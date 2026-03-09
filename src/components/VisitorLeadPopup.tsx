import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

const VISITOR_LEADS_URL = "https://functions.poehali.dev/536b1902-f1a6-497f-811d-d2fbad49442a";
const POPUP_KEY = "visitor_lead_shown";
const DELAY_MS = 40000; // показываем через 40 сек

export default function VisitorLeadPopup() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Не показываем если уже был показан или пользователь авторизован
    const alreadyShown = localStorage.getItem(POPUP_KEY);
    const user = localStorage.getItem("avangard_user");
    if (alreadyShown || user) return;

    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem(POPUP_KEY, "1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone && !email) {
      setError("Введите телефон или email");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await fetch(VISITOR_LEADS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          source: "popup",
          page_url: window.location.href,
          consent: true,
        }),
      });
      setSent(true);
      localStorage.setItem(POPUP_KEY, "1");
      setTimeout(() => setVisible(false), 3000);
    } catch {
      setError("Ошибка отправки. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in slide-in-from-bottom-4">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <Icon name="X" size={20} />
        </button>

        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="CheckCircle" size={28} className="text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Спасибо!</h3>
            <p className="text-sm text-gray-500">Мы сообщим вам об акциях и скидках первыми</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon name="Tag" size={20} className="text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 leading-tight">Акции и скидки</h3>
                <p className="text-xs text-gray-500">Получайте лучшие предложения первыми</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Оставьте контакт — мы пришлём скидку на первый ремонт и будем уведомлять о выгодных акциях.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                placeholder="Ваше имя"
                value={name}
                onChange={e => setName(e.target.value)}
                className="rounded-xl"
              />
              <Input
                placeholder="Телефон"
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
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <Icon name="AlertCircle" size={12} />
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <><Icon name="Loader2" size={16} className="animate-spin mr-2" />Отправляю...</>
                ) : (
                  <>Получать акции</>
                )}
              </Button>

              <p className="text-xs text-gray-400 text-center">
                Нажимая кнопку, вы соглашаетесь на получение рекламных рассылок. Отписаться можно в любой момент.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
