"""Обработчик вебхуков от интернет-эквайринга Точка Банка."""
import json
import os
import hmac
import hashlib
import base64
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from urllib.parse import urlencode

import psycopg2

TOCHKA_TOKEN_URL = "https://enter.tochka.com/connect/token"
TOCHKA_API_BASE = "https://enter.tochka.com/uapi/acquiring/v1.0"

HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
}


def get_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_schema() -> str:
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    return f"{schema}." if schema else ""


def verify_signature(payload: bytes, signature: str, secret_key: str) -> bool:
    """Проверка подписи вебхука через HMAC-SHA256."""
    expected = hmac.new(
        secret_key.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    try:
        return hmac.compare_digest(expected, signature)
    except Exception:
        return False


def get_access_token(client_id: str, client_secret: str) -> str:
    """Получить Bearer-токен для проверки статуса платежа."""
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
    with urlopen(req, timeout=15) as resp:
        result = json.loads(resp.read().decode())
    return result['access_token']


def verify_payment_via_api(payment_link_id: str, access_token: str) -> dict | None:
    """Проверить статус платежа через API Точка Банка."""
    req = Request(
        f"{TOCHKA_API_BASE}/payment-links/{payment_link_id}",
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        },
        method='GET'
    )
    try:
        with urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except (HTTPError, Exception):
        return None


def handler(event, context):
    """Обработка вебхука оплаты от Точка Банка."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}

    raw_body = event.get('body', '{}')
    if event.get('isBase64Encoded'):
        raw_body = base64.b64decode(raw_body).decode('utf-8')

    # Проверка подписи вебхука (если передана)
    headers = event.get('headers', {})
    signature = headers.get('x-tochka-signature', '') or headers.get('X-Tochka-Signature', '')
    client_secret = os.environ.get('TOCHKA_SECRET_KEY', '')

    if signature and client_secret:
        if not verify_signature(raw_body.encode('utf-8'), signature, client_secret):
            return {'statusCode': 401, 'headers': HEADERS, 'body': json.dumps({'error': 'Invalid signature'})}

    try:
        data = json.loads(raw_body)
    except json.JSONDecodeError:
        return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Invalid JSON'})}

    # Точка Банк отправляет вебхук в формате { "Data": { ... } }
    payment_data = data.get('Data', data)
    payment_status = payment_data.get('status', payment_data.get('paymentStatus', '')).upper()
    payment_link_id = payment_data.get('paymentLinkId', payment_data.get('externalId', ''))
    payment_id = payment_data.get('paymentId', payment_link_id)

    # Извлекаем метаданные
    description = payment_data.get('description', '')
    metadata = {}
    if description:
        try:
            metadata = json.loads(description)
        except Exception:
            pass

    order_number_meta = metadata.get('order_number', '')
    order_id_meta = metadata.get('order_id', '')

    if not payment_link_id and not order_number_meta:
        return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Missing payment identifier'})}

    # Дополнительная проверка статуса через API
    client_id = os.environ.get('TOCHKA_LOGIN', '')
    if client_id and client_secret and payment_link_id:
        try:
            access_token = get_access_token(client_id, client_secret)
            verified = verify_payment_via_api(payment_link_id, access_token)
            if verified:
                verified_data = verified.get('Data', verified)
                payment_status = verified_data.get('status', payment_status).upper()
        except Exception:
            pass

    S = get_schema()
    conn = get_connection()

    try:
        cur = conn.cursor()
        now = datetime.utcnow().isoformat()

        # Ищем заказ
        row = None
        if payment_link_id:
            cur.execute(f"SELECT id, status FROM {S}orders WHERE yookassa_payment_id = %s", (payment_link_id,))
            row = cur.fetchone()

        if not row and payment_id and payment_id != payment_link_id:
            cur.execute(f"SELECT id, status FROM {S}orders WHERE yookassa_payment_id = %s", (payment_id,))
            row = cur.fetchone()

        if not row and order_number_meta:
            cur.execute(f"SELECT id, status FROM {S}orders WHERE order_number = %s", (order_number_meta,))
            row = cur.fetchone()

        if not row and order_id_meta:
            cur.execute(f"SELECT id, status FROM {S}orders WHERE id = %s", (int(order_id_meta),))
            row = cur.fetchone()

        if not row:
            return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Order not found'})}

        order_id, current_status = row

        # APPROVED / PAID / AUTHORIZED → оплачен
        if payment_status in ('APPROVED', 'PAID', 'AUTHORIZED', 'succeeded'):
            if current_status != 'paid':
                cur.execute(f"""
                    UPDATE {S}orders
                    SET status = 'paid', paid_at = %s, updated_at = %s
                    WHERE id = %s
                """, (now, now, order_id))

                # Активация тарифа дизайнера
                user_id_meta = metadata.get('user_id')
                plan_code_meta = metadata.get('plan_code')
                if user_id_meta and plan_code_meta:
                    cur.execute(f"""
                        UPDATE {S}user_subscriptions SET status = 'cancelled', updated_at = NOW()
                        WHERE user_id = %s AND status = 'active'
                    """, (int(user_id_meta),))
                    cur.execute(f"SELECT is_monthly FROM {S}user_plans WHERE code = %s", (plan_code_meta,))
                    plan_row = cur.fetchone()
                    expires_sql = "NOW() + INTERVAL '30 days'" if plan_row and plan_row[0] else "NULL"
                    cur.execute(f"""
                        INSERT INTO {S}user_subscriptions (user_id, plan_code, status, expires_at)
                        VALUES (%s, %s, 'active', {expires_sql})
                    """, (int(user_id_meta), plan_code_meta))

                # Активация тарифа строительной компании
                contractor_id_meta = metadata.get('contractor_id')
                builder_plan_meta = metadata.get('builder_plan_code')
                months_meta = int(metadata.get('months', 1))
                if contractor_id_meta and builder_plan_meta:
                    cur.execute(f"""
                        UPDATE {S}builder_subscriptions
                        SET status = 'cancelled', updated_at = NOW()
                        WHERE contractor_id = %s AND status = 'active'
                    """, (int(contractor_id_meta),))
                    cur.execute(f"""
                        INSERT INTO {S}builder_subscriptions
                        (contractor_id, plan_code, status, leads_used, activated_at, expires_at)
                        VALUES (%s, %s, 'active', 0, NOW(), NOW() + INTERVAL '{months_meta} months')
                    """, (int(contractor_id_meta), builder_plan_meta))

                conn.commit()

        elif payment_status in ('CANCELLED', 'EXPIRED', 'REJECTED', 'canceled'):
            if current_status not in ('paid', 'canceled'):
                cur.execute(f"""
                    UPDATE {S}orders
                    SET status = 'canceled', updated_at = %s
                    WHERE id = %s
                """, (now, order_id))
                conn.commit()

        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'status': 'ok'})}

    except Exception as e:
        conn.rollback()
        return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps({'error': 'Internal error'})}
    finally:
        conn.close()