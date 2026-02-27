import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Сохраняет push-подписку браузера пользователя в базу данных."""
    headers = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type"}

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": headers, "body": json.dumps({"error": "Method not allowed"})}

    body = json.loads(event.get("body") or "{}")
    endpoint = body.get("endpoint")
    p256dh = body.get("p256dh")
    auth = body.get("auth")
    user_agent = (event.get("headers") or {}).get("user-agent", "")

    if not endpoint or not p256dh or not auth:
        return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Missing required fields"})}

    schema = os.environ.get("MAIN_DB_SCHEMA", "public")
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        f"""
        INSERT INTO {schema}.push_subscriptions (endpoint, p256dh, auth, user_agent)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (endpoint) DO UPDATE SET
            p256dh = EXCLUDED.p256dh,
            auth = EXCLUDED.auth,
            last_used_at = NOW()
        """,
        (endpoint, p256dh, auth, user_agent)
    )
    conn.commit()
    cur.close()
    conn.close()

    return {"statusCode": 200, "headers": headers, "body": json.dumps({"ok": True})}
