"""
Баланс строительных компаний (Биржа заявок):
- получение текущего баланса
- пополнение баланса (после оплаты)
- списание за раскрытие контакта
- история транзакций
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


def get_balance(conn, contractor_id):
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT amount FROM {S}builder_balances WHERE contractor_id = %s",
            (contractor_id,)
        )
        row = cur.fetchone()
        return row[0] if row else 0


def ensure_balance_row(conn, contractor_id):
    with conn.cursor() as cur:
        cur.execute(f"""
            INSERT INTO {S}builder_balances (contractor_id, amount)
            VALUES (%s, 0)
            ON CONFLICT (contractor_id) DO NOTHING
        """, (contractor_id,))
        conn.commit()


def add_transaction(conn, contractor_id, tx_type, amount, description, lead_id=None):
    with conn.cursor() as cur:
        if tx_type == "topup":
            cur.execute(f"""
                UPDATE {S}builder_balances
                SET amount = amount + %s, updated_at = NOW()
                WHERE contractor_id = %s
                RETURNING amount
            """, (amount, contractor_id))
        elif tx_type == "charge":
            cur.execute(f"""
                UPDATE {S}builder_balances
                SET amount = amount - %s, updated_at = NOW()
                WHERE contractor_id = %s AND amount >= %s
                RETURNING amount
            """, (amount, contractor_id, amount))
        else:
            return None

        row = cur.fetchone()
        if not row:
            return None

        balance_after = row[0]
        cur.execute(f"""
            INSERT INTO {S}builder_transactions
            (contractor_id, type, amount, balance_after, description, lead_id)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (contractor_id, tx_type, amount, balance_after, description, lead_id))
        tx_id = cur.fetchone()[0]
        conn.commit()
        return {"tx_id": tx_id, "balance": balance_after}


def handler(event: dict, context) -> dict:
    """Баланс строительной компании — пополнение и списание за лиды"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    action = body.get("action") or params.get("action", "")
    conn = get_conn()

    if action == "get":
        contractor_id = params.get("contractor_id")
        if not contractor_id:
            conn.close()
            return resp(400, {"error": "contractor_id required"})

        ensure_balance_row(conn, contractor_id)
        balance = get_balance(conn, int(contractor_id))
        conn.close()
        return resp(200, {"balance": balance})

    if method == "POST" and action == "topup":
        contractor_id = body.get("contractor_id")
        amount = body.get("amount")
        if not contractor_id or not amount or int(amount) <= 0:
            conn.close()
            return resp(400, {"error": "contractor_id and positive amount required"})

        ensure_balance_row(conn, contractor_id)
        result = add_transaction(
            conn, contractor_id, "topup", int(amount),
            f"Пополнение баланса на {int(amount):,} ₽".replace(",", " ")
        )
        conn.close()
        if not result:
            return resp(500, {"error": "failed to topup"})
        return resp(200, {"success": True, **result})

    if method == "POST" and action == "charge":
        contractor_id = body.get("contractor_id")
        amount = body.get("amount")
        lead_id = body.get("lead_id")
        description = body.get("description", "Списание за контакт")
        if not contractor_id or not amount or int(amount) <= 0:
            conn.close()
            return resp(400, {"error": "contractor_id and positive amount required"})

        ensure_balance_row(conn, contractor_id)
        balance = get_balance(conn, int(contractor_id))
        if balance < int(amount):
            conn.close()
            return resp(402, {
                "error": "insufficient_balance",
                "balance": balance,
                "required": int(amount),
                "shortfall": int(amount) - balance,
            })

        result = add_transaction(
            conn, contractor_id, "charge", int(amount),
            description, lead_id
        )
        conn.close()
        if not result:
            return resp(500, {"error": "failed to charge"})
        return resp(200, {"success": True, **result})

    if action == "history":
        contractor_id = params.get("contractor_id")
        limit = int(params.get("limit", "50"))
        if not contractor_id:
            conn.close()
            return resp(400, {"error": "contractor_id required"})

        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT id, type, amount, balance_after, description, lead_id, created_at
                FROM {S}builder_transactions
                WHERE contractor_id = %s
                ORDER BY created_at DESC
                LIMIT %s
            """, (contractor_id, limit))
            rows = cur.fetchall()

        conn.close()
        txs = []
        for r in rows:
            txs.append({
                "id": r[0], "type": r[1], "amount": r[2],
                "balance_after": r[3], "description": r[4],
                "lead_id": r[5], "created_at": str(r[6]),
            })
        return resp(200, {"transactions": txs})

    conn.close()
    return resp(400, {"error": "unknown action"})
