"""Создание платежей через Точка Банк и обработка вебхуков."""
import json
import os
import uuid
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import urllib.request as urlreq
import urllib.error

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
}
JSON_HEADERS = {'Content-Type': 'application/json', **CORS}

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p46588937_remont_plus_app')
CUSTOMER_CODE = "302664947"
TOCHKA_API = "https://enter.tochka.com/uapi/acquiring/v1.0"

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


def create_tochka_payment(jwt_token, amount, purpose, external_id, redirect_url, fail_redirect_url):
    """Создать платёжную ссылку через API Точка Банка."""
    payload = {
        "Data": {
            "customerCode": CUSTOMER_CODE,
            "amount": round(amount, 2),
            "currency": "RUB",
            "purpose": purpose[:140],
            "externalId": external_id,
            "paymentMode": ["card", "sbp"],
            "redirectUrl": redirect_url,
            "failRedirectUrl": fail_redirect_url,
        }
    }
    req = urlreq.Request(
        f"{TOCHKA_API}/payments",
        data=json.dumps(payload).encode(),
        headers={'Authorization': f'Bearer {jwt_token}', 'Content-Type': 'application/json'},
        method='POST'
    )
    with urlreq.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def handle_create_payment(body):
    """POST — создание платежа."""
    amount = float(body.get('amount', 0))
    user_email = body.get('user_email', '').strip()
    user_name = body.get('user_name', '').strip()
    user_phone = body.get('user_phone', '').strip()
    description = body.get('description', 'Оплата')
    return_url = body.get('return_url', '').strip()
    fail_url = body.get('fail_url', return_url).strip()
    cart_items = body.get('cart_items', [])
    metadata = body.get('metadata', {})

    if amount < 1:
        return {'statusCode': 400, 'headers': JSON_HEADERS, 'body': json.dumps({'error': 'Сумма должна быть не менее 1 ₽'})}
    if not user_email:
        return {'statusCode': 400, 'headers': JSON_HEADERS, 'body': json.dumps({'error': 'Email обязателен'})}
    if not return_url:
        return {'statusCode': 400, 'headers': JSON_HEADERS, 'body': json.dumps({'error': 'return_url обязателен'})}

    jwt_token = os.environ.get('TOCHKA_JWT_TOKEN', '').strip()
    if not jwt_token:
        return {'statusCode': 500, 'headers': JSON_HEADERS, 'body': json.dumps({'error': 'Платёжная система не настроена'})}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        now = datetime.utcnow().isoformat()
        order_number = f"TK-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
        payment_link_id = str(uuid.uuid4())

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
        payment_response = create_tochka_payment(
            jwt_token=jwt_token,
            amount=amount,
            purpose=purpose,
            external_id=payment_link_id,
            redirect_url=return_url,
            fail_redirect_url=fail_url or return_url,
        )

        tochka_data = payment_response.get('Data', {})
        payment_url = tochka_data.get('paymentUrl') or tochka_data.get('url') or tochka_data.get('link') or ''
        tochka_payment_id = tochka_data.get('paymentLinkId', payment_link_id)

        cur.execute(f"""
            UPDATE {SCHEMA}.orders SET yookassa_payment_id = %s, payment_url = %s, updated_at = %s WHERE id = %s
        """, (tochka_payment_id, payment_url, now, order_id))
        conn.commit()

        user_id = metadata.get('user_id')
        plan_code = metadata.get('plan_code')
        if user_id and plan_code:
            cur.execute(f"""
                INSERT INTO {SCHEMA}.payments (user_id, plan_code, yukassa_payment_id, amount, status, payment_url, created_at, updated_at)
                VALUES (%s, %s, %s, %s, 'pending', %s, %s, %s)
            """, (int(user_id), plan_code, tochka_payment_id, amount, payment_url, now, now))
            conn.commit()

        send_telegram(
            f"🛒 <b>Новый заказ</b>\n\n"
            f"📋 Заказ: {order_number}\n"
            f"💰 Сумма: {amount:,.0f} ₽\n".replace(',', ' ') +
            f"👤 {user_name} ({user_email})\n"
            f"📝 {description}"
        )

        return {
            'statusCode': 200,
            'headers': JSON_HEADERS,
            'body': json.dumps({
                'payment_url': payment_url,
                'payment_id': tochka_payment_id,
                'order_id': order_id,
                'order_number': order_number,
            })
        }

    except urllib.error.HTTPError as e:
        conn.rollback()
        err = e.read().decode() if e.fp else str(e)
        print(f"[payments] Tochka HTTPError {e.code}: {err}")
        return {'statusCode': 500, 'headers': JSON_HEADERS, 'body': json.dumps({'error': f'Ошибка платёжной системы: {err}'})}
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


def handle_webhook(body):
    """POST action=webhook — уведомление от Точка Банка."""
    tochka_data = body.get('Data', body.get('object', {}))
    status = tochka_data.get('status', tochka_data.get('paymentStatus', ''))
    external_id = tochka_data.get('externalId', tochka_data.get('id', ''))
    payment_link_id = tochka_data.get('paymentLinkId', external_id)

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        is_paid = status.lower() in ('paid', 'succeeded', 'completed')
        db_status = 'paid' if is_paid else status.lower()

        cur.execute(f"""
            UPDATE {SCHEMA}.orders SET status = %s, updated_at = NOW(),
            paid_at = CASE WHEN %s THEN NOW() ELSE paid_at END
            WHERE yookassa_payment_id = %s
        """, (db_status, is_paid, payment_link_id))

        cur.execute(f"""
            UPDATE {SCHEMA}.payments SET status = %s, updated_at = NOW(),
            paid_at = CASE WHEN %s THEN NOW() ELSE paid_at END
            WHERE yukassa_payment_id = %s
        """, (db_status, is_paid, payment_link_id))

        if is_paid:
            cur.execute(f"SELECT user_id, plan_code, amount FROM {SCHEMA}.payments WHERE yukassa_payment_id = %s", (payment_link_id,))
            payment = cur.fetchone()
            if payment and payment['user_id'] and payment['plan_code']:
                cur.execute(f"""
                    UPDATE {SCHEMA}.user_subscriptions SET status = 'cancelled', updated_at = NOW()
                    WHERE user_id = %s AND status = 'active'
                """, (payment['user_id'],))
                cur.execute(f"SELECT is_monthly FROM {SCHEMA}.user_plans WHERE code = %s", (payment['plan_code'],))
                plan = cur.fetchone()
                expires_sql = "NOW() + INTERVAL '30 days'" if plan and plan.get('is_monthly') else "NULL"
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.user_subscriptions (user_id, plan_code, status, expires_at)
                    VALUES (%s, %s, 'active', {expires_sql})
                """, (payment['user_id'], payment['plan_code']))

                plan_name = PLAN_NAMES.get(payment['plan_code'], payment['plan_code'])
                send_telegram(
                    f"💳 <b>Оплата получена!</b>\n\n"
                    f"📦 {plan_name}\n"
                    f"💰 {payment['amount']:,.0f} ₽\n".replace(',', ' ') +
                    f"👤 Пользователь ID: {payment['user_id']}"
                )

        conn.commit()
        return {'statusCode': 200, 'headers': JSON_HEADERS, 'body': json.dumps({'ok': True})}

    except Exception as e:
        conn.rollback()
        import traceback
        print(f"[webhook] Error: {traceback.format_exc()}")
        return {'statusCode': 500, 'headers': JSON_HEADERS, 'body': json.dumps({'error': str(e)})}
    finally:
        cur.close()
        conn.close()


def handler(event: dict, context) -> dict:
    """Единая функция платежей: создание через Точка Банк, вебхук, история."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    body = json.loads(event.get('body') or '{}')

    if method == 'GET':
        return handle_get_payments(params)

    if method == 'POST':
        action = body.get('action', '')
        if action == 'webhook' or body.get('Data'):
            return handle_webhook(body)
        return handle_create_payment(body)

    return {'statusCode': 405, 'headers': JSON_HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}
