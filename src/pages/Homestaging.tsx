import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useMeta } from "@/hooks/useMeta";
import SEOMeta from "@/components/SEOMeta";
import HomePromoBanner from "@/components/home/HomePromoBanner";
import HomestagingUpload from "./homestaging/HomestagingUpload";
import HomestagingResult from "./homestaging/HomestagingResult";
import HomestagingInfo from "./homestaging/HomestagingInfo";
import {
  ANALYZE_URL,
  REPORTS_URL,
  MAX_FILE_SIZE,
  HOMESTAGING_JSON_LD,
  ReportListItem,
  AnalysisResult,
  fileToBase64,
} from "./homestaging/HomestagingTypes";

export default function Homestaging() {
  useMeta({
    title: "Хоумстейджинг онлайн — ИИ-анализ фото квартиры перед продажей",
    description: "Бесплатный сервис предпродажной подготовки квартиры: загрузите фото комнаты и получите 5–10 персональных рекомендаций ИИ по уборке, освещению и декору. Продайте жильё на 5–15% дороже и в 2–3 раза быстрее.",
    keywords: "хоумстейджинг, home staging, предпродажная подготовка квартиры, как продать квартиру дороже, как быстро продать квартиру, стейджинг квартиры, подготовка квартиры к продаже, подготовка квартиры к сдаче в аренду, фото квартиры для объявления, оценка квартиры по фото, анализ интерьера ИИ",
    canonical: "/homestaging",
  });

  const navigate = useNavigate();

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

      <HomestagingUpload
        previewUrl={previewUrl}
        imageBase64={imageBase64}
        note={note}
        loading={loading}
        error={error}
        userId={userId}
        onSetNote={setNote}
        onFile={handleFile}
        onReset={reset}
        onAnalyze={analyze}
      />

      <main className="max-w-6xl mx-auto px-4 pb-8 sm:pb-12">
        {result && <HomestagingResult result={result} onReset={reset} />}

        <HomestagingInfo
          userId={userId}
          history={history}
          historyLoading={historyLoading}
          hasResult={!!result}
          onOpenReport={openReport}
          onDeleteReport={deleteReport}
        />
      </main>
    </div>
  );
}
