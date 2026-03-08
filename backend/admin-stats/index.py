import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для получения статистики и данных администратора'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token, X-Auth-Token'
            },
            'body': ''
        }
    
    # Проверка: принимаем либо статичный ADMIN_PASSWORD, либо сессионный токен admin-пользователя
    headers = event.get('headers', {}) or {}
    headers_lower = {k.lower(): v for k, v in headers.items()}

    # Статичный токен (X-Admin-Token)
    admin_token = headers_lower.get('x-admin-token', '')
    admin_password = os.environ.get('ADMIN_PASSWORD', '')

    # Сессионный токен пользователя (X-Auth-Token)
    session_token = headers_lower.get('x-auth-token', '').strip()

    is_authorized = False

    if admin_password and admin_token == admin_password:
        is_authorized = True
    elif session_token:
        # Проверяем токен в refresh_tokens: user_id=0 — это admin-вход
        try:
            dsn_check = os.environ.get('DATABASE_URL')
            conn_check = psycopg2.connect(dsn_check)
            cur_check = conn_check.cursor()
            schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
            cur_check.execute(
                f"SELECT rt.user_id, u.role FROM {schema}.refresh_tokens rt LEFT JOIN {schema}.users u ON u.id = rt.user_id WHERE rt.token_hash = %s AND rt.expires_at > NOW() LIMIT 1",
                (session_token,)
            )
            row = cur_check.fetchone()
            if row and (row[0] == 0 or row[1] == 'admin'):
                is_authorized = True
            cur_check.close()
            conn_check.close()
        except Exception:
            pass

    if not is_authorized:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            action = event.get('queryStringParameters', {}).get('action', 'stats')
            
            if action == 'stats':
                # Общая статистика
                cursor.execute("SELECT COUNT(*) FROM users")
                total_users = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM users WHERE user_type = 'customer'")
                customers_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM users WHERE user_type = 'contractor'")
                contractors_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM projects")
                total_projects = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM projects WHERE status = 'in_progress'")
                active_projects = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM projects WHERE status = 'completed'")
                completed_projects = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM room_measurements")
                total_measurements = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM project_photos")
                total_photos = cursor.fetchone()[0]
                
                # Статистика по типам проектов
                cursor.execute("""
                    SELECT project_type, COUNT(*) 
                    FROM projects 
                    GROUP BY project_type
                """)
                project_types = dict(cursor.fetchall())
                
                # Средний бюджет
                cursor.execute("SELECT AVG(budget) FROM projects WHERE budget IS NOT NULL")
                avg_budget = cursor.fetchone()[0]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'stats': {
                            'users': {
                                'total': total_users,
                                'customers': customers_count,
                                'contractors': contractors_count
                            },
                            'projects': {
                                'total': total_projects,
                                'active': active_projects,
                                'completed': completed_projects,
                                'by_type': project_types,
                                'avg_budget': float(avg_budget) if avg_budget else 0
                            },
                            'content': {
                                'measurements': total_measurements,
                                'photos': total_photos
                            }
                        }
                    })
                }
            
            elif action == 'projects':
                # Список всех проектов с информацией о пользователях
                limit = int(event.get('queryStringParameters', {}).get('limit', '50'))
                offset = int(event.get('queryStringParameters', {}).get('offset', '0'))
                status_filter = event.get('queryStringParameters', {}).get('status')
                
                query = """
                    SELECT 
                        p.id, p.title, p.address, p.project_type, p.area, 
                        p.rooms, p.budget, p.status, p.progress, p.created_at,
                        u.name as customer_name, u.phone as customer_phone, u.email as customer_email
                    FROM projects p
                    JOIN users u ON p.user_id = u.id
                """
                params = []
                
                if status_filter:
                    query += " WHERE p.status = %s"
                    params.append(status_filter)
                
                query += " ORDER BY p.created_at DESC LIMIT %s OFFSET %s"
                params.extend([limit, offset])
                
                cursor.execute(query, params)
                projects = cursor.fetchall()
                
                # Подсчёт общего количества
                count_query = "SELECT COUNT(*) FROM projects"
                if status_filter:
                    count_query += " WHERE status = %s"
                    cursor.execute(count_query, [status_filter])
                else:
                    cursor.execute(count_query)
                total_count = cursor.fetchone()[0]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'projects': [
                            {
                                'id': p[0],
                                'title': p[1],
                                'address': p[2],
                                'project_type': p[3],
                                'area': float(p[4]) if p[4] else None,
                                'rooms': p[5],
                                'budget': float(p[6]) if p[6] else None,
                                'status': p[7],
                                'progress': p[8],
                                'created_at': p[9].isoformat() if p[9] else None,
                                'customer': {
                                    'name': p[10],
                                    'phone': p[11],
                                    'email': p[12]
                                }
                            } for p in projects
                        ],
                        'total': total_count,
                        'limit': limit,
                        'offset': offset
                    })
                }
            
            elif action == 'users':
                # Список всех пользователей
                user_type = event.get('queryStringParameters', {}).get('user_type')
                
                query = "SELECT id, phone, name, email, user_type, specialization, experience, is_verified, created_at FROM users"
                params = []
                
                if user_type:
                    query += " WHERE user_type = %s"
                    params.append(user_type)
                
                query += " ORDER BY created_at DESC"
                
                cursor.execute(query, params)
                users = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'users': [
                            {
                                'id': u[0],
                                'phone': u[1],
                                'name': u[2],
                                'email': u[3],
                                'user_type': u[4],
                                'specialization': u[5],
                                'experience': u[6],
                                'is_verified': u[7],
                                'created_at': u[8].isoformat() if u[8] else None
                            } for u in users
                        ]
                    })
                }
            
            elif action == 'report':
                # Сводный отчёт: пользователи, дизайн-проекты, активность
                date_from = event.get('queryStringParameters', {}).get('date_from')
                date_to = event.get('queryStringParameters', {}).get('date_to')

                # --- Сводные цифры ---
                cursor.execute("SELECT COUNT(*) FROM users WHERE role != 'admin'")
                total_users = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM users WHERE user_type = 'customer'")
                customers = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM users WHERE user_type = 'contractor'")
                contractors = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM design_projects")
                total_projects = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM design_projects WHERE user_id IS NOT NULL")
                auth_projects = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM design_stage_results")
                total_stages = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM partner_leads")
                total_partner_leads = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM partner_leads WHERE status = 'new'")
                new_partner_leads = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM ai_chat_sessions")
                total_chats = cursor.fetchone()[0]

                # --- Пользователи ---
                cursor.execute("""
                    SELECT u.id, u.name, u.phone, u.email, u.user_type, u.role,
                           u.created_at, u.last_login_at,
                           COUNT(dp.id) as projects_count
                    FROM users u
                    LEFT JOIN design_projects dp ON dp.user_id = u.id
                    WHERE u.role != 'admin'
                    GROUP BY u.id
                    ORDER BY u.created_at DESC
                    LIMIT 100
                """)
                rows = cursor.fetchall()
                users_list = [
                    {
                        'id': r[0], 'name': r[1], 'phone': r[2], 'email': r[3],
                        'user_type': r[4], 'role': r[5],
                        'created_at': r[6].isoformat() if r[6] else None,
                        'last_login_at': r[7].isoformat() if r[7] else None,
                        'projects_count': r[8]
                    } for r in rows
                ]

                # --- Дизайн-проекты ---
                cursor.execute("""
                    SELECT dp.id, dp.name, dp.style, dp.total_area, dp.room_count,
                           dp.status, dp.created_at,
                           u.name as user_name, u.phone as user_phone,
                           COUNT(dsr.id) as stages_done
                    FROM design_projects dp
                    LEFT JOIN users u ON u.id = dp.user_id
                    LEFT JOIN design_stage_results dsr ON dsr.project_id = dp.id
                    GROUP BY dp.id, u.name, u.phone
                    ORDER BY dp.created_at DESC
                    LIMIT 100
                """)
                rows = cursor.fetchall()
                projects_list = [
                    {
                        'id': r[0], 'name': r[1], 'style': r[2],
                        'total_area': float(r[3]) if r[3] else None,
                        'room_count': r[4], 'status': r[5],
                        'created_at': r[6].isoformat() if r[6] else None,
                        'user_name': r[7], 'user_phone': r[8],
                        'stages_done': r[9]
                    } for r in rows
                ]

                # --- Регистрации по дням (последние 30 дней) ---
                cursor.execute("""
                    SELECT DATE(created_at) as day, COUNT(*) as cnt
                    FROM users
                    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                    GROUP BY day ORDER BY day
                """)
                registrations_by_day = [
                    {'date': str(r[0]), 'count': r[1]} for r in cursor.fetchall()
                ]

                # --- Проекты по дням (последние 30 дней) ---
                cursor.execute("""
                    SELECT DATE(created_at) as day, COUNT(*) as cnt
                    FROM design_projects
                    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                    GROUP BY day ORDER BY day
                """)
                projects_by_day = [
                    {'date': str(r[0]), 'count': r[1]} for r in cursor.fetchall()
                ]

                # --- Сметы ---
                cursor.execute("SELECT COUNT(*) FROM estimates")
                total_estimates = cursor.fetchone()[0]

                cursor.execute("SELECT COALESCE(AVG(total), 0) FROM estimates WHERE total > 0")
                avg_estimate = float(cursor.fetchone()[0])

                cursor.execute("""
                    SELECT e.id, e.name, e.total_materials, e.total_works, e.total,
                           e.status, e.created_at, e.updated_at,
                           u.name as user_name, u.phone as user_phone,
                           (SELECT COUNT(*) FROM estimate_items ei WHERE ei.estimate_id = e.id) as items_count
                    FROM estimates e
                    LEFT JOIN users u ON u.id = e.user_id
                    ORDER BY e.created_at DESC
                    LIMIT 100
                """)
                est_rows = cursor.fetchall()
                estimates_list = [
                    {
                        'id': r[0], 'name': r[1],
                        'total_materials': float(r[2]) if r[2] else 0,
                        'total_works': float(r[3]) if r[3] else 0,
                        'total': float(r[4]) if r[4] else 0,
                        'status': r[5],
                        'created_at': r[6].isoformat() if r[6] else None,
                        'updated_at': r[7].isoformat() if r[7] else None,
                        'user_name': r[8], 'user_phone': r[9],
                        'items_count': r[10],
                    } for r in est_rows
                ]

                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'summary': {
                            'total_users': total_users,
                            'customers': customers,
                            'contractors': contractors,
                            'total_projects': total_projects,
                            'auth_projects': auth_projects,
                            'total_stages': total_stages,
                            'total_partner_leads': total_partner_leads,
                            'new_partner_leads': new_partner_leads,
                            'total_chats': total_chats,
                            'total_estimates': total_estimates,
                            'avg_estimate': round(avg_estimate),
                        },
                        'users': users_list,
                        'projects': projects_list,
                        'estimates': estimates_list,
                        'registrations_by_day': registrations_by_day,
                        'projects_by_day': projects_by_day,
                    })
                }

            elif action == 'subscribers':
                # Пользователи, давшие согласие на email-рассылку
                cursor.execute("""
                    SELECT id, name, phone, email, user_type, created_at
                    FROM users
                    WHERE email_consent = TRUE AND email IS NOT NULL AND email != ''
                    ORDER BY created_at DESC
                """)
                rows = cursor.fetchall()
                subscribers = [
                    {
                        'id': r[0], 'name': r[1], 'phone': r[2], 'email': r[3],
                        'user_type': r[4],
                        'created_at': r[5].isoformat() if r[5] else None,
                    } for r in rows
                ]

                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'subscribers': subscribers, 'total': len(subscribers)})
                }

            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid action'})
                }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        cursor.close()
        conn.close()