import json
import os
import psycopg2
from decimal import Decimal

def handler(event: dict, context) -> dict:
    '''API для управления измерениями помещений'''
    
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
            project_id = event.get('queryStringParameters', {}).get('project_id')
            
            if not project_id:
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'project_id is required'})}
            
            cursor.execute(
                "SELECT id, room_name, length, width, height, area, notes, created_at FROM room_measurements WHERE project_id = %s ORDER BY created_at ASC",
                (project_id,)
            )
            measurements = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'measurements': [
                        {
                            'id': m[0],
                            'room_name': m[1],
                            'length': float(m[2]),
                            'width': float(m[3]),
                            'height': float(m[4]),
                            'area': float(m[5]) if m[5] else None,
                            'notes': m[6],
                            'created_at': m[7].isoformat() if m[7] else None
                        } for m in measurements
                    ]
                })
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            project_id = body.get('project_id')
            room_name = body.get('room_name')
            length = body.get('length')
            width = body.get('width')
            height = body.get('height')
            notes = body.get('notes')
            
            if not all([project_id, room_name, length, width, height]):
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'project_id, room_name, length, width and height are required'})}
            
            area = float(length) * float(width)
            
            cursor.execute(
                "INSERT INTO room_measurements (project_id, room_name, length, width, height, area, notes) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (project_id, room_name, length, width, height, area, notes)
            )
            measurement_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'measurement_id': measurement_id,
                    'area': area,
                    'message': 'Measurement created successfully'
                })
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            
            measurement_id = body.get('measurement_id')
            if not measurement_id:
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'measurement_id is required'})}
            
            updates = []
            values = []
            
            for field in ['room_name', 'length', 'width', 'height', 'notes']:
                if field in body:
                    updates.append(f"{field} = %s")
                    values.append(body[field])
            
            if 'length' in body or 'width' in body:
                cursor.execute(
                    "SELECT length, width FROM room_measurements WHERE id = %s",
                    (measurement_id,)
                )
                current = cursor.fetchone()
                if current:
                    new_length = body.get('length', current[0])
                    new_width = body.get('width', current[1])
                    new_area = float(new_length) * float(new_width)
                    updates.append("area = %s")
                    values.append(new_area)
            
            if not updates:
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'No fields to update'})}
            
            values.append(measurement_id)
            
            cursor.execute(
                f"UPDATE room_measurements SET {', '.join(updates)} WHERE id = %s",
                values
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Measurement updated successfully'
                })
            }
        
        elif method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            measurement_id = body.get('measurement_id')
            
            if not measurement_id:
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'measurement_id is required'})}
            
            cursor.execute(
                "DELETE FROM room_measurements WHERE id = %s",
                (measurement_id,)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Measurement deleted successfully'
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
