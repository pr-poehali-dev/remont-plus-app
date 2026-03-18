import json
import os
import urllib.request
import psycopg2


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
}


def send_telegram(message: str) -> None:
    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')
    if not token or not chat_id:
        return
    data = json.dumps({'chat_id': chat_id, 'text': message, 'parse_mode': 'HTML'}).encode('utf-8')
    req = urllib.request.Request(
        f'https://api.telegram.org/bot{token}/sendMessage',
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    urllib.request.urlopen(req, timeout=10)


def handler(event: dict, context) -> dict:
    """Сохранение лида с калькулятора — имя и телефон в обмен на доступ к PDF"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    headers = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}

    body = json.loads(event.get('body') or '{}')
    name = body.get('name', '').strip()
    phone = body.get('phone', '').strip()
    email = body.get('email', '').strip()
    calc_type = body.get('calc_type', 'Калькулятор ремонта').strip()
    total_sum = body.get('total_sum', '').strip()
    items_count = body.get('items_count', 0)
    region = body.get('region', '').strip()
    source = body.get('source', 'export_pdf').strip()
    page_url = body.get('page_url', '').strip()

    if not phone or len(phone) < 5:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Укажите телефон'}, ensure_ascii=False)
        }

    dsn = os.environ.get('DATABASE_URL', '')
    lead_id = None

    conn = psycopg2.connect(dsn)
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO calculator_leads (name, phone, email, calc_type, total_sum, items_count, region, source, page_url) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (name, phone, email, calc_type, total_sum, items_count, region, source, page_url)
            )
            lead_id = cur.fetchone()[0]
        conn.commit()
    finally:
        conn.close()

    try:
        fmt_total = total_sum if total_sum else '—'
        tg_text = (
            f"📋 <b>Заявка на PDF-смету</b>\n\n"
            f"👤 Имя: {name or '—'}\n"
            f"📞 Телефон: {phone}\n"
            f"💰 Сумма: {fmt_total}\n"
            f"🔧 Тип: {calc_type}\n"
            f"📍 Регион: {region or '—'}\n"
            f"📄 Позиций: {items_count}\n"
            f"🆔 Лид #{lead_id}"
        )
        send_telegram(tg_text)
    except Exception as e:
        print(f'TELEGRAM ERROR: {e}')

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'lead_id': lead_id}, ensure_ascii=False)
    }
