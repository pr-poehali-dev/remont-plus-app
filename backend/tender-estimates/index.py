import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p46588937_remont_plus_app')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-User-Email',
    'Access-Control-Max-Age': '86400',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def resp(status, body):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False, default=str),
        'isBase64Encoded': False,
    }


def _identity(event):
    headers = event.get('headers') or {}
    params = event.get('queryStringParameters') or {}
    uid = headers.get('X-User-Id') or params.get('user_id')
    email = headers.get('X-User-Email') or params.get('email')
    user_id = int(uid) if uid and str(uid).isdigit() else None
    return user_id, (email or None)


def handler(event: dict, context) -> dict:
    """Сохранение, список, получение и удаление смет по ТЗ («Мои сметы»)."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    user_id, email = _identity(event)
    if not user_id and not email:
        return resp(200, {'estimates': []})

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        params = event.get('queryStringParameters') or {}

        if method == 'GET':
            est_id = params.get('id')
            if est_id and str(est_id).isdigit():
                cur.execute(
                    f"SELECT id, title, mode, total, payload, created_at, updated_at "
                    f"FROM {SCHEMA}.tender_estimates WHERE id = %s AND "
                    f"(user_id = %s OR (email IS NOT NULL AND email = %s))",
                    (int(est_id), user_id, email),
                )
                row = cur.fetchone()
                if not row:
                    return resp(404, {'error': 'Смета не найдена'})
                return resp(200, {'estimate': row})

            # список (без тяжёлого payload)
            cur.execute(
                f"SELECT id, title, mode, total, created_at, updated_at "
                f"FROM {SCHEMA}.tender_estimates "
                f"WHERE user_id = %s OR (email IS NOT NULL AND email = %s) "
                f"ORDER BY updated_at DESC LIMIT 200",
                (user_id, email),
            )
            return resp(200, {'estimates': cur.fetchall()})

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            title = (body.get('title') or 'Смета по ТЗ')[:255]
            mode = (body.get('mode') or 'estimate')[:20]
            total = body.get('total') or 0
            payload = body.get('payload')
            if payload is None:
                return resp(400, {'error': 'Нет данных сметы'})
            payload_json = json.dumps(payload, ensure_ascii=False)

            est_id = body.get('id')
            if est_id and str(est_id).isdigit():
                cur.execute(
                    f"UPDATE {SCHEMA}.tender_estimates "
                    f"SET title = %s, mode = %s, total = %s, payload = %s::jsonb, updated_at = CURRENT_TIMESTAMP "
                    f"WHERE id = %s AND (user_id = %s OR (email IS NOT NULL AND email = %s)) RETURNING id",
                    (title, mode, total, payload_json, int(est_id), user_id, email),
                )
                row = cur.fetchone()
                if not row:
                    return resp(404, {'error': 'Смета не найдена'})
                conn.commit()
                return resp(200, {'id': row['id'], 'saved': True})

            cur.execute(
                f"INSERT INTO {SCHEMA}.tender_estimates (user_id, email, title, mode, total, payload) "
                f"VALUES (%s, %s, %s, %s, %s, %s::jsonb) RETURNING id",
                (user_id, email, title, mode, total, payload_json),
            )
            new_id = cur.fetchone()['id']
            conn.commit()
            return resp(200, {'id': new_id, 'saved': True})

        if method == 'DELETE':
            est_id = params.get('id') or json.loads(event.get('body') or '{}').get('id')
            if not est_id or not str(est_id).isdigit():
                return resp(400, {'error': 'Не указан id'})
            cur.execute(
                f"DELETE FROM {SCHEMA}.tender_estimates "
                f"WHERE id = %s AND (user_id = %s OR (email IS NOT NULL AND email = %s)) RETURNING id",
                (int(est_id), user_id, email),
            )
            row = cur.fetchone()
            conn.commit()
            return resp(200, {'deleted': bool(row)})

        return resp(405, {'error': 'Метод не поддерживается'})
    finally:
        cur.close()
        conn.close()
