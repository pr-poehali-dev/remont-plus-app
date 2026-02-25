import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const STEPS = [
  {
    number: "01",
    title: "Рассчитайте смету на ремонт",
    description: "Укажите тип помещения, площадь и виды работ — калькулятор мгновенно сформирует смету с актуальными ценами по вашему региону. Партнёры увидят запрос и предложат свои условия.",
    cta: "Рассчитать смету",
    ctaPath: "/calculator",
    icon: "Calculator",
    color: "from-green-500 to-emerald-600",
    lightColor: "bg-green-50",
    accentColor: "text-green-600",
    borderColor: "border-green-200",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/d4df22fb-690d-4ce3-911f-3665b0ee8c7d.jpg",
  },
  {
    number: "02",
    title: "Подберите и рассчитайте окна",
    description: "Настройте конструкцию окна: профиль, стеклопакет, ламинацию, фурнитуру. Цена пересчитывается мгновенно — получите КП и сравните предложения от партнёров.",
    cta: "Рассчитать окна",
    ctaPath: "/windows",
    icon: "AppWindow",
    color: "from-sky-500 to-blue-600",
    lightColor: "bg-sky-50",
    accentColor: "text-sky-600",
    borderColor: "border-sky-200",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/167349ac-0fe6-480a-8fe4-50ce2cfb8ab1.jpg",
  },
  {
    number: "03",
    title: "Спросите ИИ‑эксперта",
    description: "Задайте вопрос ИИ‑эксперту по дизайну и ремонту — он поможет определиться со стилем, материалами и бюджетом, а при желании сформирует готовое ТЗ для дизайнера.",
    cta: "Спросить эксперта",
    ctaPath: "/expert",
    icon: "Sparkles",
    color: "from-violet-500 to-purple-600",
    lightColor: "bg-violet-50",
    accentColor: "text-violet-600",
    borderColor: "border-violet-200",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/8ce30a40-8e67-4b5d-a83d-2fc5350fe708.jpg",
  },
  {
    number: "04",
    title: "Получите дизайн-проект",
    description: "ИИ-дизайнер создаёт планировку и визуализацию интерьера онлайн. Вы видите результат до начала работ и можете показать его партнёрам для расчёта.",
    cta: "Создать проект",
    ctaPath: "/designer",
    icon: "Palette",
    color: "from-orange-400 to-amber-500",
    lightColor: "bg-amber-50",
    accentColor: "text-amber-600",
    borderColor: "border-amber-200",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/387a5b0f-25ee-44e8-98cb-021029b309f6.jpg",
  },
  {
    number: "05",
    title: "Выберите мастеров",
    description: "Партнёры из вашего региона присылают предложения с готовой сметой. Сравните по цене, рейтингу и отзывам — и выберите подходящее.",
    cta: "Найти мастеров",
    ctaPath: "/masters",
    icon: "HardHat",
    color: "from-emerald-500 to-teal-600",
    lightColor: "bg-emerald-50",
    accentColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/d942a8b7-a909-47e5-bfd4-00ebbe92ff9e.jpg",
  },
  {
    number: "06",
    title: "Принимайте готовую квартиру",
    description: "Всё общение с партнёром, документы и история заказа — в личном кабинете. Удобно следить за этапами и фиксировать договорённости.",
    cta: "Личный кабинет",
    ctaPath: "/dashboard",
    icon: "CheckCircle",
    color: "from-blue-500 to-indigo-600",
    lightColor: "bg-blue-50",
    accentColor: "text-blue-600",
    borderColor: "border-blue-200",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/a2e07dbe-454e-44df-96e6-08db359b88f6.jpg",
  },
];

export default function HomeHowItWorks() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Заголовок */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary/60 mb-3">Быстро и удобно</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Как это работает
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            От идеи до готового расчёта — онлайн, без лишних звонков и встреч
          </p>
        </div>

        {/* Десктоп: таббы слева + иллюстрация справа */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
          {/* Шаги */}
          <div className="space-y-3">
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-full text-left rounded-2xl p-5 transition-all duration-300 border-2 ${
                  active === i
                    ? `${s.lightColor} ${s.borderColor} shadow-md`
                    : "bg-gray-50 border-transparent hover:bg-gray-100"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${s.color}`}>
                    <Icon name={s.icon as Parameters<typeof Icon>[0]["name"]} size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${active === i ? s.accentColor : "text-gray-400"}`}>{s.number}</span>
                      <h3 className={`font-bold text-base ${active === i ? "text-gray-900" : "text-gray-600"}`}>{s.title}</h3>
                    </div>
                    {active === i && (
                      <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                        <p className="text-sm text-gray-600 mb-3">{s.description}</p>
                        <Button
                          size="sm"
                          className={`bg-gradient-to-r ${s.color} text-white border-0 rounded-xl`}
                          onClick={(e) => { e.stopPropagation(); navigate(s.ctaPath); }}
                        >
                          {s.cta}
                          <Icon name="ArrowRight" size={14} className="ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Иллюстрация */}
          <div className="relative">
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.color} opacity-10 blur-3xl scale-110`} />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
              {STEPS.map((s, i) => (
                <img
                  key={i}
                  src={s.image}
                  alt={s.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-0"}`}
                />
              ))}
              {/* Нижний оверлей с CTA */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${step.color}`}>
                    <Icon name={step.icon as Parameters<typeof Icon>[0]["name"]} size={16} className="text-white" />
                  </div>
                  <span className="text-white font-semibold">{step.title}</span>
                </div>
              </div>
              {/* Счётчики шагов */}
              <div className="absolute top-4 right-4 flex gap-1.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Мобайл: вертикальные карточки */}
        <div className="lg:hidden space-y-6">
          {STEPS.map((s, i) => (
            <div key={i} className={`rounded-2xl overflow-hidden border-2 ${s.borderColor} shadow-sm`}>
              <div className="aspect-video overflow-hidden">
                <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
              </div>
              <div className={`p-5 ${s.lightColor}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${s.color}`}>
                    <Icon name={s.icon as Parameters<typeof Icon>[0]["name"]} size={15} className="text-white" />
                  </div>
                  <span className={`text-xs font-bold ${s.accentColor}`}>{s.number}</span>
                  <h3 className="font-bold text-gray-900">{s.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">{s.description}</p>
                <Button
                  size="sm"
                  className={`bg-gradient-to-r ${s.color} text-white border-0 rounded-xl`}
                  onClick={() => navigate(s.ctaPath)}
                >
                  {s.cta}
                  <Icon name="ArrowRight" size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}