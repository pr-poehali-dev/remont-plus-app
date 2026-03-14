"""Создание платёжной ссылки через интернет-эквайринг Точка Банка."""
import json
import os
import re
import uuid
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.error import HTTPError

import psycopg2


EMAIL_REGEX = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
MIN_AMOUNT = 1.00
MAX_AMOUNT = 1_000_000.00

CUSTOMER_CODE = "302664947"
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


def create_tochka_payment(
    jwt_token: str,
    amount: float,
    purpose: str,
    payment_link_id: str,
    redirect_url: str,
    fail_redirect_url: str,
) -> dict:
    """Создать платёжную ссылку в Точка Банке."""
    payload = {
        "Data": {
            "customerCode": CUSTOMER_CODE,
            "amount": round(amount, 2),
            "currency": "RUB",
            "purpose": purpose[:140],
            "externalId": payment_link_id,
            "paymentMode": ["card", "sbp"],
            "redirectUrl": redirect_url,
            "failRedirectUrl": fail_redirect_url,
        }
    }

    print(f"[payment] POST payload: {json.dumps(payload)[:500]}")

    req = Request(
        f"{TOCHKA_API_BASE}/payments",
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {jwt_token}',
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

    jwt_token = os.environ.get('TOCHKA_JWT_TOKEN', '').strip()
    if not jwt_token:
        return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps({'error': 'Tochka JWT token not configured'})}

    if not cart_items:
        cart_items = [{'id': '1', 'name': description or 'Оплата', 'price': amount, 'quantity': 1}]

    S = get_schema()
    conn = get_connection()

    try:
        cur = conn.cursor()
        now = datetime.utcnow().isoformat()

        order_number = f"TK-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
        payment_link_id = str(uuid.uuid4())

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

        conn.commit()

        purpose = f"{description} ({order_number})"

        payment_response = create_tochka_payment(
            jwt_token=jwt_token,
            amount=amount,
            purpose=purpose,
            payment_link_id=payment_link_id,
            redirect_url=return_url,
            fail_redirect_url=fail_url or return_url,
        )

        tochka_data = payment_response.get('Data', {})
        confirmation_url = (
            tochka_data.get('paymentUrl') or
            tochka_data.get('url') or
            tochka_data.get('link') or ''
        )
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
        print(f"[handler] HTTPError: {e.code} {error_body}")
        return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps({'error': f'Tochka API error: {error_body}'})}
    except Exception as e:
        conn.rollback()
        import traceback
        print(f"[handler] Exception: {traceback.format_exc()}")
        return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps({'error': str(e)})}
    finally:
        conn.close()