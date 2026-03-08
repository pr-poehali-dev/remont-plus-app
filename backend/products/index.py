"""
API для управления каталогом товаров (CRUD).
GET /  — список активных товаров
GET /?categories=1 — список уникальных категорий
POST / — создать {name, volume, unit, category}
PUT /  — обновить ?id=N {name, volume, unit, category}
DELETE / — мягкое удаление ?id=N (is_active=false)
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

def row_to_product(r):
    return {"id": str(r[0]), "name": r[1], "volume": float(r[2]), "unit": r[3], "createdAt": r[4].isoformat(), "category": r[5] or ""}

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
            if params.get("categories"):
                cur.execute(
                    f"SELECT DISTINCT category FROM {SCHEMA}.products WHERE is_active = TRUE AND category != '' ORDER BY category"
                )
                return ok([r[0] for r in cur.fetchall()])
            cur.execute(
                f"SELECT id, name, volume, unit, created_at, category FROM {SCHEMA}.products WHERE is_active = TRUE ORDER BY created_at DESC"
            )
            return ok([row_to_product(r) for r in cur.fetchall()])

        if method == "POST":
            name = str(body.get("name", "")).strip()
            volume = float(body.get("volume", 0))
            unit = str(body.get("unit", "л"))
            category = str(body.get("category", "")).strip()
            if not name or volume <= 0:
                return err("Укажите название и объём")
            cur.execute(
                f"INSERT INTO {SCHEMA}.products (name, volume, unit, category) VALUES (%s, %s, %s, %s) RETURNING id, name, volume, unit, created_at, category",
                (name, volume, unit, category)
            )
            r = cur.fetchone()
            conn.commit()
            return ok(row_to_product(r), 201)

        if method == "PUT":
            pid = params.get("id")
            name = str(body.get("name", "")).strip()
            volume = float(body.get("volume", 0))
            unit = str(body.get("unit", "л"))
            category = str(body.get("category", "")).strip()
            if not pid or not name or volume <= 0:
                return err("Неверные данные")
            cur.execute(
                f"UPDATE {SCHEMA}.products SET name=%s, volume=%s, unit=%s, category=%s WHERE id=%s AND is_active=TRUE RETURNING id, name, volume, unit, created_at, category",
                (name, volume, unit, category, int(pid))
            )
            r = cur.fetchone()
            conn.commit()
            return ok(row_to_product(r)) if r else err("Не найдено", 404)

        if method == "DELETE":
            pid = params.get("id")
            if not pid:
                return err("Нет id")
            cur.execute(
                f"UPDATE {SCHEMA}.products SET is_active=FALSE WHERE id=%s AND is_active=TRUE RETURNING id",
                (int(pid),)
            )
            r = cur.fetchone()
            conn.commit()
            return ok({"ok": True}) if r else err("Не найдено", 404)

        return err("Method not allowed", 405)

    finally:
        cur.close()
        conn.close()