import json
import os
import psycopg2
from pywebpush import webpush, WebPushException

def handler(event: dict, context) -> dict:
    """Отправляет push-уведомление всем подписанным пользователям. Только для администратора."""
    headers = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-Authorization"}

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    # Проверка админ-токена
    req_headers = event.get("headers") or {}
    auth = req_headers.get("X-Authorization", "")
    admin_password = os.environ.get("ADMIN_PASSWORD", "")
    if auth != f"Bearer {admin_password}":
        return {"statusCode": 403, "headers": headers, "body": json.dumps({"error": "Forbidden"})}

    body = json.loads(event.get("body") or "{}")
    title = body.get("title", "АВАНГАРД")
    message = body.get("message", "")
    url = body.get("url", "/")

    if not message:
        return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Message is required"})}

    vapid_private = os.environ.get("VAPID_PRIVATE_KEY", "")
    vapid_email = os.environ.get("VAPID_EMAIL", "mailto:info@avangard-ai.ru")

    payload = json.dumps({"title": title, "body": message, "url": url, "icon": "/icons/icon-192.png"})

    schema = os.environ.get("MAIN_DB_SCHEMA", "public")
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(f"SELECT endpoint, p256dh, auth FROM {schema}.push_subscriptions")
    subs = cur.fetchall()
    cur.close()
    conn.close()

    sent = 0
    failed = 0
    for endpoint, p256dh, auth_key in subs:
        try:
            webpush(
                subscription_info={"endpoint": endpoint, "keys": {"p256dh": p256dh, "auth": auth_key}},
                data=payload,
                vapid_private_key=vapid_private,
                vapid_claims={"sub": vapid_email},
            )
            sent += 1
        except WebPushException:
            failed += 1

    return {"statusCode": 200, "headers": headers, "body": json.dumps({"ok": True, "sent": sent, "failed": failed, "total": len(subs)})}
