import { calcJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/components/SEOMeta";

export const HOMESTAGING_FAQ = [
  {
    q: "Что такое хоумстейджинг простыми словами?",
    a: "Хоумстейджинг — это предпродажная подготовка квартиры: уборка, обезличивание, правильное освещение, расстановка мебели и мелкий косметический ремонт, которые увеличивают привлекательность объекта для покупателя и позволяют продать жильё на 5–15% дороже и в 2–3 раза быстрее.",
  },
  {
    q: "Сколько стоит подготовить квартиру к продаже?",
    a: "70% рекомендаций из отчёта можно выполнить самостоятельно без затрат (перестановка, уборка, обезличивание). Остальное обычно укладывается в 10 000–30 000 ₽: освещение, текстиль, декор, мелкий косметический ремонт. ИИ показывает ориентировочную стоимость по каждому пункту.",
  },
  {
    q: "Как работает ИИ-анализ фото квартиры?",
    a: "Вы загружаете фото помещения на страницу сервиса. Искусственный интеллект оценивает комнату по 7 критериям: порядок, освещение, цветовая гамма, мебель, декор, дефекты, визуальное восприятие. Затем формирует отчёт с оценкой 1–10, сильными сторонами и 5–10 персональными рекомендациями с приоритетом и стоимостью.",
  },
  {
    q: "Это бесплатно?",
    a: "Да, сервис анализа фото для хоумстейджинга бесплатный. Авторизованные пользователи получают сохранение истории отчётов в личном кабинете.",
  },
  {
    q: "Подходит ли сервис для сдачи в аренду?",
    a: "Да. Рекомендации одинаково полезны как для продажи квартиры, так и для сдачи в долгосрочную или краткосрочную аренду. Подготовленная квартира сдаётся быстрее и по более высокой ставке.",
  },
  {
    q: "Что делать после получения рекомендаций?",
    a: "Вы можете выполнить пункты самостоятельно или воспользоваться разделом «Мастера» — найти проверенных исполнителей в своём городе для уборки, мелкого ремонта, монтажа освещения и декора.",
  },
];

export const HOMESTAGING_JSON_LD = [
  calcJsonLd(
    "ИИ-анализ фото квартиры для хоумстейджинга",
    "Бесплатный онлайн-сервис предпродажной подготовки квартиры: загрузите фото комнаты и получите персональные рекомендации ИИ по уборке, освещению, декору и мелкому ремонту, чтобы продать жильё дороже.",
    "/homestaging",
  ),
  faqJsonLd(HOMESTAGING_FAQ),
  breadcrumbJsonLd([
    { name: "Главная", url: "/" },
    { name: "Хоумстейджинг", url: "/homestaging" },
  ]),
];

export const ANALYZE_URL = "https://functions.poehali.dev/aba07e30-7771-4d10-a210-665a7bc44ed6";
export const REPORTS_URL = "https://functions.poehali.dev/9507a027-3e05-4ee7-a432-b90d2dea0603";
export const MAX_FILE_SIZE = 8 * 1024 * 1024;

export interface ReportListItem {
  id: number;
  room_type: string;
  overall_score: number;
  short_summary: string;
  image_url: string | null;
  created_at: string;
}

export type Priority = "high" | "medium" | "low";

export interface Recommendation {
  category: string;
  priority: Priority;
  title: string;
  description: string;
  estimatedCost: string;
}

export interface AnalysisResult {
  roomType: string;
  overallScore: number;
  shortSummary: string;
  recommendations: Recommendation[];
  strengths: string[];
}

export const PRIORITY_META: Record<Priority, { label: string; bg: string; text: string; icon: string }> = {
  high: { label: "Важно", bg: "bg-red-50 border-red-200", text: "text-red-700", icon: "AlertCircle" },
  medium: { label: "Средне", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: "AlertTriangle" },
  low: { label: "Опция", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: "Leaf" },
};

export const BENEFITS = [
  { icon: "TrendingUp", title: "Цена продажи выше на 5-15%", text: "Подготовленная квартира продаётся дороже и быстрее" },
  { icon: "Timer", title: "Сделка за 2-3 недели", text: "Вместо средних 2-3 месяцев на рынке" },
  { icon: "Camera", title: "Качественные фото", text: "Получите список улучшений для съёмки объявления" },
  { icon: "Sparkles", title: "Минимальные вложения", text: "Большинство рекомендаций — бесплатно или до 5 000 ₽" },
];

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
