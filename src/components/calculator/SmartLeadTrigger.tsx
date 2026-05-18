import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useExitIntent } from "@/hooks/useExitIntent";

const EMAIL_FN = "https://functions.poehali.dev/536b1902-f1a6-497f-811d-d2fbad49442a";
const SEND_ESTIMATE_FN = "https://functions.poehali.dev/a8b87e78-89d1-48d8-ba76-8da2e0df32a3";

interface Props {
  /** Имя калькулятора (например "Окна", "Под ключ") */
  calcType: string;
  /** Текущая итоговая сумма расчёта (в ₽) */
  totalSum: number;
  /** Процент заполненности калькулятора (0-100) — для условий и текста */
  progressPct?: number;
  /** Список позиций для отправки на email */
  items?: { name: string; price: number }[];
  /** Дополнительные параметры (для email) */
  params?: Record<string, string>;
  /** Глобально отключить триггеры (например, на /print или /admin) */
  disabled?: boolean;
}

type Scenario = "exit" | "longstay" | "highvalue";

interface ScenarioCfg {
  icon: Parameters<typeof Icon>[0]["name"];
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
  accentGrad: string;
  benefit: string;
}

function getScenarioCfg(scenario: Scenario, calcType: string, totalSum: number): ScenarioCfg {
  switch (scenario) {
    case "exit":
      return {
        icon: "Save",
        badge: "Не теряйте расчёт",
        title: "Сохраним вашу смету на email?",
        subtitle: `Вы потратили время на расчёт «${calcType}». Отправим её на почту — сможете вернуться и продолжить когда удобно.`,
        cta: "Прислать смету на email",
        accentGrad: "from-amber-500 to-orange-500",
        benefit: "Бесплатно · без звонков · письмо приходит сразу",
      };
    case "highvalue":
      return {
        icon: "Sparkles",
        badge: `Расчёт от ${new Intl.NumberFormat("ru-RU").format(totalSum)} ₽`,
        title: "Хотите получить до 3 предложений мастеров?",
        subtitle: "Мы покажем смету проверенным специалистам в вашем регионе — они предложат конкурентные цены. Вы выбираете лучшее.",
        cta: "Сравнить предложения",
        accentGrad: "from-emerald-500 to-green-500",
        benefit: "Скидка до 15% от рыночных цен · только проверенные мастера",
      };
    case "longstay":
    default:
      return {
        icon: "Mail",
        badge: "Калькулятор почти готов",
        title: "Получите смету по email и сравните цены",
        subtitle: "Пришлём вашу смету и подборку цен по региону на ту же почту. Никаких звонков без вашего согласия.",
        cta: "Отправить на email",
        accentGrad: "from-blue-500 to-sky-500",
        benefit: "Бесплатно · моментально · отписаться в один клик",
      };
  }
}

export default function SmartLeadTrigger({
  calcType,
  totalSum,
  progressPct = 0,
  items = [],
  params = {},
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [scenario, setScenario] = useState<Scenario>("longstay");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const longStayShownRef = useRef(false);
  const highValueShownRef = useRef(false);

  // Триггер №1 — exit-intent
  useExitIntent({
    enabled: !disabled && totalSum > 0 && !open,
    delay: 8000,
    storageKey: `lead_trigger_exit_${calcType}`,
    cooldownMin: 180,
    onTrigger: () => {
      setScenario("exit");
      setOpen(true);
      return true;
    },
  });

  // Триггер №2 — long stay (60 сек на странице с прогрессом > 40%)
  useEffect(() => {
    if (disabled || open || longStayShownRef.current) return;
    if (progressPct < 40 || totalSum <= 0) return;

    const key = `lead_trigger_longstay_${calcType}`;
    try {
      const last = parseInt(localStorage.getItem(key) || "0", 10);
      if (last && Date.now() - last < 90 * 60 * 1000) return;
    } catch { /* ignore */ }

    const timer = setTimeout(() => {
      if (longStayShownRef.current) return;
      longStayShownRef.current = true;
      setScenario("longstay");
      setOpen(true);
      try { localStorage.setItem(key, String(Date.now())); } catch { /* ignore */ }
    }, 60000);

    return () => clearTimeout(timer);
  }, [progressPct, totalSum, calcType, disabled, open]);

  // Триггер №3 — high-value (сумма > 150k и калькулятор готов на 70%+)
  useEffect(() => {
    if (disabled || open || highValueShownRef.current) return;
    if (totalSum < 150000 || progressPct < 70) return;

    const key = `lead_trigger_highvalue_${calcType}`;
    try {
      const last = parseInt(localStorage.getItem(key) || "0", 10);
      if (last && Date.now() - last < 240 * 60 * 1000) return;
    } catch { /* ignore */ }

    const timer = setTimeout(() => {
      if (highValueShownRef.current) return;
      highValueShownRef.current = true;
      setScenario("highvalue");
      setOpen(true);
      try { localStorage.setItem(key, String(Date.now())); } catch { /* ignore */ }
    }, 12000);

    return () => clearTimeout(timer);
  }, [totalSum, progressPct, calcType, disabled, open]);

  const cfg = getScenarioCfg(scenario, calcType, totalSum);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Введите корректный email");
      return;
    }
    setSubmitting(true);
    try {
      const tasks: Promise<unknown>[] = [];

      // Записываем лид
      tasks.push(fetch(EMAIL_FN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          source: `smart_lead_${scenario}`,
          page_url: window.location.href,
          consent: true,
          meta: { calc_type: calcType, total_sum: totalSum, scenario, progress: progressPct },
        }),
      }).catch(() => null));

      // Отправляем смету (если есть позиции и сценарий не «highvalue»)
      if (scenario !== "highvalue" && items.length > 0) {
        tasks.push(fetch(SEND_ESTIMATE_FN, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send_estimate",
            to_email: trimmed,
            subject: `Ваша смета: ${calcType}`,
            calc_name: calcType,
            total_sum: totalSum,
            items,
            params,
            doc_date: new Date().toLocaleDateString("ru-RU"),
          }),
        }).catch(() => null));
      }

      await Promise.allSettled(tasks);
      setDone(true);
    } catch {
      setError("Не получилось отправить. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Закрыть */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Закрыть"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-900 flex items-center justify-center transition-all"
        >
          <Icon name="X" size={16} />
        </button>

        {/* Шапка */}
        <div className={`bg-gradient-to-br ${cfg.accentGrad} px-6 pt-6 pb-5 text-white`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon name={cfg.icon} size={18} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
              {cfg.badge}
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold leading-tight">{cfg.title}</h3>
          <p className="text-sm opacity-90 mt-1.5 leading-snug">{cfg.subtitle}</p>
        </div>

        {/* Тело */}
        <div className="p-5 md:p-6">
          {done ? (
            <div className="text-center py-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Icon name="CheckCircle2" size={24} />
              </div>
              <p className="font-semibold text-gray-900">Готово!</p>
              <p className="text-sm text-gray-500 mt-1">
                {scenario === "highvalue"
                  ? "Передали ваш расчёт менеджеру. Свяжемся в течение часа."
                  : "Смета отправлена. Проверьте почту — письмо приходит за минуту."}
              </p>
              <Button
                className="mt-4 w-full"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Хорошо
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block uppercase tracking-wide">
                  Ваш email
                </label>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={submitting}
                  className="h-11"
                  required
                />
                {error && (
                  <p className="text-xs text-red-500 mt-1.5">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className={`w-full h-11 bg-gradient-to-r ${cfg.accentGrad} hover:opacity-90 text-white font-semibold border-0`}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Отправляем...
                  </span>
                ) : cfg.cta}
              </Button>

              <p className="text-[11px] text-gray-400 text-center leading-tight">
                {cfg.benefit}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
