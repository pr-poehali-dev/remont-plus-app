"""Создание платежей через PayKeeper API (Точка Банк) и управление заказами."""
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
PAYKEEPER_BASE = "https://checkout.tochka.com"

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


def paykeeper_request(path, data=None, method="GET"):
    """Выполнить запрос к PayKeeper API (Точка Банк эквайринг)."""
    import base64
    login = os.environ.get("TOCHKA_LOGIN", "").strip()
    secret = os.environ.get("TOCHKA_SECRET_KEY", "").strip()
    if not login or not secret:
        return None, "TOCHKA_LOGIN или TOCHKA_SECRET_KEY не настроены"

    auth = base64.b64encode(f"{login}:{secret}".encode()).decode()
    url = f"{PAYKEEPER_BASE}/{path.lstrip('/')}"

    headers = {"Authorization": f"Basic {auth}"}
    body = None
    if data and method == "POST":
        body = urllib.parse.urlencode(data).encode() if isinstance(data, dict) else data
        headers["Content-Type"] = "application/x-www-form-urlencoded"

    req = urlreq.Request(url, data=body, headers=headers, method=method)
    try:
        with urlreq.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode()), None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode() if e.fp else str(e)
        print(f"[payments] PayKeeper error {e.code}: {err_body}")
        return None, f"PayKeeper ({e.code}): {err_body[:200]}"
    except Exception as e:
        print(f"[payments] PayKeeper request error: {e}")
        return None, str(e)


def create_tochka_payment(amount, purpose, order_id, client_email="", client_phone=""):
    """Создать уникальную платёжную ссылку через PayKeeper API."""
    token_resp, err = paykeeper_request("/info/settings/token/")
    if err:
        return None, err
    token = token_resp.get("token", "")
    if not token:
        return None, "Не удалось получить security token"

    sign_str = f"{amount:.2f}{client_email}{order_id}{purpose}{token}"
    sign = hashlib.md5(sign_str.encode()).hexdigest()

    invoice_data = {
        "pay_amount": f"{amount:.2f}",
        "clientid": purpose[:255],
        "orderid": str(order_id),
        "service_name": purpose[:255],
        "client_email": client_email,
        "client_phone": client_phone,
        "token": token,
        "sign": sign,
    }

    result, err = paykeeper_request("/change/invoice/preview/", data=invoice_data, method="POST")
    if err:
        return None, err

    invoice_id = result.get("invoice_id", "")
    if not invoice_id:
        return None, f"Нет invoice_id в ответе: {json.dumps(result)[:200]}"

    payment_url = f"{PAYKEEPER_BASE}/bill/{invoice_id}/"
    return {"payment_url": payment_url, "invoice_id": str(invoice_id)}, None


def handle_create_payment(body):
    """POST — создание платежа с уникальной ссылкой через PayKeeper."""
    amount = float(body.get('amount', 0))
    user_email = body.get('user_email', '').strip()
    user_name = body.get('user_name', '').strip()
    user_phone = body.get('user_phone', '').strip()
    description = body.get('description', 'Оплата')
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
        payment_result, err = create_tochka_payment(amount, purpose, order_number, user_email, user_phone)

        if err or not payment_result:
            cur.execute(f"UPDATE {SCHEMA}.orders SET status='error', updated_at=%s WHERE id=%s", (now, order_id))
            conn.commit()
            return {'statusCode': 500, 'headers': JSON_HEADERS, 'body': json.dumps({'error': f'Не удалось создать платёж: {err}'})}

        payment_url = payment_result["payment_url"]
        invoice_id = payment_result["invoice_id"]

        cur.execute(f"""
            UPDATE {SCHEMA}.orders SET yookassa_payment_id = %s, payment_url = %s, updated_at = %s WHERE id = %s
        """, (invoice_id, payment_url, now, order_id))
        conn.commit()

        user_id = metadata.get('user_id')
        plan_code = metadata.get('plan_code')
        if user_id and plan_code:
            cur.execute(f"""
                INSERT INTO {SCHEMA}.payments (user_id, plan_code, yukassa_payment_id, amount, status, payment_url, created_at, updated_at)
                VALUES (%s, %s, %s, %s, 'pending', %s, %s, %s)
            """, (int(user_id), plan_code, invoice_id, amount, payment_url, now, now))
            conn.commit()

        send_telegram(
            f"🛒 <b>Новый заказ</b>\n\n"
            f"📋 Заказ: {order_number}\n"
            f"💰 Сумма: {amount:,.0f} ₽\n".replace(',', ' ') +
            f"👤 {user_name} ({user_email})\n"
            f"📝 {description}\n"
            f"Invoice ID: {invoice_id}"
        )

        return {
            'statusCode': 200,
            'headers': JSON_HEADERS,
            'body': json.dumps({
                'payment_url': payment_url,
                'invoice_id': invoice_id,
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
    """Создание платежей через PayKeeper API (Точка Банк) с уникальной ссылкой на каждый заказ."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}

    if method == 'GET':
        return handle_get_payments(params)

    body = json.loads(event.get('body') or '{}')
    return handle_create_payment(body)
