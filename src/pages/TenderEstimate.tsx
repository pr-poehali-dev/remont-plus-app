import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SEOMeta, { breadcrumbJsonLd } from "@/components/SEOMeta";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { toast } from "@/hooks/use-toast";
import { CALC_REGIONS } from "@/components/calculator/shared/regions";
import { SEASONS, seasonCoeff, seasonLabel, autoSeasonLabel } from "@/components/calculator/shared/seasonality";
import type { SeasonId } from "@/components/calculator/shared/seasonality";
import { extractFromFiles } from "@/lib/documentExtract";
import TenderEstimateTable from "@/components/tender/TenderEstimateTable";
import type { TenderResult } from "@/components/tender/TenderEstimateTable";
import OverheadsPanel from "@/components/calculator/shared/OverheadsPanel";
import { loadOverheads, saveOverheads } from "@/components/calculator/shared/overheads";
import type { OverheadState } from "@/components/calculator/shared/overheads";
import { exportTenderToExcel } from "@/components/tender/tenderExport";
import { printTenderKP } from "@/components/tender/tenderPrint";
import TenderAnalysisView from "@/components/tender/TenderAnalysisView";
import type { AnalyzeResult } from "@/components/tender/tenderAnalysis";
import funcUrls from "@/../backend/func2url.json";

const TENDER_URL = (funcUrls as Record<string, string>)["tender-estimate"];
const PAY_URL = (funcUrls as Record<string, string>)["yookassa-yookassa"];
const PAID_KEY = "tender_estimate_paid";
const TENDER_PRICE = 1490;
const MASTER_KEY = "tender_master";
// Секретный код автономного доступа (без оплаты). Активация: /tender?unlock=КОД
const MASTER_CODE = "avangard-2026";

export default function TenderEstimate() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [extracted, setExtracted] = useState<{ text: string; images: string[] } | null>(null);
  const [parsing, setParsing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"estimate" | "analyze">("estimate");
  const [result, setResult] = useState<TenderResult | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);

  const [regionId, setRegionId] = useState("moscow");
  const [seasonId, setSeasonId] = useState<SeasonId>("auto");
  const [markupPct, setMarkupPct] = useState(0);
  const [profitPct, setProfitPct] = useState(0);
  const [overheads, setOverheads] = useState<OverheadState>(loadOverheads);
  const [master, setMaster] = useState<boolean>(() => localStorage.getItem(MASTER_KEY) === "1");
  const [paid, setPaid] = useState<boolean>(() => localStorage.getItem(PAID_KEY) === "1" || localStorage.getItem(MASTER_KEY) === "1");
  const [unlocking, setUnlocking] = useState(false);

  // Автономный вход по секретному коду: /tender?unlock=КОД — сохраняется навсегда на устройстве
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("unlock") === MASTER_CODE) {
      localStorage.setItem(MASTER_KEY, "1");
      setMaster(true);
      setPaid(true);
      params.delete("unlock");
      const clean = window.location.pathname + (params.toString() ? `?${params}` : "");
      window.history.replaceState({}, "", clean);
      toast({ title: "Автономный доступ активирован", description: "Все расчёты открыты без оплаты" });
    }
  }, []);

  const updateOverheads = (next: OverheadState) => {
    setOverheads(next);
    saveOverheads(next);
  };

  const handleUnlock = async () => {
    let user: { id?: number; email?: string; name?: string } | null = null;
    try { user = JSON.parse(localStorage.getItem("avangard_user") || "null"); } catch { user = null; }

    let email = user?.email || localStorage.getItem("tender_email") || "";
    if (!email) {
      email = (window.prompt("Укажите email для чека и доступа к смете:", "") || "").trim();
      if (!email) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({ title: "Некорректный email", variant: "destructive" });
        return;
      }
      localStorage.setItem("tender_email", email);
    }

    setUnlocking(true);
    try {
      const resp = await fetch(PAY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: TENDER_PRICE,
          user_name: user?.name || "",
          user_email: email,
          description: "Смета по ТЗ (разовый расчёт)",
          return_url: window.location.href,
          cart_items: [{ id: "tender_estimate", name: "Смета по ТЗ (разовый расчёт)", price: TENDER_PRICE, quantity: 1 }],
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.payment_url) throw new Error(data.error || "Не удалось создать оплату");
      localStorage.setItem("tender_pending_order", data.order_number || "");
      window.location.href = data.payment_url;
    } catch (e) {
      toast({ title: "Оплата недоступна", description: e instanceof Error ? e.message : "", variant: "destructive" });
      setUnlocking(false);
    }
  };

  useEffect(() => {
    const orderNumber = localStorage.getItem("tender_pending_order");
    if (!orderNumber || paid) return;
    fetch(PAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check_status", order_number: orderNumber }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.status === "paid") {
          localStorage.setItem(PAID_KEY, "1");
          localStorage.removeItem("tender_pending_order");
          setPaid(true);
          toast({ title: "Оплата получена", description: "Смета открыта полностью" });
        }
      })
      .catch(() => {});
  }, [paid]);

  const region = CALC_REGIONS.find((r) => r.id === regionId) ?? CALC_REGIONS[0];
  const sCoeff = seasonCoeff(seasonId);
  const workCoeff = region.coeff * sCoeff;

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).slice(0, 8);
    setFileNames(arr.map((f) => f.name));
    setParsing(true);
    try {
      const res = await extractFromFiles(arr);
      setExtracted(res);
      if (res.text && !text) setText(res.text.slice(0, 12000));
      if (res.images.length > 0) {
        toast({ title: "Документы готовы", description: `Распознаём ${res.images.length} стр. сканов через ИИ` });
      } else if (res.text) {
        toast({ title: "Текст извлечён", description: "Проверьте и запустите расчёт" });
      } else {
        toast({ title: "Не удалось прочитать", description: "Попробуйте другой файл или вставьте текст", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка чтения файла", variant: "destructive" });
    } finally {
      setParsing(false);
    }
  }, [text]);

  const runEstimate = async () => {
    const payloadText = (text || extracted?.text || "").trim();
    const images = extracted?.images ?? [];
    if (!payloadText && images.length === 0) {
      toast({
        title: mode === "analyze" ? "Добавьте смету" : "Добавьте ТЗ",
        description: mode === "analyze"
          ? "Загрузите готовую смету заказчика (Excel, PDF, фото)"
          : "Загрузите документ или вставьте текст задания",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setResult(null);
    setAnalyzeResult(null);
    if (!master) {
      setPaid(false);
      localStorage.removeItem(PAID_KEY);
    }
    try {
      const resp = await fetch(TENDER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: payloadText, images, mode }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Ошибка обработки");
      if (mode === "analyze" || data.mode === "analyze") {
        setAnalyzeResult(data as AnalyzeResult);
        toast({ title: "Анализ готов", description: `Проверено позиций: ${data.items?.length ?? 0}` });
      } else {
        setResult(data as TenderResult);
        toast({ title: "Смета готова", description: `Позиций: ${data.items?.length ?? 0}` });
      }
    } catch (e) {
      toast({ title: "Не удалось обработать", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOMeta
        title="Смета по ТЗ онлайн — расчёт для тендера по PDF и фото"
        description="Загрузите техническое задание в PDF, скан или фото — ИИ распознает позиции и оценит стоимость работ и материалов по расценкам 2026. Быстрый расчёт сметы для тендера."
        keywords="смета по ТЗ, расчёт сметы для тендера, распознать смету pdf, оценка стоимости ремонта по документам"
        path="/tender"
        jsonLd={[breadcrumbJsonLd([{ name: "Главная", url: "/" }, { name: "Смета по ТЗ", url: "/tender" }])]}
      />

      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-gray-400 hover:text-gray-600">
            <Icon name="ArrowLeft" size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Icon name="FileText" size={20} className="text-teal-600" /> Смета по ТЗ
            </h1>
            <p className="text-xs text-gray-500">Загрузите PDF, скан или фото задания — получите смету для тендера</p>
          </div>
          {master && (
            <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Icon name="ShieldCheck" size={13} /> Автономный доступ
            </span>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 grid lg:grid-cols-5 gap-6">
        {/* Левая колонка — ввод */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-2">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setMode("estimate")}
                className={`rounded-lg py-2.5 px-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
                  mode === "estimate" ? "bg-teal-600 text-white shadow" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon name="Calculator" size={16} /> Посчитать по ТЗ
              </button>
              <button
                onClick={() => setMode("analyze")}
                className={`rounded-lg py-2.5 px-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
                  mode === "analyze" ? "bg-indigo-600 text-white shadow" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon name="ChartLine" size={16} /> Анализ сметы
              </button>
            </div>
            <p className="text-xs text-gray-400 px-2 py-1.5">
              {mode === "estimate"
                ? "Загрузите ТЗ — рассчитаем стоимость работ и материалов."
                : "Загрузите готовую смету заказчика — покажем вашу прибыль и риски."}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">1. Загрузите документы</p>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/40 transition"
            >
              <Icon name="Upload" size={28} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Excel, PDF, JPG, PNG — ТЗ, смета Estimate, фото документа</p>
              <p className="text-xs text-gray-400 mt-1">Нажмите или перетащите файлы</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.xlsx,.xls,.csv,image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            {parsing && (
              <p className="text-xs text-teal-600 mt-2 flex items-center gap-1">
                <Icon name="LoaderCircle" size={13} className="animate-spin" /> Читаем документы…
              </p>
            )}
            {fileNames.length > 0 && !parsing && (
              <div className="mt-3 space-y-1">
                {fileNames.map((n, i) => (
                  <div key={i} className="text-xs text-gray-600 flex items-center gap-1">
                    <Icon name="File" size={12} /> {n}
                  </div>
                ))}
                {extracted?.images.length ? (
                  <p className="text-xs text-gray-400">{extracted.images.length} стр. будут распознаны через ИИ (OCR)</p>
                ) : null}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">2. Или вставьте текст ТЗ</p>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Например: Штукатурка стен 45 м². Стяжка пола 30 м². Укладка плитки на пол 30 м². Установка унитаза и раковины…"
              className="min-h-[140px] text-sm"
            />
          </Card>

          {mode === "estimate" ? (
          <Card className="p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase">3. Параметры расчёта</p>

            <div>
              <label className="text-xs text-gray-500">Регион</label>
              <select
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                {CALC_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>{r.label} (×{r.coeff})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500">Сезон (влияет на работы)</label>
              <select
                value={seasonId}
                onChange={(e) => setSeasonId(e.target.value as SeasonId)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="auto">Авто по месяцу — {autoSeasonLabel()}</option>
                {SEASONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label} (×{s.coeff})</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Работы × {workCoeff.toFixed(2)} (регион × сезон {sCoeff.toFixed(2)})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Наценка, %</label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={markupPct}
                  onChange={(e) => setMarkupPct(Math.max(0, Math.min(200, parseFloat(e.target.value) || 0)))}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Сметная прибыль, %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={profitPct}
                  onChange={(e) => setProfitPct(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <OverheadsPanel value={overheads} onChange={updateOverheads} className="pt-1" />

            <Button onClick={runEstimate} disabled={loading || parsing} className="w-full bg-teal-600 hover:bg-teal-700">
              {loading ? (
                <><Icon name="LoaderCircle" size={16} className="animate-spin mr-2" /> Считаем смету…</>
              ) : (
                <><Icon name="Calculator" size={16} className="mr-2" /> Рассчитать смету</>
              )}
            </Button>
          </Card>
          ) : (
            <Card className="p-5">
              <Button onClick={runEstimate} disabled={loading || parsing} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {loading ? (
                  <><Icon name="LoaderCircle" size={16} className="animate-spin mr-2" /> Анализируем смету…</>
                ) : (
                  <><Icon name="ChartLine" size={16} className="mr-2" /> Проанализировать смету</>
                )}
              </Button>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Покажем вашу прибыль по позициям, риски и забытые работы
              </p>
            </Card>
          )}
        </div>

        {/* Правая колонка — результат */}
        <div className="lg:col-span-3 space-y-4">
          {analyzeResult ? (
            <TenderAnalysisView
              data={analyzeResult}
              locked={!paid}
              onUnlock={handleUnlock}
              unlocking={unlocking}
              price={TENDER_PRICE}
            />
          ) : result ? (
            <>
            <TenderEstimateTable
              result={result}
              workCoeff={workCoeff}
              markupPct={markupPct}
              overheads={overheads}
              profitPct={profitPct}
              locked={!paid}
              onUnlock={handleUnlock}
              unlocking={unlocking}
              price={TENDER_PRICE}
            />
            {paid && (
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => exportTenderToExcel(result, workCoeff, markupPct, overheads, profitPct)}
                  className="flex-1"
                >
                  <Icon name="Sheet" size={16} className="mr-2" /> Скачать Excel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => printTenderKP(result, workCoeff, markupPct, overheads, profitPct)}
                  className="flex-1"
                >
                  <Icon name="Printer" size={16} className="mr-2" /> Печать / PDF
                </Button>
              </div>
            )}
            </>
          ) : (
            <Card className="p-10 text-center text-gray-400 h-full flex flex-col items-center justify-center">
              <Icon name={mode === "analyze" ? "ChartLine" : "FileSearch"} size={44} className="mb-3 opacity-40" />
              <p className="text-sm max-w-xs">
                {mode === "analyze"
                  ? "Загрузите готовую смету заказчика (Excel, PDF, фото) — ИИ посчитает вашу прибыль, выделит выгодные и убыточные позиции, риски и забытые работы."
                  : "Загрузите ТЗ или вставьте текст — ИИ распознает позиции и оценит стоимость работ и материалов по вашим расценкам 2026 и рынку."}
              </p>
              {mode === "estimate" && (
                <p className="text-xs mt-3 text-gray-400">
                  Сезон учтён: {seasonLabel(seasonId)} · работы ×{workCoeff.toFixed(2)}
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}