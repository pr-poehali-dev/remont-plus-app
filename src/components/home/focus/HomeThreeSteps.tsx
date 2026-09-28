import Icon from "@/components/ui/icon";

const STEPS = [
  {
    num: "01",
    icon: "SlidersHorizontal",
    title: "Укажите параметры",
    text: "Площадь, тип ремонта и город. Если знаете детали — уточните комнаты и виды работ. Если нет — расчёт сделаем по средним нормам.",
  },
  {
    num: "02",
    icon: "FileSpreadsheet",
    title: "Получите смету",
    text: "Расчёт работ и материалов с ценами вашего региона. Видно каждую статью: что входит, сколько стоит, где можно сэкономить.",
  },
  {
    num: "03",
    icon: "Handshake",
    title: "Выберите исполнителя",
    text: "Проверенные мастера видят вашу смету и предлагают условия. Сравниваете предложения и выбираете — или просто забираете расчёт себе.",
  },
];

interface Props {
  onCalcClick: () => void;
}

export default function HomeThreeSteps({ onCalcClick }: Props) {
  return (
    <section id="how" className="bg-white py-16 sm:py-20 scroll-mt-16">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight text-center">
          Три шага до готовой сметы
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {STEPS.map((s) => (
            <div key={s.num} className="relative rounded-2xl border border-gray-200 p-6 hover:border-amber-300 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Icon name={s.icon} size={21} className="text-amber-600" />
                </div>
                <span className="text-3xl font-extrabold text-gray-100 tabular-nums select-none">{s.num}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">{s.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-9">
          <button
            onClick={onCalcClick}
            className="px-7 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold transition inline-flex items-center gap-2"
          >
            <Icon name="ArrowUp" size={18} />
            Начать расчёт
          </button>
        </div>
      </div>
    </section>
  );
}
