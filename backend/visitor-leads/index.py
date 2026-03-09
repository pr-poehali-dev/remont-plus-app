import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Сохраняет контакты посетителей (имя, телефон, email) для рассылки акций и скидок"""

    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    # GET — список лидов для админки
    if event.get('httpMethod') == 'GET':
        params = event.get('queryStringParameters') or {}
        admin_token = (event.get('headers') or {}).get('X-Admin-Token', '')
        if admin_token != 'admin2025':
            return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Forbidden'})}

        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cursor = conn.cursor()

        limit = int(params.get('limit', 100))
        offset = int(params.get('offset', 0))
        source = params.get('source', '')

        where = f"WHERE source = '{source}'" if source else ''
        cursor.execute(
            f"SELECT id, name, phone, email, source, page_url, consent, created_at FROM {schema}.visitor_leads {where} ORDER BY created_at DESC LIMIT {limit} OFFSET {offset}"
        )
        rows = cursor.fetchall()
        cursor.execute(f"SELECT COUNT(*) FROM {schema}.visitor_leads {where}")
        total = cursor.fetchone()[0]
        cursor.close()
        conn.close()

        leads = [
            {'id': r[0], 'name': r[1], 'phone': r[2], 'email': r[3], 'source': r[4], 'page_url': r[5], 'consent': r[6], 'created_at': str(r[7])}
            for r in rows
        ]
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'leads': leads, 'total': total}, ensure_ascii=False)}

    # POST — сохранить контакт
    if event.get('httpMethod') == 'POST':
        body = json.loads(event.get('body') or '{}')
        name = (body.get('name') or '').strip()
        phone = (body.get('phone') or '').strip()
        email = (body.get('email') or '').strip().lower()
        source = (body.get('source') or 'popup').strip()
        page_url = (body.get('page_url') or '').strip()
        consent = bool(body.get('consent', True))

        if not phone and not email:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Укажите телефон или email'}, ensure_ascii=False)}

        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cursor = conn.cursor()

        cursor.execute(
            f"INSERT INTO {schema}.visitor_leads (name, phone, email, source, page_url, consent) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
            (name or None, phone or None, email or None, source, page_url or None, consent)
        )
        lead_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()

        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'success': True, 'id': lead_id}, ensure_ascii=False)}

    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}
