import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { trackCalcEvent } from "@/hooks/useCalcTracking";

interface Props {
  calcType: string;
  totalSum: number;
}

type Status = "idle" | "sending" | "success" | "error";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  let d = digits;
  if (d.startsWith("8") && d.length > 1) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  let r = "+7";
  if (d.length > 1) r += " (" + d.slice(1, 4);
  if (d.length >= 4) r += ") " + d.slice(4, 7);
  if (d.length >= 7) r += "-" + d.slice(7, 9);
  if (d.length >= 9) r += "-" + d.slice(9, 11);
  return r;
}

function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

export default function CalcInlineLeadForm({ calcType, totalSum }: Props) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const digits = phone.replace(/\D/g, "");
  const isValid = digits.length >= 11;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setStatus("sending");
    try {
      const res = await fetch("https://functions.poehali.dev/e155a53f-72bf-4c18-8aec-b9bd60565215", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: digits,
          calc_type: calcType,
          total: `от ${fmt(totalSum)} ₽`,
          source: "inline_result",
          page_url: window.location.pathname,
        }),
      });
      if (res.ok) {
        trackCalcEvent(calcType, "lead");
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
      <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2 text-white">
        <div className="w-8 h-8 bg-green-400/30 rounded-full flex items-center justify-center shrink-0">
          <Icon name="CheckCircle2" size={16} className="text-green-300" />
        </div>
        <div>
          <p className="text-sm font-semibold">Заявка принята!</p>
          <p className="text-xs opacity-70">Перезвоним за 15 минут</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-white/20">
      <p className="text-xs text-white/80 font-semibold mb-2 flex items-center gap-1.5">
        <Icon name="PhoneCall" size={12} />
        Получить точную смету бесплатно
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="tel"
          className="flex-1 min-w-0 border border-white/30 rounded-lg px-3 py-2 text-sm bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-colors"
          placeholder="+7 (___) ___-__-__"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!isValid || status === "sending"}
          className="bg-white text-orange-700 hover:bg-orange-50 font-bold rounded-lg px-3 shrink-0 disabled:opacity-40"
        >
          {status === "sending" ? (
            <Icon name="Loader2" size={14} className="animate-spin" />
          ) : (
            <Icon name="Send" size={14} />
          )}
        </Button>
      </form>
      {status === "error" && (
        <p className="text-xs text-red-200 mt-1.5 flex items-center gap-1">
          <Icon name="AlertCircle" size={11} />
          Ошибка, попробуйте ещё раз
        </p>
      )}
      <p className="text-[9px] text-white/40 mt-1.5">
        Менеджер перезвонит и пришлёт смету на WhatsApp
      </p>
    </div>
  );
}