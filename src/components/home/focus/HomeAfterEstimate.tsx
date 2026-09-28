import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const CARDS = [
  {
    icon: "Users",
    title: "Мастера под вашу смету",
    text: "Отправьте расчёт проверенным бригадам — они предложат свои условия. Сравните цены и отзывы, выберите подходящего. Бесплатно для вас.",
    action: "Как это работает",
    path: "/masters",
  },
  {
    icon: "ShoppingCart",
    title: "Материалы со скидкой",
    text: "Список материалов из сметы можно сразу заказать у партнёров. Не нужно переписывать позиции вручную.",
    action: "Смотреть каталог",
    path: "/lemanapro",
  },
  {
    icon: "CalendarCheck",
    title: "Контроль хода работ",
    text: "Календарный план с этапами и бюджетом план-факт. Видно, где идёт перерасход, пока ремонт ещё можно поправить.",
    action: "Открыть органайзер",
    path: "/organizer",
  },
];

export default function HomeAfterEstimate() {
  const navigate = useNavigate();

  return (
    <section className="bg-[#0f0f13] py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-center">
          Смета — только начало
        </h2>
        <p className="mt-3 text-center text-gray-400 max-w-xl mx-auto">
          Дальше сервис помогает довести ремонт до конца, а не бросает с цифрой на руках
        </p>

        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {CARDS.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 flex flex-col hover:border-amber-400/40 hover:bg-white/[0.06] transition"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-400/15 flex items-center justify-center mb-4">
                <Icon name={c.icon} size={21} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{c.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed flex-1">{c.text}</p>
              <button
                onClick={() => navigate(c.path)}
                className="mt-4 text-sm font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5 self-start transition"
              >
                {c.action} <Icon name="ArrowRight" size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
