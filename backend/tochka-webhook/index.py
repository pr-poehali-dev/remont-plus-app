"""Вебхук от Точка Банк: подтверждение оплаты и обновление статуса заказов."""
import json
import os
import urllib.request
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")
S = f"{SCHEMA}."

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def resp(status, body):
    return {
        "statusCode": status,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False, default=str),
    }


def send_telegram(message: str) -> None:
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "")
    if not token or not chat_id:
        return
    data = json.dumps({"chat_id": chat_id, "text": message, "parse_mode": "HTML"}).encode("utf-8")
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data=data,
        headers={"Content-Type": "application/json"},
    )
    try:
        urllib.request.urlopen(req, timeout=10)
    except Exception:
        pass


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    smtp_host = os.environ.get("SMTP_HOST", "")
    smtp_port = int(os.environ.get("SMTP_PORT", "465"))
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_password = os.environ.get("SMTP_PASSWORD", "")
    if not all([smtp_host, smtp_user, smtp_password, to_email]):
        return False
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Авангард <{smtp_user}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html", "utf-8"))
    context = ssl.create_default_context()
    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context) as server:
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_user, to_email, msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls(context=context)
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_user, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"[tochka-webhook] email error: {e}")
        return False


def client_paid_email(order_number: str, client_name: str, amount: float) -> str:
    fmt_amount = f"{amount:,.0f}".replace(",", " ")
    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 540px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 28px 32px;">
      <h1 style="color: #fff; margin: 0; font-size: 20px;">Оплата прошла успешно!</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">Авангард · {order_number}</p>
    </div>
    <div style="padding: 28px 32px;">
      <p style="color: #333; font-size: 15px;">Здравствуйте, <strong>{client_name or 'уважаемый клиент'}</strong>!</p>
      <p style="color: #555; font-size: 14px; margin-bottom: 20px;">
        Ваша оплата на сумму <strong>{fmt_amount} ₽</strong> получена. Доступ к сервисам открыт — вы можете вернуться на сайт и продолжить работу.
      </p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px;">
        <p style="margin: 0; color: #16a34a; font-size: 14px; font-weight: 600;">Доступ активирован</p>
        <p style="margin: 4px 0 0; color: #555; font-size: 13px;">Печать смет, калькулятор, дизайнер, ИИ-эксперт</p>
      </div>
      <p style="color: #888; font-size: 13px;">Если у вас есть вопросы — звоните: <strong>8 (927) 748-68-68</strong></p>
    </div>
    <div style="background: #f9fafb; padding: 14px 32px; text-align: center;">
      <p style="color: #bbb; font-size: 11px; margin: 0;">Авангард · avangard-ai.ru</p>
    </div>
  </div>
</body></html>"""


def decode_jwt_payload(token_str: str) -> dict:
    import base64
    parts = token_str.strip().split(".")
    if len(parts) != 3:
        return {}
    payload_b64 = parts[1]
    padding = 4 - len(payload_b64) % 4
    if padding != 4:
        payload_b64 += "=" * padding
    decoded = base64.urlsafe_b64decode(payload_b64)
    return json.loads(decoded)


def handler(event: dict, context) -> dict:
    """Обработка вебхука от Точка Банка."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    raw_body = event.get("body") or ""

    body = {}
    if raw_body.startswith("{"):
        body = json.loads(raw_body)
    elif "." in raw_body and raw_body.count(".") == 2:
        body = decode_jwt_payload(raw_body)
    else:
        try:
            body = json.loads(raw_body)
        except Exception:
            print(f"[tochka-webhook] cannot parse body: {raw_body[:500]}")
            return resp(200, {"ok": True, "note": "unrecognized format"})

    payment_data = body.get("Data", body)
    payment_status = str(payment_data.get("status", payment_data.get("paymentStatus", ""))).upper()
    payment_amount = payment_data.get("amount", payment_data.get("Amount", 0))
    payment_id = payment_data.get("paymentLinkId", payment_data.get("paymentId", payment_data.get("externalId", "")))
    payer_email = payment_data.get("payerEmail", payment_data.get("email", ""))
    purpose = payment_data.get("purpose", payment_data.get("description", ""))

    print(f"[tochka-webhook] status={payment_status} amount={payment_amount} id={payment_id} email={payer_email} purpose={purpose}")

    is_paid = payment_status in ("APPROVED", "PAID", "AUTHORIZED", "SUCCEEDED", "COMPLETED")
    if not is_paid:
        send_telegram(
            f"<b>Точка webhook</b>: статус {payment_status}\n"
            f"ID: {payment_id}\nСумма: {payment_amount}\nEmail: {payer_email or '—'}"
        )
        return resp(200, {"ok": True, "status": payment_status})

    conn = get_conn()
    updated_orders = []

    try:
        with conn.cursor() as cur:
            if payment_id:
                cur.execute(
                    f"""UPDATE {S}estimate_orders
                        SET status='paid', yookassa_payment_id=%s, paid_at=NOW(), updated_at=NOW()
                        WHERE yookassa_payment_id=%s AND status='pending'
                        RETURNING id, order_number, client_name, client_email, client_phone, amount, user_id""",
                    (payment_id, payment_id),
                )
                rows = cur.fetchall()
                updated_orders.extend(rows)

            if payment_id:
                cur.execute(
                    f"""UPDATE {S}orders
                        SET status='paid', paid_at=NOW(), updated_at=NOW()
                        WHERE yookassa_payment_id=%s AND status='pending'""",
                    (payment_id,),
                )

            if not updated_orders and payer_email:
                cur.execute(
                    f"""UPDATE {S}estimate_orders
                        SET status='paid', yookassa_payment_id=%s, paid_at=NOW(), updated_at=NOW()
                        WHERE LOWER(client_email)=LOWER(%s) AND status='pending'
                          AND amount=%s
                        RETURNING id, order_number, client_name, client_email, client_phone, amount, user_id""",
                    (payment_id or "tochka-webhook", payer_email, float(payment_amount) if payment_amount else 399),
                )
                rows = cur.fetchall()
                updated_orders.extend(rows)

            if not updated_orders and payer_email:
                cur.execute(
                    f"""UPDATE {S}estimate_orders
                        SET status='paid', yookassa_payment_id=%s, paid_at=NOW(), updated_at=NOW()
                        WHERE id = (
                            SELECT id FROM {S}estimate_orders
                            WHERE LOWER(client_email)=LOWER(%s) AND status='pending'
                            ORDER BY created_at DESC LIMIT 1
                        )
                        RETURNING id, order_number, client_name, client_email, client_phone, amount, user_id""",
                    (payment_id or "tochka-webhook", payer_email),
                )
                rows = cur.fetchall()
                updated_orders.extend(rows)

            if not updated_orders:
                cur.execute(
                    f"""UPDATE {S}estimate_orders
                        SET status='paid', yookassa_payment_id=%s, paid_at=NOW(), updated_at=NOW()
                        WHERE id = (
                            SELECT id FROM {S}estimate_orders
                            WHERE status='pending'
                            ORDER BY created_at DESC LIMIT 1
                        )
                        RETURNING id, order_number, client_name, client_email, client_phone, amount, user_id""",
                    (payment_id or "tochka-webhook",),
                )
                rows = cur.fetchall()
                updated_orders.extend(rows)

            conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"[tochka-webhook] DB error: {e}")
        return resp(500, {"error": str(e)})
    finally:
        conn.close()

    for row in updated_orders:
        order_id, order_number, client_name, client_email, client_phone, amount, user_id = row
        fmt_amount = f"{float(amount):,.0f}".replace(",", " ")

        if client_email:
            send_email(
                client_email,
                f"Авангард: оплата {order_number} подтверждена",
                client_paid_email(order_number, client_name, float(amount)),
            )

        admin_email = os.environ.get("SMTP_USER", "")
        if admin_email:
            send_email(
                admin_email,
                f"Оплата подтверждена: {order_number} ({fmt_amount} ₽)",
                f"<p>Заказ <b>{order_number}</b> оплачен.</p>"
                f"<p>Клиент: {client_name or '—'}<br>Email: {client_email or '—'}<br>"
                f"Телефон: {client_phone or '—'}<br>Сумма: {fmt_amount} ₽<br>"
                f"User ID: {user_id or '—'}</p>",
            )

        tg_msg = (
            f"<b>Оплата подтверждена!</b>\n"
            f"Заказ: <b>{order_number}</b>\n"
            f"Сумма: <b>{fmt_amount} ₽</b>\n"
            f"Клиент: {client_name or '—'}\n"
            f"Email: {client_email or '—'}\n"
            f"Тел: {client_phone or '—'}\n"
            f"User ID: {user_id or '—'}"
        )
        send_telegram(tg_msg)

    if not updated_orders:
        send_telegram(
            f"<b>Точка webhook: оплата получена, но заказ не найден</b>\n"
            f"ID: {payment_id}\nСумма: {payment_amount}\nEmail: {payer_email or '—'}\n"
            f"Purpose: {purpose or '—'}"
        )

    return resp(200, {
        "ok": True,
        "matched_orders": len(updated_orders),
        "order_numbers": [r[1] for r in updated_orders],
    })