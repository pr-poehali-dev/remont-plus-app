"""
Напоминания об истекающих договорах — возвращает список договоров,
срок действия которых заканчивается в ближайшие N дней (по умолчанию 30).
Также умеет отправлять email-напоминания администратору.
"""
import json
import os
import psycopg2
import smtplib
import ssl
from datetime import date, datetime, timedelta
from decimal import Decimal
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def json_serial(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return int(obj)
    if isinstance(obj, timedelta):
        return obj.days
    raise TypeError(f"Type {type(obj)} not serializable")


def resp(status, body):
    return {
        "statusCode": status,
        "headers": {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
        "body": json.dumps(body, default=json_serial, ensure_ascii=False),
    }


def send_email(subject: str, html_body: str) -> bool:
    smtp_host = os.environ.get("SMTP_HOST", "")
    smtp_port = int(os.environ.get("SMTP_PORT", "465"))
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_password = os.environ.get("SMTP_PASSWORD", "")
    if not all([smtp_host, smtp_user, smtp_password]):
        return False
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Авангард <{smtp_user}>"
    msg["To"] = smtp_user
    msg.attach(MIMEText(html_body, "html", "utf-8"))
    context = ssl.create_default_context()
    if smtp_port == 465:
        with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context) as server:
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, smtp_user, msg.as_string())
    else:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls(context=context)
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, smtp_user, msg.as_string())
    return True


def build_email_html(contracts: list) -> str:
    rows = ""
    for c in contracts:
        days = c["days_left"]
        color = "#dc2626" if days <= 7 else "#ea580c" if days <= 14 else "#d97706"
        rows += f"""
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111;font-weight:500">{c['title']}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#555">{c['counterparty_name']}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#555">{c.get('valid_until','—')}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:700;color:{color}">{days} дн.</td>
        </tr>"""
    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;">
      <h1 style="color:#fff;margin:0;font-size:20px;">⚠️ Истекающие договоры</h1>
      <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">Авангард · Юридический отдел</p>
    </div>
    <div style="padding:24px 32px;">
      <p style="color:#333;font-size:15px;margin:0 0 20px;">Следующие договоры истекают в ближайшие 30 дней:</p>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#888;font-weight:600;border-bottom:2px solid #e5e7eb;">Договор</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#888;font-weight:600;border-bottom:2px solid #e5e7eb;">Контрагент</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#888;font-weight:600;border-bottom:2px solid #e5e7eb;">Истекает</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#888;font-weight:600;border-bottom:2px solid #e5e7eb;">Осталось</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
    <div style="background:#f9fafb;padding:16px 32px;text-align:center;">
      <p style="color:#bbb;font-size:11px;margin:0;">Авангард · avangard-ai.ru · Автоматическое уведомление</p>
    </div>
  </div>
</body></html>"""


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
            "Access-Control-Max-Age": "86400",
        }, "body": ""}

    token = event.get("headers", {}).get("X-Admin-Token", "")
    if token != "admin2025":
        return resp(403, {"error": "Forbidden"})

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    days = int(params.get("days", 30))

    conn = get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT id, title, contract_number, contract_type, counterparty_name,
                   status, amount, currency, valid_until, responsible_person,
                   (valid_until - CURRENT_DATE) AS days_left
            FROM contracts
            WHERE valid_until IS NOT NULL
              AND valid_until >= CURRENT_DATE
              AND valid_until <= CURRENT_DATE + INTERVAL '%d days'
              AND status NOT IN ('terminated', 'expired')
            ORDER BY valid_until ASC
        """ % int(days))
        rows = cur.fetchall()
        cols = ["id", "title", "contract_number", "contract_type", "counterparty_name",
                "status", "amount", "currency", "valid_until", "responsible_person", "days_left"]
        contracts = [dict(zip(cols, r)) for r in rows]

        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            if body.get("send_email") and contracts:
                html = build_email_html(contracts)
                sent = send_email(f"Авангард: {len(contracts)} договоров истекают в ближайшие {days} дней", html)
                return resp(200, {"contracts": contracts, "total": len(contracts), "email_sent": sent})

        return resp(200, {"contracts": contracts, "total": len(contracts)})

    finally:
        cur.close()
        conn.close()