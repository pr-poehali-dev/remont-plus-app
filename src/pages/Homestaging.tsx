import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMeta } from "@/hooks/useMeta";
import SEOMeta, { calcJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/components/SEOMeta";
import HomePromoBanner from "@/components/home/HomePromoBanner";

const HOMESTAGING_FAQ = [
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

const HOMESTAGING_JSON_LD = [
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

const ANALYZE_URL = "https://functions.poehali.dev/aba07e30-7771-4d10-a210-665a7bc44ed6";
const REPORTS_URL = "https://functions.poehali.dev/9507a027-3e05-4ee7-a432-b90d2dea0603";
const MAX_FILE_SIZE = 8 * 1024 * 1024;

interface ReportListItem {
  id: number;
  room_type: string;
  overall_score: number;
  short_summary: string;
  image_url: string | null;
  created_at: string;
}

type Priority = "high" | "medium" | "low";

interface Recommendation {
  category: string;
  priority: Priority;
  title: string;
  description: string;
  estimatedCost: string;
}

interface AnalysisResult {
  roomType: string;
  overallScore: number;
  shortSummary: string;
  recommendations: Recommendation[];
  strengths: string[];
}

const PRIORITY_META: Record<Priority, { label: string; bg: string; text: string; icon: string }> = {
  high: { label: "Важно", bg: "bg-red-50 border-red-200", text: "text-red-700", icon: "AlertCircle" },
  medium: { label: "Средне", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: "AlertTriangle" },
  low: { label: "Опция", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: "Leaf" },
};

const BENEFITS = [
  { icon: "TrendingUp", title: "Цена продажи выше на 5-15%", text: "Подготовленная квартира продаётся дороже и быстрее" },
  { icon: "Timer", title: "Сделка за 2-3 недели", text: "Вместо средних 2-3 месяцев на рынке" },
  { icon: "Camera", title: "Качественные фото", text: "Получите список улучшений для съёмки объявления" },
  { icon: "Sparkles", title: "Минимальные вложения", text: "Большинство рекомендаций — бесплатно или до 5 000 ₽" },
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Homestaging() {
  useMeta({
    title: "Хоумстейджинг онлайн — ИИ-анализ фото квартиры перед продажей",
    description: "Бесплатный сервис предпродажной подготовки квартиры: загрузите фото комнаты и получите 5–10 персональных рекомендаций ИИ по уборке, освещению и декору. Продайте жильё на 5–15% дороже и в 2–3 раза быстрее.",
    keywords: "хоумстейджинг, home staging, предпродажная подготовка квартиры, как продать квартиру дороже, как быстро продать квартиру, стейджинг квартиры, подготовка квартиры к продаже, подготовка квартиры к сдаче в аренду, фото квартиры для объявления, оценка квартиры по фото, анализ интерьера ИИ",
    canonical: "/homestaging",
  });

  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<ReportListItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("avangard_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u?.id) setUserId(u.id);
      } catch { /* ignore */ }
    }
  }, []);

  const loadHistory = async (uid: number) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${REPORTS_URL}?userId=${uid}`, {
        headers: { "X-User-Id": String(uid) },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.reports)) setHistory(data.reports);
    } catch { /* ignore */ }
    finally { setHistoryLoading(false); }
  };

  useEffect(() => {
    if (userId) loadHistory(userId);
  }, [userId]);

  const openReport = async (id: number) => {
    if (!userId) return;
    try {
      const res = await fetch(`${REPORTS_URL}?id=${id}&userId=${userId}`, {
        headers: { "X-User-Id": String(userId) },
      });
      const data = await res.json();
      if (res.ok && data.report) {
        setResult({
          roomType: data.report.room_type,
          overallScore: data.report.overall_score,
          shortSummary: data.report.short_summary,
          recommendations: data.report.recommendations || [],
          strengths: data.report.strengths || [],
        });
        setPreviewUrl(data.report.image_url || "");
        setImageBase64("");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch { /* ignore */ }
  };

  const deleteReport = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || !confirm("Удалить этот отчёт?")) return;
    try {
      const res = await fetch(`${REPORTS_URL}?id=${id}&userId=${userId}`, {
        method: "DELETE",
        headers: { "X-User-Id": String(userId) },
      });
      if (res.ok) setHistory((prev) => prev.filter((r) => r.id !== id));
    } catch { /* ignore */ }
  };

  const handleFile = async (file: File) => {
    setError("");
    setResult(null);
    if (!file.type.startsWith("image/")) {
      setError("Файл должен быть изображением (JPG, PNG)");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Размер фото не должен превышать 8 МБ");
      return;
    }
    try {
      const dataUrl = await fileToBase64(file);
      setPreviewUrl(dataUrl);
      setImageBase64(dataUrl);
    } catch {
      setError("Не удалось прочитать файл");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const analyze = async () => {
    if (!imageBase64) {
      setError("Сначала загрузите фото помещения");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (userId) headers["X-User-Id"] = String(userId);
      const res = await fetch(ANALYZE_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ imageBase64, note: note.trim(), userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось проанализировать фото");
        return;
      }
      setResult(data.result);
      if (userId) loadHistory(userId);
    } catch {
      setError("Проблемы с соединением. Попробуйте ещё раз");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPreviewUrl("");
    setImageBase64("");
    setNote("");
    setResult(null);
    setError("");
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <SEOMeta
        title="Хоумстейджинг онлайн — ИИ-анализ фото квартиры перед продажей"
        description="Бесплатный сервис предпродажной подготовки квартиры: загрузите фото комнаты и получите 5–10 персональных рекомендаций ИИ. Продайте квартиру на 5–15% дороже и быстрее."
        keywords="хоумстейджинг, home staging, предпродажная подготовка квартиры, как продать квартиру дороже, стейджинг квартиры, анализ интерьера ИИ, фото квартиры для объявления"
        path="/homestaging"
        jsonLd={HOMESTAGING_JSON_LD}
      />
      <HomePromoBanner />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Icon name="ArrowLeft" size={20} />
          </button>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-base sm:text-lg">Хоумстейджинг с ИИ</p>
            <p className="text-xs text-gray-500 hidden sm:block">Предпродажная подготовка квартиры</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <Icon name="Sparkles" size={14} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">Бесплатно</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold mb-4">
                <Icon name="Home" size={14} />
                ХОУМСТЕЙДЖИНГ С ИИ
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4">
                Хоумстейджинг&nbsp;—<br />продай квартиру дороже
              </h1>
              <p className="text-white/90 text-base sm:text-lg max-w-xl">
                Загрузите фото комнаты — искусственный интеллект проанализирует помещение
                по 7 критериям и даст 5–10 конкретных рекомендаций перед съёмкой объявления
                или показом покупателю.
              </p>
            </div>
            <div className="w-40 h-40 sm:w-56 sm:h-56 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center flex-shrink-0">
              <Icon name="Sparkles" size={96} className="text-white/90" />
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Upload area */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <Icon name="Upload" size={20} className="text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">1. Загрузите фото помещения</h3>
              <p className="text-xs text-gray-500">Гостиная, кухня, спальня, ванная — любая комната</p>
            </div>
          </div>

          {!previewUrl ? (
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInput.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-rose-400 hover:bg-rose-50/50 rounded-2xl p-10 text-center cursor-pointer transition-colors"
            >
              <Icon name="ImagePlus" size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="font-semibold text-gray-700 mb-1">Нажмите или перетащите фото сюда</p>
              <p className="text-xs text-gray-500">JPG, PNG до 8 МБ</p>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                <img src={previewUrl} alt="Фото комнаты" className="w-full max-h-[400px] object-contain" />
                <button
                  onClick={reset}
                  className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  aria-label="Удалить фото"
                >
                  <Icon name="X" size={18} />
                </button>
              </div>
              <button
                onClick={() => fileInput.current?.click()}
                className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1.5"
              >
                <Icon name="RefreshCw" size={14} />
                Выбрать другое фото
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          )}

          {/* Optional note */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Комментарий (необязательно)
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Например: планирую продать квартиру в ближайший месяц, бюджет на подготовку до 20 000 ₽"
              rows={2}
              className="resize-none"
            />
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-sm text-red-700">
              <Icon name="AlertCircle" size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!userId && imageBase64 && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 flex items-start gap-2">
              <Icon name="Info" size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                <button onClick={() => navigate("/login")} className="font-bold underline">Войдите</button>
                {" "}— и отчёт сохранится в вашем личном кабинете.
              </span>
            </div>
          )}

          <Button
            onClick={analyze}
            disabled={loading || !imageBase64}
            className="w-full mt-6 h-12 bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white font-bold text-base"
          >
            {loading ? (
              <><Icon name="Loader2" size={20} className="animate-spin mr-2" />ИИ анализирует фото...</>
            ) : (
              <><Icon name="Sparkles" size={20} className="mr-2" />Получить рекомендации</>
            )}
          </Button>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-start gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center text-white">
                    <Icon name="Home" size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Помещение</p>
                    <h3 className="font-bold text-gray-900 capitalize">{result.roomType}</h3>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <Icon name="Star" size={18} className="text-amber-500 fill-amber-500" />
                  <span className="font-bold text-gray-900 text-lg">{result.overallScore}</span>
                  <span className="text-gray-500 text-sm">/ 10</span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{result.shortSummary}</p>

              {result.strengths?.length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Сильные стороны</p>
                  <div className="flex flex-wrap gap-2">
                    {result.strengths.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                        <Icon name="Check" size={14} />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Icon name="ListChecks" size={22} className="text-rose-500" />
                <h3 className="text-xl font-bold text-gray-900">
                  Рекомендации ({result.recommendations.length})
                </h3>
              </div>

              <div className="space-y-3">
                {result.recommendations.map((rec, i) => {
                  const meta = PRIORITY_META[rec.priority] || PRIORITY_META.medium;
                  return (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border ${meta.bg} ${meta.text}`}>
                              <Icon name={meta.icon} size={12} />
                              {meta.label}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                              {rec.category}
                            </span>
                            {rec.estimatedCost && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                <Icon name="Wallet" size={12} />
                                {rec.estimatedCost}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-gray-900 mb-1">{rec.title}</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{rec.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 text-white">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Нужна помощь с реализацией?</h3>
                  <p className="text-white/70 text-sm">
                    Найдём проверенных мастеров в вашем городе для мелкого ремонта, уборки и декора перед продажей.
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/masters")}
                  className="bg-white text-gray-900 hover:bg-white/90 font-bold h-12 px-6"
                >
                  Найти мастера
                  <Icon name="ArrowRight" size={18} className="ml-2" />
                </Button>
              </div>
            </div>

            <Button
              onClick={reset}
              variant="outline"
              className="w-full h-11"
            >
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Анализировать другое фото
            </Button>
          </div>
        )}

        {/* История отчётов — показываем если юзер авторизован и есть отчёты */}
        {userId && history.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon name="History" size={22} className="text-rose-500" />
                <h3 className="text-xl font-bold text-gray-900">Мои отчёты</h3>
                <span className="text-sm text-gray-400">({history.length})</span>
              </div>
              {historyLoading && <Icon name="Loader2" size={16} className="animate-spin text-gray-400" />}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.map((r) => (
                <div
                  key={r.id}
                  onClick={() => openReport(r.id)}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-rose-300 cursor-pointer overflow-hidden transition-all"
                >
                  {r.image_url ? (
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      <img src={r.image_url} alt={r.room_type} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-rose-100 to-fuchsia-100 flex items-center justify-center">
                      <Icon name="Home" size={40} className="text-rose-400" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 capitalize truncate">{r.room_type || "Помещение"}</h4>
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 flex-shrink-0">
                        <Icon name="Star" size={12} className="fill-amber-500 text-amber-500" />
                        {r.overall_score}/10
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{r.short_summary}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <button
                        onClick={(e) => deleteReport(r.id, e)}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                        aria-label="Удалить"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Benefits — показываем до первого результата */}
        {!result && (
          <section className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Зачем это нужно</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {BENEFITS.map((b, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                  <Icon name={b.icon} size={28} className="text-rose-500 mb-3" />
                  <h4 className="font-bold text-gray-900 mb-1.5 text-sm">{b.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{b.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* How it works */}
        {!result && (
          <section className="mt-12 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Как это работает</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { num: "1", icon: "Upload", title: "Загрузи фото", text: "Сфотографируй помещение с хорошего ракурса и загрузи в сервис" },
                { num: "2", icon: "Bot", title: "ИИ анализирует", text: "Искусственный интеллект оценивает комнату по 7 критериям хоумстейджинга" },
                { num: "3", icon: "ListChecks", title: "Получи рекомендации", text: "Конкретные пункты со стоимостью и приоритетом — что делать в первую очередь" },
              ].map((s) => (
                <div key={s.num} className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white font-bold text-lg flex items-center justify-center mb-3">
                    {s.num}
                  </div>
                  <Icon name={s.icon} size={20} className="text-rose-500 mb-2" />
                  <h4 className="font-bold text-gray-900 mb-1">{s.title}</h4>
                  <p className="text-sm text-gray-600">{s.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ — важно для SEO и Schema.org FAQPage */}
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 text-center">
            Частые вопросы о хоумстейджинге
          </h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {HOMESTAGING_FAQ.map((item, i) => (
              <details
                key={i}
                className="group bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 open:shadow-md transition-shadow"
              >
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg flex-1">{item.q}</h3>
                  <Icon
                    name="ChevronDown"
                    size={20}
                    className="text-rose-500 flex-shrink-0 mt-0.5 group-open:rotate-180 transition-transform"
                  />
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed text-sm sm:text-base">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* SEO-описание направления */}
        <section className="mt-12 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 prose prose-sm sm:prose-base max-w-none">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-4">
            Что такое хоумстейджинг и почему он работает
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Хоумстейджинг</strong> (от англ. <em>home staging</em> — «подготовка дома») —
            это профессиональная предпродажная подготовка жилья, которая делает квартиру
            привлекательной для максимально широкого круга покупателей. По данным американской
            Национальной ассоциации риэлторов, квартиры после хоумстейджинга продаются
            в среднем на 5–15% дороже и в 2–3 раза быстрее, чем аналогичные без подготовки.
          </p>
          <h3 className="text-lg font-bold text-gray-900 mt-5 mb-2">Ключевые принципы</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-1.5">
            <li><strong>Обезличивание</strong> — уберите семейные фото, магниты, личные вещи, чтобы покупатель представил там свою жизнь.</li>
            <li><strong>Свет и чистота</strong> — максимальная яркость, чистые окна, свежий воздух.</li>
            <li><strong>Нейтральная палитра</strong> — бежевые, серые, белые тона расширяют аудиторию покупателей.</li>
            <li><strong>Визуальный простор</strong> — уберите лишнюю мебель, откройте проходы, освободите поверхности.</li>
            <li><strong>Акценты</strong> — живые растения, свежий текстиль, новые шторы за небольшие деньги преображают кадр.</li>
            <li><strong>Мелкий ремонт</strong> — отремонтируйте мелкие дефекты: плинтусы, сколы краски, подтёки.</li>
          </ul>
          <h3 className="text-lg font-bold text-gray-900 mt-5 mb-2">Чем полезен ИИ-анализ</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Хоумстейджер в Москве берёт 15–40 тыс. ₽ за выезд и подготовку технического задания.
            Наш онлайн-сервис выполняет ту же задачу бесплатно: искусственный интеллект на базе
            GPT-4 с компьютерным зрением оценивает вашу комнату за 10–20 секунд и выдаёт
            персональный список улучшений с приоритетом «важно / средне / опция» и ориентировочной
            стоимостью по каждому пункту. Вы получаете те же рекомендации, что и у профессионала,
            но без расходов и ожидания.
          </p>
          <h3 className="text-lg font-bold text-gray-900 mt-5 mb-2">Когда это особенно актуально</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-1.5">
            <li>Продажа квартиры на вторичном рынке — выделиться среди похожих объявлений.</li>
            <li>Сдача квартиры в долгосрочную или посуточную аренду — повысить ставку.</li>
            <li>Подготовка к фотосъёмке объявления на Авито, Циан, ДомКлик.</li>
            <li>Организация виртуальных туров и видеообзоров.</li>
          </ul>
          <h3 className="text-lg font-bold text-gray-900 mt-5 mb-2">Полезные сервисы АВАНГАРД</h3>
          <p className="text-gray-700 leading-relaxed">
            После получения рекомендаций вы можете:
            найти исполнителей в разделе <a href="/masters" className="text-rose-600 hover:underline font-medium">«Мастера»</a>,
            рассчитать бюджет косметического ремонта
            через <a href="/turnkey" className="text-rose-600 hover:underline font-medium">калькулятор ремонта под ключ</a>,
            подобрать <a href="/furniture" className="text-rose-600 hover:underline font-medium">мебель и декор</a> или
            создать полноценный <a href="/designer" className="text-rose-600 hover:underline font-medium">дизайн-проект интерьера</a>.
          </p>
        </section>
      </main>
    </div>
  );
}