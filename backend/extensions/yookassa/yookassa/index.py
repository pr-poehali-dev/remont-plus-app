"""Создание платёжной ссылки через интернет-эквайринг Точка Банка."""
import json
import os
import re
import uuid
import hashlib
import hmac
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from urllib.parse import urlencode

import psycopg2


EMAIL_REGEX = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
MIN_AMOUNT = 1.00
MAX_AMOUNT = 1_000_000.00

TOCHKA_TOKEN_URL = "https://enter.tochka.com/connect/token"
TOCHKA_API_BASE = "https://enter.tochka.com/uapi/acquiring/v1.0"

HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
}


def is_valid_email(email: str) -> bool:
    return bool(EMAIL_REGEX.match(email))


def is_valid_url(url: str) -> bool:
    return url.startswith('https://')


def get_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_schema() -> str:
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    return f"{schema}." if schema else ""


def get_access_token(client_id: str, client_secret: str) -> str:
    """Получить Bearer-токен через OAuth2 client_credentials."""
    data = urlencode({
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret,
        'scope': 'acquiring:payments'
    }).encode('utf-8')

    req = Request(
        TOCHKA_TOKEN_URL,
        data=data,
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
        method='POST'
    )
    try:
        with urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode())
        print(f"[token] got access_token ok, keys: {list(result.keys())}")
        return result['access_token']
    except HTTPError as e:
        err = e.read().decode() if e.fp else str(e)
        print(f"[token] ERROR {e.code}: {err}")
        raise


def get_customer_code(access_token: str) -> str:
    """Получить customerCode (код счёта/клиента) из API Точка Банка."""
    req = Request(
        f"{TOCHKA_API_BASE}/customers",
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        },
        method='GET'
    )
    try:
        with urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode())
        print(f"[customers] response: {json.dumps(result)[:500]}")
        # Берём первый customerCode из списка
        items = result.get('Data', result).get('customers', result.get('Data', []))
        if isinstance(items, list) and items:
            return items[0].get('customerCode', '')
        return ''
    except HTTPError as e:
        err = e.read().decode() if e.fp else str(e)
        print(f"[customers] ERROR {e.code}: {err}")
        return ''


def create_tochka_payment(
    access_token: str,
    customer_code: str,
    amount: float,
    purpose: str,
    payment_link_id: str,
    redirect_url: str,
    fail_redirect_url: str,
    metadata_str: str = ''
) -> dict:
    """Создать платёжную ссылку в Точка Банке."""
    payload = {
        "Data": {
            "customerCode": customer_code,
            "amount": int(round(amount * 100)),
            "currency": "RUB",
            "purpose": purpose[:140],
            "paymentLinkId": payment_link_id,
            "redirectUrl": redirect_url,
            "failRedirectUrl": fail_redirect_url,
            "saveCard": False
        }
    }

    if metadata_str:
        payload["Data"]["description"] = metadata_str[:255]

    print(f"[payment] POST /payment-links payload: {json.dumps(payload)[:500]}")

    req = Request(
        f"{TOCHKA_API_BASE}/payment-links",
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        },
        method='POST'
    )

    try:
        with urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode())
        print(f"[payment] response: {json.dumps(result)[:500]}")
        return result
    except HTTPError as e:
        err = e.read().decode() if e.fp else str(e)
        print(f"[payment] ERROR {e.code}: {err}")
        raise


def handler(event, context):
    """Создание платёжной ссылки Точка Банк для оплаты заказа."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}

    body = event.get('body', '{}')
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Invalid JSON'})}

    amount = float(data.get('amount', 0))
    user_name = data.get('user_name', '').strip()
    user_email = data.get('user_email', '').strip()
    user_phone = data.get('user_phone', '').strip()
    return_url = data.get('return_url', '').strip()
    fail_url = data.get('fail_url', return_url).strip()
    description = data.get('description', 'Оплата заказа')
    cart_items = data.get('cart_items', [])
    extra_metadata = data.get('metadata', {})

    if amount < MIN_AMOUNT or amount > MAX_AMOUNT:
        return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': f'Amount must be between {MIN_AMOUNT} and {MAX_AMOUNT} RUB'})}

    if not user_email or not is_valid_email(user_email):
        return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Valid email is required'})}

    if not return_url or not is_valid_url(return_url):
        return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'return_url must be a valid HTTPS URL'})}

    client_id = os.environ.get('TOCHKA_LOGIN', '')
    client_secret = os.environ.get('TOCHKA_SECRET_KEY', '')

    if not client_id or not client_secret:
        return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps({'error': 'Tochka Bank credentials not configured'})}

    if not cart_items:
        cart_items = [{'id': '1', 'name': description or 'Оплата', 'price': amount, 'quantity': 1}]

    S = get_schema()
    conn = get_connection()

    try:
        cur = conn.cursor()
        now = datetime.utcnow().isoformat()

        order_number = f"TK-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
        payment_link_id = uuid.uuid4().hex

        cur.execute(f"""
            INSERT INTO {S}orders
            (order_number, user_name, user_email, user_phone, amount, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, 'pending', %s, %s)
            RETURNING id
        """, (order_number, user_name, user_email, user_phone, amount, now, now))

        order_id = cur.fetchone()[0]

        for item in cart_items:
            cur.execute(f"""
                INSERT INTO {S}order_items
                (order_id, product_id, product_name, product_price, quantity, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                order_id,
                str(item.get('id', '')),
                item.get('name', ''),
                item.get('price', 0),
                item.get('quantity', 1),
                now
            ))

        metadata_parts = {
            "order_id": str(order_id),
            "order_number": order_number,
            **{k: str(v) for k, v in extra_metadata.items() if k in (
                "user_id", "plan_code", "contractor_id", "builder_plan_code", "months"
            )}
        }

        purpose = f"{description} ({order_number})"
        metadata_str = json.dumps(metadata_parts, ensure_ascii=False)

        access_token = get_access_token(client_id, client_secret)

        # Получаем реальный customerCode (не логин!)
        customer_code = get_customer_code(access_token) or client_id
        print(f"[payment] using customerCode={customer_code}")

        payment_response = create_tochka_payment(
            access_token=access_token,
            customer_code=customer_code,
            amount=amount,
            purpose=purpose,
            payment_link_id=payment_link_id,
            redirect_url=return_url,
            fail_redirect_url=fail_url or return_url,
            metadata_str=metadata_str
        )

        tochka_data = payment_response.get('Data', {})
        confirmation_url = tochka_data.get('paymentUrl') or tochka_data.get('url') or ''
        tochka_payment_id = tochka_data.get('paymentLinkId', payment_link_id)

        cur.execute(f"""
            UPDATE {S}orders
            SET yookassa_payment_id = %s, payment_url = %s, updated_at = %s
            WHERE id = %s
        """, (tochka_payment_id, confirmation_url, now, order_id))

        conn.commit()

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({
                'payment_url': confirmation_url,
                'payment_id': tochka_payment_id,
                'order_id': order_id,
                'order_number': order_number
            })
        }

    except HTTPError as e:
        conn.rollback()
        error_body = e.read().decode() if e.fp else str(e)
        return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps({'error': f'Tochka API error: {error_body}'})}
    except Exception as e:
        conn.rollback()
        return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps({'error': str(e)})}
    finally:
        conn.close()