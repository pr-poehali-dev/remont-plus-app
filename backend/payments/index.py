"""Создание платежей через API Точка Банк и управление заказами."""
import json
import os
import uuid
import hashlib
import urllib.request as urlreq
import urllib.error
import urllib.parse
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
}
JSON_HEADERS = {'Content-Type': 'application/json', **CORS}

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p46588937_remont_plus_app')

TOCHKA_API = "https://enter.tochka.com/uapi/acquiring/v1.0"
CUSTOMER_CODE = "302664947"
FALLBACK_CHECKOUT = "https://checkout.tochka.com/d527d3a3-af1a-49cf-b2f7-87b76ce2ff32"

PLAN_NAMES = {
    'start': 'Тариф START', 'pro': 'Тариф PRO', 'max': 'Тариф MAX',
    'studio': 'Тариф STUDIO', 'business': 'Тариф BUSINESS', 'enterprise': 'Тариф ENTERPRISE',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def send_telegram(message: str):
    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')
    if not token or not chat_id:
        return
    data = json.dumps({'chat_id': chat_id, 'text': message, 'parse_mode': 'HTML'}).encode()
    req = urlreq.Request(f'https://api.telegram.org/bot{token}/sendMessage', data=data, headers={'Content-Type': 'application/json'})
    try:
        urlreq.urlopen(req, timeout=10)
    except Exception:
        pass


def create_tochka_payment(amount, purpose, external_id, redirect_url):
    """Создать платёжную ссылку через Tochka Open API."""
    jwt_token = os.environ.get('TOCHKA_JWT_TOKEN', '').strip()
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
    req = urlreq.Request(
        f"{TOCHKA_API}/payments",
        data=json.dumps(payload).encode(),
        headers={'Authorization': f'Bearer {jwt_token}', 'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urlreq.urlopen(req, timeout=30) as r:
            result = json.loads(r.read().decode())
        d = result.get('Data', {})
        payment_url = d.get('paymentUrl') or d.get('url') or d.get('link') or ''
        payment_link_id = d.get('paymentLinkId') or d.get('paymentId') or external_id
        return {"payment_url": payment_url, "payment_link_id": payment_link_id}, None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode() if e.fp else str(e)
        print(f"[payments] Tochka API error {e.code}: {err_body[:300]}")
        return None, f"Tochka API ({e.code})"
    except Exception as e:
        print(f"[payments] Tochka request error: {e}")
        return None, str(e)


def handle_create_payment(body):
    """POST — создание платежа с ссылкой на оплату."""
    amount = float(body.get('amount', 0))
    user_email = body.get('user_email', '').strip()
    user_name = body.get('user_name', '').strip()
    user_phone = body.get('user_phone', '').strip()
    description = body.get('description', 'Оплата')
    return_url = body.get('return_url', 'https://avangard-ai.ru').strip()
    cart_items = body.get('cart_items', [])
    metadata = body.get('metadata', {})

    if amount < 1:
        return {'statusCode': 400, 'headers': JSON_HEADERS, 'body': json.dumps({'error': 'Сумма должна быть не менее 1 ₽'})}
    if not user_email:
        return {'statusCode': 400, 'headers': JSON_HEADERS, 'body': json.dumps({'error': 'Email обязателен'})}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        now = datetime.utcnow().isoformat()
        order_number = f"TK-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
        external_id = str(uuid.uuid4())

        cur.execute(f"""
            INSERT INTO {SCHEMA}.orders
            (order_number, user_name, user_email, user_phone, amount, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, 'pending', %s, %s)
            RETURNING id
        """, (order_number, user_name, user_email, user_phone, amount, now, now))
        order_id = cur.fetchone()['id']

        if not cart_items:
            cart_items = [{'id': '1', 'name': description, 'price': amount, 'quantity': 1}]

        for item in cart_items:
            cur.execute(f"""
                INSERT INTO {SCHEMA}.order_items (order_id, product_id, product_name, product_price, quantity, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (order_id, str(item.get('id', '')), item.get('name', ''), item.get('price', 0), item.get('quantity', 1), now))

        conn.commit()

        purpose = f"{description} ({order_number})"
        payment_result, err = create_tochka_payment(amount, purpose, external_id, return_url)

        payment_url = FALLBACK_CHECKOUT
        payment_link_id = external_id
        api_used = False

        if payment_result and payment_result.get("payment_url"):
            payment_url = payment_result["payment_url"]
            payment_link_id = payment_result.get("payment_link_id", external_id)
            api_used = True
        elif err:
            print(f"[payments] API fallback for {order_number}: {err}")

        cur.execute(f"""
            UPDATE {SCHEMA}.orders SET yookassa_payment_id = %s, payment_url = %s, updated_at = %s WHERE id = %s
        """, (payment_link_id, payment_url, now, order_id))
        conn.commit()

        user_id = metadata.get('user_id')
        plan_code = metadata.get('plan_code')
        if user_id and plan_code:
            cur.execute(f"""
                INSERT INTO {SCHEMA}.payments (user_id, plan_code, yukassa_payment_id, amount, status, payment_url, created_at, updated_at)
                VALUES (%s, %s, %s, %s, 'pending', %s, %s, %s)
            """, (int(user_id), plan_code, payment_link_id, amount, payment_url, now, now))
            conn.commit()

        send_telegram(
            f"🛒 <b>Новый заказ</b>\n\n"
            f"📋 Заказ: {order_number}\n"
            f"💰 Сумма: {amount:,.0f} ₽\n".replace(',', ' ') +
            f"👤 {user_name} ({user_email})\n"
            f"📝 {description}\n"
            f"API: {'да' if api_used else 'фоллбэк'}"
        )

        return {
            'statusCode': 200,
            'headers': JSON_HEADERS,
            'body': json.dumps({
                'payment_url': payment_url,
                'payment_id': payment_link_id,
                'order_id': order_id,
                'order_number': order_number,
            })
        }

    except Exception as e:
        conn.rollback()
        import traceback
        print(f"[payments] Error: {traceback.format_exc()}")
        return {'statusCode': 500, 'headers': JSON_HEADERS, 'body': json.dumps({'error': str(e)})}
    finally:
        cur.close()
        conn.close()


def handle_get_payments(params):
    """GET — история платежей пользователя."""
    user_id = params.get('user_id', '')
    if not user_id:
        return {'statusCode': 400, 'headers': JSON_HEADERS, 'body': json.dumps({'error': 'user_id required'})}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(f"SELECT * FROM {SCHEMA}.payments WHERE user_id = %s ORDER BY created_at DESC LIMIT 20", (int(user_id),))
        rows = [dict(r) for r in cur.fetchall()]
        return {'statusCode': 200, 'headers': JSON_HEADERS, 'body': json.dumps({'payments': rows}, default=str)}
    finally:
        cur.close()
        conn.close()


def handler(event: dict, context) -> dict:
    """Создание платежей через API Точка Банк с уникальной ссылкой на каждый заказ."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}

    if method == 'GET':
        return handle_get_payments(params)

    body = json.loads(event.get('body') or '{}')
    return handle_create_payment(body)
