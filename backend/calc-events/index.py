import json
import os
import psycopg2  # noqa


def handler(event: dict, context) -> dict:
    """Трекинг событий калькуляторов: открытие, расчёт, заявка"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    headers = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
    method = event.get('httpMethod', 'GET')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()

    # POST — записать событие
    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        calc_type = body.get('calc_type', '').strip()
        event_type = body.get('event_type', '').strip()
        user_id = body.get('user_id')

        if not calc_type or event_type not in ('open', 'calc', 'lead'):
            conn.close()
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'calc_type и event_type обязательны'}, ensure_ascii=False)
            }

        cursor.execute(
            f"INSERT INTO {schema}.calculator_events (calc_type, event_type, user_id) VALUES (%s, %s, %s)",
            (calc_type, event_type, user_id if user_id else None)
        )
        conn.commit()
        conn.close()
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True})
        }

    # GET — статистика для админа
    if method == 'GET':
        req_headers = event.get('headers', {}) or {}
        req_headers_lower = {k.lower(): v for k, v in req_headers.items()}
        admin_token = req_headers_lower.get('x-admin-token', '')
        admin_password = os.environ.get('ADMIN_PASSWORD', '')

        if not admin_password or admin_token != admin_password:
            conn.close()
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Unauthorized'})
            }

        cursor.execute(f"""
            SELECT
                calc_type,
                SUM(CASE WHEN event_type = 'open' THEN 1 ELSE 0 END) AS opens,
                SUM(CASE WHEN event_type = 'calc' THEN 1 ELSE 0 END) AS calcs,
                SUM(CASE WHEN event_type = 'lead' THEN 1 ELSE 0 END) AS leads
            FROM {schema}.calculator_events
            GROUP BY calc_type
            ORDER BY opens DESC
        """)
        rows = cursor.fetchall()

        cursor.execute(f"""
            SELECT
                SUM(CASE WHEN event_type = 'open' THEN 1 ELSE 0 END),
                SUM(CASE WHEN event_type = 'calc' THEN 1 ELSE 0 END),
                SUM(CASE WHEN event_type = 'lead' THEN 1 ELSE 0 END)
            FROM {schema}.calculator_events
        """)
        totals = cursor.fetchone()
        conn.close()

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'by_calc': [
                    {'calc_type': r[0], 'opens': r[1], 'calcs': r[2], 'leads': r[3]}
                    for r in rows
                ],
                'totals': {
                    'opens': totals[0] or 0,
                    'calcs': totals[1] or 0,
                    'leads': totals[2] or 0
                }
            }, ensure_ascii=False)
        }

    conn.close()
    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}