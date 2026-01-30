import json
import os
import psycopg2
from datetime import datetime
from decimal import Decimal

def handler(event: dict, context) -> dict:
    '''API для управления проектами заказчиков'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            user_id = event.get('queryStringParameters', {}).get('user_id')
            project_id = event.get('queryStringParameters', {}).get('project_id')
            
            if project_id:
                cursor.execute(
                    "SELECT id, user_id, title, address, project_type, area, rooms, budget, description, status, progress, start_date, deadline, created_at FROM projects WHERE id = %s",
                    (project_id,)
                )
                project = cursor.fetchone()
                
                if not project:
                    return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Project not found'})}
                
                cursor.execute(
                    "SELECT id, room_name, length, width, height, area, notes FROM room_measurements WHERE project_id = %s",
                    (project_id,)
                )
                measurements = cursor.fetchall()
                
                cursor.execute(
                    "SELECT id, photo_url, room_name, description, created_at FROM project_photos WHERE project_id = %s",
                    (project_id,)
                )
                photos = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'project': {
                            'id': project[0],
                            'user_id': project[1],
                            'title': project[2],
                            'address': project[3],
                            'project_type': project[4],
                            'area': float(project[5]) if project[5] else None,
                            'rooms': project[6],
                            'budget': float(project[7]) if project[7] else None,
                            'description': project[8],
                            'status': project[9],
                            'progress': project[10],
                            'start_date': project[11].isoformat() if project[11] else None,
                            'deadline': project[12].isoformat() if project[12] else None,
                            'created_at': project[13].isoformat() if project[13] else None
                        },
                        'measurements': [
                            {
                                'id': m[0],
                                'room_name': m[1],
                                'length': float(m[2]),
                                'width': float(m[3]),
                                'height': float(m[4]),
                                'area': float(m[5]) if m[5] else None,
                                'notes': m[6]
                            } for m in measurements
                        ],
                        'photos': [
                            {
                                'id': p[0],
                                'photo_url': p[1],
                                'room_name': p[2],
                                'description': p[3],
                                'created_at': p[4].isoformat() if p[4] else None
                            } for p in photos
                        ]
                    })
                }
            
            elif user_id:
                cursor.execute(
                    "SELECT id, title, address, project_type, area, rooms, budget, status, progress, start_date, deadline, created_at FROM projects WHERE user_id = %s ORDER BY created_at DESC",
                    (user_id,)
                )
                projects = cursor.fetchall()
                
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
                                'start_date': p[9].isoformat() if p[9] else None,
                                'deadline': p[10].isoformat() if p[10] else None,
                                'created_at': p[11].isoformat() if p[11] else None
                            } for p in projects
                        ]
                    })
                }
            
            else:
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'user_id or project_id is required'})}
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            user_id = body.get('user_id')
            title = body.get('title')
            address = body.get('address')
            project_type = body.get('project_type', 'apartment')
            area = body.get('area')
            rooms = body.get('rooms')
            budget = body.get('budget')
            description = body.get('description')
            
            if not all([user_id, title, address]):
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'user_id, title and address are required'})}
            
            cursor.execute(
                "INSERT INTO projects (user_id, title, address, project_type, area, rooms, budget, description) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (user_id, title, address, project_type, area, rooms, budget, description)
            )
            project_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'project_id': project_id,
                    'message': 'Project created successfully'
                })
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            
            project_id = body.get('project_id')
            if not project_id:
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'project_id is required'})}
            
            updates = []
            values = []
            
            for field in ['title', 'address', 'project_type', 'area', 'rooms', 'budget', 'description', 'status', 'progress', 'start_date', 'deadline']:
                if field in body:
                    updates.append(f"{field} = %s")
                    values.append(body[field])
            
            if not updates:
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'No fields to update'})}
            
            updates.append("updated_at = NOW()")
            values.append(project_id)
            
            cursor.execute(
                f"UPDATE projects SET {', '.join(updates)} WHERE id = %s",
                values
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Project updated successfully'
                })
            }
        
        else:
            return {'statusCode': 405, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'})}
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        cursor.close()
        conn.close()
