"""
Управление платежами через ЮKassa: создание платежа, проверка статуса, webhook-активация тарифа.
"""
import json
import os
import uuid
import base64
import psycopg2
from psycopg2.extras import RealDictCursor
import urllib.request as urlreq


def send_telegram(message: str) -> None:
    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')
    if not token or not chat_id:
        return
    data = json.dumps({'chat_id': chat_id, 'text': message, 'parse_mode': 'HTML'}).encode('utf-8')
    req = urlreq.Request(
        f'https://api.telegram.org/bot{token}/sendMessage',
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    urlreq.urlopen(req, timeout=10)

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
}
JSON = {'Content-Type': 'application/json', **CORS}

YUKASSA_URL = 'https://api.yookassa.ru/v3/payments'
SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p46588937_remont_plus_app')

PLAN_PRICES = {
    'start':      990,
    'pro':       2490,
    'max':       4990,
    'studio':    9900,
    'business': 19900,
    'enterprise': 49900,
}

PLAN_NAMES = {
    'start': 'Тариф START',
    'pro': 'Тариф PRO',
    'max': 'Тариф MAX',
    'studio': 'Тариф STUDIO',
    'business': 'Тариф BUSINESS',
    'enterprise': 'Тариф ENTERPRISE',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def yukassa_request(method: str, path: str, body: dict = None) -> dict:
    shop_id = os.environ['YUKASSA_SHOP_ID']
    secret = os.environ['YUKASSA_SECRET_KEY']
    credentials = base64.b64encode(f'{shop_id}:{secret}'.encode()).decode()

    url = f'https://api.yookassa.ru/v3{path}'
    data = json.dumps(body).encode() if body else None
    headers = {
        'Authorization': f'Basic {credentials}',
        'Content-Type': 'application/json',
    }
    if method == 'POST':
        headers['Idempotence-Key'] = str(uuid.uuid4())

    req = urlreq.Request(url, data=data, headers=headers, method=method)
    with urlreq.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def activate_plan(cur, conn, user_id: int, plan_code: str):
    cur.execute(f"""
        UPDATE {SCHEMA}.user_subscriptions SET status = 'cancelled', updated_at = NOW()
        WHERE user_id = %s AND status = 'active'
    """, (user_id,))

    cur.execute(f"SELECT is_monthly FROM {SCHEMA}.user_plans WHERE code = %s", (plan_code,))
    plan = cur.fetchone()
    expires_sql = f"NOW() + INTERVAL '30 days'" if plan and plan['is_monthly'] else "NULL"

    cur.execute(f"""
        INSERT INTO {SCHEMA}.user_subscriptions (user_id, plan_code, status, expires_at)
        VALUES (%s, %s, 'active', {expires_sql})
    """, (user_id, plan_code))
    conn.commit()


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    body = json.loads(event.get('body') or '{}')

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # GET /payments?user_id=X — история платежей
        if method == 'GET':
            user_id_str = params.get('user_id', '')
            if not user_id_str:
                return {'statusCode': 400, 'headers': JSON, 'body': json.dumps({'error': 'user_id required'})}
            user_id = int(user_id_str)
            cur.execute(f"""
                SELECT * FROM {SCHEMA}.payments WHERE user_id = %s ORDER BY created_at DESC LIMIT 20
            """, (user_id,))
            rows = [dict(r) for r in cur.fetchall()]
            return {'statusCode': 200, 'headers': JSON, 'body': json.dumps({'payments': rows}, default=str)}

        action = body.get('action')

        # POST action=create — создать платёж
        if action == 'create':
            user_id = int(body.get('user_id', 0))
            plan_code = body.get('plan_code', '')
            return_url = body.get('return_url', 'https://avangard-ai.ru/dashboard')

            if not user_id or plan_code not in PLAN_PRICES:
                return {'statusCode': 400, 'headers': JSON, 'body': json.dumps({'error': 'user_id and valid plan_code required'})}

            amount = PLAN_PRICES[plan_code]
            description = PLAN_NAMES.get(plan_code, f'Тариф {plan_code.upper()}')

            yk_response = yukassa_request('POST', '/payments', {
                'amount': {'value': str(amount) + '.00', 'currency': 'RUB'},
                'confirmation': {'type': 'redirect', 'return_url': return_url},
                'capture': True,
                'description': description,
                'metadata': {'user_id': str(user_id), 'plan_code': plan_code},
            })

            payment_id = yk_response.get('id')
            payment_url = yk_response.get('confirmation', {}).get('confirmation_url', '')

            cur.execute(f"""
                INSERT INTO {SCHEMA}.payments (user_id, plan_code, yukassa_payment_id, amount, status, payment_url)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (user_id, plan_code, payment_id, amount, 'pending', payment_url))
            db_id = cur.fetchone()['id']
            conn.commit()

            return {'statusCode': 200, 'headers': JSON, 'body': json.dumps({
                'payment_id': payment_id,
                'db_id': db_id,
                'payment_url': payment_url,
                'amount': amount,
            })}

        # POST action=check — проверить статус платежа
        if action == 'check':
            payment_id = body.get('payment_id', '')
            if not payment_id:
                return {'statusCode': 400, 'headers': JSON, 'body': json.dumps({'error': 'payment_id required'})}

            yk = yukassa_request('GET', f'/payments/{payment_id}')
            status = yk.get('status')
            metadata = yk.get('metadata', {})
            user_id = int(metadata.get('user_id', 0))
            plan_code = metadata.get('plan_code', '')

            cur.execute(f"""
                UPDATE {SCHEMA}.payments
                SET status = %s, updated_at = NOW(), paid_at = CASE WHEN %s = 'succeeded' THEN NOW() ELSE paid_at END
                WHERE yukassa_payment_id = %s
            """, (status, status, payment_id))

            if status == 'succeeded' and user_id and plan_code:
                activate_plan(cur, conn, user_id, plan_code)
                try:
                    plan_name = PLAN_NAMES.get(plan_code, plan_code.upper())
                    amount = PLAN_PRICES.get(plan_code, 0)
                    send_telegram(
                        f"💳 <b>Оплата подписки</b>\n\n"
                        f"📦 Тариф: {plan_name}\n"
                        f"💰 Сумма: {amount:,} ₽".replace(',', ' ') + f"\n"
                        f"👤 Пользователь ID: {user_id}"
                    )
                except Exception as e:
                    print(f'TELEGRAM ERROR: {e}')
            else:
                conn.commit()

            return {'statusCode': 200, 'headers': JSON, 'body': json.dumps({'status': status, 'plan_code': plan_code})}

        # POST action=webhook — ЮKassa уведомление
        if action == 'webhook' or not action:
            event_type = body.get('event', '')
            obj = body.get('object', {})
            payment_id = obj.get('id', '')
            status = obj.get('status', '')
            metadata = obj.get('metadata', {})
            user_id = int(metadata.get('user_id', 0))
            plan_code = metadata.get('plan_code', '')

            cur.execute(f"""
                UPDATE {SCHEMA}.payments
                SET status = %s, updated_at = NOW(), paid_at = CASE WHEN %s = 'succeeded' THEN NOW() ELSE paid_at END
                WHERE yukassa_payment_id = %s
            """, (status, status, payment_id))

            if event_type == 'payment.succeeded' and user_id and plan_code:
                activate_plan(cur, conn, user_id, plan_code)
                try:
                    plan_name = PLAN_NAMES.get(plan_code, plan_code.upper())
                    amount = PLAN_PRICES.get(plan_code, 0)
                    send_telegram(
                        f"💳 <b>Оплата подписки</b>\n\n"
                        f"📦 Тариф: {plan_name}\n"
                        f"💰 Сумма: {amount:,} ₽".replace(',', ' ') + f"\n"
                        f"👤 Пользователь ID: {user_id}"
                    )
                except Exception as e:
                    print(f'TELEGRAM ERROR: {e}')
            else:
                conn.commit()

            return {'statusCode': 200, 'headers': JSON, 'body': json.dumps({'ok': True})}

        return {'statusCode': 400, 'headers': JSON, 'body': json.dumps({'error': 'Unknown action'})}

    finally:
        cur.close()
        conn.close()