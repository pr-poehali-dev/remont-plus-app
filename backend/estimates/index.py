import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p46588937_remont_plus_app')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
    'Access-Control-Max-Age': '86400'
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def resp(status, body):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False, default=str),
        'isBase64Encoded': False
    }


def handler(event: dict, context) -> dict:
    """API для сохранения и получения смет калькулятора"""

    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    headers = event.get('headers') or {}
    user_id_str = headers.get('X-User-Id') or (event.get('queryStringParameters') or {}).get('user_id')
    user_id = int(user_id_str) if user_id_str else None

    conn = get_conn()
    cur = conn.cursor()

    try:
        # GET — список смет пользователя или всех (для админа)
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            admin_token = headers.get('X-Admin-Token', '')
            is_admin = admin_token == os.environ.get('ADMIN_PASSWORD', 'admin2025')

            if is_admin:
                cur.execute(f"""
                    SELECT e.id, e.name, e.total_materials, e.total_works, e.total,
                           e.status, e.created_at, e.updated_at,
                           u.name as user_name, u.phone as user_phone, u.email as user_email,
                           (SELECT COUNT(*) FROM {SCHEMA}.estimate_items ei WHERE ei.estimate_id = e.id) as items_count
                    FROM {SCHEMA}.estimates e
                    LEFT JOIN {SCHEMA}.users u ON u.id = e.user_id
                    ORDER BY e.created_at DESC
                    LIMIT 200
                """)
            elif user_id:
                cur.execute(f"""
                    SELECT e.id, e.name, e.total_materials, e.total_works, e.total,
                           e.status, e.created_at, e.updated_at,
                           NULL, NULL, NULL,
                           (SELECT COUNT(*) FROM {SCHEMA}.estimate_items ei WHERE ei.estimate_id = e.id) as items_count
                    FROM {SCHEMA}.estimates e
                    WHERE e.user_id = {user_id}
                    ORDER BY e.created_at DESC
                    LIMIT 50
                """)
            else:
                return resp(401, {'error': 'Unauthorized'})

            rows = cur.fetchall()
            estimates = [
                {
                    'id': r[0], 'name': r[1],
                    'total_materials': float(r[2]) if r[2] else 0,
                    'total_works': float(r[3]) if r[3] else 0,
                    'total': float(r[4]) if r[4] else 0,
                    'status': r[5],
                    'created_at': r[6].isoformat() if r[6] else None,
                    'updated_at': r[7].isoformat() if r[7] else None,
                    'user_name': r[8], 'user_phone': r[9], 'user_email': r[10],
                    'items_count': r[11],
                } for r in rows
            ]
            return resp(200, {'estimates': estimates})

        # POST — сохранить смету
        elif method == 'POST':
            if not user_id:
                return resp(401, {'error': 'Unauthorized'})

            body = json.loads(event.get('body') or '{}')
            name = body.get('name', 'Смета')
            items = body.get('items', [])
            total_materials = float(body.get('total_materials', 0))
            total_works = float(body.get('total_works', 0))
            total = float(body.get('total', 0))
            region = body.get('region', '')

            # Проверяем — есть ли уже смета за сегодня для этого пользователя
            cur.execute(f"""
                SELECT id FROM {SCHEMA}.estimates
                WHERE user_id = {user_id}
                  AND DATE(updated_at) = CURRENT_DATE
                ORDER BY updated_at DESC LIMIT 1
            """)
            existing = cur.fetchone()

            if existing:
                estimate_id = existing[0]
                cur.execute(f"""
                    UPDATE {SCHEMA}.estimates
                    SET name = %s, total_materials = %s, total_works = %s,
                        total = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (name, total_materials, total_works, total, estimate_id))
                cur.execute(f"DELETE FROM {SCHEMA}.estimate_items WHERE estimate_id = %s", (estimate_id,))
            else:
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.estimates (user_id, name, total_materials, total_works, total, status)
                    VALUES ({user_id}, %s, %s, %s, %s, 'draft')
                    RETURNING id
                """, (name, total_materials, total_works, total))
                estimate_id = cur.fetchone()[0]

            # Сохраняем позиции
            for item in items:
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.estimate_items
                        (estimate_id, category, name, unit, quantity, price, total)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    estimate_id,
                    item.get('category', ''),
                    item.get('name', ''),
                    item.get('unit', ''),
                    float(item.get('quantity', 0)),
                    float(item.get('price', 0)),
                    float(item.get('total', 0)),
                ))

            conn.commit()
            return resp(200, {'id': estimate_id, 'saved': True})

        return resp(405, {'error': 'Method not allowed'})

    except Exception as e:
        conn.rollback()
        return resp(500, {'error': str(e)})
    finally:
        cur.close()
        conn.close()
