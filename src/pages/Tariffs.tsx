import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { useMeta } from "@/hooks/useMeta";
import PricingPlans from "@/components/prices/PricingPlans";
import EstimatePricingSection from "@/components/prices/EstimatePricingSection";
import PageTour from "@/components/ui/PageTour";

const TARIFFS_TOUR = [
  {
    title: "Всё в одном пакете",
    text: "Каждый тариф включает не только дизайн-проект и смету, но и ИИ-эксперта по интерьеру, шоурум готовых проектов и органайзер ремонта — в зависимости от уровня.",
    icon: "Layers",
  },
  {
    title: "ИИ-эксперт и ЯСЕН",
    text: "ИИ-эксперт отвечает на вопросы по дизайну и формирует ТЗ для дизайнера. Голосовой ассистент ЯСЕН помогает фиксировать задачи и управлять ходом ремонта — доступен в тарифах PRO MAX и BUSINESS+.",
    icon: "Sparkles",
  },
  {
    title: "Органайзер ремонта",
    text: "Встроенный планировщик этапов ремонта с чек-листами, сроками и бюджетом — держит весь процесс под контролем. Входит в тарифы PRO и выше.",
    icon: "ClipboardList",
  },
  {
    title: "Остались вопросы?",
    text: "Оставьте заявку — мы свяжемся с вами в рабочее время, расскажем обо всех возможностях и подберём подходящий тариф.",
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
    title: "Тарифы для студий и строительных компаний — АВАНГАРД",
    description: "Тарифы АВАНГАРД: дизайн-проект, смета, ИИ-эксперт по интерьеру, органайзер ремонта, голосовой ассистент ЯСЕН, шоурум готовых проектов. Для студий и строительных компаний.",
    keywords: "цены дизайн-проект, стоимость ремонта смета, ИИ эксперт интерьер, органайзер ремонта, голосовой ассистент ЯСЕН, тарифы строительная компания, B2B автоматизация проектов",
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

        {/* Hero-блок */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Тарифы для студий и строительных компаний</h1>
              <p className="text-gray-500">
                Автоматизация дизайн‑проектов, смет и управления ремонтом — выберите подходящий пакет для вашей компании
              </p>
            </div>
            <Button
              onClick={() => navigate("/expert")}
              className="bg-orange-500 hover:bg-orange-600 text-white shrink-0 h-11 px-5"
            >
              <Icon name="Sparkles" size={16} className="mr-2" />
              Спросить ИИ‑эксперта
            </Button>
          </div>

          {/* Ценностные блоки */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: "Zap",
                color: "text-orange-500",
                bg: "bg-orange-50",
                title: "В 3× быстрее",
                text: "Смета и дизайн-проект — за минуты, а не дни. Больше сделок за тот же рабочий день.",
              },
              {
                icon: "TrendingUp",
                color: "text-blue-500",
                bg: "bg-blue-50",
                title: "+40% к конверсии",
                text: "Клиент видит готовый проект с реальными ценами ещё на этапе переговоров — принять решение проще.",
              },
              {
                icon: "ShieldCheck",
                color: "text-green-500",
                bg: "bg-green-50",
                title: "Ваш бренд",
                text: "Все сметы, проекты и отчёты выходят под логотипом вашей компании — никаких чужих watermark.",
              },
              {
                icon: "HeadphonesIcon",
                color: "text-purple-500",
                bg: "bg-purple-50",
                title: "Поддержка 24/7",
                text: "Персональный менеджер и приоритетная очередь — ваша команда не тратит время на ожидание.",
              },
            ].map((item) => (
              <div key={item.title} className={`rounded-xl ${item.bg} p-4 flex flex-col gap-2`}>
                <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm`}>
                  <Icon name={item.icon} size={18} className={item.color} />
                </div>
                <p className="font-semibold text-sm text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <PricingPlans />

        <EstimatePricingSection />

        {/* Форма заявки */}
        <div id="tariff-lead-form" className="mt-8 mb-6 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-xl font-bold mb-2">Подберём тариф под вашу задачу</h2>
            <p className="text-gray-500 mb-4">
              Расскажите о вашем бизнесе — мы разберём ваши задачи и покажем, как АВАНГАРД закроет их конкретными инструментами.
            </p>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Icon name="Clock" size={16} className="text-primary shrink-0" />
                Перезваниваем в рабочее время (пн–пт, 9:00–18:00)
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Sparkles" size={16} className="text-primary shrink-0" />
                Покажем демо с вашими реальными задачами
              </li>
              <li className="flex items-center gap-2">
                <Icon name="ShieldCheck" size={16} className="text-primary shrink-0" />
                Без скриптов продаж — только по делу
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
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={sending || !name.trim() || !phone.trim()}
                >
                  {sending ? (
                    <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Отправляем...</>
                  ) : (
                    <><Icon name="Phone" size={16} className="mr-2" />Хочу демо и подбор тарифа</>
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
        <div>АВАНГАРД &copy; {new Date().getFullYear()}</div>
        <div className="mt-1">ООО «МАТ-Лабс» &nbsp;|&nbsp; ИНН/КПП 6312223437/631201001 &nbsp;|&nbsp; ОГРН 1266300004288</div>
      </footer>

      <PageTour tourKey="tariffs_tour_done" steps={TARIFFS_TOUR} delay={1200} />
    </div>
  );
}