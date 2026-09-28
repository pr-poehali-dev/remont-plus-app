import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { CALC_REGIONS } from "@/components/calculator/shared/regions";

const LEVELS = [
  { id: "economy", label: "Косметический", hint: "обои, покраска, замена покрытий" },
  { id: "standard", label: "Капитальный", hint: "со стяжкой, электрикой, сантехникой" },
  { id: "premium", label: "Дизайнерский", hint: "по проекту, премиум-материалы" },
] as const;

const TZ_TO_REGION: Record<string, string> = {
  "Europe/Moscow": "moscow",
  "Europe/Samara": "samara",
  "Europe/Saratov": "saratov",
  "Europe/Volgograd": "volgograd",
  "Asia/Yekaterinburg": "ekb",
  "Asia/Novosibirsk": "novosibirsk",
};

function detectRegion(): string {
  try {
    const saved = localStorage.getItem("turnkey_region");
    if (saved && CALC_REGIONS.some(r => r.id === saved)) return saved;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TZ_TO_REGION[tz] || "moscow";
  } catch {
    return "moscow";
  }
}

interface Props {
  /** Компактный вид — для повторов формы ниже по странице */
  compact?: boolean;
}

export default function QuickEstimateForm({ compact = false }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [area, setArea] = useState("");
  const [level, setLevel] = useState<string>("standard");
  const [region, setRegion] = useState("moscow");
  const [error, setError] = useState("");

  useEffect(() => {
    setRegion(detectRegion());
    if (!compact) {
      const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 400);
      return () => clearTimeout(t);
    }
  }, [compact]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const a = parseFloat(area.replace(",", "."));
    if (!a || a < 10) {
      setError("Укажите площадь — от 10 м²");
      inputRef.current?.focus();
      return;
    }
    if (a > 500) {
      setError("Для площади свыше 500 м² используйте расчёт коммерческих объектов");
      return;
    }
    localStorage.setItem("turnkey_region", region);
    navigate(`/turnkey?area=${Math.round(a)}&level=${level}&region=${region}`);
  };

  return (
    <form
      onSubmit={submit}
      className={`w-full ${compact ? "max-w-2xl" : "max-w-xl"} rounded-2xl bg-white shadow-2xl shadow-black/30 p-5 sm:p-6`}
    >
      <div className="mb-4">
        <label htmlFor="qe-area" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Площадь квартиры, м²
        </label>
        <input
          ref={inputRef}
          id="qe-area"
          type="number"
          inputMode="decimal"
          min={10}
          max={500}
          value={area}
          onChange={(e) => { setArea(e.target.value); setError(""); }}
          placeholder="54"
          className="w-full h-14 sm:h-16 px-4 rounded-xl border-2 border-gray-200 bg-white text-3xl font-bold text-gray-900 tabular-nums
                     placeholder:text-gray-300 placeholder:font-normal
                     focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition"
        />
        {error && (
          <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1.5">
            <Icon name="CircleAlert" size={14} /> {error}
          </p>
        )}
      </div>

      <div className="mb-4">
        <span className="block text-sm font-semibold text-gray-700 mb-1.5">Тип ремонта</span>
        <div className="grid grid-cols-3 gap-2">
          {LEVELS.map((l) => {
            const active = level === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => setLevel(l.id)}
                title={l.hint}
                className={`rounded-xl border-2 px-2 py-3 text-center transition ${
                  active
                    ? "border-amber-400 bg-amber-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className={`block text-sm font-semibold leading-tight ${active ? "text-amber-900" : "text-gray-700"}`}>
                  {l.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="qe-region" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Город
        </label>
        <div className="relative">
          <Icon name="MapPin" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            id="qe-region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full h-12 pl-9 pr-9 rounded-xl border-2 border-gray-200 bg-white text-base text-gray-900
                       appearance-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition"
          >
            {CALC_REGIONS.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
          <Icon name="ChevronDown" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <button
        type="submit"
        className="w-full h-14 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black text-lg font-bold
                   shadow-lg shadow-amber-400/30 transition flex items-center justify-center gap-2"
      >
        <Icon name="Calculator" size={20} />
        Рассчитать смету
      </button>

      <p className="text-center text-xs text-gray-500 mt-3">
        Бесплатно · Без регистрации · Результат сразу на экране
      </p>
    </form>
  );
}
