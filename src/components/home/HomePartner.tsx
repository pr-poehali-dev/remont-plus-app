import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

const PARTNER_TYPES = [
  {
    icon: "HardHat",
    title: "Бригады и мастера",
    description: "Получайте заявки на отделку, ремонт и монтажные работы от клиентов в своём регионе",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    icon: "Store",
    title: "Поставщики материалов",
    description: "Размещайте каталог товаров и получайте заказы от людей, уже рассчитавших смету",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    icon: "AppWindow",
    title: "Оконные компании",
    description: "Принимайте горячие заявки от клиентов, уже рассчитавших стоимость окон онлайн",
    color: "bg-violet-50 text-violet-600 border-violet-100",
  },
  {
    icon: "Palette",
    title: "Дизайн-студии",
    description: "Предлагайте услуги клиентам, которые уже сделали базовый проект и хотят большего",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
];

const BENEFITS = [
  { icon: "Target", text: "Целевые заявки — клиент, как правило, уже имеет представление о бюджете и задаче" },
  { icon: "MapPin", text: "Заявки преимущественно из вашего региона — конкуренция локальная, а не по всей стране" },
  { icon: "TrendingUp", text: "Прозрачная аналитика: конверсии, отзывы, рейтинг в каталоге" },
  { icon: "Zap", text: "Быстрый старт — заполните профиль компании и начните получать заявки" },
];

export default function HomePartner() {
  const navigate = useNavigate();

  return (
    <section className="mt-20">
      <div className="relative rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm">
        {/* Верхняя полоса */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

        <div className="p-8 md:p-12">
          {/* Заголовок */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">Для бизнеса</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                Стать партнёром
              </h2>
              <p className="text-gray-500 text-lg max-w-xl">
                Получайте заявки от клиентов, которые уже рассчитали ориентировочную стоимость и сформулировали задачу.
                Меньше холодного поиска — больше предметного общения.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => navigate("/partner")}
              className="shrink-0 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white border-0 rounded-2xl px-8 shadow-lg shadow-orange-200"
            >
              <Icon name="Handshake" size={18} className="mr-2" />
              Стать партнёром
            </Button>
          </div>

          {/* Типы партнёров */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {PARTNER_TYPES.map((type, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-5 ${type.color}`}
              >
                <Icon name={type.icon as Parameters<typeof Icon>[0]["name"]} size={24} className="mb-3" />
                <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{type.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{type.description}</p>
              </div>
            ))}
          </div>

          {/* Преимущества */}
          <div className="border-t border-gray-100 pt-8">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Почему партнёры выбирают нас</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {BENEFITS.map((b, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <Icon name={b.icon as Parameters<typeof Icon>[0]["name"]} size={16} className="text-orange-500" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}