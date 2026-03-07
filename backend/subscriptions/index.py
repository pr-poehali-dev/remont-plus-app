"""
Управление подписками пользователей: получение статуса, активация плана, проверка и списание лимитов.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
}
JSON = {'Content-Type': 'application/json', **CORS}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_active_sub(cur, user_id: int):
    cur.execute("""
        SELECT s.*, p.name as plan_name, p.segment, p.price, p.is_monthly,
               p.max_projects, p.max_visualizations, p.max_revisions,
               p.has_materials, p.has_suppliers, p.has_brief, p.has_manager,
               p.has_crm, p.has_whitelabel, p.is_unlimited
        FROM user_subscriptions s
        JOIN user_plans p ON p.code = s.plan_code
        WHERE s.user_id = %s AND s.status = 'active'
          AND (s.expires_at IS NULL OR s.expires_at > NOW())
        ORDER BY s.created_at DESC LIMIT 1
    """, (user_id,))
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    user_id_str = params.get('user_id') or (event.get('headers') or {}).get('X-User-Id', '')
    if not user_id_str:
        return {'statusCode': 400, 'headers': JSON, 'body': json.dumps({'error': 'user_id required'})}
    user_id = int(user_id_str)

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # GET — статус подписки (касса временно отключена — возвращаем активный безлимитный план)
        if method == 'GET':
            sub = get_active_sub(cur, user_id)
            if sub:
                sub = dict(sub)
                sub['projects_left'] = 9999
                sub['visualizations_left'] = 9999
                sub['revisions_left'] = 9999
                sub['activated_at'] = str(sub['activated_at']) if sub['activated_at'] else None
                sub['expires_at'] = str(sub['expires_at']) if sub['expires_at'] else None
                sub['created_at'] = str(sub['created_at']) if sub['created_at'] else None
                sub['updated_at'] = str(sub['updated_at']) if sub['updated_at'] else None
            else:
                sub = {
                    'status': 'active',
                    'plan_code': 'max',
                    'plan_name': 'MAX',
                    'is_unlimited': True,
                    'projects_left': 9999,
                    'visualizations_left': 9999,
                    'revisions_left': 9999,
                    'has_materials': True,
                    'has_manager': True,
                    'has_crm': True,
                    'has_whitelabel': False,
                    'expires_at': None,
                }
            return {'statusCode': 200, 'headers': JSON, 'body': json.dumps({'subscription': sub}, default=str)}

        # POST — активация или списание
        body = json.loads(event.get('body') or '{}')
        action = body.get('action')

        # Активировать план
        if action == 'activate':
            plan_code = body.get('plan_code')
            if not plan_code:
                return {'statusCode': 400, 'headers': JSON, 'body': json.dumps({'error': 'plan_code required'})}

            cur.execute("SELECT * FROM user_plans WHERE code = %s", (plan_code,))
            plan = cur.fetchone()
            if not plan:
                return {'statusCode': 404, 'headers': JSON, 'body': json.dumps({'error': 'Plan not found'})}

            # Деактивируем текущую
            cur.execute("""
                UPDATE user_subscriptions SET status = 'cancelled', updated_at = NOW()
                WHERE user_id = %s AND status = 'active'
            """, (user_id,))

            # Считаем срок для ежемесячных
            expires_sql = "NOW() + INTERVAL '30 days'" if plan['is_monthly'] else "NULL"

            cur.execute(f"""
                INSERT INTO user_subscriptions (user_id, plan_code, status, expires_at)
                VALUES (%s, %s, 'active', {expires_sql})
                RETURNING *
            """, (user_id, plan_code))
            new_sub = dict(cur.fetchone())
            conn.commit()
            return {'statusCode': 200, 'headers': JSON, 'body': json.dumps({'success': True, 'subscription_id': new_sub['id']}, default=str)}

        # Проверить лимит (касса отключена — всегда разрешено)
        if action == 'check':
            return {'statusCode': 200, 'headers': JSON, 'body': json.dumps({'allowed': True})}

        # Списать использование (касса отключена — просто отвечаем успехом)
        if action == 'consume':
            return {'statusCode': 200, 'headers': JSON, 'body': json.dumps({'success': True, 'consumed': 1})}

        return {'statusCode': 400, 'headers': JSON, 'body': json.dumps({'error': 'Unknown action'})}

    finally:
        cur.close()
        conn.close()