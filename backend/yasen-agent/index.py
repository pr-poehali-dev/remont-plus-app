import json
import os
import base64
from datetime import datetime
import requests
import psycopg2

def handler(event: dict, context) -> dict:
    '''
    ИИ-агент ЯСЕН для голосового общения с заказчиками и исполнителями.
    Формирует наряды-заказы и сохраняет записи разговоров.
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': ''
        }
    
    action = event.get('queryStringParameters', {}).get('action', 'chat')
    
    if method == 'POST':
        if action == 'transcribe':
            return handle_transcribe(event)
        elif action == 'chat':
            return handle_chat(event)
        elif action == 'create_order':
            return handle_create_order(event)
        elif action == 'save_recording':
            return handle_save_recording(event)
    
    if method == 'GET':
        if action == 'orders':
            return get_orders(event)
        elif action == 'recordings':
            return get_recordings(event)
    
    return {
        'statusCode': 400,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Invalid action or method'})
    }

def handle_transcribe(event: dict) -> dict:
    '''Преобразование голоса в текст через OpenAI Whisper API'''
    try:
        data = json.loads(event.get('body', '{}'))
        audio_base64 = data.get('audio')
        
        if not audio_base64:
            return error_response('Audio data required', 400)
        
        audio_bytes = base64.b64decode(audio_base64)
        
        api_key = os.environ.get('POLZA_AI_API_KEY')
        if not api_key:
            return error_response('API key not configured', 500)
        
        response = requests.post(
            'https://api.polza.ai/v1/audio/transcriptions',
            headers={'Authorization': f'Bearer {api_key}'},
            files={'file': ('audio.webm', audio_bytes, 'audio/webm')},
            data={'model': 'whisper-1', 'language': 'ru'}
        )
        
        if response.status_code != 200:
            return error_response(f'Transcription failed: {response.text}', 500)
        
        result = response.json()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'text': result.get('text', '')
            })
        }
    except Exception as e:
        return error_response(str(e), 500)

def handle_chat(event: dict) -> dict:
    '''Обработка текстового сообщения агентом ЯСЕН'''
    try:
        data = json.loads(event.get('body', '{}'))
        user_message = data.get('message', '')
        conversation_history = data.get('history', [])
        user_role = data.get('user_role', 'customer')
        
        if not user_message:
            return error_response('Message required', 400)
        
        api_key = os.environ.get('POLZA_AI_API_KEY')
        if not api_key:
            return error_response('API key not configured', 500)
        
        system_prompt = get_yasen_prompt(user_role)
        
        messages = [{'role': 'system', 'content': system_prompt}]
        messages.extend(conversation_history)
        messages.append({'role': 'user', 'content': user_message})
        
        response = requests.post(
            'https://api.polza.ai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'openai/gpt-4o',
                'messages': messages,
                'temperature': 0.7,
                'max_tokens': 1000
            }
        )
        
        if response.status_code not in [200, 201]:
            return error_response(f'Chat API error: {response.status_code}', 500)
        
        result = response.json()
        
        if 'choices' not in result or not result['choices']:
            return error_response('Invalid API response', 500)
        
        assistant_message = result['choices'][0]['message']['content']
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': assistant_message,
                'usage': result.get('usage', {})
            })
        }
    except Exception as e:
        return error_response(str(e), 500)

def handle_create_order(event: dict) -> dict:
    '''Создание наряда-заказа на основе разговора'''
    try:
        data = json.loads(event.get('body', '{}'))
        customer_phone = data.get('customer_phone')
        contractor_phone = data.get('contractor_phone')
        work_description = data.get('work_description')
        price = data.get('price')
        deadline = data.get('deadline')
        conversation_id = data.get('conversation_id')
        
        if not all([customer_phone, work_description]):
            return error_response('Missing required fields', 400)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            INSERT INTO work_orders 
            (customer_phone, contractor_phone, work_description, price, deadline, conversation_id, status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, 'pending', NOW())
            RETURNING id, created_at
        ''', (customer_phone, contractor_phone, work_description, price, deadline, conversation_id))
        
        order_id, created_at = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'order_id': order_id,
                'created_at': created_at.isoformat()
            })
        }
    except Exception as e:
        return error_response(str(e), 500)

def handle_save_recording(event: dict) -> dict:
    '''Сохранение записи разговора в S3'''
    try:
        data = json.loads(event.get('body', '{}'))
        audio_base64 = data.get('audio')
        conversation_id = data.get('conversation_id')
        duration = data.get('duration', 0)
        participants = data.get('participants', [])
        
        if not audio_base64:
            return error_response('Audio data required', 400)
        
        import boto3
        
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        audio_bytes = base64.b64decode(audio_base64)
        file_key = f'recordings/{conversation_id}_{datetime.now().timestamp()}.webm'
        
        s3.put_object(
            Bucket='files',
            Key=file_key,
            Body=audio_bytes,
            ContentType='audio/webm'
        )
        
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            INSERT INTO conversation_recordings 
            (conversation_id, audio_url, duration, participants, created_at)
            VALUES (%s, %s, %s, %s, NOW())
            RETURNING id
        ''', (conversation_id, cdn_url, duration, json.dumps(participants)))
        
        recording_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'recording_id': recording_id,
                'audio_url': cdn_url
            })
        }
    except Exception as e:
        return error_response(str(e), 500)

def get_orders(event: dict) -> dict:
    '''Получение списка нарядов-заказов'''
    try:
        params = event.get('queryStringParameters', {})
        status = params.get('status')
        limit = int(params.get('limit', 50))
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        query = 'SELECT id, customer_phone, contractor_phone, work_description, price, deadline, status, created_at FROM work_orders'
        
        if status:
            query += f" WHERE status = '{status}'"
        
        query += f' ORDER BY created_at DESC LIMIT {limit}'
        
        cur.execute(query)
        orders = []
        
        for row in cur.fetchall():
            orders.append({
                'id': row[0],
                'customer_phone': row[1],
                'contractor_phone': row[2],
                'work_description': row[3],
                'price': float(row[4]) if row[4] else None,
                'deadline': row[5].isoformat() if row[5] else None,
                'status': row[6],
                'created_at': row[7].isoformat()
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'orders': orders})
        }
    except Exception as e:
        return error_response(str(e), 500)

def get_recordings(event: dict) -> dict:
    '''Получение записей разговоров'''
    try:
        params = event.get('queryStringParameters', {})
        conversation_id = params.get('conversation_id')
        limit = int(params.get('limit', 50))
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        if conversation_id:
            cur.execute('''
                SELECT id, conversation_id, audio_url, duration, participants, created_at 
                FROM conversation_recordings 
                WHERE conversation_id = %s
                ORDER BY created_at DESC
            ''', (conversation_id,))
        else:
            cur.execute(f'''
                SELECT id, conversation_id, audio_url, duration, participants, created_at 
                FROM conversation_recordings 
                ORDER BY created_at DESC LIMIT {limit}
            ''')
        
        recordings = []
        for row in cur.fetchall():
            recordings.append({
                'id': row[0],
                'conversation_id': row[1],
                'audio_url': row[2],
                'duration': row[3],
                'participants': json.loads(row[4]) if row[4] else [],
                'created_at': row[5].isoformat()
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'recordings': recordings})
        }
    except Exception as e:
        return error_response(str(e), 500)

def get_yasen_prompt(user_role: str) -> str:
    '''Системный промпт для агента ЯСЕН'''
    base_prompt = '''Ты — ЯСЕН, умный ИИ-помощник для управления ремонтом и строительством.

Твои компетенции:
- Понимание строительных работ, материалов и технологий
- Оценка стоимости и сроков выполнения работ
- Составление технических заданий и нарядов-заказов
- Координация между заказчиками и исполнителями
- Контроль качества и соблюдения норм

Твоя задача:
1. Выслушать детали заказа от клиента
2. Задать уточняющие вопросы для полного понимания
3. Предложить оптимальные решения
4. Сформировать четкий наряд-заказ с описанием работ, сроками и ценой
5. Быть вежливым, профессиональным и конкретным

Стиль общения: дружелюбный эксперт, говорящий простым языком.
'''
    
    if user_role == 'customer':
        return base_prompt + '\n\nСейчас ты общаешься с ЗАКАЗЧИКОМ. Помоги ему четко сформулировать потребности и создать заказ.'
    elif user_role == 'contractor':
        return base_prompt + '\n\nСейчас ты общаешься с ИСПОЛНИТЕЛЕМ. Предоставь детали заказа и согласуй условия работы.'
    else:
        return base_prompt

def get_db_connection():
    '''Подключение к PostgreSQL'''
    return psycopg2.connect(os.environ['DATABASE_URL'])

def error_response(message: str, status_code: int = 500) -> dict:
    '''Формирование ответа с ошибкой'''
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': False, 'error': message})
    }