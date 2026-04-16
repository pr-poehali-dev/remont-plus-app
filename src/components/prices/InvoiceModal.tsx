import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { type PlanInfo, fmt, COMPANY_REQUISITES, YOOKASSA_API } from "./pricingTypes";
import reachGoal from "@/lib/metrika";
import PaymentModalYookassa from "./PaymentModal";
import { isFreePeriod } from "@/lib/promo";

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  return Promise.resolve();
}

function generateInvoiceHTML(plan: PlanInfo, orderNumber: string, buyerName: string, buyerInn: string) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("ru-RU");
  const r = COMPANY_REQUISITES;
  const amount = plan.price;
  const amountFmt = amount.toLocaleString("ru-RU");

  const units = amount % 100;
  const tens = Math.floor(amount / 10) % 10;
  let word = "рублей";
  if (tens !== 1) {
    if (units === 1) word = "рубль";
    else if (units >= 2 && units <= 4) word = "рубля";
  }

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Счёт ${orderNumber}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Roboto',Arial,sans-serif;font-size:11pt;color:#111;background:#fff}
  .page{max-width:210mm;margin:0 auto;padding:15mm}
  h1{font-size:16pt;font-weight:700;margin-bottom:20px;color:#1e40af}
  .header-line{border-bottom:3px solid #1e40af;margin-bottom:20px;padding-bottom:10px}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  .info-table td{padding:4px 8px;font-size:10pt;vertical-align:top}
  .info-table .label{color:#666;width:140px}
  .items-table{border:1px solid #ccc}
  .items-table th{background:#1e40af;color:#fff;padding:8px 10px;text-align:left;font-size:9.5pt;font-weight:600}
  .items-table td{padding:8px 10px;border-bottom:1px solid #eee;font-size:10pt}
  .items-table td.r{text-align:right}
  .total-row td{font-weight:700;border-top:2px solid #1e40af;font-size:11pt}
  .section{margin-bottom:18px}
  .section-title{font-size:9pt;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #e5e7eb}
  .sig{display:flex;justify-content:space-between;margin-top:40px}
  .sig-block{width:45%}
  .sig-line{border-bottom:1px solid #333;height:30px;margin-top:8px}
  .sig-label{font-size:9pt;color:#666;margin-top:4px}
  .footer{text-align:center;font-size:8pt;color:#aaa;margin-top:30px;padding-top:10px;border-top:1px solid #eee}
  .stamp{display:inline-block;border:2px solid #1e40af;border-radius:8px;padding:6px 16px;font-weight:700;color:#1e40af;font-size:9pt;margin-top:12px}
  @media print{@page{size:A4;margin:10mm} body{font-size:10pt}}
</style>
</head><body>
<div class="page">
  <div class="header-line">
    <h1>СЧЁТ НА ОПЛАТУ № ${orderNumber}</h1>
    <p style="font-size:10pt;color:#666">от ${dateStr} г.</p>
  </div>

  <div class="section">
    <div class="section-title">Поставщик</div>
    <table class="info-table">
      <tr><td class="label">Наименование</td><td><strong>${r.name}</strong></td></tr>
      <tr><td class="label">ИНН / КПП</td><td>${r.inn} / ${r.kpp}</td></tr>
      <tr><td class="label">Расчётный счёт</td><td>${r.account}</td></tr>
      <tr><td class="label">Банк</td><td>${r.bankName}</td></tr>
      <tr><td class="label">БИК</td><td>${r.bik}</td></tr>
      <tr><td class="label">Корр. счёт</td><td>${r.corrAccount}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Покупатель</div>
    <table class="info-table">
      <tr><td class="label">Наименование</td><td><strong>${buyerName || "—"}</strong></td></tr>
      <tr><td class="label">ИНН</td><td>${buyerInn || "—"}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Товары / Услуги</div>
    <table class="items-table">
      <thead><tr><th style="width:40px">№</th><th>Наименование</th><th style="width:60px">Кол.</th><th style="width:100px;text-align:right">Цена</th><th style="width:100px;text-align:right">Сумма</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>Тариф «${plan.name}» — подписка на 1 месяц</td><td>1</td><td class="r">${amountFmt} &#8381;</td><td class="r">${amountFmt} &#8381;</td></tr>
        <tr class="total-row"><td colspan="4" style="text-align:right;padding-right:16px">Итого:</td><td class="r">${amountFmt} &#8381;</td></tr>
      </tbody>
    </table>
    <p style="font-size:10pt"><strong>Итого к оплате: ${amountFmt} (${numberToWords(amount)}) ${word} 00 копеек.</strong></p>
    <p style="font-size:9pt;color:#666;margin-top:4px">Без НДС (УСН)</p>
  </div>

  <div class="section">
    <div class="section-title">Назначение платежа</div>
    <p style="font-size:10pt">Оплата по счёту № ${orderNumber} от ${dateStr} за тариф «${plan.name}». Без НДС.</p>
  </div>

  <div class="sig">
    <div class="sig-block">
      <div class="section-title">Поставщик</div>
      <div class="sig-line"></div>
      <div class="sig-label">Подпись / Печать</div>
      <div class="stamp">ООО "МАТ-ЛАБС"</div>
    </div>
  </div>

  <div class="footer">
    <p>Счёт сформирован автоматически и действителен без подписи и печати</p>
    <p style="margin-top:4px">АВАНГАРД &middot; avangard-ai.ru</p>
  </div>
</div>
</body></html>`;
}

function numberToWords(n: number): string {
  const ones = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять",
    "десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать",
    "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"];
  const tens = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"];
  const hundreds = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"];
  const thousands = ["", "одна тысяча", "две тысячи", "три тысячи", "четыре тысячи", "пять тысяч",
    "шесть тысяч", "семь тысяч", "восемь тысяч", "девять тысяч", "десять тысяч",
    "одиннадцать тысяч", "двенадцать тысяч", "тринадцать тысяч", "четырнадцать тысяч",
    "пятнадцать тысяч", "шестнадцать тысяч", "семнадцать тысяч", "восемнадцать тысяч",
    "девятнадцать тысяч", "двадцать тысяч", "двадцать одна тысяча", "двадцать две тысячи",
    "двадцать три тысячи", "двадцать четыре тысячи", "двадцать пять тысяч"];

  if (n === 0) return "ноль";
  const th = Math.floor(n / 1000);
  const rem = n % 1000;
  const h = Math.floor(rem / 100);
  const t = rem % 100;
  const parts: string[] = [];
  if (th > 0 && th < thousands.length) parts.push(thousands[th]);
  else if (th > 0) parts.push(`${th} тысяч`);
  if (h > 0) parts.push(hundreds[h]);
  if (t > 0 && t < 20) parts.push(ones[t]);
  else if (t >= 20) {
    parts.push(tens[Math.floor(t / 10)]);
    if (t % 10 > 0) parts.push(ones[t % 10]);
  }
  return parts.join(" ");
}

function InvoiceForm({ plan, onClose }: { plan: PlanInfo; onClose: () => void }) {
  const [companyName, setCompanyName] = useState("");
  const [inn, setInn] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");
  const [orderNumber, setOrderNumber] = useState("");
  const [copied, setCopied] = useState(false);

  const validate = () => {
    if (!companyName.trim()) { setError("Введите название компании"); return false; }
    if (!inn.trim() || !/^\d{10,12}$/.test(inn.trim())) { setError("Введите корректный ИНН (10 или 12 цифр)"); return false; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Введите корректный email"); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (isFreePeriod()) { onClose(); return; }
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const description = `Тариф «${plan.name}» — ${companyName.trim()}${comment.trim() ? `, ${comment.trim()}` : ""}`;
      const res = await fetch(YOOKASSA_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          user_name: contactName.trim() || companyName.trim(),
          user_email: email.trim(),
          user_phone: phone.trim(),
          description,
          return_url: window.location.href,
          cart_items: [{
            id: plan.id,
            name: `Тариф «${plan.name}» (1 мес)`,
            price: plan.price,
            quantity: 1,
          }],
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) { setError(data.error || "Ошибка создания платежа"); setLoading(false); return; }

      setOrderNumber(data.order_number);
      reachGoal("invoice_request", { plan: plan.id, price: plan.price });

      if (data.payment_url) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.open(data.payment_url, "_blank");
        } else {
          window.location.href = data.payment_url;
        }
      }
      setStep("success");
    } catch {
      setError("Не удалось отправить запрос. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Оплата по счёту</p>
              <h2 className="text-xl font-bold">Тариф «{plan.name}»</h2>
              <p className="text-3xl font-black mt-2">
                {fmt(plan.price)} <span className="text-lg font-normal opacity-80">₽/мес</span>
              </p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-1">
              <Icon name="X" size={22} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === "success" ? (
            <div className="py-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Icon name="CheckCircle" size={22} className="text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Заявка #{orderNumber} принята</h3>
                  <p className="text-xs text-gray-400">Счёт отправим на {email}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Реквизиты для оплаты</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Получатель</span><span className="font-medium text-gray-900 text-right max-w-[60%]">{COMPANY_REQUISITES.shortName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">ИНН</span><span className="font-mono text-gray-900">{COMPANY_REQUISITES.inn}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">КПП</span><span className="font-mono text-gray-900">{COMPANY_REQUISITES.kpp}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Р/с</span><span className="font-mono text-gray-900 text-xs">{COMPANY_REQUISITES.account}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Банк</span><span className="font-medium text-gray-900 text-right max-w-[60%]">{COMPANY_REQUISITES.bankName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">БИК</span><span className="font-mono text-gray-900">{COMPANY_REQUISITES.bik}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">К/с</span><span className="font-mono text-gray-900 text-xs">{COMPANY_REQUISITES.corrAccount}</span></div>
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Назначение платежа</span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1 font-medium">Оплата по тарифу «{plan.name}» ({fmt(plan.price)} ₽/мес), заявка #{orderNumber}. Без НДС.</p>
                </div>
              </div>

              <div className="flex gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    const text = [
                      `Получатель: ${COMPANY_REQUISITES.name}`,
                      `ИНН: ${COMPANY_REQUISITES.inn}`,
                      `КПП: ${COMPANY_REQUISITES.kpp}`,
                      `Р/с: ${COMPANY_REQUISITES.account}`,
                      `Банк: ${COMPANY_REQUISITES.bankName}`,
                      `БИК: ${COMPANY_REQUISITES.bik}`,
                      `К/с: ${COMPANY_REQUISITES.corrAccount}`,
                      `Назначение: Оплата по тарифу «${plan.name}» (${fmt(plan.price)} руб./мес), заявка #${orderNumber}. Без НДС.`,
                    ].join("\n");
                    copyToClipboard(text).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    });
                  }}
                >
                  {copied
                    ? <><Icon name="Check" size={14} className="mr-1.5 text-green-500" />Скопировано</>
                    : <><Icon name="Copy" size={14} className="mr-1.5" />Скопировать</>
                  }
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    const html = generateInvoiceHTML(plan, orderNumber, companyName, inn);
                    const w = window.open("", "_blank");
                    if (w) {
                      w.document.write(html);
                      w.document.close();
                      setTimeout(() => w.print(), 500);
                    }
                  }}
                >
                  <Icon name="Download" size={14} className="mr-1.5" />
                  Скачать PDF
                </Button>
              </div>

              <Button className="w-full" variant="outline" onClick={onClose}>Закрыть</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Название компании *</label>
                <Input placeholder='ООО "Строй Групп"' value={companyName} onChange={(e) => { setCompanyName(e.target.value); setError(""); }} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">ИНН *</label>
                <Input placeholder="1234567890" value={inn} onChange={(e) => { setInn(e.target.value.replace(/\D/g, "").slice(0, 12)); setError(""); }} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Контактное лицо</label>
                <Input placeholder="Иван Иванов" value={contactName} onChange={(e) => setContactName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email — сюда пришлём счёт *</label>
                <Input type="email" placeholder="buh@company.ru" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Телефон</label>
                <Input type="tel" placeholder="+7 (___) ___-__-__" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Комментарий</label>
                <Textarea placeholder="Дополнительные пожелания..." value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Тариф «{plan.name}»</span>
                  <span>{fmt(plan.price)} ₽/мес</span>
                </div>
                <div className="border-t border-blue-200 pt-3 flex justify-between font-bold text-gray-900">
                  <span>К оплате</span>
                  <span className="text-blue-600">{fmt(plan.price)} ₽/мес</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
                  <Icon name="AlertCircle" size={15} className="shrink-0" />
                  {error}
                </div>
              )}

              {isFreePeriod() ? (
                <div className="w-full bg-green-500 text-white font-bold h-12 rounded-md flex items-center justify-center gap-2"><Icon name="Gift" size={18} />Бесплатно до 15 мая!</div>
              ) : (
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold h-12" onClick={handleSubmit} disabled={loading}>
                  {loading
                    ? <><Icon name="Loader2" size={18} className="animate-spin mr-2" />Отправляем...</>
                    : <><Icon name="FileText" size={18} className="mr-2" />Запросить счёт</>
                  }
                </Button>
              )}
              <p className="text-center text-xs text-gray-400">Счёт будет отправлен на указанный email</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function B2BPaymentChoice({ plan, onClose }: { plan: PlanInfo; onClose: () => void }) {
  const [mode, setMode] = useState<"choose" | "online" | "invoice">("choose");

  if (mode === "online") {
    return <PaymentModalYookassa plan={plan} onClose={onClose} />;
  }
  if (mode === "invoice") return <InvoiceForm plan={plan} onClose={onClose} />;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">Тариф «{plan.name}»</h2>
              <p className="text-3xl font-black mt-2">
                {fmt(plan.price)} <span className="text-lg font-normal opacity-80">₽/мес</span>
              </p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-1">
              <Icon name="X" size={22} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-sm text-gray-500 mb-4">Выберите способ оплаты:</p>

          {isFreePeriod() ? (
            <div className="w-full bg-green-500 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2">
              <Icon name="Gift" size={18} />Бесплатно до 15 мая!
            </div>
          ) : (
            <>
              <button
                className="w-full border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-left"
                onClick={() => setMode("online")}
              >
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <Icon name="CreditCard" size={20} className="text-orange-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Оплатить онлайн</p>
                  <p className="text-xs text-gray-400">Банковская карта или СБП</p>
                </div>
              </button>

              <button
                className="w-full border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-left"
                onClick={() => setMode("invoice")}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Icon name="FileText" size={20} className="text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Оплата по счёту</p>
                  <p className="text-xs text-gray-400">Для юрлиц и ИП — выставим счёт</p>
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}