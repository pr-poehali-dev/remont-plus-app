"""
Биржа заявок — управление лидами для строительных компаний:
- приём заявок с калькулятора
- распределение по тарифу и бюджету заявки
- просмотр заявок в кабинете (с расчётом стоимости лида)
- раскрытие телефона (списание стоимости лида)
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


def calc_lead_fee(budget, fee_pct, fee_min):
    """Рассчитать стоимость лида: % от бюджета, но не меньше минимума"""
    if not budget:
        return fee_min
    fee = int(int(budget) * float(fee_pct) / 100)
    return max(fee_min, fee)


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
    lead_fee = lead.get("lead_fee", 5000)
    lead_fee_str = f"{lead_fee:,} ₽".replace(",", " ")

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px">Новая заявка на бирже</h1>
        <p style="color:#fff9;margin:8px 0 0">АВАНГАРД — Биржа заявок</p>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <p style="color:#374151;font-size:16px">Здравствуйте, <strong>{contractor_name}</strong>!</p>
        <p style="color:#374151">Вам доступна новая заявка от клиента.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr style="background:#f9fafb"><td style="padding:10px 14px;color:#6b7280;font-size:14px">Город</td>
            <td style="padding:10px 14px;font-weight:600;color:#111827">{lead.get('city') or '—'}</td></tr>
          <tr><td style="padding:10px 14px;color:#6b7280;font-size:14px">Бюджет</td>
            <td style="padding:10px 14px;font-weight:600;color:#111827">{budget_str}</td></tr>
          <tr style="background:#f9fafb"><td style="padding:10px 14px;color:#6b7280;font-size:14px">Виды работ</td>
            <td style="padding:10px 14px;font-weight:600;color:#111827">{work_types_str}</td></tr>
          <tr><td style="padding:10px 14px;color:#6b7280;font-size:14px">Стоимость контакта</td>
            <td style="padding:10px 14px;font-weight:600;color:#f97316">{lead_fee_str}</td></tr>
        </table>
        <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0;color:#92400e;font-size:14px">
            ⏱ Откройте кабинет, чтобы увидеть контакты клиента. Стоимость лида спишется при раскрытии телефона.
          </p>
        </div>
        <a href="https://avangard-remont.ru/masters" style="display:inline-block;background:#f97316;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
          Открыть кабинет
        </a>
      </div>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Новая заявка — {lead.get('city', '')}, бюджет {budget_str}"
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


def distribute_lead(conn, lead_id: int, city: str, budget: int):
    """
    Распределение заявки по новой модели:
    1. Найти компании с активной подпиской
    2. Проверить max_budget тарифа >= бюджета заявки (NULL = без ограничений)
    3. Проверить лимит заявок
    4. Сортировка: приоритет тарифа → меньше использовано → рейтинг
    5. Рассчитать стоимость лида для каждого подрядчика
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
                bp.lead_fee_pct,
                bp.lead_fee_min,
                bp.max_budget
            FROM {S}contractors c
            JOIN {S}builder_subscriptions bs ON bs.contractor_id = c.id
            JOIN {S}builder_plans bp ON bp.code = bs.plan_code
            WHERE bs.status = 'active'
              AND bp.is_active = true
              AND (bs.expires_at IS NULL OR bs.expires_at > NOW())
              AND (bp.is_unlimited OR bs.leads_used < bp.leads_per_month)
              AND (bp.max_budget IS NULL OR bp.max_budget >= %s)
              AND c.id NOT IN (
                SELECT contractor_id FROM {S}builder_lead_assignments WHERE lead_id = %s
              )
            ORDER BY
                bp.priority DESC,
                bs.leads_used ASC,
                c.rating DESC
            LIMIT 3
        """, (budget or 0, lead_id))
        candidates = cur.fetchall()

        assigned = []
        for row in candidates:
            contractor_id = row[0]
            email = row[1]
            name = row[2]
            fee_pct = row[9]
            fee_min = row[10]

            lead_fee = calc_lead_fee(budget, fee_pct, fee_min)

            cur.execute(f"""
                INSERT INTO {S}builder_lead_assignments (lead_id, contractor_id, status, notified_at, lead_fee)
                VALUES (%s, %s, 'new', NOW(), %s)
                ON CONFLICT (lead_id, contractor_id) DO NOTHING
            """, (lead_id, contractor_id, lead_fee))

            cur.execute(f"""
                UPDATE {S}builder_subscriptions
                SET leads_used = leads_used + 1, updated_at = NOW()
                WHERE contractor_id = %s AND status = 'active'
            """, (contractor_id,))

            assigned.append({
                "contractor_id": contractor_id,
                "email": email,
                "name": name,
                "lead_fee": lead_fee,
            })

        conn.commit()
        return assigned


def handler(event: dict, context) -> dict:
    """Биржа заявок — приём и распределение лидов строительным компаниям"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    action = body.get("action") or event.get("queryStringParameters", {}).get("action", "")

    conn = get_conn()

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
                (source, city, work_types, budget, customer_name, customer_phone, customer_comment, calc_type)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (source, city, work_types, budget, customer_name, customer_phone, customer_comment, calc_type))
            lead_id = cur.fetchone()[0]
            conn.commit()

        lead_data = {
            "id": lead_id, "city": city, "budget": budget,
            "customer_name": customer_name, "customer_phone": customer_phone,
            "customer_comment": customer_comment, "work_types": work_types,
        }

        assigned = distribute_lead(conn, lead_id, city, budget or 0)

        for a in assigned:
            lead_data["lead_fee"] = a["lead_fee"]
            if a.get("email"):
                send_email_notification(a["email"], a["name"], lead_data)

        budget_str = f"{budget:,}".replace(",", " ") if budget else "?"
        try:
            send_telegram(
                f"🏗 <b>Биржа заявок</b>\n"
                f"Город: {city}\n"
                f"Бюджет: {budget_str} ₽\n"
                f"Работы: {', '.join(work_types) if work_types else '—'}\n"
                f"Распределено: {len(assigned)} подрядчикам"
            )
        except Exception:
            pass

        conn.close()
        return resp(200, {
            "success": True, "lead_id": lead_id,
            "assigned_count": len(assigned),
        })

    if action == "my_leads":
        params = event.get("queryStringParameters") or {}
        contractor_id = params.get("contractor_id")
        if not contractor_id:
            conn.close()
            return resp(400, {"error": "contractor_id required"})

        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT
                    bl.id, bl.city, bl.work_types, bl.budget,
                    bl.customer_name, bl.customer_comment,
                    bl.calc_type, bl.created_at,
                    bla.status, bla.lead_fee,
                    CASE WHEN bla.status = 'viewed' THEN bl.customer_phone ELSE NULL END as phone
                FROM {S}builder_lead_assignments bla
                JOIN {S}builder_leads bl ON bl.id = bla.lead_id
                WHERE bla.contractor_id = %s
                ORDER BY bl.created_at DESC
                LIMIT 100
            """, (contractor_id,))
            rows = cur.fetchall()

        conn.close()
        leads = []
        for r in rows:
            leads.append({
                "id": r[0], "city": r[1], "work_types": r[2], "budget": r[3],
                "customer_name": r[4], "customer_comment": r[5],
                "calc_type": r[6], "created_at": str(r[7]),
                "status": r[8], "lead_fee": r[9],
                "customer_phone": r[10],
            })
        return resp(200, {"leads": leads})

    if action == "stats":
        params = event.get("queryStringParameters") or {}
        contractor_id = params.get("contractor_id")
        if not contractor_id:
            conn.close()
            return resp(400, {"error": "contractor_id required"})

        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE bla.status = 'new') as new,
                    COUNT(*) FILTER (WHERE bla.status = 'viewed') as viewed,
                    COUNT(*) FILTER (WHERE bl.created_at > date_trunc('month', NOW())) as this_month,
                    COALESCE(SUM(bla.lead_fee) FILTER (WHERE bla.status = 'viewed'), 0) as total_spent
                FROM {S}builder_lead_assignments bla
                JOIN {S}builder_leads bl ON bl.id = bla.lead_id
                WHERE bla.contractor_id = %s
            """, (contractor_id,))
            row = cur.fetchone()

        conn.close()
        return resp(200, {
            "total": row[0], "new": row[1], "viewed": row[2],
            "this_month": row[3], "total_spent": row[4],
        })

    if method == "POST" and action == "view_lead":
        lead_id = body.get("lead_id")
        contractor_id = body.get("contractor_id")
        if not lead_id or not contractor_id:
            conn.close()
            return resp(400, {"error": "lead_id and contractor_id required"})

        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT bla.status, bla.lead_fee, bl.customer_phone, bl.city, bl.budget
                FROM {S}builder_lead_assignments bla
                JOIN {S}builder_leads bl ON bl.id = bla.lead_id
                WHERE bla.lead_id = %s AND bla.contractor_id = %s
            """, (lead_id, contractor_id))
            row = cur.fetchone()

            if not row:
                conn.close()
                return resp(404, {"error": "assignment not found"})

            if row[0] == "viewed":
                conn.close()
                return resp(200, {"phone": row[2], "lead_fee": row[1], "already_viewed": True})

            lead_fee = row[1] or 5000

            cur.execute(f"""
                INSERT INTO {S}builder_balances (contractor_id, amount)
                VALUES (%s, 0) ON CONFLICT (contractor_id) DO NOTHING
            """, (contractor_id,))

            cur.execute(f"""
                SELECT amount FROM {S}builder_balances WHERE contractor_id = %s
            """, (contractor_id,))
            bal_row = cur.fetchone()
            balance = bal_row[0] if bal_row else 0

            if balance < lead_fee:
                conn.close()
                return resp(402, {
                    "error": "insufficient_balance",
                    "balance": balance,
                    "required": lead_fee,
                    "shortfall": lead_fee - balance,
                })

            cur.execute(f"""
                UPDATE {S}builder_balances
                SET amount = amount - %s, updated_at = NOW()
                WHERE contractor_id = %s AND amount >= %s
                RETURNING amount
            """, (lead_fee, contractor_id, lead_fee))
            new_bal = cur.fetchone()
            if not new_bal:
                conn.close()
                return resp(402, {"error": "insufficient_balance", "balance": balance, "required": lead_fee})

            city = row[3] or ""
            budget = row[4] or 0
            budget_str = f"{budget:,}".replace(",", " ") if budget else "?"
            cur.execute(f"""
                INSERT INTO {S}builder_transactions
                (contractor_id, type, amount, balance_after, description, lead_id)
                VALUES (%s, 'charge', %s, %s, %s, %s)
            """, (contractor_id, lead_fee, new_bal[0],
                  f"Контакт: {city}, бюджет {budget_str} ₽", lead_id))

            cur.execute(f"""
                UPDATE {S}builder_lead_assignments
                SET status = 'viewed', viewed_at = NOW()
                WHERE lead_id = %s AND contractor_id = %s
            """, (lead_id, contractor_id))
            conn.commit()

        conn.close()
        return resp(200, {
            "phone": row[2], "lead_fee": lead_fee,
            "already_viewed": False, "balance": new_bal[0],
        })

    conn.close()
    return resp(400, {"error": "unknown action"})