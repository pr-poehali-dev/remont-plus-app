import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { useMeta } from "@/hooks/useMeta";
import PricingPlans from "@/components/prices/PricingPlans";
import PageTour from "@/components/ui/PageTour";

const TARIFFS_TOUR = [
  {
    title: "Тарифы для любых задач",
    text: "Есть разовые планы для частных клиентов и ежемесячные — для строительных компаний и студий.",
    icon: "Layers",
  },
  {
    title: "Попробуйте бесплатно",
    text: "Нажмите «Попробовать бесплатно» — вы получите 3 бесплатные сметы без регистрации и оплаты.",
    icon: "Sparkles",
  },
  {
    title: "Остались вопросы?",
    text: "Оставьте заявку — мы свяжемся с вами в рабочее время и подберём подходящий тариф.",
    icon: "Phone",
  },
];

const NOTIFY_URL = "https://functions.poehali.dev/a8b87e78-89d1-48d8-ba76-8da2e0df32a3";

export default function Tariffs() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useMeta({
    title: "Цены на услуги — дизайн-проект и смета",
    description: "Стоимость услуг: дизайн-проект, смета ремонта, подбор материалов. Тарифы для частных клиентов и строительных компаний.",
    keywords: "цены дизайн-проект, стоимость сметы ремонта, тарифы дизайн интерьера, B2B автоматизация проектов",
    canonical: "/tariffs",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSending(true);
    setError("");
    try {
      await fetch(NOTIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "lead_tariff",
          name: name.trim(),
          phone: phone.trim(),
          comment: comment.trim(),
        }),
      });
      setSent(true);
    } catch {
      setError("Не удалось отправить заявку. Попробуйте позже или позвоните нам.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <Icon name="Compass" className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold tracking-tight">АВАНГАРД</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Icon name="Phone" className="h-4 w-4" />
              <span className="font-medium text-gray-700">8 (927) 748-68-68</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <span className="cursor-pointer hover:text-gray-600" onClick={() => navigate("/")}>
            Главная
          </span>
          <Icon name="ChevronRight" size={14} />
          <span className="text-gray-700">Цены</span>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Цены на услуги</h1>
            <p className="text-gray-500">
              Выберите подходящий тариф — для частного клиента или для вашей компании
            </p>
          </div>
          <Button
            onClick={() => navigate("/ai-chat")}
            className="bg-orange-500 hover:bg-orange-600 text-white shrink-0 h-11 px-5"
          >
            <Icon name="Sparkles" size={16} className="mr-2" />
            Попробовать бесплатно
          </Button>
        </div>

        <PricingPlans />

        {/* Форма заявки */}
        <div className="mt-8 mb-6 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-xl font-bold mb-2">Остались вопросы?</h2>
            <p className="text-gray-500 mb-4">
              Оставьте заявку — мы свяжемся с вами, ответим на все вопросы и подберём подходящий тариф.
            </p>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Icon name="Clock" size={16} className="text-primary shrink-0" />
                Связываемся в рабочее время (пн–пт, 9:00–18:00)
              </li>
              <li className="flex items-center gap-2">
                <Icon name="ShieldCheck" size={16} className="text-primary shrink-0" />
                Первичная консультация бесплатна, без обязательств по покупке
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Phone" size={16} className="text-primary shrink-0" />
                8 (927) 748-68-68
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {sent ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" size={28} className="text-green-500" />
                </div>
                <h3 className="font-bold text-lg mb-1">Заявка отправлена!</h3>
                <p className="text-gray-500 text-sm">Мы перезвоним вам в ближайшее время</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Ваше имя *</label>
                  <Input
                    placeholder="Иван Иванов"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Телефон *</label>
                  <Input
                    placeholder="+7 (___) ___-__-__"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    type="tel"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Комментарий</label>
                  <Textarea
                    placeholder="Расскажите о вашей задаче..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={sending || !name.trim() || !phone.trim()}
                >
                  {sending ? (
                    <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Отправляем...</>
                  ) : (
                    <><Icon name="Send" size={16} className="mr-2" />Отправить заявку</>
                  )}
                </Button>
                <p className="text-xs text-gray-400 text-center">
                  Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                </p>
              </form>
            )}
          </div>
        </div>

        <div className="mt-2 text-center">
          <p className="text-sm text-gray-400 mb-3">Нужен прайс на строительные работы?</p>
          <Button variant="outline" onClick={() => navigate("/prices")}>
            <Icon name="ClipboardList" size={16} className="mr-2" />
            Смотреть прайс-лист работ
          </Button>
        </div>
      </main>

      <footer className="py-8 text-center text-xs text-gray-400 mt-8">
        АВАНГАРД &copy; {new Date().getFullYear()}
      </footer>

      <PageTour tourKey="tariffs_tour_done" steps={TARIFFS_TOUR} delay={1200} />
    </div>
  );
}