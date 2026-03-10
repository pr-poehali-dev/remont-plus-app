import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMeta } from "@/hooks/useMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/89a93896-7725-4f8e-b42b-561db9546fd8";

const PARTNER_TYPES = [
  { value: "contractor", label: "Бригада / мастер", icon: "HardHat", description: "Отделочные и ремонтные работы" },
  { value: "supplier", label: "Поставщик материалов", icon: "Store", description: "Стройматериалы и отделка" },
  { value: "windows", label: "Оконная компания", icon: "AppWindow", description: "ПВХ, алюминий, деревянные окна" },
  { value: "ceilings", label: "Натяжные потолки", icon: "Layers", description: "ПВХ и тканевые потолки, монтаж" },
  { value: "design", label: "Дизайн-студия", icon: "Palette", description: "Дизайн-проекты интерьера" },
  { value: "other", label: "Другое", icon: "Briefcase", description: "Смежные услуги для ремонта" },
];

const HOW_IT_WORKS = [
  { step: "01", icon: "UserPlus", title: "Регистрируетесь", text: "Заполните профиль компании: специализация, регион, портфолио, контакты. Модерация — до 24 часов." },
  { step: "02", icon: "Bell", title: "Получаете заявки", text: "Клиенты, которые рассчитали смету или дизайн-проект, видят ваше предложение и отправляют запрос." },
  { step: "03", icon: "MessageCircle", title: "Общаетесь напрямую", text: "Связываетесь с клиентом, уточняете детали и делаете точное коммерческое предложение." },
  { step: "04", icon: "TrendingUp", title: "Растёте вместе с нами", text: "Рейтинг, отзывы и аналитика помогают привлекать больше клиентов без дополнительных затрат." },
];

const CONDITIONS = [
  { icon: "Gift", title: "Быстрый старт", text: "Регистрация и размещение профиля без предоплаты. Монетизация подключается по мере вашего роста." },
  { icon: "MapPin", title: "Региональный фокус", text: "Заявки преимущественно от клиентов из вашего города и области — конкурируете локально, а не по всей стране." },
  { icon: "Target", title: "Клиенты с задачей", text: "Человек уже рассчитал ориентировочную смету или дизайн-проект — у него есть конкретная задача и представление о бюджете." },
  { icon: "BarChart2", title: "Прозрачная аналитика", text: "Видите, сколько заявок пришло, сколько конвертировалось, какой средний чек. Управляйте своим ростом осознанно." },
  { icon: "ShieldCheck", title: "Верификация профиля", text: "Значок «Проверенный партнёр» повышает доверие клиентов и ставит вас выше в результатах поиска." },
  { icon: "Headphones", title: "Поддержка 7 дней", text: "Персональный менеджер помогает настроить профиль, разобраться с заявками и выстроить стратегию роста." },
];

const REGIONS = [
  "Москва", "Московская область", "Санкт-Петербург", "Ленинградская область",
  "Краснодарский край", "Новосибирск", "Екатеринбург", "Казань",
  "Нижний Новгород", "Самара", "Ростов-на-Дону", "Воронеж",
  "Тюмень", "Красноярск", "Челябинск", "Другой регион",
];

interface FormState {
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  partner_type: string;
  region: string;
  comment: string;
}

export default function Partner() {
  useMeta({
    title: "Стать партнёром — мастера, поставщики, дизайнеры",
    description: "Зарегистрируйтесь как партнёр АВАНГАРД: бригады, поставщики материалов, оконные компании и дизайн-студии. Получайте заявки от клиентов по всей России.",
    keywords: "стать партнёром ремонт, регистрация мастер, поставщик стройматериалов, заявки на ремонт",
    canonical: "/partner",
  });

  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    company_name: "", contact_name: "", phone: "", email: "",
    partner_type: "", region: "", comment: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.partner_type) { setError("Выберите тип партнёра"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Что-то пошло не так. Попробуйте ещё раз.");
      }
    } catch {
      setError("Ошибка сети. Проверьте соединение и попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Hero */}
      <div className="relative bg-[#0f0f13] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/5" />
        <div className="relative container mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/50 hover:text-white/90 transition-colors text-sm mb-10"
          >
            <Icon name="ArrowLeft" size={16} />
            На главную
          </button>
          <div className="max-w-3xl mx-auto text-center pb-16 pt-4">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-orange-500/20">
              <Icon name="Handshake" size={14} />
              Партнёрская программа
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
              Получайте заявки от клиентов,{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                которые уже знают, чего хотят
              </span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-2xl mx-auto">
              Клиенты АВАНГАРД рассчитывают смету и создают дизайн-проект до того, как обращаются к партнёрам.
              Вы получаете контакт с клиентом, у которого уже есть задача и представление о бюджете — меньше уговоров, больше дела.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-white/40">
              <span className="flex items-center gap-1.5"><Icon name="Check" size={14} className="text-emerald-400" />Регистрация без оплаты</span>
              <span className="flex items-center gap-1.5"><Icon name="Check" size={14} className="text-emerald-400" />Заявки из вашего региона</span>
              <span className="flex items-center gap-1.5"><Icon name="Check" size={14} className="text-emerald-400" />Вся Россия</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">

        {/* Типы партнёров */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Кто может стать партнёром</h2>
            <p className="text-gray-500 text-lg">Мы работаем со всеми участниками рынка ремонта и обустройства жилья</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PARTNER_TYPES.map((type) => (
              <div key={type.value} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center hover:shadow-md hover:border-orange-200 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
                  <Icon name={type.icon as Parameters<typeof Icon>[0]["name"]} size={22} className="text-orange-500" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{type.label}</h3>
                <p className="text-gray-400 text-xs">{type.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Условия */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Условия партнёрства</h2>
            <p className="text-gray-500 text-lg">Прозрачно, выгодно и без скрытых платежей</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CONDITIONS.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4">
                  <Icon name={item.icon as Parameters<typeof Icon>[0]["name"]} size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Как это работает */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Как это работает</h2>
            <p className="text-gray-500 text-lg">Четыре шага от регистрации до первых клиентов</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="text-5xl font-extrabold text-gray-100 mb-4 leading-none">{item.step}</div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
                  <Icon name={item.icon as Parameters<typeof Icon>[0]["name"]} size={20} className="text-orange-500" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Форма заявки */}
        <section id="form">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Оставить заявку</h2>
              <p className="text-gray-500 text-lg">Заполните форму — мы свяжемся в течение рабочего дня и расскажем об условиях</p>
            </div>

            {success ? (
              <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                  <Icon name="CheckCircle" size={40} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Заявка принята!</h3>
                <p className="text-gray-500 text-lg mb-8 max-w-sm mx-auto">
                  Мы получили вашу заявку и свяжемся с вами в течение рабочего дня, чтобы рассказать обо всех условиях.
                </p>
                <Button onClick={() => navigate("/")} variant="outline" className="rounded-full px-8">
                  Вернуться на главную
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10 space-y-6">

                {/* Тип партнёра */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Тип партнёра <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PARTNER_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => { setForm(prev => ({ ...prev, partner_type: type.value })); setError(""); }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          form.partner_type === type.value
                            ? "border-orange-400 bg-orange-50 text-orange-700"
                            : "border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-orange-50/50"
                        }`}
                      >
                        <Icon name={type.icon as Parameters<typeof Icon>[0]["name"]} size={16} />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Название компании */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Название компании или ИП <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={form.company_name}
                    onChange={set("company_name")}
                    placeholder="ООО «СтройМастер» или ИП Иванов"
                    required
                    className="rounded-xl h-11"
                  />
                </div>

                {/* Имя и телефон */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Контактное лицо <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={form.contact_name}
                      onChange={set("contact_name")}
                      placeholder="Имя и фамилия"
                      required
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Телефон <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="+7 900 000-00-00"
                      type="tel"
                      required
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>

                {/* Email и регион */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <Input
                      value={form.email}
                      onChange={set("email")}
                      placeholder="company@mail.ru"
                      type="email"
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Регион работы</label>
                    <select
                      value={form.region}
                      onChange={set("region")}
                      className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Выберите регион</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                {/* Комментарий */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Расскажите о своей компании
                  </label>
                  <Textarea
                    value={form.comment}
                    onChange={set("comment")}
                    placeholder="Специализация, опыт работы, количество объектов в год, средний чек..."
                    rows={4}
                    className="rounded-xl resize-none"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
                    <Icon name="AlertCircle" size={16} />
                    {error}
                  </div>
                )}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 accent-orange-500 w-4 h-4 shrink-0"
                    required
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    Я принимаю{" "}
                    <a href="/terms" target="_blank" className="text-orange-500 hover:underline">
                      Пользовательское соглашение
                    </a>{" "}
                    и{" "}
                    <a href="/privacy" target="_blank" className="text-orange-500 hover:underline">
                      Политику конфиденциальности
                    </a>
                    , даю согласие на обработку персональных данных в соответствии с ФЗ-152
                  </span>
                </label>

                <Button
                  type="submit"
                  disabled={loading || !agreed}
                  size="lg"
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white border-0 rounded-2xl h-12 text-base font-semibold shadow-lg shadow-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Icon name="Loader2" size={18} className="mr-2 animate-spin" />Отправляем заявку...</>
                  ) : (
                    <><Icon name="Send" size={18} className="mr-2" />Отправить заявку</>
                  )}
                </Button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}