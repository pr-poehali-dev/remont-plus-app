import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p46588937_remont_plus_app')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """CRUD API для управления рекомендуемыми материалами в конструкторе"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }

    if method == 'GET':
        return get_materials(headers)
    elif method == 'POST':
        return create_material(event, headers)
    elif method == 'PUT':
        return update_material(event, headers)
    elif method == 'DELETE':
        return delete_material(event, headers)

    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Method not allowed'})
    }

def get_materials(headers):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"""
        SELECT id, name, price, category, description, image_url, is_active, sort_order
        FROM {SCHEMA}.recommended_materials
        ORDER BY sort_order ASC, id ASC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    materials = []
    for r in rows:
        materials.append({
            'id': r[0],
            'name': r[1],
            'price': r[2],
            'category': r[3],
            'description': r[4] or '',
            'image_url': r[5],
            'is_active': r[6],
            'sort_order': r[7]
        })

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'materials': materials}, ensure_ascii=False)
    }

def create_material(event, headers):
    body = json.loads(event.get('body', '{}'))
    name = body.get('name', '')
    price = body.get('price', '')

    if not name or not price:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Название и цена обязательны'})
        }

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"""
        INSERT INTO {SCHEMA}.recommended_materials (name, price, category, description, image_url, is_active, sort_order)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (
        name,
        price,
        body.get('category', 'Отделочные'),
        body.get('description', ''),
        body.get('image_url'),
        body.get('is_active', True),
        body.get('sort_order', 0)
    ))
    material_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'id': material_id, 'success': True})
    }

def update_material(event, headers):
    body = json.loads(event.get('body', '{}'))
    material_id = body.get('id')

    if not material_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'ID обязателен'})
        }

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"""
        UPDATE {SCHEMA}.recommended_materials
        SET name = %s, price = %s, category = %s, description = %s,
            image_url = %s, is_active = %s, sort_order = %s, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
    """, (
        body.get('name', ''),
        body.get('price', ''),
        body.get('category', ''),
        body.get('description', ''),
        body.get('image_url'),
        body.get('is_active', True),
        body.get('sort_order', 0),
        material_id
    ))
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True})
    }

def delete_material(event, headers):
    params = event.get('queryStringParameters') or {}
    material_id = params.get('id')

    if not material_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'ID обязателен'})
        }

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"DELETE FROM {SCHEMA}.recommended_materials WHERE id = %s", (material_id,))
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True})
    }