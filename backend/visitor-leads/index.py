import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Сохранение и получение контактов посетителей сайта для рассылки"""

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
        'Content-Type': 'application/json',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()

    method = event.get('httpMethod', 'GET')

    # GET — список лидов для админа
    if method == 'GET':
        admin_token = (event.get('headers') or {}).get('X-Admin-Token', '')
        if admin_token != 'admin2025':
            cursor.close(); conn.close()
            return {'statusCode': 403, 'headers': cors_headers, 'body': json.dumps({'error': 'Forbidden'})}

        params = event.get('queryStringParameters') or {}
        limit = int(params.get('limit', 100))
        offset = int(params.get('offset', 0))

        cursor.execute(
            f"SELECT id, name, phone, email, source, page_url, consent, created_at FROM {schema}.visitor_leads ORDER BY created_at DESC LIMIT %s OFFSET %s",
            (limit, offset)
        )
        rows = cursor.fetchall()
        cursor.execute(f"SELECT COUNT(*) FROM {schema}.visitor_leads")
        total = cursor.fetchone()[0]
        cursor.close(); conn.close()

        leads = [
            {'id': r[0], 'name': r[1], 'phone': r[2], 'email': r[3],
             'source': r[4], 'page_url': r[5], 'consent': r[6],
             'created_at': r[7].isoformat() if r[7] else None}
            for r in rows
        ]
        return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps({'leads': leads, 'total': total}, ensure_ascii=False)}

    # POST — сохранить контакт
    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        name = (body.get('name') or '').strip()
        phone = (body.get('phone') or '').strip()
        email = (body.get('email') or '').strip().lower()
        source = (body.get('source') or 'popup').strip()
        page_url = (body.get('page_url') or '').strip()
        consent = bool(body.get('consent', True))

        if not phone and not email:
            cursor.close(); conn.close()
            return {'statusCode': 400, 'headers': cors_headers,
                    'body': json.dumps({'error': 'Укажите телефон или email'}, ensure_ascii=False)}

        cursor.execute(
            f"INSERT INTO {schema}.visitor_leads (name, phone, email, source, page_url, consent) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
            (name or None, phone or None, email or None, source, page_url or None, consent)
        )
        lead_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close(); conn.close()

        return {'statusCode': 200, 'headers': cors_headers,
                'body': json.dumps({'success': True, 'id': lead_id}, ensure_ascii=False)}

    cursor.close(); conn.close()
    return {'statusCode': 405, 'headers': cors_headers, 'body': json.dumps({'error': 'Method not allowed'})}
