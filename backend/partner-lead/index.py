"""
Приём и управление заявками от потенциальных партнёров платформы АВАНГАРД.
GET (admin) — список всех заявок, PATCH (admin) — смена статуса, POST — создание заявки.
"""
import json
import os
import psycopg2


ADMIN_TOKEN = "admin2025"


def handler(event: dict, context) -> dict:
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    method = event.get("httpMethod")

    # GET — список заявок (только для администратора)
    if method == "GET":
        if (event.get("headers") or {}).get("X-Admin-Token") != ADMIN_TOKEN:
            return {"statusCode": 403, "headers": headers, "body": json.dumps({"error": "Forbidden"})}
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        cur = conn.cursor()
        status_filter = (event.get("queryStringParameters") or {}).get("status", "")
        if status_filter:
            cur.execute(
                "SELECT id, company_name, contact_name, phone, email, partner_type, region, comment, status, created_at "
                "FROM t_p46588937_remont_plus_app.partner_leads WHERE status = %s ORDER BY created_at DESC",
                (status_filter,)
            )
        else:
            cur.execute(
                "SELECT id, company_name, contact_name, phone, email, partner_type, region, comment, status, created_at "
                "FROM t_p46588937_remont_plus_app.partner_leads ORDER BY created_at DESC"
            )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        leads = [
            {
                "id": r[0], "company_name": r[1], "contact_name": r[2], "phone": r[3],
                "email": r[4] or "", "partner_type": r[5], "region": r[6] or "",
                "comment": r[7] or "", "status": r[8],
                "created_at": r[9].strftime("%d.%m.%Y %H:%M") if r[9] else "",
            }
            for r in rows
        ]
        return {"statusCode": 200, "headers": headers, "body": json.dumps({"leads": leads, "total": len(leads)})}

    # PATCH — смена статуса заявки (только для администратора)
    if method == "PATCH":
        if (event.get("headers") or {}).get("X-Admin-Token") != ADMIN_TOKEN:
            return {"statusCode": 403, "headers": headers, "body": json.dumps({"error": "Forbidden"})}
        try:
            body = json.loads(event.get("body") or "{}")
        except Exception:
            return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Invalid JSON"})}
        lead_id = body.get("id")
        new_status = (body.get("status") or "").strip()
        if not lead_id or not new_status:
            return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "id и status обязательны"})}
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        cur = conn.cursor()
        cur.execute(
            "UPDATE t_p46588937_remont_plus_app.partner_leads SET status = %s WHERE id = %s",
            (new_status, lead_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": headers, "body": json.dumps({"ok": True})}

    # POST — создание новой заявки
    if method == "POST":
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
            "INSERT INTO t_p46588937_remont_plus_app.partner_leads "
            "(company_name, contact_name, phone, email, partner_type, region, comment) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (company_name, contact_name, phone, email or None, partner_type, region or None, comment or None),
        )
        lead_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": headers, "body": json.dumps({"ok": True, "id": lead_id, "message": "Заявка принята"})}

    return {"statusCode": 405, "headers": headers, "body": json.dumps({"error": "Method not allowed"})}
