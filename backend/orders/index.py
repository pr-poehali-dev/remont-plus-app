"""
API для управления заявками.
GET /  — список заявок с позициями (query: ?status=new|in_progress|completed)
POST / — создать заявку {customer_name, comment, items: [{product_id, product_name, volume, unit, quantity}]}
PUT /  — сменить статус ?id=N {status}
DELETE / — удалить заявку ?id=order_number
"""
import json
import os
import psycopg2

SCHEMA = "t_p82294077_user_role_app"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def ok(data, status=200):
    return {"statusCode": status, "headers": CORS, "body": json.dumps(data, ensure_ascii=False, default=str)}

def err(msg, status=400):
    return {"statusCode": status, "headers": CORS, "body": json.dumps({"error": msg})}

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    body = json.loads(event["body"]) if event.get("body") else {}

    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == "GET":
            status_filter = params.get("status")
            if status_filter:
                cur.execute(
                    f"SELECT id, order_number, customer_name, status, comment, created_at FROM {SCHEMA}.orders WHERE status=%s ORDER BY created_at DESC",
                    (status_filter,)
                )
            else:
                cur.execute(
                    f"SELECT id, order_number, customer_name, status, comment, created_at FROM {SCHEMA}.orders ORDER BY created_at DESC"
                )
            order_rows = cur.fetchall()
            orders = []
            for row in order_rows:
                oid = row[0]
                cur.execute(
                    f"SELECT product_id, product_name, volume, unit, quantity FROM {SCHEMA}.order_items WHERE order_id=%s",
                    (oid,)
                )
                items = [
                    {
                        "productId": str(ir[0]) if ir[0] else "",
                        "productName": ir[1],
                        "volume": float(ir[2]),
                        "unit": ir[3],
                        "quantity": ir[4],
                    }
                    for ir in cur.fetchall()
                ]
                orders.append({
                    "id": row[1],
                    "customerName": row[2],
                    "status": row[3],
                    "comment": row[4] or "",
                    "createdAt": row[5].isoformat(),
                    "items": items,
                })
            return ok(orders)

        if method == "POST":
            customer_name = str(body.get("customer_name", "")).strip()
            comment = str(body.get("comment", ""))
            items = body.get("items", [])
            if not customer_name or not items:
                return err("Укажите имя и товары")

            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.orders")
            count = cur.fetchone()[0]
            order_number = f"ЗАЯ-{str(count + 1).zfill(3)}"

            cur.execute(
                f"INSERT INTO {SCHEMA}.orders (order_number, customer_name, comment) VALUES (%s, %s, %s) RETURNING id",
                (order_number, customer_name, comment)
            )
            order_id = cur.fetchone()[0]

            for item in items:
                pid = item.get("productId")
                cur.execute(
                    f"INSERT INTO {SCHEMA}.order_items (order_id, product_id, product_name, volume, unit, quantity) VALUES (%s, %s, %s, %s, %s, %s)",
                    (
                        order_id,
                        int(pid) if pid else None,
                        str(item.get("productName", "")),
                        float(item.get("volume", 0)),
                        str(item.get("unit", "л")),
                        int(item.get("quantity", 1)),
                    )
                )
            conn.commit()

            return ok({"id": order_number, "status": "new"}, 201)

        if method == "PUT":
            order_number = params.get("id")
            new_status = body.get("status")
            if not order_number or new_status not in ("new", "in_progress", "completed"):
                return err("Неверные данные")
            cur.execute(
                f"UPDATE {SCHEMA}.orders SET status=%s WHERE order_number=%s RETURNING id",
                (new_status, order_number)
            )
            r = cur.fetchone()
            conn.commit()
            return ok({"ok": True}) if r else err("Не найдено", 404)

        if method == "DELETE":
            order_number = params.get("id")
            if not order_number:
                return err("Нет id")
            cur.execute(
                f"DELETE FROM {SCHEMA}.order_items WHERE order_id = (SELECT id FROM {SCHEMA}.orders WHERE order_number=%s)",
                (order_number,)
            )
            cur.execute(
                f"DELETE FROM {SCHEMA}.orders WHERE order_number=%s RETURNING id",
                (order_number,)
            )
            r = cur.fetchone()
            conn.commit()
            return ok({"ok": True}) if r else err("Не найдено", 404)

        return err("Method not allowed", 405)

    finally:
        cur.close()
        conn.close()