import json
import os
import hashlib
import secrets
import psycopg2

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    h = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}:{h}"

def verify_password(password: str, stored: str) -> bool:
    if not stored or ':' not in stored:
        return False
    salt, h = stored.split(':', 1)
    return hashlib.sha256((salt + password).encode()).hexdigest() == h

def handler(event: dict, context) -> dict:
    """Авторизация: регистрация, вход по email+пароль, проверка сессии"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': ''
        }

    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    raw_body = event.get('body') or '{}'
    body = json.loads(raw_body)
    action = body.get('action')

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()

    headers = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}

    if action == 'register':
        email = (body.get('email') or '').strip().lower()
        password = body.get('password') or ''
        name = (body.get('name') or '').strip()
        phone = (body.get('phone') or '').strip()
        user_type = body.get('user_type', 'customer')

        if not email or not password or not name:
            cursor.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Заполните email, пароль и имя'}, ensure_ascii=False)}

        if len(password) < 6:
            cursor.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Пароль минимум 6 символов'}, ensure_ascii=False)}

        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return {'statusCode': 409, 'headers': headers, 'body': json.dumps({'error': 'Пользователь с таким email уже существует'}, ensure_ascii=False)}

        pw_hash = hash_password(password)
        cursor.execute(
            "INSERT INTO users (phone, name, email, user_type, password_hash, is_verified, role) VALUES (%s, %s, %s, %s, %s, TRUE, 'user') RETURNING id, name, email, user_type, role",
            (phone or '', name, email, user_type, pw_hash)
        )
        user = cursor.fetchone()
        conn.commit()

        token = secrets.token_hex(32)

        cursor.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'token': token,
                'user': {'id': user[0], 'name': user[1], 'email': user[2], 'user_type': user[3], 'role': user[4]}
            }, ensure_ascii=False)
        }

    elif action == 'login':
        email = (body.get('email') or '').strip().lower()
        password = body.get('password') or ''

        if not email or not password:
            cursor.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Введите email и пароль'}, ensure_ascii=False)}

        admin_password = os.environ.get('ADMIN_PASSWORD', '')
        if email == 'admin' and password == admin_password and admin_password:
            cursor.close()
            conn.close()
            token = secrets.token_hex(32)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'token': token,
                    'user': {'id': 0, 'name': 'Администратор', 'email': 'admin', 'user_type': 'admin', 'role': 'admin'}
                }, ensure_ascii=False)
            }

        cursor.execute(
            "SELECT id, name, email, user_type, password_hash, role FROM users WHERE email = %s",
            (email,)
        )
        row = cursor.fetchone()
        cursor.close()
        conn.close()

        if not row or not verify_password(password, row[4]):
            return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Неверный email или пароль'}, ensure_ascii=False)}

        token = secrets.token_hex(32)
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'token': token,
                'user': {'id': row[0], 'name': row[1], 'email': row[2], 'user_type': row[3], 'role': row[5] or 'user'}
            }, ensure_ascii=False)
        }

    elif action == 'send_code':
        import random
        from datetime import datetime, timedelta
        phone = body.get('phone')
        if not phone:
            cursor.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Phone is required'})}

        code = str(random.randint(1000, 9999))
        expires_at = datetime.now() + timedelta(minutes=10)
        cursor.execute("INSERT INTO sms_codes (phone, code, expires_at) VALUES (%s, %s, %s)", (phone, code, expires_at))
        conn.commit()
        cursor.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True, 'message': f'Код отправлен на {phone}', 'dev_code': code})
        }

    elif action == 'verify_code':
        phone = body.get('phone')
        code = body.get('code')
        name = body.get('name')
        email = body.get('email')
        user_type = body.get('user_type', 'customer')

        if not all([phone, code, name]):
            cursor.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Phone, code and name are required'})}

        cursor.execute(
            "SELECT id FROM sms_codes WHERE phone = %s AND code = %s AND expires_at > NOW() AND is_used = FALSE ORDER BY created_at DESC LIMIT 1",
            (phone, code)
        )
        sms_record = cursor.fetchone()
        if not sms_record:
            cursor.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Invalid or expired code'})}

        cursor.execute("UPDATE sms_codes SET is_used = TRUE WHERE id = %s", (sms_record[0],))

        cursor.execute("SELECT id FROM users WHERE phone = %s", (phone,))
        existing = cursor.fetchone()
        if existing:
            cursor.execute("UPDATE users SET is_verified = TRUE, updated_at = NOW() WHERE phone = %s RETURNING id, name, email, user_type, role", (phone,))
        else:
            cursor.execute(
                "INSERT INTO users (phone, name, email, user_type, is_verified, role) VALUES (%s, %s, %s, %s, TRUE, 'user') RETURNING id, name, email, user_type, role",
                (phone, name, email, user_type)
            )
        user = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()

        token = secrets.token_hex(32)
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'token': token,
                'user': {'id': user[0], 'name': user[1], 'email': user[2], 'user_type': user[3], 'role': user[4] or 'user', 'phone': phone}
            })
        }

    elif action == 'get_user':
        phone = body.get('phone')
        if not phone:
            cursor.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Phone is required'})}

        cursor.execute("SELECT id, phone, name, email, user_type, specialization, experience, is_verified, created_at, role FROM users WHERE phone = %s", (phone,))
        u = cursor.fetchone()
        cursor.close()
        conn.close()

        if not u:
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'User not found'})}

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'user': {'id': u[0], 'phone': u[1], 'name': u[2], 'email': u[3], 'user_type': u[4], 'specialization': u[5], 'experience': u[6], 'is_verified': u[7], 'created_at': u[8].isoformat() if u[8] else None, 'role': u[9] or 'user'}
            })
        }

    cursor.close()
    conn.close()
    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Invalid action'})}
