import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { trackCalcEvent } from "@/hooks/useCalcTracking";
import { getVariant, trackABEvent } from "@/lib/abtest";

const AB_TEST_NAME = "popup_vs_inline";

interface Props {
  calcType: string;
  total?: string;
  onClose?: () => void;
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

export default function CalcOrderForm({ calcType, total, onClose }: Props) {
  const [abVariant] = useState(() => getVariant(AB_TEST_NAME));
  useEffect(() => { trackCalcEvent(calcType, 'form_open'); }, [calcType]);

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
        body: JSON.stringify({ phone: digits, calc_type: calcType, total }),
      });
      await res.json();
      if (res.ok) {
        trackCalcEvent(calcType, 'lead');
        trackABEvent(AB_TEST_NAME, abVariant, "lead", { source: "order_form", calc: calcType });
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
      <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-6 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Icon name="CheckCircle2" size={28} className="text-green-600" />
        </div>
        <p className="font-bold text-lg text-gray-900 mb-1">Заявка принята!</p>
        <p className="text-sm text-gray-500">Перезвоним в течение 15 минут для уточнения деталей</p>
        {onClose && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onClose}>
            Закрыть
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-6 text-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-16 translate-x-16" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <Icon name="PhoneCall" size={22} />
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">Получите точную смету</p>
            {total && (
              <p className="text-orange-100 text-sm mt-0.5">Предварительно: {total}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4 py-3 px-4 bg-white/10 rounded-xl">
          <Icon name="CheckCircle2" size={16} className="text-green-300 shrink-0" />
          <p className="text-sm text-orange-50">Бесплатный расчёт + гарантия цены 30 дней</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="tel"
            className="w-full border-2 border-white/30 rounded-xl px-4 py-3.5 text-base bg-white/10 text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/20 transition-colors"
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
          />

          {status === "error" && (
            <p className="text-sm text-red-200 flex items-center gap-1.5">
              <Icon name="AlertCircle" size={14} />
              Ошибка. Попробуйте ещё раз.
            </p>
          )}

          <Button
            type="submit"
            disabled={status === "sending" || !isValid}
            className="w-full bg-white text-orange-600 hover:bg-orange-50 font-bold h-13 text-base rounded-xl disabled:opacity-50 shadow-lg"
          >
            {status === "sending" ? (
              <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Отправляю...</>
            ) : (
              <><Icon name="PhoneCall" size={16} className="mr-2" />Перезвоните мне</>
            )}
          </Button>

          <div className="flex items-center justify-center gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-orange-200 text-xs">
              <Icon name="Clock" size={12} />
              <span>15 минут</span>
            </div>
            <div className="flex items-center gap-1.5 text-orange-200 text-xs">
              <Icon name="MessageCircle" size={12} />
              <span>Смета на WhatsApp</span>
            </div>
          </div>

          <p className="text-[10px] text-orange-200/60 text-center">
            Нажимая кнопку, вы соглашаетесь на обработку персональных данных
          </p>
        </form>
      </div>
    </div>
  );
}
