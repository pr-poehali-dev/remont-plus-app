import json
import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import urllib.request
import urllib.parse
import psycopg2


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


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    smtp_host = os.environ.get('SMTP_HOST', '')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')

    if not all([smtp_host, smtp_user, smtp_password]):
        return False

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f'Авангард <{smtp_user}>'
    msg['To'] = to_email
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))

    context = ssl.create_default_context()
    if smtp_port == 465:
        with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context) as server:
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, to_email, msg.as_string())
    else:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls(context=context)
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, to_email, msg.as_string())
    return True


def build_html(calc_type: str, name: str, phone: str, comment: str, total: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 540px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 26px 32px;">
      <h1 style="color: #fff; margin: 0; font-size: 20px;">📋 Новая заявка с калькулятора</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">Авангард · {calc_type}</p>
    </div>
    <div style="padding: 28px 32px;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="color: #888; padding: 7px 0; width: 130px;">Калькулятор</td>
          <td style="color: #111; font-weight: 600;">{calc_type}</td>
        </tr>
        <tr>
          <td style="color: #888; padding: 7px 0;">Имя клиента</td>
          <td style="color: #111; font-weight: 600;">{name or '—'}</td>
        </tr>
        <tr>
          <td style="color: #888; padding: 7px 0;">Телефон</td>
          <td style="color: #111; font-weight: 600;">{phone}</td>
        </tr>
        <tr>
          <td style="color: #888; padding: 7px 0;">Сумма по расчёту</td>
          <td style="color: #f59e0b; font-weight: 700; font-size: 16px;">{total or '—'}</td>
        </tr>
        <tr>
          <td style="color: #888; padding: 7px 0; vertical-align: top;">Комментарий</td>
          <td style="color: #555;">{comment or '—'}</td>
        </tr>
      </table>
    </div>
    <div style="background: #f9fafb; padding: 14px 32px; text-align: center;">
      <p style="color: #bbb; font-size: 11px; margin: 0;">Авангард · avangard-ai.ru · Это автоматическое уведомление</p>
    </div>
  </div>
</body>
</html>"""


def send_sms(phone: str, message: str) -> bool:
    api_key = os.environ.get('SMS_API_KEY', '')
    if not api_key:
        return False
    phone_clean = phone.replace('+', '').replace('-', '').replace(' ', '').replace('(', '').replace(')', '')
    params = urllib.parse.urlencode({
        'api_id': api_key,
        'to': phone_clean,
        'msg': message,
        'json': 1,
    })
    req = urllib.request.Request(
        f'https://sms.ru/sms/send?{params}',
        method='GET',
    )
    resp = urllib.request.urlopen(req, timeout=10)
    result = json.loads(resp.read().decode('utf-8'))
    return result.get('status') == 'OK'


def save_to_db(name, phone, calc_type, total_sum, items_count, region, source, page_url):
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return None
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO {schema}.calculator_leads (name, phone, calc_type, total_sum, items_count, region, source, page_url) "
        f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
        (name or '', phone, calc_type or 'Калькулятор', total_sum or '', items_count or 0, region or '', source or 'calculator', page_url or '')
    )
    lead_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return lead_id


def handler(event: dict, context) -> dict:
    """Приём заявок с калькуляторов: сохранение в БД + email менеджеру + Telegram"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    headers = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}

    body = json.loads(event.get('body') or '{}')
    name = body.get('name', '').strip()
    phone = body.get('phone', '').strip()
    comment = body.get('comment', '').strip()
    calc_type = body.get('calc_type', 'Калькулятор').strip()
    total = body.get('total', '').strip()
    items_count = body.get('items_count', 0)
    region = body.get('region', '').strip()
    page_url = body.get('page_url', '').strip()
    source = body.get('source', 'calculator').strip()

    if not phone:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Телефон обязателен'}, ensure_ascii=False)
        }

    lead_id = None
    try:
        lead_id = save_to_db(name, phone, calc_type, total, items_count, region, source, page_url)
    except Exception as e:
        print(f'DB ERROR: {e}')

    to_email = 'maksT77@yandex.ru'
    subject = f'Заявка с калькулятора «{calc_type}» — {phone}'
    html = build_html(calc_type, name, phone, comment, total)

    try:
        send_email(to_email, subject, html)
    except Exception as e:
        print(f'SMTP ERROR: {e}')

    try:
        tg_text = (
            f"📋 <b>Новая заявка с калькулятора</b>\n\n"
            f"🔧 Калькулятор: {calc_type}\n"
            f"👤 Имя: {name or '—'}\n"
            f"📞 Телефон: {phone}\n"
            f"💰 Сумма: {total or '—'}\n"
            f"💬 Комментарий: {comment or '—'}"
        )
        send_telegram(tg_text)
    except Exception as e:
        print(f'TELEGRAM ERROR: {e}')

    try:
        greeting = f'{name}, в' if name else 'В'
        sms_text = (
            f'{greeting}аша смета готова! '
            f'Сумма: {total or "рассчитана"}. '
            f'Наш менеджер свяжется с вами для уточнения деталей. '
            f'Авангард avangard-ai.ru'
        )
        send_sms(phone, sms_text)
    except Exception as e:
        print(f'SMS ERROR: {e}')

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'id': lead_id}, ensure_ascii=False)
    }