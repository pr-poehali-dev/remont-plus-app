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
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token'
            },
            'body': ''
        }
    
    # Проверка админского токена (пока простая проверка)
    admin_token = event.get('headers', {}).get('X-Admin-Token', '')
    admin_password = os.environ.get('ADMIN_PASSWORD', 'admin2025')
    
    if admin_token != admin_password:
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
