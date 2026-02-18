import json
import os
import psycopg2

HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
}

def get_schema():
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    return f"{schema}." if schema else ""

def resp(status, body):
    return {'statusCode': status, 'headers': HEADERS, 'body': json.dumps(body, ensure_ascii=False, default=str)}

def handler(event: dict, context) -> dict:
    """Управление адресами доставки пользователей"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    query = event.get('queryStringParameters') or {}

    dsn = os.environ.get('DATABASE_URL')
    S = get_schema()
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    if method == 'GET':
        user_id = query.get('user_id')
        if not user_id:
            cur.close()
            conn.close()
            return resp(400, {'error': 'user_id обязателен'})

        project_id = query.get('project_id')
        if project_id:
            cur.execute(
                f"""SELECT id, user_id, region, city, street, house, apartment,
                           postal_code, is_default, label, created_at, updated_at, project_id
                    FROM {S}user_addresses WHERE user_id = %s AND project_id = %s ORDER BY id DESC""",
                (int(user_id), int(project_id))
            )
        else:
            cur.execute(
                f"""SELECT id, user_id, region, city, street, house, apartment,
                           postal_code, is_default, label, created_at, updated_at, project_id
                    FROM {S}user_addresses WHERE user_id = %s ORDER BY is_default DESC, id DESC""",
                (int(user_id),)
            )
        rows = cur.fetchall()
        addresses = []
        for r in rows:
            addresses.append({
                'id': r[0], 'user_id': r[1], 'region': r[2], 'city': r[3],
                'street': r[4], 'house': r[5], 'apartment': r[6],
                'postal_code': r[7], 'is_default': r[8], 'label': r[9],
                'created_at': r[10], 'updated_at': r[11], 'project_id': r[12]
            })
        cur.close()
        conn.close()
        return resp(200, {'addresses': addresses})

    if method == 'POST':
        raw = event.get('body') or '{}'
        body = json.loads(raw)
        user_id = body.get('user_id')
        if not user_id:
            cur.close()
            conn.close()
            return resp(400, {'error': 'user_id обязателен'})

        region = (body.get('region') or '').strip()
        city = (body.get('city') or '').strip()
        street = (body.get('street') or '').strip()
        house = (body.get('house') or '').strip()
        apartment = (body.get('apartment') or '').strip()
        postal_code = (body.get('postal_code') or '').strip()
        is_default = body.get('is_default', True)
        label = (body.get('label') or '').strip()
        project_id = body.get('project_id')

        if not region or not city or not street or not house:
            cur.close()
            conn.close()
            return resp(400, {'error': 'Заполните область, город, улицу и дом'})

        if is_default:
            cur.execute(f"UPDATE {S}user_addresses SET is_default = FALSE WHERE user_id = %s", (int(user_id),))

        cur.execute(
            f"""INSERT INTO {S}user_addresses
                (user_id, region, city, street, house, apartment, postal_code, is_default, label, project_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
            (int(user_id), region, city, street, house, apartment, postal_code, is_default, label, int(project_id) if project_id else None)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return resp(201, {'id': new_id, 'message': 'Адрес добавлен'})

    if method == 'PUT':
        raw = event.get('body') or '{}'
        body = json.loads(raw)
        address_id = body.get('id')
        user_id = body.get('user_id')
        if not address_id or not user_id:
            cur.close()
            conn.close()
            return resp(400, {'error': 'id и user_id обязательны'})

        region = (body.get('region') or '').strip()
        city = (body.get('city') or '').strip()
        street = (body.get('street') or '').strip()
        house = (body.get('house') or '').strip()
        apartment = (body.get('apartment') or '').strip()
        postal_code = (body.get('postal_code') or '').strip()
        is_default = body.get('is_default', False)
        label = (body.get('label') or '').strip()

        if not region or not city or not street or not house:
            cur.close()
            conn.close()
            return resp(400, {'error': 'Заполните область, город, улицу и дом'})

        project_id = body.get('project_id')

        if is_default:
            cur.execute(f"UPDATE {S}user_addresses SET is_default = FALSE WHERE user_id = %s", (int(user_id),))

        cur.execute(
            f"""UPDATE {S}user_addresses
                SET region=%s, city=%s, street=%s, house=%s, apartment=%s,
                    postal_code=%s, is_default=%s, label=%s, project_id=%s, updated_at=CURRENT_TIMESTAMP
                WHERE id=%s AND user_id=%s""",
            (region, city, street, house, apartment, postal_code, is_default, label, int(project_id) if project_id else None, int(address_id), int(user_id))
        )
        conn.commit()
        cur.close()
        conn.close()
        return resp(200, {'message': 'Адрес обновлён'})

    if method == 'DELETE':
        raw = event.get('body') or '{}'
        body = json.loads(raw)
        address_id = body.get('id')
        user_id = body.get('user_id')
        if not address_id or not user_id:
            cur.close()
            conn.close()
            return resp(400, {'error': 'id и user_id обязательны'})

        cur.execute(
            f"SELECT id FROM {S}user_addresses WHERE id=%s AND user_id=%s",
            (int(address_id), int(user_id))
        )
        if not cur.fetchone():
            cur.close()
            conn.close()
            return resp(404, {'error': 'Адрес не найден'})

        cur.execute(
            f"DELETE FROM {S}user_addresses WHERE id=%s AND user_id=%s",
            (int(address_id), int(user_id))
        )
        conn.commit()
        cur.close()
        conn.close()
        return resp(200, {'message': 'Адрес удалён'})

    cur.close()
    conn.close()
    return resp(405, {'error': 'Method not allowed'})