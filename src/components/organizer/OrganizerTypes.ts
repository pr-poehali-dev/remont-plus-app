export const API = "https://functions.poehali.dev/2718d43b-b9db-426c-add0-8a4f4b840a10";

export function getHeaders() {
  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(userId ? { "X-User-Id": userId } : {}),
    ...(token ? { "X-Auth-Token": token } : {}),
  };
}

export const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending:     { label: "Не начат",   color: "bg-gray-100 text-gray-600 border-gray-200",       icon: "Circle" },
  in_progress: { label: "В работе",   color: "bg-blue-100 text-blue-700 border-blue-200",        icon: "PlayCircle" },
  done:        { label: "Выполнен",   color: "bg-green-100 text-green-700 border-green-200",     icon: "CheckCircle2" },
  blocked:     { label: "Задержка",   color: "bg-red-100 text-red-700 border-red-200",           icon: "AlertCircle" },
};

export interface Stage {
  id: number;
  sort_order: number;
  title: string;
  description: string;
  checkpoints: string[];
  plan_days: number | null;
  plan_amount: number | null;
  fact_days: number | null;
  fact_amount: number | null;
  planned_start: string | null;
  planned_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  status: string;
  comment: string | null;
}

export interface Plan {
  id: number;
  title: string;
  address: string;
  apartment_area: number | null;
  start_date: string | null;
  notes: string;
}

export function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";
}

export function fmtDays(n: number | null | undefined) {
  if (n == null) return "—";
  return `${n} дн.`;
}

export function diffColor(plan: number | null, fact: number | null, invert = false) {
  if (plan == null || fact == null) return "text-gray-400";
  const saved = plan - fact;
  if (saved === 0) return "text-gray-500";
  if (invert) return saved > 0 ? "text-red-600" : "text-green-600";
  return saved > 0 ? "text-green-600" : "text-red-600";
}

export function diffLabel(plan: number | null, fact: number | null, unit = "₽", invert = false) {
  if (plan == null || fact == null) return null;
  const diff = plan - fact;
  if (diff === 0) return null;
  const sign = diff > 0 ? "−" : "+";
  const abs = Math.abs(diff);
  const val = unit === "₽" ? abs.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽" : `${abs} дн.`;
  const label = invert
    ? (diff > 0 ? `Задержка ${val}` : `Опережение ${val}`)
    : (diff > 0 ? `Экономия ${val}` : `Перерасход ${val}`);
  return { label, sign, positive: invert ? diff < 0 : diff > 0 };
}
