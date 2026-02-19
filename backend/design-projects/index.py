import json
import os
import psycopg2
import psycopg2.extras

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p46588937_remont_plus_app')
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
    'Access-Control-Max-Age': '86400'
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def resp(status, body):
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False, default=str),
        'isBase64Encoded': False
    }


def get_project(project_id):
    """Загрузить проект со всеми этапами"""
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(f"SELECT * FROM {SCHEMA}.design_projects WHERE id = {int(project_id)}")
    project = cur.fetchone()

    if not project:
        cur.close()
        conn.close()
        return resp(404, {'error': 'Проект не найден'})

    cur.execute(f"SELECT * FROM {SCHEMA}.design_stage_results WHERE project_id = {int(project_id)} ORDER BY stage_id")
    stages = cur.fetchall()

    cur.close()
    conn.close()

    return resp(200, {
        'project': dict(project),
        'stages': [dict(s) for s in stages]
    })


def list_projects(session_id):
    """Список проектов по session_id (хранится в name как префикс)"""
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(
        f"SELECT id, name, style, total_area, room_count, status, created_at, updated_at "
        f"FROM {SCHEMA}.design_projects ORDER BY updated_at DESC LIMIT 20"
    )
    projects = cur.fetchall()

    cur.close()
    conn.close()

    return resp(200, {'projects': [dict(p) for p in projects]})


def create_project(body):
    """Создать новый проект"""
    name = body.get('name', 'Мой дизайн-проект')
    style = body.get('style', 'modern')
    room_count = int(body.get('room_count', 2))
    total_area = float(body.get('total_area', 60))

    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(
        f"INSERT INTO {SCHEMA}.design_projects (name, style, room_count, total_area, status) "
        f"VALUES ('{name.replace(chr(39), chr(39)+chr(39))}', '{style}', {room_count}, {total_area}, 'active') "
        f"RETURNING *"
    )
    project = cur.fetchone()
    conn.commit()

    cur.close()
    conn.close()

    return resp(201, {'project': dict(project)})


def save_stage(body):
    """Сохранить результат этапа (upsert)"""
    project_id = int(body.get('project_id', 0))
    stage_id = body.get('stage_id', '')
    user_description = body.get('user_description', '').replace("'", "''")
    notes = body.get('notes', '').replace("'", "''")
    ai_result = body.get('ai_result', '').replace("'", "''") if body.get('ai_result') else None
    ai_provider = body.get('ai_provider', '')
    checklist_state = json.dumps(body.get('checklist_state', []))
    drawing_data = body.get('drawing_data')
    status = body.get('status', 'in_progress')

    if not project_id or not stage_id:
        return resp(400, {'error': 'project_id и stage_id обязательны'})

    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    ai_result_sql = f"'{ai_result}'" if ai_result else "NULL"
    drawing_data_sql = f"'{json.dumps(drawing_data).replace(chr(39), chr(39)+chr(39))}'::jsonb" if drawing_data is not None else "NULL"

    cur.execute(
        f"INSERT INTO {SCHEMA}.design_stage_results "
        f"(project_id, stage_id, user_description, notes, ai_result, ai_provider, checklist_state, drawing_data, status) "
        f"VALUES ({project_id}, '{stage_id}', '{user_description}', '{notes}', "
        f"{ai_result_sql}, '{ai_provider}', '{checklist_state}'::jsonb, {drawing_data_sql}, '{status}') "
        f"ON CONFLICT (project_id, stage_id) DO UPDATE SET "
        f"user_description = '{user_description}', "
        f"notes = '{notes}', "
        f"ai_result = {ai_result_sql}, "
        f"ai_provider = '{ai_provider}', "
        f"checklist_state = '{checklist_state}'::jsonb, "
        f"drawing_data = {drawing_data_sql}, "
        f"status = '{status}', "
        f"updated_at = CURRENT_TIMESTAMP "
        f"RETURNING *"
    )
    stage = cur.fetchone()
    conn.commit()

    cur.close()
    conn.close()

    return resp(200, {'stage': dict(stage)})


def handler(event: dict, context) -> dict:
    """API для дизайн-проектов: создание, загрузка, сохранение этапов"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': '',
            'isBase64Encoded': False
        }

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    raw_body = event.get('body') or '{}'
    body = json.loads(raw_body) if raw_body else {}

    action = params.get('action', body.get('action', ''))
    project_id = params.get('project_id', body.get('project_id', ''))

    if method == 'GET':
        if project_id:
            return get_project(project_id)
        return list_projects(params.get('session_id', ''))

    if method == 'POST':
        if action == 'save_stage':
            return save_stage(body)
        return create_project(body)

    if method == 'PUT':
        return save_stage(body)

    return resp(405, {'error': 'Method not allowed'})