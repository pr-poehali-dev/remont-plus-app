"""
Управление подписками строительных компаний:
- получение списка тарифов
- получение текущей подписки
- активация подписки (после оплаты)
- проверка лимитов
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")
S = f"{SCHEMA}."

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def resp(status, body):
    return {
        "statusCode": status,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False, default=str),
    }


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    action = body.get("action") or params.get("action", "")
    conn = get_conn()

    # GET plans — список всех тарифов
    if method == "GET" and action == "plans":
        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT code, name, price, leads_per_month, is_unlimited, priority, description
                FROM {S}builder_plans
                ORDER BY priority ASC
            """)
            rows = cur.fetchall()

        plans = []
        for r in rows:
            plans.append({
                "code": r[0], "name": r[1], "price": r[2],
                "leads_per_month": r[3], "is_unlimited": r[4],
                "priority": r[5], "description": r[6],
            })
        conn.close()
        return resp(200, {"plans": plans})

    # GET subscription — текущая подписка подрядчика
    if method == "GET" and action == "my":
        contractor_id = params.get("contractor_id")
        if not contractor_id:
            conn.close()
            return resp(400, {"error": "contractor_id required"})

        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT
                    bs.id, bs.plan_code, bs.status, bs.leads_used,
                    bs.activated_at, bs.expires_at,
                    bp.name as plan_name, bp.price, bp.leads_per_month, bp.is_unlimited, bp.priority
                FROM {S}builder_subscriptions bs
                JOIN {S}builder_plans bp ON bp.code = bs.plan_code
                WHERE bs.contractor_id = %s AND bs.status = 'active'
                  AND (bs.expires_at IS NULL OR bs.expires_at > NOW())
                ORDER BY bs.created_at DESC
                LIMIT 1
            """, (contractor_id,))
            row = cur.fetchone()

        conn.close()
        if not row:
            return resp(200, {"subscription": None})

        return resp(200, {"subscription": {
            "id": row[0], "plan_code": row[1], "status": row[2],
            "leads_used": row[3], "activated_at": str(row[4]),
            "expires_at": str(row[5]) if row[5] else None,
            "plan_name": row[6], "price": row[7],
            "leads_per_month": row[8], "is_unlimited": row[9],
            "priority": row[10],
            "leads_left": None if row[9] else max(0, row[8] - row[3]),
        }})

    # POST activate — активировать подписку (после оплаты через yookassa)
    if method == "POST" and action == "activate":
        contractor_id = body.get("contractor_id")
        plan_code = body.get("plan_code")
        months = int(body.get("months", 1))

        if not contractor_id or not plan_code:
            conn.close()
            return resp(400, {"error": "contractor_id and plan_code required"})

        with conn.cursor() as cur:
            cur.execute(f"SELECT code FROM {S}builder_plans WHERE code = %s", (plan_code,))
            if not cur.fetchone():
                conn.close()
                return resp(404, {"error": "plan not found"})

            # Деактивируем старые подписки
            cur.execute(f"""
                UPDATE {S}builder_subscriptions
                SET status = 'cancelled', updated_at = NOW()
                WHERE contractor_id = %s AND status = 'active'
            """, (contractor_id,))

            # Создаём новую
            cur.execute(f"""
                INSERT INTO {S}builder_subscriptions
                (contractor_id, plan_code, status, leads_used, activated_at, expires_at)
                VALUES (%s, %s, 'active', 0, NOW(), NOW() + INTERVAL '{months} months')
                RETURNING id, expires_at
            """, (contractor_id, plan_code))
            row = cur.fetchone()
            conn.commit()

        conn.close()
        return resp(200, {"success": True, "subscription_id": row[0], "expires_at": str(row[1])})

    # GET check — проверить, есть ли лимит для заявок
    if method == "GET" and action == "check":
        contractor_id = params.get("contractor_id")
        if not contractor_id:
            conn.close()
            return resp(400, {"error": "contractor_id required"})

        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT bp.is_unlimited, bs.leads_used, bp.leads_per_month
                FROM {S}builder_subscriptions bs
                JOIN {S}builder_plans bp ON bp.code = bs.plan_code
                WHERE bs.contractor_id = %s AND bs.status = 'active'
                  AND (bs.expires_at IS NULL OR bs.expires_at > NOW())
                ORDER BY bs.created_at DESC LIMIT 1
            """, (contractor_id,))
            row = cur.fetchone()

        conn.close()
        if not row:
            return resp(200, {"has_subscription": False, "can_receive": False})

        can_receive = row[0] or row[1] < row[2]
        return resp(200, {
            "has_subscription": True,
            "can_receive": can_receive,
            "is_unlimited": row[0],
            "leads_used": row[1],
            "leads_per_month": row[2],
        })

    conn.close()
    return resp(400, {"error": "unknown action"})
