import json
import os
import psycopg2
from datetime import datetime

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    '''Управление медиатекой: список, добавление, удаление медиафайлов'''

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    method = event.get('httpMethod')
    token = event.get('headers', {}).get('X-Admin-Token')
    if token != 'admin2025':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Forbidden'})
        }

    conn = get_conn()
    cur = conn.cursor()

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        media_type = params.get('media_type')
        if media_type:
            cur.execute(
                "SELECT id, url, media_type, filename, title, created_at FROM media_library WHERE media_type = %s ORDER BY created_at DESC",
                (media_type,)
            )
        else:
            cur.execute(
                "SELECT id, url, media_type, filename, title, created_at FROM media_library ORDER BY created_at DESC"
            )
        rows = cur.fetchall()
        items = [
            {
                'id': r[0],
                'url': r[1],
                'media_type': r[2],
                'filename': r[3],
                'title': r[4],
                'created_at': r[5].isoformat() if r[5] else None
            }
            for r in rows
        ]
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'items': items})
        }

    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        url = body.get('url')
        media_type = body.get('media_type', 'photo')
        filename = body.get('filename', '')
        title = body.get('title', '')

        if not url:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'url is required'})
            }

        cur.execute(
            "INSERT INTO media_library (url, media_type, filename, title, created_at) VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (url, media_type, filename, title, datetime.utcnow())
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'id': new_id, 'url': url})
        }

    if method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        item_id = params.get('id')
        if not item_id:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'id is required'})
            }
        cur.execute("DELETE FROM media_library WHERE id = %s", (item_id,))
        conn.commit()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True})
        }

    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
