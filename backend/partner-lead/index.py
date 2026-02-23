"""
Приём заявок от потенциальных партнёров платформы АВАНГАРД.
Сохраняет данные компании в БД и возвращает подтверждение.
"""
import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": headers, "body": json.dumps({"error": "Method not allowed"})}

    try:
        body = json.loads(event.get("body") or "{}")
    except Exception:
        return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Invalid JSON"})}

    company_name = (body.get("company_name") or "").strip()
    contact_name = (body.get("contact_name") or "").strip()
    phone = (body.get("phone") or "").strip()
    email = (body.get("email") or "").strip()
    partner_type = (body.get("partner_type") or "").strip()
    region = (body.get("region") or "").strip()
    comment = (body.get("comment") or "").strip()

    if not company_name or not contact_name or not phone or not partner_type:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Заполните обязательные поля: компания, имя, телефон, тип партнёра"}),
        }

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO t_p46588937_remont_plus_app.partner_leads
            (company_name, contact_name, phone, email, partner_type, region, comment)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (company_name, contact_name, phone, email or None, partner_type, region or None, comment or None),
    )
    lead_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({"ok": True, "id": lead_id, "message": "Заявка принята"}),
    }
