import Icon from "@/components/ui/icon";

const ARGS = [
  {
    icon: "MapPinned",
    title: "Актуальные расценки по регионам",
    text: "Цены работ отличаются в разных городах — расчёт учитывает ваш, а не усреднённую цифру по стране.",
  },
  {
    icon: "Store",
    title: "Материалы от Лемана Про",
    text: "Стоимость берётся из ассортимента федеральной сети, а не из усреднённых справочников. Это реальные цены, по которым можно купить.",
    highlight: true,
  },
  {
    icon: "Ruler",
    title: "Расчёт по нормам расхода",
    text: "Количество материалов считается по площадям и строительным нормативам, а не на глаз.",
  },
  {
    icon: "RefreshCw",
    title: "Обновление цен",
    text: "Расценки пересматриваются регулярно — смета не устаревает к моменту начала работ.",
  },
];

export default function HomePriceTrust() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight text-center">
          Откуда берутся цены
        </h2>
        <p className="mt-3 text-center text-gray-500 max-w-xl mx-auto">
          Чтобы смета не выглядела набором случайных чисел — вот на чём построен расчёт
        </p>

        <div className="grid sm:grid-cols-2 gap-5 mt-10">
          {ARGS.map((a) => (
            <div
              key={a.title}
              className={`rounded-2xl border p-6 transition ${
                a.highlight
                  ? "border-amber-300 bg-amber-50/60 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  a.highlight ? "bg-amber-400" : "bg-gray-100"
                }`}>
                  <Icon name={a.icon} size={20} className={a.highlight ? "text-black" : "text-gray-600"} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{a.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{a.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
