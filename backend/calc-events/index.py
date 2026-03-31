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

        allowed = ('open', 'calc', 'lead', 'interact', 'result_view', 'export_click', 'form_open')
        is_ab = calc_type.startswith('ab:') and ':' in event_type
        if not calc_type or (not is_ab and event_type not in allowed):
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
        session_token = req_headers_lower.get('x-auth-token', '').strip()
        admin_password_header = req_headers_lower.get('x-admin-token', '').strip()
        admin_password = os.environ.get('ADMIN_PASSWORD', '')

        is_authorized = False
        if admin_password and admin_password_header == admin_password:
            is_authorized = True

        if not is_authorized and session_token:
            cursor.execute(
                f"SELECT user_id FROM {schema}.refresh_tokens WHERE token_hash = %s AND expires_at > NOW() LIMIT 1",
                (session_token,)
            )
            token_row = cursor.fetchone()
            if token_row and token_row[0] == 0:
                is_authorized = True

        if not is_authorized:
            conn.close()
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Unauthorized'})
            }

        params = event.get('queryStringParameters') or {}

        cursor.execute(f"""
            SELECT
                calc_type,
                SUM(CASE WHEN event_type = 'open' THEN 1 ELSE 0 END) AS opens,
                SUM(CASE WHEN event_type = 'interact' THEN 1 ELSE 0 END) AS interacts,
                SUM(CASE WHEN event_type = 'result_view' THEN 1 ELSE 0 END) AS result_views,
                SUM(CASE WHEN event_type = 'export_click' THEN 1 ELSE 0 END) AS export_clicks,
                SUM(CASE WHEN event_type = 'form_open' THEN 1 ELSE 0 END) AS form_opens,
                SUM(CASE WHEN event_type = 'calc' THEN 1 ELSE 0 END) AS calcs,
                SUM(CASE WHEN event_type = 'lead' THEN 1 ELSE 0 END) AS leads
            FROM {schema}.calculator_events
            WHERE calc_type NOT LIKE 'ab:%%'
            GROUP BY calc_type
            ORDER BY opens DESC
        """)
        rows = cursor.fetchall()

        cursor.execute(f"""
            SELECT
                SUM(CASE WHEN event_type = 'open' THEN 1 ELSE 0 END),
                SUM(CASE WHEN event_type = 'interact' THEN 1 ELSE 0 END),
                SUM(CASE WHEN event_type = 'result_view' THEN 1 ELSE 0 END),
                SUM(CASE WHEN event_type = 'export_click' THEN 1 ELSE 0 END),
                SUM(CASE WHEN event_type = 'form_open' THEN 1 ELSE 0 END),
                SUM(CASE WHEN event_type = 'calc' THEN 1 ELSE 0 END),
                SUM(CASE WHEN event_type = 'lead' THEN 1 ELSE 0 END)
            FROM {schema}.calculator_events
            WHERE calc_type NOT LIKE 'ab:%%'
        """)
        totals = cursor.fetchone()

        result = {
            'by_calc': [
                {
                    'calc_type': r[0], 'opens': r[1], 'interacts': r[2],
                    'result_views': r[3], 'export_clicks': r[4],
                    'form_opens': r[5], 'calcs': r[6], 'leads': r[7]
                }
                for r in rows
            ],
            'totals': {
                'opens': totals[0] or 0,
                'interacts': totals[1] or 0,
                'result_views': totals[2] or 0,
                'export_clicks': totals[3] or 0,
                'form_opens': totals[4] or 0,
                'calcs': totals[5] or 0,
                'leads': totals[6] or 0
            }
        }

        if params.get('ab_report'):
            cursor.execute(f"""
                SELECT event_type, COUNT(*) as cnt
                FROM {schema}.calculator_events
                WHERE calc_type LIKE 'ab:%%'
                GROUP BY event_type
                ORDER BY event_type
            """)
            ab_rows = cursor.fetchall()
            variants = {}
            for row in ab_rows:
                et = row[0]
                cnt = row[1]
                if ':' not in et:
                    continue
                variant, action = et.split(':', 1)
                if variant not in variants:
                    variants[variant] = {'variant': variant, 'impressions': 0, 'leads': 0, 'dismisses': 0}
                if action == 'impression':
                    variants[variant]['impressions'] = cnt
                elif action == 'lead':
                    variants[variant]['leads'] = cnt
                elif action == 'dismiss':
                    variants[variant]['dismisses'] = cnt

            ab_report = []
            for v in sorted(variants.values(), key=lambda x: x['variant']):
                imp = v['impressions']
                leads = v['leads']
                rate = round(leads / imp * 100, 2) if imp > 0 else 0
                ab_report.append({
                    'variant': v['variant'],
                    'impressions': imp,
                    'leads': leads,
                    'dismisses': v['dismisses'],
                    'conversionRate': str(rate),
                })
            result['ab_report'] = ab_report

        conn.close()

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(result, ensure_ascii=False)
        }

    conn.close()
    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}