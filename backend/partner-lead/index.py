"""
Приём и управление заявками от потенциальных партнёров платформы АВАНГАРД.
GET (admin) — список всех заявок, PATCH (admin) — смена статуса, POST — создание заявки.
При создании заявки отправляет email-уведомление администратору.
"""
import json
import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import urllib.request
import psycopg2


def send_telegram(message: str) -> None:
    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')
    if not token or not chat_id:
        return
    data = json.dumps({'chat_id': chat_id, 'text': message, 'parse_mode': 'HTML'}).encode('utf-8')
    req = urllib.request.Request(
        f'https://api.telegram.org/bot{token}/sendMessage',
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    urllib.request.urlopen(req, timeout=10)


ADMIN_TOKEN = "admin2025"

PARTNER_TYPE_LABELS = {
    "contractor": "Бригада / мастер",
    "supplier": "Поставщик материалов",
    "windows": "Оконная компания",
    "ceilings": "Натяжные потолки",
    "design": "Дизайн-студия",
    "other": "Другое",
}


def send_partner_notification(company_name: str, contact_name: str, phone: str,
                               email: str, partner_type: str, region: str,
                               comment: str, lead_id: int) -> bool:
    smtp_host = os.environ.get("SMTP_HOST", "")
    smtp_port = int(os.environ.get("SMTP_PORT", "465"))
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_password = os.environ.get("SMTP_PASSWORD", "")

    if not all([smtp_host, smtp_user, smtp_password]):
        return False

    admin_email = smtp_user
    type_label = PARTNER_TYPE_LABELS.get(partner_type, partner_type)

    html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 28px 32px;">
      <h1 style="color: #fff; margin: 0; font-size: 20px;">🤝 Новая заявка от партнёра</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">АВАНГАРД · Заявка №{lead_id}</p>
    </div>
    <div style="padding: 28px 32px;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="color: #888; padding: 8px 0; width: 140px; vertical-align: top;">Компания</td>
          <td style="color: #111; font-weight: 700; font-size: 16px;">{company_name}</td>
        </tr>
        <tr>
          <td style="color: #888; padding: 8px 0;">Контакт</td>
          <td style="color: #333; font-weight: 500;">{contact_name}</td>
        </tr>
        <tr>
          <td style="color: #888; padding: 8px 0;">Телефон</td>
          <td><a href="tel:{phone}" style="color: #2563eb; font-weight: 600; text-decoration: none;">{phone}</a></td>
        </tr>
        {"<tr><td style='color: #888; padding: 8px 0;'>Email</td><td><a href='mailto:" + email + "' style='color: #2563eb; text-decoration: none;'>" + email + "</a></td></tr>" if email else ""}
        <tr>
          <td style="color: #888; padding: 8px 0;">Тип партнёра</td>
          <td style="color: #333;">
            <span style="background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; border-radius: 6px; padding: 2px 10px; font-size: 13px; font-weight: 500;">{type_label}</span>
          </td>
        </tr>
        {"<tr><td style='color: #888; padding: 8px 0;'>Регион</td><td style='color: #333;'>{}</td></tr>".format(region) if region else ""}
        {"<tr><td style='color: #888; padding: 8px 0; vertical-align: top;'>Комментарий</td><td style='color: #555; background: #f9fafb; border-radius: 6px; padding: 8px 10px;'>{}</td></tr>".format(comment) if comment else ""}
      </table>
    </div>
    <div style="padding: 0 32px 28px;">
      <a href="https://avangard-ai.ru/admin" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #f97316); color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
        Открыть в админ-панели →
      </a>
    </div>
    <div style="background: #f9fafb; padding: 16px 32px; text-align: center;">
      <p style="color: #bbb; font-size: 11px; margin: 0;">АВАНГАРД · avangard-ai.ru · Автоматическое уведомление</p>
    </div>
  </div>
</body>
</html>"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Новый партнёр: {company_name} · {type_label}"
    msg["From"] = f"АВАНГАРД <{smtp_user}>"
    msg["To"] = admin_email
    msg.attach(MIMEText(html, "html", "utf-8"))

    context = ssl.create_default_context()
    if smtp_port == 465:
        with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context) as server:
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, admin_email, msg.as_string())
    else:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls(context=context)
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, admin_email, msg.as_string())
    return True


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

        try:
            send_partner_notification(company_name, contact_name, phone, email,
                                      partner_type, region, comment, lead_id)
        except Exception:
            pass

        try:
            type_label = PARTNER_TYPE_LABELS.get(partner_type, partner_type)
            tg_text = (
                f"🤝 <b>Новая заявка от партнёра</b> (№{lead_id})\n\n"
                f"🏢 Компания: {company_name}\n"
                f"👤 Контакт: {contact_name}\n"
                f"📞 Телефон: {phone}\n"
                f"🔖 Тип: {type_label}\n"
                f"📍 Регион: {region or '—'}\n"
                f"💬 Комментарий: {comment or '—'}"
            )
            send_telegram(tg_text)
        except Exception as e:
            print(f'TELEGRAM ERROR: {e}')

        return {"statusCode": 200, "headers": headers, "body": json.dumps({"ok": True, "id": lead_id, "message": "Заявка принята"})}

    return {"statusCode": 405, "headers": headers, "body": json.dumps({"error": "Method not allowed"})}