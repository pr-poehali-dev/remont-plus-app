"""
API для управления карточками шоурума: получение, создание, обновление, удаление.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
    'Access-Control-Max-Age': '86400',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    item_id = params.get('id')

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == 'GET':
            if item_id:
                cur.execute('SELECT * FROM showroom_items WHERE id = %s', (item_id,))
                row = cur.fetchone()
                if not row:
                    return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
                return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(dict(row), default=str)}
            else:
                cur.execute('SELECT * FROM showroom_items ORDER BY sort_order ASC, id ASC')
                rows = cur.fetchall()
                return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps([dict(r) for r in rows], default=str)}

        elif method == 'POST':
            data = json.loads(event.get('body') or '{}')
            cur.execute(
                '''INSERT INTO showroom_items (title, description, room, style, area, materials, image, video_url, designer, features, aspect_ratio, color, sort_order)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   RETURNING *''',
                (
                    data.get('title', ''),
                    data.get('description', ''),
                    data.get('room', ''),
                    data.get('style', ''),
                    data.get('area', ''),
                    data.get('materials', []),
                    data.get('image', ''),
                    data.get('video_url', ''),
                    data.get('designer', ''),
                    data.get('features', []),
                    data.get('aspect_ratio', 'square'),
                    data.get('color', '#ffffff'),
                    data.get('sort_order', 0),
                )
            )
            row = cur.fetchone()
            conn.commit()
            return {'statusCode': 201, 'headers': CORS_HEADERS, 'body': json.dumps(dict(row), default=str)}

        elif method == 'PUT':
            if not item_id:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'id required'})}
            data = json.loads(event.get('body') or '{}')
            cur.execute(
                '''UPDATE showroom_items SET
                    title = %s, description = %s, room = %s, style = %s, area = %s,
                    materials = %s, image = %s, video_url = %s, designer = %s, features = %s,
                    aspect_ratio = %s, color = %s, sort_order = %s, updated_at = NOW()
                   WHERE id = %s RETURNING *''',
                (
                    data.get('title', ''),
                    data.get('description', ''),
                    data.get('room', ''),
                    data.get('style', ''),
                    data.get('area', ''),
                    data.get('materials', []),
                    data.get('image', ''),
                    data.get('video_url', ''),
                    data.get('designer', ''),
                    data.get('features', []),
                    data.get('aspect_ratio', 'square'),
                    data.get('color', '#ffffff'),
                    data.get('sort_order', 0),
                    item_id,
                )
            )
            row = cur.fetchone()
            conn.commit()
            if not row:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(dict(row), default=str)}

        elif method == 'DELETE':
            if not item_id:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'id required'})}
            cur.execute('DELETE FROM showroom_items WHERE id = %s RETURNING id', (item_id,))
            row = cur.fetchone()
            conn.commit()
            if not row:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'deleted': True})}

        return {'statusCode': 405, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}

    finally:
        cur.close()
        conn.close()