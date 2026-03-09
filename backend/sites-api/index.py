import json
import os
import psycopg2


def handler(event, context):
    """API для управления каталогом сайтов: поиск, добавление и удаление"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        cur = conn.cursor()

        if method == 'GET':
            q = params.get('q', '').strip()
            if q:
                like = f'%{q}%'
                cur.execute(
                    "SELECT id, url, title, description, tags, favicon, added_at FROM sites "
                    "WHERE LOWER(title) LIKE LOWER(%s) OR LOWER(description) LIKE LOWER(%s) "
                    "OR LOWER(url) LIKE LOWER(%s) OR EXISTS (SELECT 1 FROM unnest(tags) t WHERE LOWER(t) LIKE LOWER(%s)) "
                    "ORDER BY added_at DESC",
                    (like, like, like, like)
                )
            else:
                cur.execute("SELECT id, url, title, description, tags, favicon, added_at FROM sites ORDER BY added_at DESC")

            rows = cur.fetchall()
            sites = []
            for r in rows:
                sites.append({
                    'id': str(r[0]),
                    'url': r[1],
                    'title': r[2],
                    'description': r[3],
                    'tags': r[4] or [],
                    'favicon': r[5],
                    'addedAt': r[6].isoformat() if r[6] else None
                })
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(sites, ensure_ascii=False)}

        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            url = body.get('url', '').strip()
            title = body.get('title', '').strip()
            description = body.get('description', '').strip()
            tags = body.get('tags', [])

            if not url or not title:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'url и title обязательны'})}

            cur.execute(
                "INSERT INTO sites (url, title, description, tags) VALUES (%s, %s, %s, %s) RETURNING id, added_at",
                (url, title, description, tags)
            )
            row = cur.fetchone()
            conn.commit()

            site = {
                'id': str(row[0]),
                'url': url,
                'title': title,
                'description': description,
                'tags': tags,
                'favicon': None,
                'addedAt': row[1].isoformat()
            }
            return {'statusCode': 201, 'headers': headers, 'body': json.dumps(site, ensure_ascii=False)}

        elif method == 'DELETE':
            site_id = params.get('id', '')
            if not site_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'id обязателен'})}
            cur.execute("DELETE FROM sites WHERE id = %s", (site_id,))
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}
    finally:
        conn.close()
