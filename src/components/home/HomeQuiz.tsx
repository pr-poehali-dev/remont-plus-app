import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import reachGoal from "@/lib/metrika";

interface QuizOption {
  id: string;
  emoji: string;
  label: string;
  sub?: string;
}

const STEP1_OPTIONS: QuizOption[] = [
  { id: "apartment", emoji: "🏠", label: "Квартира", sub: "Новостройка или вторичка" },
  { id: "bathroom", emoji: "🚿", label: "Ванная / санузел", sub: "Плитка, сантехника, тёплый пол" },
  { id: "house", emoji: "🏗️", label: "Дом / баня", sub: "Каркасник, баня с нуля" },
  { id: "office", emoji: "🏢", label: "Офис / коммерция", sub: "Ремонт коммерческих помещений" },
  { id: "parts", emoji: "⚡", label: "Отдельные работы", sub: "Окна, потолки, полы, электрика" },
  { id: "design", emoji: "🎨", label: "Дизайн-проект", sub: "ИИ поможет с интерьером" },
];

const STEP2_APARTMENT: QuizOption[] = [
  { id: "newbuild", emoji: "🏗️", label: "Новостройка", sub: "С нуля: стяжка, штукатурка, всё" },
  { id: "turnkey", emoji: "🔑", label: "Под ключ", sub: "Полный ремонт квартиры" },
  { id: "bathroom_only", emoji: "🚿", label: "Только ванная", sub: "Плитка, сантехника, гидроизоляция" },
];

const STEP2_PARTS: QuizOption[] = [
  { id: "windows", emoji: "🪟", label: "Окна", sub: "ПВХ и алюминий" },
  { id: "ceilings", emoji: "🏠", label: "Потолки", sub: "Натяжные, ПВХ, тканевые" },
  { id: "flooring", emoji: "🪵", label: "Полы", sub: "Ламинат, плитка, паркет" },
  { id: "electrics", emoji: "⚡", label: "Электрика", sub: "Розетки, кабели, щиток" },
];

const STEP2_HOUSE: QuizOption[] = [
  { id: "framehouse", emoji: "🏗", label: "Каркасный дом", sub: "OSB, SIP, ЛСТК" },
  { id: "bathhouse", emoji: "🪵", label: "Баня", sub: "Брус, бревно, каркас" },
];

const AREA_OPTIONS: QuizOption[] = [
  { id: "small", emoji: "📐", label: "До 40 м²", sub: "Студия или однушка" },
  { id: "medium", emoji: "📐", label: "40–80 м²", sub: "Двух- или трёхкомнатная" },
  { id: "large", emoji: "📐", label: "80–150 м²", sub: "Большая квартира или дом" },
  { id: "xlarge", emoji: "📐", label: "От 150 м²", sub: "Коттедж или коммерция" },
];

const ROUTE_MAP: Record<string, string> = {
  newbuild: "/newbuild",
  turnkey: "/turnkey",
  bathroom_only: "/bathroom",
  bathroom: "/bathroom",
  windows: "/windows",
  ceilings: "/ceilings",
  flooring: "/flooring",
  electrics: "/electrics",
  framehouse: "/framehouse",
  bathhouse: "/bathhouse",
  office: "/office",
  design: "/designer",
  apartment: "/turnkey",
  house: "/framehouse",
  parts: "/calculator",
};

export default function HomeQuiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [type, setType] = useState("");
  const [subType, setSubType] = useState("");

  const goTo = (path: string, quizPath: string) => {
    reachGoal("quiz_complete", { path, quiz_path: quizPath });
    navigate(path);
  };

  const handleSelect = (id: string) => {
    if (step === 0) {
      reachGoal("quiz_step", { step: 0, choice: id });
      if (id === "design") { goTo("/designer", id); return; }
      if (id === "office") { goTo("/office", id); return; }
      if (id === "bathroom") { goTo("/bathroom", id); return; }
      setType(id);
      setStep(1);
      return;
    }

    if (step === 1) {
      reachGoal("quiz_step", { step: 1, choice: id, type });
      setSubType(id);
      const target = id as keyof typeof ROUTE_MAP;
      if (["framehouse", "bathhouse"].includes(id)) {
        goTo(ROUTE_MAP[target] || "/calculator", `${type}>${id}`);
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      const route = ROUTE_MAP[subType || type] || "/calculator";
      goTo(route, `${type}>${subType}>${id}`);
    }
  };

  const getStep1Label = () => "Что планируете?";
  const getStep2Label = () => {
    if (type === "apartment") return "Какой вид ремонта?";
    if (type === "parts") return "Что именно нужно?";
    if (type === "house") return "Что строим?";
    return "";
  };

  const getCurrentOptions = (): QuizOption[] => {
    if (step === 0) return STEP1_OPTIONS;
    if (step === 1) {
      if (type === "apartment") return STEP2_APARTMENT;
      if (type === "parts") return STEP2_PARTS;
      if (type === "house") return STEP2_HOUSE;
      return [];
    }
    return AREA_OPTIONS;
  };

  const title = step === 0 ? getStep1Label() : step === 1 ? getStep2Label() : "Какая площадь?";
  const options = getCurrentOptions();
  const stepLabels = ["Тип", "Детали", "Площадь"];

  return (
    <section className="py-16 px-4" id="quiz">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Icon name="Zap" size={14} />
            Подберём за 30 секунд
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            {title}
          </h2>
          <p className="text-gray-500 text-base">
            {step === 2
              ? "Последний шаг — переходим к расчёту"
              : "Ответьте на 3 вопроса — мы подберём нужный калькулятор"}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  i < step
                    ? "bg-orange-500 text-white"
                    : i === step
                      ? "bg-orange-500 text-white ring-4 ring-orange-200"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {i < step ? (
                  <Icon name="Check" size={14} />
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i <= step ? "text-gray-700" : "text-gray-400"}`}>
                {label}
              </span>
              {i < stepLabels.length - 1 && (
                <div className={`w-12 h-0.5 rounded-full transition-colors ${i < step ? "bg-orange-400" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className="group relative bg-white rounded-2xl border-2 border-gray-100 hover:border-orange-400 p-5 text-left transition-all duration-200 hover:shadow-lg hover:shadow-orange-100 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span className="text-3xl mb-3 block">{opt.emoji}</span>
              <p className="font-bold text-gray-900 text-sm mb-0.5">{opt.label}</p>
              {opt.sub && (
                <p className="text-gray-400 text-xs leading-snug">{opt.sub}</p>
              )}
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon name="ArrowRight" size={12} className="text-orange-500" />
              </div>
            </button>
          ))}
        </div>

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-6 mx-auto flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            <Icon name="ArrowLeft" size={14} />
            Назад
          </button>
        )}
      </div>
    </section>
  );
}