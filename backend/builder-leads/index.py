"""
Управление заявками для строительных компаний:
- принятие заявок с калькулятора
- автоматическое распределение по тарифу и загруженности
- просмотр заявок в личном кабинете
- отметка о просмотре/обработке
"""
import json
import os
import smtplib
import urllib.request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
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

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")
S = f"{SCHEMA}."

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def resp(status, body):
    return {
        "statusCode": status,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False, default=str),
    }


def send_email_notification(contractor_email: str, contractor_name: str, lead: dict):
    smtp_host = os.environ.get("SMTP_HOST", "smtp.yandex.ru")
    smtp_port = int(os.environ.get("SMTP_PORT", "465"))
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_pass = os.environ.get("SMTP_PASS", "")
    from_email = os.environ.get("FROM_EMAIL", smtp_user)

    if not smtp_user or not smtp_pass:
        return

    budget_str = f"{lead['budget']:,} ₽".replace(",", " ") if lead.get("budget") else "не указан"
    work_types_str = ", ".join(lead.get("work_types") or []) or "не указаны"

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px">Новая заявка на ремонт</h1>
        <p style="color:#fff9;margin:8px 0 0">АВАНГАРД — система для строительных компаний</p>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <p style="color:#374151;font-size:16px">Здравствуйте, <strong>{contractor_name}</strong>!</p>
        <p style="color:#374151">Вам поступила новая заявка от клиента.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr style="background:#f9fafb"><td style="padding:10px 14px;color:#6b7280;font-size:14px">Город</td>
            <td style="padding:10px 14px;font-weight:600;color:#111827">{lead.get('city') or '—'}</td></tr>
          <tr><td style="padding:10px 14px;color:#6b7280;font-size:14px">Бюджет</td>
            <td style="padding:10px 14px;font-weight:600;color:#111827">{budget_str}</td></tr>
          <tr style="background:#f9fafb"><td style="padding:10px 14px;color:#6b7280;font-size:14px">Виды работ</td>
            <td style="padding:10px 14px;font-weight:600;color:#111827">{work_types_str}</td></tr>
          <tr><td style="padding:10px 14px;color:#6b7280;font-size:14px">Имя клиента</td>
            <td style="padding:10px 14px;font-weight:600;color:#111827">{lead.get('customer_name') or '—'}</td></tr>
          <tr style="background:#f9fafb"><td style="padding:10px 14px;color:#6b7280;font-size:14px">Телефон клиента</td>
            <td style="padding:10px 14px;font-weight:600;color:#f97316;font-size:18px">{lead.get('customer_phone') or '—'}</td></tr>
          {"<tr><td style='padding:10px 14px;color:#6b7280;font-size:14px'>Комментарий</td><td style='padding:10px 14px;color:#374151'>" + str(lead.get('customer_comment')) + "</td></tr>" if lead.get('customer_comment') else ""}
        </table>
        <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0;color:#92400e;font-size:14px">
            ⏱ Свяжитесь с клиентом в течение 2 часов — это увеличивает вероятность заключения договора в 3 раза.
          </p>
        </div>
        <a href="https://avangard-remont.ru/masters" style="display:inline-block;background:#f97316;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
          Открыть личный кабинет
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">
          Вы получили это письмо, так как являетесь партнёром АВАНГАРД.
        </p>
      </div>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Новая заявка — {lead.get('city', 'неизвестный город')}, бюджет {budget_str}"
    msg["From"] = from_email
    msg["To"] = contractor_email
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_email, contractor_email, msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_email, contractor_email, msg.as_string())
    except Exception:
        pass


def distribute_lead(conn, lead_id: int, city: str):
    """
    Алгоритм распределения:
    1. Найти компании с активной подпиской в этом городе
    2. Отсортировать: приоритет тарифа → меньше заявок за месяц → рейтинг
    3. Назначить топ-3 компании (или меньше, если недостаточно)
    """
    with conn.cursor() as cur:
        cur.execute(f"""
            SELECT
                c.id as contractor_id,
                c.email,
                c.full_name,
                bs.plan_code,
                bp.priority as plan_priority,
                bp.leads_per_month,
                bp.is_unlimited,
                bs.leads_used,
                c.rating,
                c.location
            FROM {S}contractors c
            JOIN {S}builder_subscriptions bs ON bs.contractor_id = c.id
            JOIN {S}builder_plans bp ON bp.code = bs.plan_code
            WHERE bs.status = 'active'
              AND (bs.expires_at IS NULL OR bs.expires_at > NOW())
              AND (bp.is_unlimited OR bs.leads_used < bp.leads_per_month)
              AND c.id NOT IN (
                SELECT contractor_id FROM {S}builder_lead_assignments WHERE lead_id = %s
              )
            ORDER BY
                bp.priority DESC,
                bs.leads_used ASC,
                c.rating DESC
            LIMIT 3
        """, (lead_id,))
        candidates = cur.fetchall()

        assigned = []
        for row in candidates:
            contractor_id = row[0]
            email = row[1]
            name = row[2]

            cur.execute(f"""
                INSERT INTO {S}builder_lead_assignments (lead_id, contractor_id, status, notified_at)
                VALUES (%s, %s, 'new', NOW())
                ON CONFLICT (lead_id, contractor_id) DO NOTHING
            """, (lead_id, contractor_id))

            cur.execute(f"""
                UPDATE {S}builder_subscriptions
                SET leads_used = leads_used + 1, updated_at = NOW()
                WHERE contractor_id = %s AND status = 'active'
            """, (contractor_id,))

            assigned.append({"contractor_id": contractor_id, "email": email, "name": name})

        conn.commit()
        return assigned


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    action = body.get("action") or event.get("queryStringParameters", {}).get("action", "")

    conn = get_conn()

    # POST — принять новую заявку (из калькулятора или формы)
    if method == "POST" and action == "create":
        city = body.get("city", "")
        budget = body.get("budget")
        customer_name = body.get("name") or body.get("customer_name", "")
        customer_phone = body.get("phone") or body.get("customer_phone", "")
        customer_comment = body.get("comment") or body.get("customer_comment", "")
        work_types = body.get("work_types") or []
        calc_type = body.get("calc_type", "")
        source = body.get("source", "calculator")

        with conn.cursor() as cur:
            cur.execute(f"""
                INSERT INTO {S}builder_leads
                (source, city, work_types, budget, customer_name, customer_phone, customer_comment, calc_type, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'new')
                RETURNING id, city, budget, customer_name, customer_phone, customer_comment, work_types, calc_type, created_at
            """, (source, city, work_types, budget, customer_name, customer_phone, customer_comment, calc_type))
            lead = cur.fetchone()
            conn.commit()

        lead_id = lead[0]
        lead_data = {
            "id": lead_id, "city": lead[1], "budget": lead[2],
            "customer_name": lead[3], "customer_phone": lead[4],
            "customer_comment": lead[5], "work_types": lead[6],
        }

        assigned = distribute_lead(conn, lead_id, city)

        for a in assigned:
            if a.get("email"):
                send_email_notification(a["email"], a["name"] or "партнёр", lead_data)

        try:
            budget_str = f"{budget:,} ₽".replace(",", " ") if budget else "не указан"
            work_str = ", ".join(work_types) if work_types else "не указаны"
            tg_text = (
                f"🏗 <b>Новая заявка на ремонт</b> (№{lead_id})\n\n"
                f"📍 Город: {city or '—'}\n"
                f"💰 Бюджет: {budget_str}\n"
                f"🔧 Работы: {work_str}\n"
                f"👤 Имя: {customer_name or '—'}\n"
                f"📞 Телефон: {customer_phone or '—'}\n"
                f"💬 Комментарий: {customer_comment or '—'}\n"
                f"📋 Назначено подрядчиков: {len(assigned)}"
            )
            send_telegram(tg_text)
        except Exception as e:
            print(f'TELEGRAM ERROR: {e}')

        conn.close()
        return resp(200, {"success": True, "lead_id": lead_id, "assigned_count": len(assigned)})

    # GET — список заявок для подрядчика
    if method == "GET" and action == "my_leads":
        contractor_id = event.get("queryStringParameters", {}).get("contractor_id")
        if not contractor_id:
            conn.close()
            return resp(400, {"error": "contractor_id required"})

        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT
                    bl.id, bl.city, bl.work_types, bl.budget,
                    bl.customer_name, bl.customer_phone, bl.customer_comment,
                    bl.calc_type, bl.source, bl.created_at,
                    bla.status as assignment_status, bla.viewed_at
                FROM {S}builder_lead_assignments bla
                JOIN {S}builder_leads bl ON bl.id = bla.lead_id
                WHERE bla.contractor_id = %s
                ORDER BY bl.created_at DESC
                LIMIT 100
            """, (contractor_id,))
            rows = cur.fetchall()

        leads = []
        for r in rows:
            leads.append({
                "id": r[0], "city": r[1], "work_types": r[2] or [],
                "budget": r[3], "customer_name": r[4],
                "customer_phone": r[5] if r[10] == "viewed" else None,
                "customer_comment": r[6],
                "calc_type": r[7], "source": r[8],
                "created_at": str(r[9]),
                "status": r[10], "viewed_at": str(r[11]) if r[11] else None,
            })

        conn.close()
        return resp(200, {"leads": leads})

    # POST — отметить заявку просмотренной (раскрыть контакты)
    if method == "POST" and action == "view_lead":
        lead_id = body.get("lead_id")
        contractor_id = body.get("contractor_id")
        if not lead_id or not contractor_id:
            conn.close()
            return resp(400, {"error": "lead_id and contractor_id required"})

        with conn.cursor() as cur:
            cur.execute(f"""
                UPDATE {S}builder_lead_assignments
                SET status = 'viewed', viewed_at = NOW()
                WHERE lead_id = %s AND contractor_id = %s AND status = 'new'
            """, (lead_id, contractor_id))

            cur.execute(f"""
                SELECT bl.customer_phone, bl.customer_name
                FROM {S}builder_leads bl
                JOIN {S}builder_lead_assignments bla ON bla.lead_id = bl.id
                WHERE bl.id = %s AND bla.contractor_id = %s
            """, (lead_id, contractor_id))
            row = cur.fetchone()
            conn.commit()

        conn.close()
        if row:
            return resp(200, {"phone": row[0], "name": row[1]})
        return resp(404, {"error": "not found"})

    # GET — статистика для личного кабинета
    if method == "GET" and action == "stats":
        contractor_id = event.get("queryStringParameters", {}).get("contractor_id")
        if not contractor_id:
            conn.close()
            return resp(400, {"error": "contractor_id required"})

        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN bla.status = 'new' THEN 1 ELSE 0 END) as new_count,
                    SUM(CASE WHEN bla.status = 'viewed' THEN 1 ELSE 0 END) as viewed_count,
                    SUM(CASE WHEN bla.created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as this_month
                FROM {S}builder_lead_assignments bla
                WHERE bla.contractor_id = %s
            """, (contractor_id,))
            row = cur.fetchone()

        conn.close()
        return resp(200, {
            "total": row[0] or 0,
            "new": row[1] or 0,
            "viewed": row[2] or 0,
            "this_month": row[3] or 0,
        })

    # GET — список всех заявок (для админа)
    if method == "GET" and action == "all_leads":
        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT id, city, work_types, budget, customer_name, customer_phone,
                       calc_type, source, status, created_at
                FROM {S}builder_leads
                ORDER BY created_at DESC
                LIMIT 200
            """)
            rows = cur.fetchall()

        leads = [{"id": r[0], "city": r[1], "work_types": r[2] or [], "budget": r[3],
                  "customer_name": r[4], "customer_phone": r[5], "calc_type": r[6],
                  "source": r[7], "status": r[8], "created_at": str(r[9])} for r in rows]
        conn.close()
        return resp(200, {"leads": leads})

    conn.close()
    return resp(400, {"error": "unknown action"})