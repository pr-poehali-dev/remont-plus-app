import json
import os
import requests
from typing import List, Dict

def handler(event: dict, context) -> dict:
    """API для чата с ИИ-консультантом по ремонту"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        messages = body.get('messages', [])
        
        if not messages:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Messages array is required'})
            }
        
        api_key = os.environ.get('POLZA_AI_API_KEY')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'API key not configured'})
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
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': assistant_message,
                'usage': data.get('usage', {})
            })
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }
    except requests.RequestException as e:
        return {
            'statusCode': 502,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'AI service error: {str(e)}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Internal error: {str(e)}'})
        }
