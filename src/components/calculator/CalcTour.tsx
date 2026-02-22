import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const TOUR_KEY = "calc_tour_done";

const STEPS = [
  {
    title: "Выберите регион",
    text: "Цены на работы отличаются по регионам. Укажите ваш город, чтобы расчёт был точным.",
    icon: "MapPin",
    position: "bottom-right" as const,
  },
  {
    title: "Добавляйте работы из прайса",
    text: "Нажмите «Добавить из прайса» — выберите нужные виды работ с актуальными ценами.",
    icon: "ClipboardList",
    position: "bottom-right" as const,
  },
  {
    title: "Используйте шаблоны",
    text: "Готовые наборы работ для типовых помещений — кухня, ванная, спальня. Экономит время.",
    icon: "LayoutTemplate",
    position: "bottom-left" as const,
  },
  {
    title: "Смета и КП для печати",
    text: "Когда добавите позиции — нажмите «Скачать PDF» и получите готовый документ с вашими реквизитами.",
    icon: "FileText",
    position: "bottom-left" as const,
  },
];

export default function CalcTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      setTimeout(() => setVisible(true), 800);
    }
  }, []);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    localStorage.setItem(TOUR_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <>
      {/* Затемнение фона */}
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[1px]"
        onClick={handleClose}
      />

      {/* Карточка подсказки */}
      <div className="fixed z-50 bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Прогресс */}
        <div className="flex">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 transition-colors duration-300 ${i <= step ? "bg-orange-500" : "bg-gray-100"}`}
            />
          ))}
        </div>

        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <Icon name={current.icon as "MapPin"} size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{current.title}</p>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">{current.text}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleClose}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Пропустить тур
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{step + 1} / {STEPS.length}</span>
              <button
                onClick={handleNext}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
              >
                {step < STEPS.length - 1 ? "Далее" : "Готово"}
                <Icon name={step < STEPS.length - 1 ? "ChevronRight" : "Check"} size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
