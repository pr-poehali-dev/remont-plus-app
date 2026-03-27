import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import reachGoal from "@/lib/metrika";

const VISITOR_LEADS_URL = "https://functions.poehali.dev/536b1902-f1a6-497f-811d-d2fbad49442a";
const STORAGE_KEY = "lead_popup_dismissed";
const SHOW_DELAY_MS = 15000;

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

export default function LeadCapturePopup() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 11) {
      setError("Введите корректный номер телефона");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await fetch(VISITOR_LEADS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: "",
          source: "popup",
          page_url: window.location.pathname,
          consent: true,
        }),
      });
      setDone(true);
      reachGoal("lead_popup", { source: "lead_capture" });
      localStorage.setItem(STORAGE_KEY, "1");
      setTimeout(() => setVisible(false), 3000);
    } catch {
      setError("Ошибка. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 pointer-events-none">
      <div
        className="pointer-events-auto w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
      >
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4 flex items-start justify-between">
          <div>
            <p className="text-white font-bold text-base leading-tight">Бесплатный расчёт сметы за 2 часа</p>
            <p className="text-orange-100 text-sm mt-0.5">Оставьте телефон — наш специалист рассчитает стоимость и перезвонит</p>
          </div>
          <button onClick={handleDismiss} className="text-orange-200 hover:text-white ml-3 mt-0.5 flex-shrink-0">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          {done ? (
            <div className="flex flex-col items-center py-3 gap-2 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="CheckCircle" size={24} className="text-green-600" />
              </div>
              <p className="font-semibold text-gray-900">Отлично! Перезвоним в течение 2 часов</p>
              <p className="text-sm text-gray-500">Подготовим расчёт и свяжемся с вами</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                placeholder="Ваше имя (необязательно)"
                value={name}
                onChange={e => setName(e.target.value)}
                className="rounded-xl"
              />
              <Input
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                className="rounded-xl text-base h-12"
                required
              />
              {error && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <Icon name="AlertCircle" size={12} />
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 text-base font-semibold"
              >
                {loading ? <Icon name="Loader2" size={16} className="animate-spin mr-2" /> : null}
                Получить расчёт бесплатно
              </Button>
              <p className="text-[10px] text-gray-400 text-center leading-tight">
                Нажимая кнопку, вы соглашаетесь на обработку персональных данных
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}