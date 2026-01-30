import json
import os
import requests

def handler(event: dict, context) -> dict:
    '''
    Отправка уведомлений о нарядах-заказах через SMS и Telegram
    '''
    method = event.get('httpMethod', 'POST')
    
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
    
    if method == 'POST':
        data = json.loads(event.get('body', '{}'))
        action = data.get('action', 'send')
        
        if action == 'send':
            return send_notification(data)
        elif action == 'test':
            return test_notification(data)
    
    return error_response('Invalid method or action', 400)

def send_notification(data: dict) -> dict:
    '''Отправка уведомления о наряде-заказе'''
    try:
        notification_type = data.get('type', 'both')
        phone = data.get('phone')
        telegram_id = data.get('telegram_id')
        order_id = data.get('order_id')
        work_description = data.get('work_description', '')
        price = data.get('price')
        deadline = data.get('deadline')
        
        if not phone and not telegram_id:
            return error_response('Phone or telegram_id required', 400)
        
        message = format_order_message(order_id, work_description, price, deadline)
        
        results = {}
        
        if notification_type in ['sms', 'both'] and phone:
            sms_result = send_sms(phone, message)
            results['sms'] = sms_result
        
        if notification_type in ['telegram', 'both'] and telegram_id:
            telegram_result = send_telegram(telegram_id, message)
            results['telegram'] = telegram_result
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'results': results
            })
        }
    except Exception as e:
        return error_response(str(e), 500)

def send_sms(phone: str, message: str) -> dict:
    '''Отправка SMS через SMS.ru'''
    api_key = os.environ.get('SMS_API_KEY')
    
    if not api_key:
        return {'success': False, 'error': 'SMS API key not configured'}
    
    try:
        phone_clean = phone.replace('+', '').replace('-', '').replace(' ', '')
        
        response = requests.post(
            'https://sms.ru/sms/send',
            data={
                'api_id': api_key,
                'to': phone_clean,
                'msg': message,
                'json': 1
            },
            timeout=10
        )
        
        result = response.json()
        
        if result.get('status') == 'OK':
            return {'success': True, 'message': 'SMS sent successfully'}
        else:
            return {'success': False, 'error': result.get('status_text', 'Unknown error')}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def send_telegram(chat_id: str, message: str) -> dict:
    '''Отправка сообщения через Telegram Bot API'''
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    
    if not bot_token:
        return {'success': False, 'error': 'Telegram bot token not configured'}
    
    try:
        response = requests.post(
            f'https://api.telegram.org/bot{bot_token}/sendMessage',
            json={
                'chat_id': chat_id,
                'text': message,
                'parse_mode': 'HTML'
            },
            timeout=10
        )
        
        result = response.json()
        
        if result.get('ok'):
            return {'success': True, 'message': 'Telegram message sent successfully'}
        else:
            return {'success': False, 'error': result.get('description', 'Unknown error')}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def format_order_message(order_id: int, work_description: str, price: float, deadline: str) -> str:
    '''Форматирование сообщения о наряде-заказе'''
    message = f"🔔 Новый наряд-заказ #{order_id}\n\n"
    message += f"📋 Работы: {work_description}\n\n"
    
    if price:
        message += f"💰 Стоимость: {price:,.0f} ₽\n"
    
    if deadline:
        message += f"📅 Срок: {deadline}\n"
    
    message += "\n✅ Подтвердите получение заказа"
    
    return message

def test_notification(data: dict) -> dict:
    '''Тестовая отправка уведомления'''
    try:
        notification_type = data.get('type', 'telegram')
        phone = data.get('phone')
        telegram_id = data.get('telegram_id')
        
        test_message = "🧪 Тестовое уведомление от ЯСЕН\n\nСистема отправки работает корректно!"
        
        if notification_type == 'sms' and phone:
            result = send_sms(phone, test_message)
        elif notification_type == 'telegram' and telegram_id:
            result = send_telegram(telegram_id, test_message)
        else:
            return error_response('Invalid test parameters', 400)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': result.get('success', False),
                'result': result
            })
        }
    except Exception as e:
        return error_response(str(e), 500)

def error_response(message: str, status_code: int = 500) -> dict:
    '''Формирование ответа с ошибкой'''
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': False, 'error': message})
    }
