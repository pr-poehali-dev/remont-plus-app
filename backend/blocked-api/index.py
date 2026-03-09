import json
import os
import psycopg2


def handler(event, context):
    """API для управления блокировками сайтов: список, добавление, удаление и проверка"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        cur = conn.cursor()

        if method == 'GET':
            check_url = params.get('check', '')
            if check_url:
                cur.execute(
                    "SELECT id, url_pattern, reason, blocked_at FROM blocked_sites "
                    "WHERE LOWER(%s) LIKE '%%' || LOWER(url_pattern) || '%%' LIMIT 1",
                    (check_url,)
                )
                row = cur.fetchone()
                if row:
                    blocked = {
                        'id': str(row[0]),
                        'urlPattern': row[1],
                        'reason': row[2],
                        'blockedAt': row[3].isoformat() if row[3] else None
                    }
                    return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'blocked': True, 'entry': blocked}, ensure_ascii=False)}
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'blocked': False})}

            cur.execute("SELECT id, url_pattern, reason, blocked_at FROM blocked_sites ORDER BY blocked_at DESC")
            rows = cur.fetchall()
            blocked_list = []
            for r in rows:
                blocked_list.append({
                    'id': str(r[0]),
                    'urlPattern': r[1],
                    'reason': r[2],
                    'blockedAt': r[3].isoformat() if r[3] else None
                })
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(blocked_list, ensure_ascii=False)}

        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            url_pattern = body.get('urlPattern', '').strip()
            reason = body.get('reason', '').strip()

            if not url_pattern:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'urlPattern обязателен'})}

            cur.execute(
                "INSERT INTO blocked_sites (url_pattern, reason) VALUES (%s, %s) RETURNING id, blocked_at",
                (url_pattern, reason)
            )
            row = cur.fetchone()
            conn.commit()

            entry = {
                'id': str(row[0]),
                'urlPattern': url_pattern,
                'reason': reason,
                'blockedAt': row[1].isoformat()
            }
            return {'statusCode': 201, 'headers': headers, 'body': json.dumps(entry, ensure_ascii=False)}

        elif method == 'DELETE':
            blocked_id = params.get('id', '')
            if not blocked_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'id обязателен'})}
            cur.execute("DELETE FROM blocked_sites WHERE id = %s", (blocked_id,))
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}
    finally:
        conn.close()
