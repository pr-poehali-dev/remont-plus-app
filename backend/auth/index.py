import json
import os
import psycopg2
from datetime import datetime, timedelta
import random

def handler(event: dict, context) -> dict:
    '''API для регистрации и авторизации пользователей с SMS-подтверждением'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body = json.loads(event.get('body', '{}'))
    action = body.get('action')
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()
    
    try:
        if action == 'send_code':
            phone = body.get('phone')
            user_type = body.get('user_type', 'customer')
            
            if not phone:
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Phone is required'})}
            
            code = str(random.randint(1000, 9999))
            expires_at = datetime.now() + timedelta(minutes=10)
            
            cursor.execute(
                "INSERT INTO sms_codes (phone, code, expires_at) VALUES (%s, %s, %s)",
                (phone, code, expires_at)
            )
            conn.commit()
            
            print(f"SMS код для {phone}: {code}")
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': f'Код отправлен на {phone}',
                    'dev_code': code
                })
            }
        
        elif action == 'verify_code':
            phone = body.get('phone')
            code = body.get('code')
            name = body.get('name')
            email = body.get('email')
            user_type = body.get('user_type', 'customer')
            specialization = body.get('specialization')
            experience = body.get('experience')
            
            if not all([phone, code, name]):
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Phone, code and name are required'})}
            
            cursor.execute(
                "SELECT id FROM sms_codes WHERE phone = %s AND code = %s AND expires_at > NOW() AND is_used = FALSE ORDER BY created_at DESC LIMIT 1",
                (phone, code)
            )
            sms_record = cursor.fetchone()
            
            if not sms_record:
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Invalid or expired code'})}
            
            cursor.execute("UPDATE sms_codes SET is_used = TRUE WHERE id = %s", (sms_record[0],))
            
            cursor.execute("SELECT id FROM users WHERE phone = %s", (phone,))
            existing_user = cursor.fetchone()
            
            if existing_user:
                cursor.execute("UPDATE users SET is_verified = TRUE, updated_at = NOW() WHERE phone = %s RETURNING id, name, email, user_type", (phone,))
            else:
                cursor.execute(
                    "INSERT INTO users (phone, name, email, user_type, specialization, experience, is_verified) VALUES (%s, %s, %s, %s, %s, %s, TRUE) RETURNING id, name, email, user_type",
                    (phone, name, email, user_type, specialization, experience)
                )
            
            user = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user': {
                        'id': user[0],
                        'name': user[1],
                        'email': user[2],
                        'user_type': user[3],
                        'phone': phone
                    }
                })
            }
        
        elif action == 'get_user':
            phone = body.get('phone')
            
            if not phone:
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Phone is required'})}
            
            cursor.execute(
                "SELECT id, phone, name, email, user_type, specialization, experience, is_verified, created_at FROM users WHERE phone = %s",
                (phone,)
            )
            user_data = cursor.fetchone()
            
            if not user_data:
                return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'User not found'})}
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user': {
                        'id': user_data[0],
                        'phone': user_data[1],
                        'name': user_data[2],
                        'email': user_data[3],
                        'user_type': user_data[4],
                        'specialization': user_data[5],
                        'experience': user_data[6],
                        'is_verified': user_data[7],
                        'created_at': user_data[8].isoformat() if user_data[8] else None
                    }
                })
            }
        
        else:
            return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Invalid action'})}
    
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
