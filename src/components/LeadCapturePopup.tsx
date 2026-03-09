import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

const VISITOR_LEADS_URL = "https://functions.poehali.dev/69fd9787-d0eb-4342-b94b-9d14bb3f36e7";
const STORAGE_KEY = "lead_popup_dismissed";
const SHOW_DELAY_MS = 30000;

export default function LeadCapturePopup() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
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
    if (!phone && !email) {
      setError("Укажите телефон или email");
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
          email: email.trim().toLowerCase(),
          source: "popup",
          page_url: window.location.pathname,
          consent: true,
        }),
      });
      setDone(true);
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
        style={{ animation: "slideUp 0.3s ease-out" }}
      >
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4 flex items-start justify-between">
          <div>
            <p className="text-white font-bold text-base leading-tight">Скидка до 15% на ремонт</p>
            <p className="text-orange-100 text-sm mt-0.5">Оставьте контакт — пришлём выгодные предложения</p>
          </div>
          <button onClick={handleDismiss} className="text-orange-200 hover:text-white ml-3 mt-0.5 flex-shrink-0">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          {done ? (
            <div className="flex flex-col items-center py-4 gap-2 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="CheckCircle" size={24} className="text-green-600" />
              </div>
              <p className="font-semibold text-gray-900">Отлично! Мы запомнили вас</p>
              <p className="text-sm text-gray-500">Пришлём лучшие предложения на ваши контакты</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                placeholder="Ваше имя"
                value={name}
                onChange={e => setName(e.target.value)}
                className="rounded-xl"
              />
              <Input
                placeholder="Телефон *"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="rounded-xl"
              />
              <Input
                placeholder="Email (необязательно)"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="rounded-xl"
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
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
              >
                {loading ? <Icon name="Loader2" size={16} className="animate-spin mr-2" /> : null}
                Получить предложение
              </Button>
              <p className="text-[10px] text-gray-400 text-center leading-tight">
                Нажимая кнопку, вы соглашаетесь на обработку персональных данных и получение рассылки
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
