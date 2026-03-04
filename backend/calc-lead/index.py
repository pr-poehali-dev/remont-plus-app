import json
import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import urllib.request


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


def handler(event: dict, context) -> dict:
    """Приём заявок с калькуляторов и отправка на email менеджеру"""

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

    if not phone:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Телефон обязателен'}, ensure_ascii=False)
        }

    to_email = 'maksT77@yandex.ru'
    subject = f'Заявка с калькулятора «{calc_type}» — {phone}'
    html = build_html(calc_type, name, phone, comment, total)

    try:
        ok = send_email(to_email, subject, html)
    except Exception as e:
        print(f'SMTP ERROR: {e}')
        ok = False

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

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': ok}, ensure_ascii=False)
    }