import json
import os
import boto3
import psycopg2
import base64
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для загрузки и управления фотографиями проектов'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'project_id is required'})
                }
            
            cursor.execute(
                "SELECT id, photo_url, room_name, description, created_at FROM project_photos WHERE project_id = %s ORDER BY created_at DESC",
                (project_id,)
            )
            photos = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
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
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            project_id = body.get('project_id')
            photo_base64 = body.get('photo')
            room_name = body.get('room_name', '')
            description = body.get('description', '')
            
            if not all([project_id, photo_base64]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'project_id and photo are required'})
                }
            
            try:
                photo_data = base64.b64decode(photo_base64)
            except Exception as e:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid base64 photo data'})
                }
            
            s3 = boto3.client('s3',
                endpoint_url='https://bucket.poehali.dev',
                aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
            )
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            file_key = f"projects/{project_id}/photos/{timestamp}.jpg"
            
            s3.put_object(
                Bucket='files',
                Key=file_key,
                Body=photo_data,
                ContentType='image/jpeg'
            )
            
            cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
            
            cursor.execute(
                "INSERT INTO project_photos (project_id, photo_url, room_name, description) VALUES (%s, %s, %s, %s) RETURNING id",
                (project_id, cdn_url, room_name, description)
            )
            photo_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'photo_id': photo_id,
                    'photo_url': cdn_url,
                    'message': 'Photo uploaded successfully'
                })
            }
        
        elif method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            photo_id = body.get('photo_id')
            
            if not photo_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'photo_id is required'})
                }
            
            cursor.execute("DELETE FROM project_photos WHERE id = %s", (photo_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Photo deleted successfully'
                })
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
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
