import json
import os
import requests
import psycopg2
from typing import List, Dict
import uuid

def get_db_connection():
    """Создает подключение к базе данных"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def save_chat_session(conn, session_id: str, user_id: int = None):
    """Сохраняет или обновляет сессию чата"""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT session_id FROM t_p46588937_remont_plus_app.ai_chat_sessions 
            WHERE session_id = %s
        """, (session_id,))
        exists = cur.fetchone()
        
        if exists:
            cur.execute("""
                UPDATE t_p46588937_remont_plus_app.ai_chat_sessions 
                SET updated_at = CURRENT_TIMESTAMP
                WHERE session_id = %s
            """, (session_id,))
        else:
            cur.execute("""
                INSERT INTO t_p46588937_remont_plus_app.ai_chat_sessions (session_id, user_id, updated_at)
                VALUES (%s, %s, CURRENT_TIMESTAMP)
            """, (session_id, user_id))
    conn.commit()

def save_message(conn, session_id: str, role: str, content: str):
    """Сохраняет сообщение в базу данных"""
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO t_p46588937_remont_plus_app.ai_chat_messages (session_id, role, content)
            VALUES (%s, %s, %s)
        """, (session_id, role, content))
    conn.commit()

def get_chat_history(conn, session_id: str) -> List[Dict]:
    """Загружает историю чата из базы данных"""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT role, content, created_at 
            FROM t_p46588937_remont_plus_app.ai_chat_messages
            WHERE session_id = %s
            ORDER BY created_at ASC
        """, (session_id,))
        rows = cur.fetchall()
        return [
            {
                'role': row[0],
                'content': row[1],
                'timestamp': row[2].isoformat()
            }
            for row in rows
        ]

def handler(event: dict, context) -> dict:
    """API для чата с ИИ-консультантом по ремонту с сохранением в БД"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    conn = None
    try:
        body = json.loads(event.get('body', '{}'))
        messages = body.get('messages', [])
        session_id = body.get('sessionId')
        load_history = body.get('loadHistory', False)
        
        conn = get_db_connection()
        
        if not session_id:
            session_id = str(uuid.uuid4())
        
        save_chat_session(conn, session_id)
        
        if load_history:
            history = get_chat_history(conn, session_id)
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'sessionId': session_id,
                    'messages': history
                }),
                'isBase64Encoded': False
            }
        
        if not messages:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Messages array is required'}),
                'isBase64Encoded': False
            }
        
        api_key = os.environ.get('POLZA_AI_API_KEY')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'API key not configured'}),
                'isBase64Encoded': False
            }
        
        system_prompt = {
            "role": "system",
            "content": """Ты профессиональный консультант по ремонту квартир и домов. Твоя задача - помогать клиентам с вопросами о ремонте, дизайне интерьера, выборе материалов и планировании работ.

Твои знания включают:
- Современные тренды в дизайне интерьеров
- Виды отделочных материалов и их характеристики
- Этапы ремонтных работ и их последовательность
- Примерные расценки на работы и материалы
- Подбор цветовых решений и стилей
- Планировка помещений и зонирование
- Электрика, сантехника, вентиляция

Стиль общения:
- Дружелюбный и профессиональный
- Давай конкретные советы и рекомендации
- Используй примеры и визуальные описания
- При необходимости задавай уточняющие вопросы
- Предупреждай о возможных проблемах и подводных камнях

Если клиент спрашивает о стоимости:
- Давай примерные диапазоны цен для Москвы/регионов
- Объясняй, от чего зависит цена
- Предлагай варианты оптимизации бюджета"""
        }
        
        full_messages = [system_prompt] + messages
        
        response = requests.post(
            'https://api.polza.ai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': full_messages,
                'temperature': 0.7,
                'max_tokens': 1500
            },
            timeout=30
        )
        
        response.raise_for_status()
        data = response.json()
        
        assistant_message = data['choices'][0]['message']['content']
        
        user_message = messages[-1] if messages else None
        if user_message:
            save_message(conn, session_id, user_message['role'], user_message['content'])
        
        save_message(conn, session_id, 'assistant', assistant_message)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'sessionId': session_id,
                'message': assistant_message,
                'usage': data.get('usage', {})
            }),
            'isBase64Encoded': False
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid JSON in request body'}),
            'isBase64Encoded': False
        }
    except requests.RequestException as e:
        return {
            'statusCode': 502,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'AI service error: {str(e)}'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Internal error: {str(e)}'}),
            'isBase64Encoded': False
        }
    finally:
        if conn:
            conn.close()