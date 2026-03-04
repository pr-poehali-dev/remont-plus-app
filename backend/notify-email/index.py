import json
import os
import smtplib
import ssl
import urllib.request
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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
    """Отправка email через SMTP"""
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


def payment_received_html(master_name: str, customer_name: str, contract_amount: float,
                           commission_amount: float, payout_amount: float,
                           work_description: str, transaction_id: int) -> str:
    fmt = lambda n: f"{n:,.0f}".replace(',', ' ')
    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 28px 32px;">
      <h1 style="color: #fff; margin: 0; font-size: 20px;">💰 Оплата получена!</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">Авангард · Уведомление о платеже</p>
    </div>
    <div style="padding: 28px 32px;">
      <p style="color: #333; font-size: 15px; margin: 0 0 20px;">Здравствуйте, <strong>{master_name}</strong>!</p>
      <p style="color: #555; font-size: 14px; margin: 0 0 20px;">
        Заказчик <strong>{customer_name or 'Заказчик'}</strong> произвёл оплату по договору.
        Средства поступили на счёт Авангард и будут перечислены вам в течение <strong>3 рабочих дней</strong>.
      </p>

      <div style="background: #f9fafb; border-radius: 8px; padding: 18px 20px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #888; padding: 4px 0;">Вид работ</td>
            <td style="color: #333; text-align: right; font-weight: 500;">{work_description or '—'}</td>
          </tr>
          <tr>
            <td style="color: #888; padding: 4px 0;">Сумма договора</td>
            <td style="color: #333; text-align: right; font-weight: 500;">{fmt(contract_amount)} ₽</td>
          </tr>
          <tr>
            <td style="color: #888; padding: 4px 0;">Комиссия Авангард (5%)</td>
            <td style="color: #e85d04; text-align: right; font-weight: 500;">− {fmt(commission_amount)} ₽</td>
          </tr>
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="color: #111; padding: 10px 0 4px; font-weight: 700; font-size: 15px;">Вам к выплате</td>
            <td style="color: #16a34a; text-align: right; font-weight: 700; font-size: 17px; padding: 10px 0 4px;">{fmt(payout_amount)} ₽</td>
          </tr>
        </table>
      </div>

      <p style="color: #888; font-size: 12px; margin: 0 0 6px;">
        Транзакция № {transaction_id} · Статус: <span style="color: #2563eb;">Ожидает выплаты</span>
      </p>
      <p style="color: #888; font-size: 12px; margin: 0;">
        История всех выплат доступна в личном кабинете мастера на сайте.
      </p>
    </div>
    <div style="background: #f9fafb; padding: 16px 32px; text-align: center;">
      <p style="color: #bbb; font-size: 11px; margin: 0;">
        Авангард · avangard-ai.ru · Это автоматическое уведомление, отвечать на него не нужно.
      </p>
    </div>
  </div>
</body>
</html>
"""


def handler(event: dict, context) -> dict:
    """Email-уведомления мастерам: подписание договора и получение оплаты"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': ''
        }

    headers = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
    body = json.loads(event.get('body') or '{}')
    action = body.get('action')

    if action == 'notify_payment_received':
        transaction_id = body.get('transaction_id')
        master_email = body.get('master_email', '')
        master_name = body.get('master_name', '')
        customer_name = body.get('customer_name', '')
        contract_amount = float(body.get('contract_amount', 0))
        commission_amount = float(body.get('commission_amount', 0))
        payout_amount = float(body.get('payout_amount', 0))
        work_description = body.get('work_description', '')

        if not master_email:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'master_email обязателен'}, ensure_ascii=False)}

        # Обновляем статус транзакции в БД
        if transaction_id:
            dsn = os.environ.get('DATABASE_URL')
            conn = psycopg2.connect(dsn)
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE agent_transactions SET status='paid', paid_at=NOW(), updated_at=NOW() WHERE id=%s",
                (int(transaction_id),)
            )
            conn.commit()
            cursor.close()
            conn.close()

        html = payment_received_html(master_name, customer_name, contract_amount,
                                     commission_amount, payout_amount, work_description,
                                     transaction_id or 0)
        ok = send_email(master_email, f'Авангард: получена оплата {int(payout_amount):,} ₽ к выплате'.replace(',', ' '), html)
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'success': ok, 'sent': ok}, ensure_ascii=False)}

    elif action == 'lead_tariff':
        lead_name = body.get('name', '')
        lead_phone = body.get('phone', '')
        lead_comment = body.get('comment', '')
        admin_email = os.environ.get('SMTP_USER', '')
        if not admin_email:
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'success': True})}
        html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #6366f1, #ec4899); padding: 24px 32px;">
      <h1 style="color: #fff; margin: 0; font-size: 20px;">💎 Новая заявка с тарифной страницы</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">АВАНГАРД · Заявка на услуги</p>
    </div>
    <div style="padding: 24px 32px;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr><td style="color: #888; padding: 6px 0; width: 120px;">Имя</td><td style="color: #111; font-weight: 600;">{lead_name}</td></tr>
        <tr><td style="color: #888; padding: 6px 0;">Телефон</td><td style="color: #111; font-weight: 600;">{lead_phone}</td></tr>
        <tr><td style="color: #888; padding: 6px 0; vertical-align: top;">Комментарий</td><td style="color: #555;">{lead_comment or '—'}</td></tr>
      </table>
    </div>
    <div style="background: #f9fafb; padding: 14px 32px; text-align: center;">
      <p style="color: #bbb; font-size: 11px; margin: 0;">Авангард · avangard-ai.ru</p>
    </div>
  </div>
</body></html>"""
        ok = send_email(admin_email, f'Новая заявка: {lead_name} · {lead_phone}', html)
        try:
            send_telegram(
                f"💎 <b>Заявка с тарифной страницы</b>\n\n"
                f"👤 Имя: {lead_name or '—'}\n"
                f"📞 Телефон: {lead_phone or '—'}\n"
                f"💬 Комментарий: {lead_comment or '—'}"
            )
        except Exception as e:
            print(f'TELEGRAM ERROR: {e}')
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'success': ok}, ensure_ascii=False)}

    elif action == 'send_design_brief':
        client_name = body.get('name', '')
        client_phone = body.get('phone', '')
        brief_text = body.get('brief', '')
        admin_email = os.environ.get('SMTP_USER', '')
        if not admin_email:
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'success': True})}
        html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #c9a84c, #e8c96a); padding: 24px 32px;">
      <h1 style="color: #0f0f13; margin: 0; font-size: 20px;">📋 Новое ТЗ от клиента</h1>
      <p style="color: rgba(0,0,0,0.6); margin: 6px 0 0; font-size: 14px;">АВАНГАРД · Техническое задание для дизайн-проекта</p>
    </div>
    <div style="padding: 24px 32px;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
        <tr><td style="color: #888; padding: 6px 0; width: 120px;">Имя</td><td style="color: #111; font-weight: 600;">{client_name or '—'}</td></tr>
        <tr><td style="color: #888; padding: 6px 0;">Телефон</td><td style="color: #111; font-weight: 600;">{client_phone or '—'}</td></tr>
      </table>
      <div style="background: #fafaf8; border: 1px solid #e5e1d8; border-radius: 8px; padding: 20px; white-space: pre-wrap; font-size: 13px; color: #333; line-height: 1.7;">
{brief_text}
      </div>
    </div>
    <div style="background: #f9fafb; padding: 14px 32px; text-align: center;">
      <p style="color: #bbb; font-size: 11px; margin: 0;">Авангард · avangard-ai.ru · Заявка с ИИ-эксперта</p>
    </div>
  </div>
</body></html>"""
        ok = send_email(admin_email, f'ТЗ на дизайн-проект: {client_name} · {client_phone}', html)
        try:
            send_telegram(
                f"🎨 <b>Запрос на дизайн-проект</b>\n\n"
                f"👤 Имя: {client_name or '—'}\n"
                f"📞 Телефон: {client_phone or '—'}\n"
                f"📝 ТЗ: {(brief_text or '—')[:300]}"
            )
        except Exception as e:
            print(f'TELEGRAM ERROR: {e}')
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'success': ok}, ensure_ascii=False)}

    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Invalid action'})}