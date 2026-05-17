import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Глобальный поиск по сайту: блог + подрядчики"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    headers = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}

    if event.get('httpMethod') == 'POST':
        raw = event.get('body') or '{}'
        body = json.loads(raw)
        query = (body.get('query') or '').strip()
    else:
        params = event.get('queryStringParameters') or {}
        query = (params.get('q') or '').strip()

    if len(query) < 2:
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'posts': [], 'masters': []}, ensure_ascii=False),
        }

    q_safe = query.replace("'", "''")
    like = f"%{q_safe}%"

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()

    posts = []
    try:
        cursor.execute(
            "SELECT id, title, slug, excerpt, category, image_url "
            "FROM posts "
            "WHERE is_published = TRUE AND ("
            f"  title ILIKE '{like}' OR "
            f"  excerpt ILIKE '{like}' OR "
            f"  category ILIKE '{like}'"
            ") "
            "ORDER BY views DESC, created_at DESC "
            "LIMIT 6"
        )
        for r in cursor.fetchall():
            posts.append({
                'id': r[0],
                'title': r[1] or '',
                'slug': r[2] or '',
                'excerpt': (r[3] or '')[:140],
                'category': r[4] or '',
                'image_url': r[5] or '',
            })
    except Exception as e:
        print(f'POSTS SEARCH ERROR: {e}')

    masters = []
    try:
        cursor.execute(
            "SELECT id, full_name, location, specializations, rating "
            "FROM contractors "
            "WHERE profile_completed = TRUE AND ("
            f"  full_name ILIKE '{like}' OR "
            f"  location ILIKE '{like}' OR "
            f"  description ILIKE '{like}' OR "
            f"  array_to_string(specializations, ' ') ILIKE '{like}'"
            ") "
            "ORDER BY rating DESC NULLS LAST, reviews_count DESC "
            "LIMIT 5"
        )
        for r in cursor.fetchall():
            masters.append({
                'id': r[0],
                'full_name': r[1] or '',
                'location': r[2] or '',
                'specializations': r[3] or [],
                'rating': float(r[4]) if r[4] else 0.0,
            })
    except Exception as e:
        print(f'MASTERS SEARCH ERROR: {e}')

    cursor.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'posts': posts, 'masters': masters}, ensure_ascii=False),
    }
