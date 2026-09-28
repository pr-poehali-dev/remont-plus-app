import json
import os
import psycopg2


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def handler(event: dict, context) -> dict:
    """Отдаёт активные отзывы клиентов для главной страницы."""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': '', 'isBase64Encoded': False}

    if method != 'GET':
        return {'statusCode': 405, 'headers': cors_headers(),
                'body': json.dumps({'error': 'Method not allowed'}), 'isBase64Encoded': False}

    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {'statusCode': 200, 'headers': cors_headers(),
                'body': json.dumps({'reviews': []}), 'isBase64Encoded': False}

    params = event.get('queryStringParameters') or {}
    try:
        limit = max(1, min(12, int(params.get('limit', 4))))
    except (TypeError, ValueError):
        limit = 4

    conn = psycopg2.connect(dsn)
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, name, text, rating, date_label, emoji "
                "FROM client_reviews WHERE is_active = true "
                f"ORDER BY sort_order ASC, id ASC LIMIT {limit}"
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    reviews = [
        {
            'id': r[0],
            'name': r[1],
            'text': r[2],
            'rating': r[3],
            'date_label': r[4],
            'emoji': r[5],
        }
        for r in rows
    ]

    return {'statusCode': 200, 'headers': cors_headers(),
            'body': json.dumps({'reviews': reviews}, ensure_ascii=False), 'isBase64Encoded': False}
