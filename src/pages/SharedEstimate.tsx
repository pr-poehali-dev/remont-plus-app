import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { SharedEstimate as ShareData, decodePayload, readShareFromStorage, formatRub } from "@/lib/shareEstimate";
import { useMeta } from "@/hooks/useMeta";

export default function SharedEstimate() {
  const { token = "" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ShareData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useMeta({
    title: "Смета · АВАНГАРД",
    description: "Сметы на ремонт и строительство — посмотрите детальный расчёт онлайн.",
    canonical: `/estimate/shared/${token}`,
  });

  useEffect(() => {
    const local = readShareFromStorage(token);
    if (local) { setData(local); return; }
    const d = params.get("d");
    if (d) {
      const decoded = decodePayload(d);
      if (decoded) { setData(decoded); return; }
    }
    setNotFound(true);
  }, [token, params]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <Icon name="FileSearch" size={48} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Смета не найдена</h1>
          <p className="text-sm text-gray-500 mb-6">
            Возможно, ссылка устарела или была открыта на другом устройстве. Попросите автора прислать актуальную ссылку.
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            <Icon name="Home" size={16} className="mr-2" />
            На главную
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={32} className="animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 hover:bg-gray-100 rounded-lg">
            <Icon name="ArrowLeft" size={20} />
          </button>
          <div className="flex-1">
            <p className="text-xs text-gray-500">Смета — АВАНГАРД</p>
            <p className="font-bold text-gray-900">{data.title}</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <Icon name="Share2" size={14} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">Поделено</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-wrap items-start gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                <Icon name="FileText" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{data.type || "Смета"}</p>
                <h1 className="font-bold text-gray-900 text-lg">{data.title}</h1>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Итого</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{formatRub(data.total)} ₽</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {data.region && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Регион</p>
                <p className="font-semibold text-gray-900">{data.region}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Создано</p>
              <p className="font-semibold text-gray-900">
                {new Date(data.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            {data.author && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Автор</p>
                <p className="font-semibold text-gray-900">{data.author}</p>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        {data.items && data.items.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <Icon name="ListChecks" size={18} className="text-amber-500" />
              <h2 className="font-bold text-gray-900">Состав сметы</h2>
              <span className="text-xs text-gray-400 ml-auto">{data.items.length} поз.</span>
            </div>
            <div className="divide-y divide-gray-100">
              {data.items.map((it, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{it.name}</p>
                    {it.qty && (
                      <p className="text-xs text-gray-500">
                        {it.qty} {it.unit || "шт"}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-900 shrink-0">{formatRub(it.price)} ₽</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Хотите такой же расчёт?</h3>
              <p className="text-white/70 text-sm">
                Создайте свою смету за 2 минуты — калькуляторы АВАНГАРД учитывают цены вашего региона.
              </p>
            </div>
            <Button
              onClick={() => navigate("/")}
              className="bg-white text-gray-900 hover:bg-white/90 font-bold h-12 px-6"
            >
              Создать смету
              <Icon name="ArrowRight" size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
