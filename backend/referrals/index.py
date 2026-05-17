import json
import os
import secrets
import string
import psycopg2


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}


def gen_code(length: int = 8) -> str:
    alphabet = string.ascii_uppercase + string.digits
    # Без похожих символов
    alphabet = alphabet.replace('O', '').replace('0', '').replace('I', '').replace('1', '')
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def get_or_create_code(cursor, user_id: int) -> str:
    cursor.execute("SELECT referral_code FROM users WHERE id = %s", (user_id,))
    row = cursor.fetchone()
    if row and row[0]:
        return row[0]
    # Генерируем уникальный код
    for _ in range(20):
        code = gen_code(8)
        cursor.execute("SELECT 1 FROM users WHERE referral_code = %s", (code,))
        if not cursor.fetchone():
            cursor.execute("UPDATE users SET referral_code = %s WHERE id = %s", (code, user_id))
            return code
    raise RuntimeError('Failed to generate unique referral code')


def handler(event: dict, context) -> dict:
    """Реферальная система: получить свой код, статистику, привязать реферера"""

    headers_resp = {'Content-Type': 'application/json', **CORS}

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    raw = event.get('body') or '{}'
    try:
        body = json.loads(raw)
    except Exception:
        body = {}
    action = body.get('action')

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()

    try:
        if action == 'get_my_code':
            user_id = body.get('user_id')
            if not user_id:
                return {'statusCode': 400, 'headers': headers_resp, 'body': json.dumps({'error': 'user_id required'})}

            code = get_or_create_code(cursor, int(user_id))
            conn.commit()

            cursor.execute(
                "SELECT COUNT(*) FROM users WHERE referred_by = %s",
                (int(user_id),)
            )
            invited_total = cursor.fetchone()[0]

            cursor.execute(
                "SELECT COALESCE(SUM(reward_value), 0), COUNT(*) FROM referral_rewards WHERE referrer_id = %s",
                (int(user_id),)
            )
            row = cursor.fetchone()
            rewards_sum = int(row[0] or 0)
            rewards_count = int(row[1] or 0)

            base_url = os.environ.get('SITE_URL', 'https://avangard-ai.ru').rstrip('/')
            invite_link = f"{base_url}/?ref={code}"

            return {
                'statusCode': 200,
                'headers': headers_resp,
                'body': json.dumps({
                    'code': code,
                    'invite_link': invite_link,
                    'stats': {
                        'invited_total': invited_total,
                        'rewards_count': rewards_count,
                        'rewards_sum': rewards_sum,
                    },
                }, ensure_ascii=False),
            }

        elif action == 'attach_referrer':
            user_id = body.get('user_id')
            code = (body.get('code') or '').strip().upper()
            if not user_id or not code:
                return {'statusCode': 400, 'headers': headers_resp, 'body': json.dumps({'error': 'user_id и code обязательны'}, ensure_ascii=False)}

            cursor.execute("SELECT referred_by FROM users WHERE id = %s", (int(user_id),))
            row = cursor.fetchone()
            if not row:
                return {'statusCode': 404, 'headers': headers_resp, 'body': json.dumps({'error': 'Пользователь не найден'}, ensure_ascii=False)}
            if row[0]:
                return {'statusCode': 200, 'headers': headers_resp, 'body': json.dumps({'success': True, 'already': True}, ensure_ascii=False)}

            cursor.execute("SELECT id FROM users WHERE referral_code = %s", (code,))
            ref_row = cursor.fetchone()
            if not ref_row:
                return {'statusCode': 404, 'headers': headers_resp, 'body': json.dumps({'error': 'Код не найден'}, ensure_ascii=False)}

            referrer_id = int(ref_row[0])
            if referrer_id == int(user_id):
                return {'statusCode': 400, 'headers': headers_resp, 'body': json.dumps({'error': 'Нельзя пригласить самого себя'}, ensure_ascii=False)}

            cursor.execute("UPDATE users SET referred_by = %s WHERE id = %s", (referrer_id, int(user_id)))
            try:
                cursor.execute(
                    "INSERT INTO referral_rewards (referrer_id, referred_user_id, reward_type, reward_value) "
                    "VALUES (%s, %s, 'signup', 500) ON CONFLICT DO NOTHING",
                    (referrer_id, int(user_id))
                )
            except Exception as e:
                print(f'REWARD INSERT ERROR: {e}')
            conn.commit()

            return {
                'statusCode': 200,
                'headers': headers_resp,
                'body': json.dumps({'success': True, 'referrer_id': referrer_id}, ensure_ascii=False),
            }

        elif action == 'get_invited_list':
            user_id = body.get('user_id')
            if not user_id:
                return {'statusCode': 400, 'headers': headers_resp, 'body': json.dumps({'error': 'user_id required'})}

            cursor.execute(
                "SELECT id, name, email, created_at FROM users WHERE referred_by = %s ORDER BY created_at DESC LIMIT 50",
                (int(user_id),)
            )
            invited = []
            for r in cursor.fetchall():
                invited.append({
                    'id': r[0],
                    'name': r[1] or '',
                    'email': (r[2] or '')[:3] + '***' if r[2] else '',
                    'created_at': r[3].isoformat() if r[3] else None,
                })
            return {
                'statusCode': 200,
                'headers': headers_resp,
                'body': json.dumps({'invited': invited}, ensure_ascii=False),
            }

        else:
            return {'statusCode': 400, 'headers': headers_resp, 'body': json.dumps({'error': 'Unknown action'}, ensure_ascii=False)}
    finally:
        cursor.close()
        conn.close()
