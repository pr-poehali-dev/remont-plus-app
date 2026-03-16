"""Управление тарифами клиентов: получение, активация, проверка доступа, история платежей."""
import json
import os
from datetime import datetime, timedelta

import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")
S = f"{SCHEMA}."

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id",
    "Access-Control-Max-Age": "86400",
}

PLAN_NAMES = {
    "b2c_basic": "Базовый",
    "b2c_professional": "Профессиональный",
    "b2c_premium": "Премиум",
    "b2b_start": "Старт",
    "b2b_business": "Бизнес",
    "b2b_pro": "Профи",
}

PLAN_PRICES = {
    "b2c_basic": 1490,
    "b2c_professional": 2990,
    "b2c_premium": 4990,
    "b2b_start": 5900,
    "b2b_business": 12900,
    "b2b_pro": 24900,
}

B2B_PLANS = {"b2b_start", "b2b_business", "b2b_pro"}

PLAN_DOCS = {
    "b2c_basic": ["smeta"],
    "b2c_professional": ["smeta", "kp", "ks2", "ks3", "act", "contract"],
    "b2c_premium": ["smeta", "kp", "ks2", "ks3", "act", "contract"],
    "b2b_start": ["smeta", "kp", "ks2", "ks3", "act", "contract"],
    "b2b_business": ["smeta", "kp", "ks2", "ks3", "act", "contract"],
    "b2b_pro": ["smeta", "kp", "ks2", "ks3", "act", "contract"],
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def resp(status, body):
    return {
        "statusCode": status,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False, default=str),
    }


def get_tariff(conn, user_id=None, email=None):
    with conn.cursor() as cur:
        if user_id:
            cur.execute(
                f"SELECT id, plan_id, plan_name, price, is_monthly, status, activated_at, expires_at "
                f"FROM {S}client_tariffs WHERE user_id=%s AND status='active' "
                f"ORDER BY created_at DESC LIMIT 1",
                (user_id,),
            )
        elif email:
            cur.execute(
                f"SELECT id, plan_id, plan_name, price, is_monthly, status, activated_at, expires_at "
                f"FROM {S}client_tariffs WHERE email=%s AND status='active' "
                f"ORDER BY created_at DESC LIMIT 1",
                (email,),
            )
        else:
            return None

        row = cur.fetchone()
        if not row:
            return None

        activated_at = row[6]
        expires_at = row[7]
        now = datetime.utcnow()

        if expires_at and now > expires_at:
            cur.execute(
                f"UPDATE {S}client_tariffs SET status='expired', updated_at=NOW() WHERE id=%s",
                (row[0],),
            )
            conn.commit()
            return None

        days_total = 30
        if expires_at and activated_at:
            days_total = max(1, (expires_at - activated_at).days)
        days_remaining = 0
        if expires_at:
            days_remaining = max(0, (expires_at - now).days)

        return {
            "id": row[0],
            "plan_id": row[1],
            "plan_name": row[2],
            "price": float(row[3]),
            "is_monthly": row[4],
            "status": row[5],
            "activated_at": row[6].isoformat() if row[6] else None,
            "expires_at": row[7].isoformat() if row[7] else None,
            "days_remaining": days_remaining,
            "days_total": days_total,
            "allowed_docs": PLAN_DOCS.get(row[1], []),
        }


def activate_tariff(conn, user_id, email, plan_id):
    plan_name = PLAN_NAMES.get(plan_id, plan_id)
    price = PLAN_PRICES.get(plan_id, 0)
    is_monthly = plan_id in B2B_PLANS
    duration_days = 30

    with conn.cursor() as cur:
        if user_id:
            cur.execute(
                f"UPDATE {S}client_tariffs SET status='replaced', updated_at=NOW() "
                f"WHERE user_id=%s AND status='active'",
                (user_id,),
            )
        elif email:
            cur.execute(
                f"UPDATE {S}client_tariffs SET status='replaced', updated_at=NOW() "
                f"WHERE email=%s AND status='active'",
                (email,),
            )

        expires_at = datetime.utcnow() + timedelta(days=duration_days)
        cur.execute(
            f"INSERT INTO {S}client_tariffs (user_id, email, plan_id, plan_name, price, is_monthly, status, activated_at, expires_at) "
            f"VALUES (%s, %s, %s, %s, %s, %s, 'active', NOW(), %s) RETURNING id",
            (user_id, email, plan_id, plan_name, price, is_monthly, expires_at),
        )
        tariff_id = cur.fetchone()[0]

        cur.execute(
            f"INSERT INTO {S}tariff_payments (user_id, email, plan_id, plan_name, amount, status) "
            f"VALUES (%s, %s, %s, %s, %s, 'paid') RETURNING id",
            (user_id, email, plan_id, plan_name, price),
        )
        payment_id = cur.fetchone()[0]

    conn.commit()
    return tariff_id, payment_id


def get_payments(conn, user_id=None, email=None):
    with conn.cursor() as cur:
        if user_id:
            cur.execute(
                f"SELECT id, plan_id, plan_name, amount, status, paid_at, created_at "
                f"FROM {S}tariff_payments WHERE user_id=%s ORDER BY created_at DESC LIMIT 50",
                (user_id,),
            )
        elif email:
            cur.execute(
                f"SELECT id, plan_id, plan_name, amount, status, paid_at, created_at "
                f"FROM {S}tariff_payments WHERE email=%s ORDER BY created_at DESC LIMIT 50",
                (email,),
            )
        else:
            return []

        rows = cur.fetchall()
        return [
            {
                "id": r[0],
                "plan_id": r[1],
                "plan_name": r[2],
                "amount": float(r[3]),
                "status": r[4],
                "paid_at": r[5].isoformat() if r[5] else None,
                "created_at": r[6].isoformat() if r[6] else None,
            }
            for r in rows
        ]


def handler(event: dict, context) -> dict:
    """Управление тарифами клиентов: проверка, активация, история платежей."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    action = body.get("action") or params.get("action", "")
    user_id = body.get("user_id") or params.get("user_id")
    email = body.get("email") or params.get("email")

    if user_id:
        user_id = int(user_id)

    conn = get_conn()
    try:
        if action == "get_tariff" or (method == "GET" and not action):
            tariff = get_tariff(conn, user_id=user_id, email=email)
            return resp(200, {"tariff": tariff})

        if action == "check_access":
            doc_type = body.get("doc_type") or params.get("doc_type", "smeta")
            tariff = get_tariff(conn, user_id=user_id, email=email)
            if not tariff:
                return resp(200, {"has_access": False, "reason": "no_tariff"})
            allowed = PLAN_DOCS.get(tariff["plan_id"], [])
            has_access = doc_type in allowed
            return resp(200, {"has_access": has_access, "plan_id": tariff["plan_id"], "allowed_docs": allowed})

        if action == "activate":
            plan_id = body.get("plan_id", "")
            if plan_id not in PLAN_NAMES:
                return resp(400, {"error": f"Неизвестный тариф: {plan_id}"})
            if not user_id and not email:
                return resp(400, {"error": "Нужен user_id или email"})
            tariff_id, payment_id = activate_tariff(conn, user_id, email, plan_id)
            tariff = get_tariff(conn, user_id=user_id, email=email)
            return resp(200, {"ok": True, "tariff": tariff, "payment_id": payment_id})

        if action == "get_payments":
            payments = get_payments(conn, user_id=user_id, email=email)
            return resp(200, {"payments": payments})

        return resp(400, {"error": f"Неизвестное действие: {action}"})
    finally:
        conn.close()
