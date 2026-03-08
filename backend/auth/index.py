import json
import os
import hashlib
import secrets
import urllib.request
import psycopg2


def send_telegram(message: str) -> None:
    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')
    if not token or not chat_id:
        return
    data = json.dumps({'chat_id': chat_id, 'text': message, 'parse_mode': 'HTML'}).encode('utf-8')
    req = urllib.request.Request(
        f'https://api.telegram.org/bot{token}/sendMessage',
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    urllib.request.urlopen(req, timeout=10)

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
        email_consent = bool(body.get('email_consent', False))

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
            "INSERT INTO users (phone, name, email, user_type, password_hash, is_verified, role, email_consent) VALUES (%s, %s, %s, %s, %s, TRUE, 'user', %s) RETURNING id, name, email, user_type, role",
            (phone or '', name, email, user_type, pw_hash, email_consent)
        )
        user = cursor.fetchone()
        conn.commit()

        token = secrets.token_hex(32)

        try:
            user_type_label = {'customer': 'Клиент', 'contractor': 'Подрядчик', 'designer': 'Дизайнер'}.get(user_type, user_type)
            send_telegram(
                f"🆕 <b>Новый пользователь</b>\n\n"
                f"👤 Имя: {name}\n"
                f"📧 Email: {email}\n"
                f"📞 Телефон: {phone or '—'}\n"
                f"🏷 Тип: {user_type_label}\n"
                f"📨 Рассылка: {'✅ Да' if email_consent else '❌ Нет'}"
            )
        except Exception as e:
            print(f'TELEGRAM ERROR: {e}')

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

        yukassa_login = os.environ.get('YUKASSA_STAFF_LOGIN', '')
        yukassa_password = os.environ.get('YUKASSA_STAFF_PASSWORD', '')
        if yukassa_login and email == yukassa_login and password == yukassa_password:
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'token': secrets.token_hex(32),
                    'user': {'id': -1, 'name': 'Сотрудник ЮКасса', 'email': yukassa_login, 'user_type': 'staff', 'role': 'yukassa_staff'}
                }, ensure_ascii=False)
            }

        admin_password = os.environ.get('ADMIN_PASSWORD', '')
        if email == 'admin' and password == admin_password and admin_password:
            token = secrets.token_hex(32)
            schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
            # Сохраняем токен в refresh_tokens с user_id=0 (виртуальный admin)
            cursor.execute(
                f"INSERT INTO {schema}.refresh_tokens (user_id, token_hash, expires_at) VALUES (0, %s, NOW() + INTERVAL '30 days')",
                (token,)
            )
            conn.commit()
            cursor.close()
            conn.close()
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
        email_consent = bool(body.get('email_consent', False))

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
            cursor.execute(
                "UPDATE users SET is_verified = TRUE, email_consent = %s, updated_at = NOW() WHERE phone = %s RETURNING id, name, email, user_type, role",
                (email_consent, phone)
            )
        else:
            cursor.execute(
                "INSERT INTO users (phone, name, email, user_type, is_verified, role, email_consent) VALUES (%s, %s, %s, %s, TRUE, 'user', %s) RETURNING id, name, email, user_type, role",
                (phone, name, email, user_type, email_consent)
            )
        user = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()

        try:
            user_type_label = {'customer': 'Клиент', 'contractor': 'Подрядчик', 'designer': 'Дизайнер'}.get(user_type, user_type)
            send_telegram(
                f"🆕 <b>Новый пользователь</b>\n\n"
                f"👤 Имя: {name}\n"
                f"📞 Телефон: {phone}\n"
                f"📧 Email: {email or '—'}\n"
                f"🏷 Тип: {user_type_label}\n"
                f"📨 Рассылка: {'✅ Да' if email_consent else '❌ Нет'}"
            )
        except Exception as e:
            print(f'TELEGRAM ERROR: {e}')

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

    elif action == 'get_master_profile':
        user_id = body.get('user_id')
        if not user_id:
            cursor.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id обязателен'}, ensure_ascii=False)}

        cursor.execute("""
            SELECT id, user_id, company_name, full_name, phone, email, citizenship,
                   experience_years, specializations, has_tools, work_style,
                   technologies_knowledge, certificates, portfolio_photos, portfolio_links,
                   payment_methods, payment_schedule, discount_info, business_status,
                   profile_completed, description, location
            FROM contractors WHERE user_id = %s
        """, (int(user_id),))
        row = cursor.fetchone()
        cursor.close()
        conn.close()

        if not row:
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'profile': None, 'exists': False}, ensure_ascii=False)}

        profile = {
            'id': row[0], 'user_id': row[1], 'company_name': row[2] or '',
            'full_name': row[3] or '', 'phone': row[4] or '', 'email': row[5] or '',
            'citizenship': row[6] or '', 'experience_years': row[7],
            'specializations': row[8] or [], 'has_tools': row[9] or False,
            'work_style': row[10] or 'both', 'technologies_knowledge': row[11] or '',
            'certificates': row[12] or [], 'portfolio_photos': row[13] or [],
            'portfolio_links': row[14] or [], 'payment_methods': row[15] or [],
            'payment_schedule': row[16] or '', 'discount_info': row[17] or '',
            'business_status': row[18] or '', 'profile_completed': row[19] or False,
            'description': row[20] or '', 'location': row[21] or '',
        }
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'profile': profile, 'exists': True}, ensure_ascii=False)}

    elif action == 'get_masters_list':
        cursor.execute("""
            SELECT id, full_name, phone, email, telegram, whatsapp, instagram, website,
                   location, experience_years, specializations, business_status,
                   has_tools, verified, rating, reviews_count, guarantee_period,
                   guarantee_description, payment_methods, certificates, portfolio_links,
                   description
            FROM contractors
            WHERE profile_completed = true
            ORDER BY rating DESC, reviews_count DESC
        """)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        masters = []
        for r in rows:
            masters.append({
                'id': r[0], 'full_name': r[1] or '', 'phone': r[2] or '',
                'email': r[3] or '', 'telegram': r[4] or '', 'whatsapp': r[5] or '',
                'instagram': r[6] or '', 'website': r[7] or '',
                'location': r[8] or '', 'experience_years': r[9] or 0,
                'specializations': r[10] or [], 'business_status': r[11] or '',
                'has_tools': r[12] or False, 'verified': r[13] or False,
                'rating': float(r[14]) if r[14] else 0.0, 'reviews': r[15] or 0,
                'guarantee_period': r[16] or 'none', 'guarantee_description': r[17] or '',
                'payment_methods': r[18] or [], 'certificates': r[19] or [],
                'portfolio_links': r[20] or [], 'description': r[21] or '',
            })
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'masters': masters}, ensure_ascii=False)}

    elif action == 'save_master_profile':
        user_id = body.get('user_id')
        if not user_id:
            cursor.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id обязателен'}, ensure_ascii=False)}

        data = body.get('profile', {})
        full_name = (data.get('full_name') or '').strip()
        phone = (data.get('phone') or '').strip()
        email = (data.get('email') or '').strip()
        telegram = (data.get('telegram') or '').strip()
        whatsapp = (data.get('whatsapp') or '').strip()
        instagram = (data.get('instagram') or '').strip()
        website = (data.get('website') or '').strip()
        citizenship = (data.get('citizenship') or '').strip()
        experience_years = data.get('experience_years')
        specializations = data.get('specializations') or []
        has_tools = bool(data.get('has_tools'))
        work_style = data.get('work_style', 'both')
        technologies_knowledge = (data.get('technologies_knowledge') or '').strip()
        certificates = data.get('certificates') or []
        portfolio_photos = data.get('portfolio_photos') or []
        portfolio_links = data.get('portfolio_links') or []
        payment_methods = data.get('payment_methods') or []
        payment_schedule = data.get('payment_schedule') or ''
        discount_info = (data.get('discount_info') or '').strip()
        business_status = data.get('business_status') or ''
        description = (data.get('description') or '').strip()
        location = (data.get('location') or '').strip()
        company_name = (data.get('company_name') or full_name).strip()
        guarantee_period = data.get('guarantee_period') or 'none'
        guarantee_description = (data.get('guarantee_description') or '').strip()

        profile_completed = bool(full_name and phone and specializations)

        cursor.execute("SELECT id FROM contractors WHERE user_id = %s", (int(user_id),))
        existing = cursor.fetchone()

        if existing:
            cursor.execute("""
                UPDATE contractors SET
                    company_name=%s, full_name=%s, phone=%s, email=%s,
                    telegram=%s, whatsapp=%s, instagram=%s, website=%s,
                    citizenship=%s, experience_years=%s, specializations=%s,
                    has_tools=%s, work_style=%s, technologies_knowledge=%s,
                    certificates=%s, portfolio_photos=%s, portfolio_links=%s,
                    payment_methods=%s, payment_schedule=%s, discount_info=%s,
                    business_status=%s, profile_completed=%s, description=%s,
                    location=%s, guarantee_period=%s, guarantee_description=%s,
                    updated_at=NOW()
                WHERE user_id=%s RETURNING id
            """, (company_name, full_name, phone, email, telegram, whatsapp,
                  instagram, website, citizenship, experience_years, specializations,
                  has_tools, work_style, technologies_knowledge, certificates,
                  portfolio_photos, portfolio_links, payment_methods, payment_schedule,
                  discount_info, business_status, profile_completed,
                  description, location, guarantee_period, guarantee_description,
                  int(user_id)))
        else:
            cursor.execute("""
                INSERT INTO contractors (
                    user_id, company_name, full_name, phone, email,
                    telegram, whatsapp, instagram, website,
                    citizenship, experience_years, specializations, has_tools, work_style,
                    technologies_knowledge, certificates, portfolio_photos,
                    portfolio_links, payment_methods, payment_schedule,
                    discount_info, business_status, profile_completed,
                    description, location, guarantee_period, guarantee_description
                ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                RETURNING id
            """, (int(user_id), company_name, full_name, phone, email, telegram,
                  whatsapp, instagram, website, citizenship, experience_years,
                  specializations, has_tools, work_style, technologies_knowledge,
                  certificates, portfolio_photos, portfolio_links, payment_methods,
                  payment_schedule, discount_info, business_status, profile_completed,
                  description, location, guarantee_period, guarantee_description))

        record_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True, 'id': record_id, 'profile_completed': profile_completed}, ensure_ascii=False)
        }

    elif action == 'get_transactions':
        contractor_id = body.get('contractor_id')
        if not contractor_id:
            cursor.close(); conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'contractor_id обязателен'}, ensure_ascii=False)}
        cursor.execute("""
            SELECT id, contract_amount, commission_pct, commission_amount, payout_amount,
                   customer_name, work_description, status, paid_at, payout_at, created_at
            FROM agent_transactions
            WHERE contractor_id = %s
            ORDER BY created_at DESC
            LIMIT 50
        """, (int(contractor_id),))
        rows = cursor.fetchall()
        cursor.close(); conn.close()
        txns = []
        for r in rows:
            txns.append({
                'id': r[0],
                'contract_amount': float(r[1]),
                'commission_pct': float(r[2]),
                'commission_amount': float(r[3]),
                'payout_amount': float(r[4]),
                'customer_name': r[5] or '',
                'work_description': r[6] or '',
                'status': r[7],
                'paid_at': r[8].isoformat() if r[8] else None,
                'payout_at': r[9].isoformat() if r[9] else None,
                'created_at': r[10].isoformat() if r[10] else None,
            })
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'transactions': txns}, ensure_ascii=False)}

    elif action == 'create_transaction':
        contractor_id = body.get('contractor_id')
        contract_amount = body.get('contract_amount')
        customer_name = (body.get('customer_name') or '').strip()
        work_description = (body.get('work_description') or '').strip()
        if not contractor_id or not contract_amount:
            cursor.close(); conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'contractor_id и contract_amount обязательны'}, ensure_ascii=False)}
        amount = float(contract_amount)
        # Считаем сколько завершённых заказов у мастера
        cursor.execute(
            "SELECT COUNT(*) FROM agent_transactions WHERE contractor_id = %s AND status = 'completed'",
            (int(contractor_id),)
        )
        completed_count = cursor.fetchone()[0]
        # Первые 3 заказа — 0% комиссии (бонус лояльности), далее стандартные 5%
        commission_pct = 0.0 if completed_count < 3 else 5.0
        commission_amount = round(amount * commission_pct / 100, 2)
        payout_amount = round(amount - commission_amount, 2)
        is_bonus = commission_pct == 0.0
        cursor.execute("""
            INSERT INTO agent_transactions
                (contractor_id, contract_amount, commission_pct, commission_amount, payout_amount, customer_name, work_description, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending')
            RETURNING id, created_at
        """, (int(contractor_id), amount, commission_pct, commission_amount, payout_amount, customer_name, work_description))
        row = cursor.fetchone()
        conn.commit(); cursor.close(); conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
            'success': True, 'id': row[0],
            'commission_pct': commission_pct,
            'commission_amount': commission_amount,
            'payout_amount': payout_amount,
            'is_bonus': is_bonus,
            'completed_orders': completed_count,
        }, ensure_ascii=False)}

    cursor.close()
    conn.close()
    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Invalid action'})}