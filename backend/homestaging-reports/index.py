import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
    'Content-Type': 'application/json',
}

SCHEMA = 't_p46588937_remont_plus_app'


def get_user_id(event: dict):
    headers = event.get('headers') or {}
    qs = event.get('queryStringParameters') or {}
    raw = headers.get('X-User-Id') or headers.get('x-user-id') or qs.get('userId')
    try:
        return int(raw) if raw else None
    except (TypeError, ValueError):
        return None


def handler(event: dict, context) -> dict:
    """Список и управление отчётами хоумстейджинга пользователя"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    user_id = get_user_id(event)
    if not user_id:
        return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'userId required'})}

    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'DB not configured'})}

    conn = psycopg2.connect(dsn)
    try:
        qs = event.get('queryStringParameters') or {}
        report_id_raw = qs.get('id')

        if method == 'GET':
            if report_id_raw:
                try:
                    report_id = int(report_id_raw)
                except ValueError:
                    return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Invalid id'})}
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        f"""SELECT id, user_id, room_type, overall_score, short_summary,
                        recommendations, strengths, note, image_url, created_at
                        FROM {SCHEMA}.homestaging_reports WHERE id = %s AND user_id = %s""",
                        (report_id, user_id),
                    )
                    row = cur.fetchone()
                if not row:
                    return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
                row['created_at'] = row['created_at'].isoformat() if row.get('created_at') else None
                return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'report': row}, ensure_ascii=False)}

            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    f"""SELECT id, room_type, overall_score, short_summary, image_url, created_at
                    FROM {SCHEMA}.homestaging_reports
                    WHERE user_id = %s
                    ORDER BY created_at DESC LIMIT 50""",
                    (user_id,),
                )
                rows = cur.fetchall()
            for r in rows:
                r['created_at'] = r['created_at'].isoformat() if r.get('created_at') else None
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'reports': rows}, ensure_ascii=False)}

        if method == 'DELETE':
            if not report_id_raw:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'id required'})}
            try:
                report_id = int(report_id_raw)
            except ValueError:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Invalid id'})}
            with conn.cursor() as cur:
                cur.execute(
                    f"DELETE FROM {SCHEMA}.homestaging_reports WHERE id = %s AND user_id = %s",
                    (report_id, user_id),
                )
                deleted = cur.rowcount
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'deleted': deleted})}

        return {'statusCode': 405, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}
    except Exception as e:
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': f'Internal error: {str(e)}'})}
    finally:
        conn.close()
