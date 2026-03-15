"""Вебхук от Точка Банк (PayKeeper): подтверждение оплаты и обновление статуса заказов."""
import json
import os
import urllib.request
import urllib.parse
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


def parse_webhook_body(raw_body: str) -> dict:
    """Парсинг тела вебхука — поддержка JSON и form-urlencoded (PayKeeper)."""
    if not raw_body:
        return {}

    raw_body = raw_body.strip()

    if raw_body.startswith("{"):
        return json.loads(raw_body)

    try:
        parsed = urllib.parse.parse_qs(raw_body, keep_blank_values=True)
        return {k: v[0] if len(v) == 1 else v for k, v in parsed.items()}
    except Exception:
        pass

    try:
        return json.loads(raw_body)
    except Exception:
        print(f"[tochka-webhook] cannot parse body: {raw_body[:500]}")
        return {}


def handler(event: dict, context) -> dict:
    """Обработка вебхука от Точка Банка (PayKeeper) — сопоставление по orderid/invoice_id."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    raw_body = event.get("body") or ""
    body = parse_webhook_body(raw_body)

    if not body:
        return resp(200, {"ok": True, "note": "empty or unrecognized"})

    pk_id = body.get("id", "")
    pk_orderid = body.get("orderid", "")
    pk_sum = body.get("sum", body.get("pay_amount", body.get("amount", 0)))
    pk_clientid = body.get("clientid", "")
    pk_client_email = body.get("client_email", body.get("payerEmail", body.get("email", "")))
    pk_status = body.get("status", "")
    pk_key = body.get("key", "")
    pk_service_name = body.get("service_name", body.get("purpose", body.get("description", "")))

    payment_data = body.get("Data", {})
    if payment_data and isinstance(payment_data, dict):
        pk_status = pk_status or str(payment_data.get("status", payment_data.get("paymentStatus", ""))).upper()
        pk_id = pk_id or payment_data.get("paymentLinkId", payment_data.get("paymentId", ""))
        pk_sum = pk_sum or payment_data.get("amount", 0)
        pk_client_email = pk_client_email or payment_data.get("payerEmail", "")
        pk_orderid = pk_orderid or payment_data.get("externalId", "")

    print(f"[tochka-webhook] id={pk_id} orderid={pk_orderid} sum={pk_sum} "
          f"email={pk_client_email} status={pk_status} clientid={pk_clientid}")

    is_paid = str(pk_status).upper() in ("APPROVED", "PAID", "AUTHORIZED", "SUCCEEDED", "COMPLETED", "")

    if pk_id and not pk_status:
        is_paid = True

    if not is_paid:
        send_telegram(
            f"<b>Точка webhook</b>: статус {pk_status}\n"
            f"id: {pk_id}\norderid: {pk_orderid}\n"
            f"Сумма: {pk_sum}\nEmail: {pk_client_email or '—'}"
        )
        return resp(200, {"ok": True, "status": pk_status})

    conn = get_conn()
    updated_estimate_orders = []
    updated_orders = []

    try:
        with conn.cursor() as cur:
            if pk_orderid:
                cur.execute(
                    f"""UPDATE {S}estimate_orders
                        SET status='paid', paid_at=NOW(), updated_at=NOW()
                        WHERE order_number=%s AND status='pending'
                        RETURNING id, order_number, client_name, client_email, client_phone, amount, user_id""",
                    (pk_orderid,),
                )
                updated_estimate_orders.extend(cur.fetchall())

            if not updated_estimate_orders and pk_id:
                cur.execute(
                    f"""UPDATE {S}estimate_orders
                        SET status='paid', paid_at=NOW(), updated_at=NOW()
                        WHERE yookassa_payment_id=%s AND status='pending'
                        RETURNING id, order_number, client_name, client_email, client_phone, amount, user_id""",
                    (str(pk_id),),
                )
                updated_estimate_orders.extend(cur.fetchall())

            if pk_orderid:
                cur.execute(
                    f"""UPDATE {S}orders
                        SET status='paid', paid_at=NOW(), updated_at=NOW()
                        WHERE order_number=%s AND status='pending'
                        RETURNING id, order_number, user_name, user_email, amount""",
                    (pk_orderid,),
                )
                updated_orders.extend(cur.fetchall())

            if not updated_orders and pk_id:
                cur.execute(
                    f"""UPDATE {S}orders
                        SET status='paid', paid_at=NOW(), updated_at=NOW()
                        WHERE yookassa_payment_id=%s AND status='pending'
                        RETURNING id, order_number, user_name, user_email, amount""",
                    (str(pk_id),),
                )
                updated_orders.extend(cur.fetchall())

            if pk_id:
                cur.execute(
                    f"""UPDATE {S}payments
                        SET status='paid', updated_at=NOW()
                        WHERE yukassa_payment_id=%s AND status='pending'""",
                    (str(pk_id),),
                )

            conn.commit()

    except Exception as e:
        conn.rollback()
        print(f"[tochka-webhook] DB error: {e}")
        send_telegram(f"[tochka-webhook] DB error: {e}\nid: {pk_id}\norderid: {pk_orderid}")
        return resp(200, {"ok": True, "error": str(e)})
    finally:
        conn.close()

    for row in updated_estimate_orders:
        oid, order_number, client_name, client_email, client_phone, amount, user_id = row
        if client_email:
            send_email(
                client_email,
                f"Авангард: ваш заказ {order_number} оплачен",
                client_paid_email(order_number, client_name, float(amount)),
            )
        send_telegram(
            f"<b>Оплата получена (смета)</b>\n"
            f"Заказ: <b>{order_number}</b>\n"
            f"Сумма: <b>{float(amount):.0f} ₽</b>\n"
            f"Клиент: {client_name or '—'}\n"
            f"Email: {client_email or '—'}\n"
            f"Тел: {client_phone or '—'}"
        )

    for row in updated_orders:
        oid, order_number, user_name, user_email, amount = row
        if user_email:
            send_email(
                user_email,
                f"Авангард: заказ {order_number} оплачен",
                client_paid_email(order_number, user_name, float(amount)),
            )
        send_telegram(
            f"<b>Оплата получена (заказ)</b>\n"
            f"Заказ: <b>{order_number}</b>\n"
            f"Сумма: <b>{float(amount):.0f} ₽</b>\n"
            f"Клиент: {user_name or '—'} ({user_email or '—'})"
        )

    total_updated = len(updated_estimate_orders) + len(updated_orders)
    if total_updated == 0:
        send_telegram(
            f"<b>Точка webhook — оплата без заказа!</b>\n"
            f"id: {pk_id}\norderid: {pk_orderid}\n"
            f"Сумма: {pk_sum}\nEmail: {pk_client_email or '—'}\n"
            f"Описание: {pk_service_name or '—'}"
        )

    return resp(200, {
        "ok": True,
        "updated_estimate_orders": len(updated_estimate_orders),
        "updated_orders": len(updated_orders),
    })
