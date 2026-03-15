"""
Управление заказами смет (estimate_orders) с оплатой через Точка Банк:
- POST action=create_order — создание записи + платёжная ссылка через API Точки
- POST action=check_status — проверка статуса по order_number
- POST action=check_user_paid — проверка оплаты по user_id / email
"""
import json
import os
import uuid
import smtplib
import ssl
import urllib.request
import urllib.error
import urllib.parse
import hashlib
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

TOCHKA_API = "https://enter.tochka.com/uapi/acquiring/v1.0"
CUSTOMER_CODE = "302664947"
FALLBACK_CHECKOUT = "https://checkout.tochka.com/d527d3a3-af1a-49cf-b2f7-87b76ce2ff32"


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
        print(f"[estimate-payment] email error: {e}")
        return False


PLAN_LABELS = {
    "estimate_print": "Смета + распечатка",
    "estimate_digital": "Смета в PDF",
    "estimate_consult": "Смета + консультация эксперта",
}


def create_tochka_payment(amount, purpose, external_id, redirect_url):
    """Создать платёжную ссылку через API Точка Банка (Open API)."""
    jwt_token = os.environ.get("TOCHKA_JWT_TOKEN", "").strip()
    if not jwt_token:
        return None, "TOCHKA_JWT_TOKEN не настроен"

    payload = {
        "Data": {
            "customerCode": CUSTOMER_CODE,
            "amount": round(amount, 2),
            "currency": "RUB",
            "purpose": purpose[:140],
            "externalId": external_id,
            "paymentMode": ["sbp", "card"],
            "redirectUrl": redirect_url,
            "failRedirectUrl": redirect_url,
        }
    }
    req = urllib.request.Request(
        f"{TOCHKA_API}/payments",
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {jwt_token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            result = json.loads(r.read().decode())
        data = result.get("Data", {})
        payment_url = data.get("paymentUrl") or data.get("url") or data.get("link") or ""
        payment_link_id = data.get("paymentLinkId") or data.get("paymentId") or external_id
        return {"payment_url": payment_url, "payment_link_id": payment_link_id}, None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode() if e.fp else str(e)
        print(f"[estimate-payment] Tochka API error {e.code}: {err_body[:300]}")
        return None, f"Tochka API ({e.code})"
    except Exception as e:
        print(f"[estimate-payment] Tochka request error: {e}")
        return None, str(e)


def client_email_html(plan_type: str, order_number: str, client_name: str) -> str:
    label = PLAN_LABELS.get(plan_type, plan_type)
    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 540px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 28px 32px;">
      <h1 style="color: #fff; margin: 0; font-size: 20px;">Оплата прошла успешно!</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">Авангард · Заказ сметы</p>
    </div>
    <div style="padding: 28px 32px;">
      <p style="color: #333; font-size: 15px;">Здравствуйте, <strong>{client_name or 'уважаемый клиент'}</strong>!</p>
      <p style="color: #555; font-size: 14px; margin-bottom: 20px;">
        Ваш заказ <strong>«{label}»</strong> принят и оплачен. Наш специалист свяжется с вами в ближайшее рабочее время для уточнения деталей.
      </p>
      <div style="background: #f9fafb; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px;">
        <p style="margin: 0; color: #888; font-size: 13px;">Номер заказа</p>
        <p style="margin: 4px 0 0; color: #111; font-size: 17px; font-weight: 700;">{order_number}</p>
      </div>
      <p style="color: #888; font-size: 13px;">Если у вас есть вопросы — звоните: <strong>8 (927) 748-68-68</strong></p>
    </div>
    <div style="background: #f9fafb; padding: 14px 32px; text-align: center;">
      <p style="color: #bbb; font-size: 11px; margin: 0;">Авангард · avangard-ai.ru · Автоматическое уведомление</p>
    </div>
  </div>
</body></html>"""


def admin_email_html(plan_type: str, order_number: str, client_name: str,
                     client_email: str, client_phone: str, client_comment: str, amount: float) -> str:
    label = PLAN_LABELS.get(plan_type, plan_type)
    fmt = lambda n: f"{n:,.0f}".replace(",", " ")
    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 540px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 28px 32px;">
      <h1 style="color: #fff; margin: 0; font-size: 20px;">Новый оплаченный заказ!</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">Авангард · Заказ сметы · {order_number}</p>
    </div>
    <div style="padding: 28px 32px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="color: #888; padding: 5px 0; width: 130px;">Тариф</td><td style="color: #111; font-weight: 600;">{label}</td></tr>
        <tr><td style="color: #888; padding: 5px 0;">Сумма</td><td style="color: #16a34a; font-weight: 700; font-size: 16px;">{fmt(amount)} ₽</td></tr>
        <tr><td style="color: #888; padding: 5px 0;">Клиент</td><td style="color: #111; font-weight: 600;">{client_name or '—'}</td></tr>
        <tr><td style="color: #888; padding: 5px 0;">Email</td><td style="color: #111;">{client_email or '—'}</td></tr>
        <tr><td style="color: #888; padding: 5px 0;">Телефон</td><td style="color: #111;">{client_phone or '—'}</td></tr>
        <tr><td style="color: #888; padding: 5px 0; vertical-align: top;">Комментарий</td><td style="color: #555;">{client_comment or '—'}</td></tr>
      </table>
    </div>
  </div>
</body></html>"""


def handler(event: dict, context) -> dict:
    """Обработка запросов на создание и проверку заказов смет с оплатой через Точка Банк."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    raw = event.get("body") or "{}"
    body = json.loads(raw)
    action = body.get("action", "")

    if action == "check_user_paid":
        user_id = body.get("user_id")
        client_email = body.get("client_email", "")

        if not user_id and not client_email:
            return resp(400, {"error": "user_id или client_email обязательны"})

        conn = get_conn()
        with conn.cursor() as cur:
            if user_id:
                cur.execute(
                    f"""SELECT id, order_number, plan_type, amount, paid_at
                        FROM {S}estimate_orders
                        WHERE user_id=%s AND status='paid'
                        ORDER BY paid_at DESC LIMIT 1""",
                    (int(user_id),),
                )
            else:
                cur.execute(
                    f"""SELECT id, order_number, plan_type, amount, paid_at
                        FROM {S}estimate_orders
                        WHERE LOWER(client_email)=LOWER(%s) AND status='paid'
                        ORDER BY paid_at DESC LIMIT 1""",
                    (client_email,),
                )
            row = cur.fetchone()
        conn.close()

        if row:
            return resp(200, {
                "paid": True,
                "order_id": row[0], "order_number": row[1], "plan_type": row[2],
                "amount": float(row[3]), "paid_at": str(row[4]) if row[4] else None,
            })
        return resp(200, {"paid": False})

    if action == "create_order":
        plan_type = body.get("plan_type", "")
        amount = float(body.get("amount", 0))
        client_name = body.get("client_name", "")
        client_email = body.get("client_email", "")
        client_phone = body.get("client_phone", "")
        client_comment = body.get("client_comment", "")
        user_id = body.get("user_id")
        return_url = body.get("return_url", "https://avangard-ai.ru/prices")

        if not plan_type or not amount:
            return resp(400, {"error": "plan_type и amount обязательны"})

        external_id = str(uuid.uuid4())
        label = PLAN_LABELS.get(plan_type, plan_type)

        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute(
                f"""INSERT INTO {S}estimate_orders
                    (plan_type, amount, client_name, client_email, client_phone, client_comment, user_id, status, payment_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending', %s)
                    RETURNING id""",
                (plan_type, amount, client_name, client_email, client_phone, client_comment,
                 int(user_id) if user_id else None, external_id),
            )
            order_id = cur.fetchone()[0]
            order_number = f"EST-{order_id:05d}"
            cur.execute(
                f"UPDATE {S}estimate_orders SET order_number=%s WHERE id=%s",
                (order_number, order_id),
            )
            conn.commit()

        purpose = f"{label} ({order_number})"
        payment_result, err = create_tochka_payment(amount, purpose, external_id, return_url)

        payment_url = FALLBACK_CHECKOUT
        payment_link_id = external_id
        api_used = False

        if payment_result and payment_result.get("payment_url"):
            payment_url = payment_result["payment_url"]
            payment_link_id = payment_result.get("payment_link_id", external_id)
            api_used = True
        elif err:
            print(f"[estimate-payment] API fallback for {order_number}: {err}")

        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute(
                f"""UPDATE {S}estimate_orders
                    SET yookassa_payment_id=%s, payment_id=%s, updated_at=NOW()
                    WHERE id=%s""",
                (payment_link_id, external_id, order_id),
            )
            conn.commit()
        conn.close()

        send_telegram(
            f"<b>Новый заказ сметы</b>\n"
            f"Заказ: <b>{order_number}</b>\n"
            f"Тариф: {label}\n"
            f"Сумма: <b>{amount:.0f} ₽</b>\n"
            f"Клиент: {client_name or '—'}\n"
            f"Email: {client_email or '—'}\n"
            f"API: {'да' if api_used else 'фоллбэк'}"
        )

        return resp(200, {
            "order_id": order_id,
            "order_number": order_number,
            "payment_url": payment_url,
            "payment_id": payment_link_id,
        })

    if action == "check_status":
        order_number = body.get("order_number", "")
        if not order_number:
            return resp(400, {"error": "order_number обязателен"})
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT id, status, plan_type, amount, paid_at FROM {S}estimate_orders WHERE order_number=%s",
                (order_number,),
            )
            row = cur.fetchone()
        conn.close()
        if not row:
            return resp(404, {"error": "Заказ не найден"})
        return resp(200, {
            "order_id": row[0], "status": row[1], "plan_type": row[2],
            "amount": float(row[3]), "paid_at": str(row[4]) if row[4] else None,
        })

    return resp(400, {"error": f"Неизвестный action: {action}"})
