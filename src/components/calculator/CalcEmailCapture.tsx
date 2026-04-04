import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { trackCalcEvent } from "@/hooks/useCalcTracking";

const VISITOR_LEADS_API = "https://functions.poehali.dev/536b1902-f1a6-497f-811d-d2fbad49442a";
const NOTIFY_EMAIL_API = "https://functions.poehali.dev/a8b87e78-89d1-48d8-ba76-8da2e0df32a3";

export interface EstimateItem {
  name: string;
  price: number;
}

interface Props {
  calcType: string;
  totalSum: number;
  items?: EstimateItem[];
  params?: Record<string, string>;
}

type Status = "idle" | "sending" | "success" | "error";

function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

export default function CalcEmailCapture({ calcType, totalSum, items, params }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  if (totalSum <= 0) return null;

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setStatus("sending");
    try {
      const now = new Date();
      const docDate = now.toLocaleDateString("ru-RU");

      const [leadRes] = await Promise.all([
        fetch(VISITOR_LEADS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            source: "calc_email_capture",
            page_url: window.location.pathname,
            consent: true,
          }),
        }),
        fetch(NOTIFY_EMAIL_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send_estimate",
            to_email: email.trim(),
            subject: `Смета: ${calcType} — ${fmt(totalSum)} ₽`,
            calc_name: calcType,
            total_sum: totalSum,
            items: items || [{ name: calcType, price: totalSum }],
            params: params || {},
            customer: "",
            contractor: "",
            address: "",
            phone: "",
            doc_date: docDate,
          }),
        }),
      ]);

      if (leadRes.ok) {
        trackCalcEvent(calcType, "email_lead");
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-5 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
            <Icon name="CheckCircle2" size={22} className="text-green-600" />
          </div>
          <div>
            <p className="font-bold text-green-800 text-sm">Смета отправлена!</p>
            <p className="text-xs text-green-600 mt-0.5">Проверьте <strong>{email}</strong> — детальный расчёт уже там</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5 mt-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
          <Icon name="Mail" size={20} className="text-blue-600" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-tight">
            Получить смету на {fmt(totalSum)} ₽ на email
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Детальный расчёт с ценами на работы и материалы
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          className="flex-1 min-w-0 border border-blue-200 rounded-xl px-4 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
          placeholder="your@email.ru"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          type="submit"
          disabled={!isValid || status === "sending"}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 h-[42px] shrink-0 disabled:opacity-40 shadow-md shadow-blue-200"
        >
          {status === "sending" ? (
            <Icon name="Loader2" size={16} className="animate-spin" />
          ) : (
            <>
              <Icon name="Send" size={14} className="mr-1.5" />
              <span className="hidden sm:inline">Отправить</span>
            </>
          )}
        </Button>
      </form>

      {status === "error" && (
        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
          <Icon name="AlertCircle" size={11} />
          Ошибка, попробуйте ещё раз
        </p>
      )}

      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1 text-gray-400 text-[11px]">
          <Icon name="Shield" size={11} />
          <span>Не спам</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-[11px]">
          <Icon name="Zap" size={11} />
          <span>Мгновенно</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-[11px]">
          <Icon name="FileText" size={11} />
          <span>Смета на email</span>
        </div>
      </div>
    </div>
  );
}
