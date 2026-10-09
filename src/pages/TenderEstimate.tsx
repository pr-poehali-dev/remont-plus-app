import { useState, useCallback, useEffect } from "react";
import SEOMeta, { breadcrumbJsonLd } from "@/components/SEOMeta";
import { toast } from "@/hooks/use-toast";
import { CALC_REGIONS } from "@/components/calculator/shared/regions";
import { seasonCoeff } from "@/components/calculator/shared/seasonality";
import type { SeasonId } from "@/components/calculator/shared/seasonality";
import { extractFromFiles } from "@/lib/documentExtract";
import type { TenderResult } from "@/components/tender/TenderEstimateTable";
import { loadOverheads, saveOverheads } from "@/components/calculator/shared/overheads";
import type { OverheadState } from "@/components/calculator/shared/overheads";
import type { AnalyzeResult } from "@/components/tender/tenderAnalysis";
import { computeTenderTotals, DEFAULT_DISCOUNT, type DiscountState } from "@/components/tender/tenderTotals";
import MyEstimatesModal from "@/components/tender/MyEstimatesModal";
import ContractModal from "@/components/tender/ContractModal";
import { printContract, type ContractParty } from "@/components/tender/tenderContract";
import { saveEstimate, getEstimate, canSaveEstimates, type EstimatePayload } from "@/components/tender/tenderStorage";
import { isMasterAccess } from "@/lib/masterAccess";
import funcUrls from "@/../backend/func2url.json";
import TenderHeader from "@/components/tender/page/TenderHeader";
import TenderInputPanel from "@/components/tender/page/TenderInputPanel";
import TenderParamsCard from "@/components/tender/page/TenderParamsCard";
import TenderResultPanel from "@/components/tender/page/TenderResultPanel";

const TENDER_URL = (funcUrls as Record<string, string>)["tender-estimate"];
const PAY_URL = (funcUrls as Record<string, string>)["yookassa-yookassa"];
const PAID_KEY = "tender_estimate_paid";
const TENDER_PRICE = 1490;

export default function TenderEstimate() {
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
  const master = isMasterAccess();
  const [paid, setPaid] = useState<boolean>(() => localStorage.getItem(PAID_KEY) === "1" || isMasterAccess());
  const [unlocking, setUnlocking] = useState(false);

  const [discount, setDiscount] = useState<DiscountState>(DEFAULT_DISCOUNT);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showMyEstimates, setShowMyEstimates] = useState(false);
  const [showContract, setShowContract] = useState(false);

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
      const msg = e instanceof Error ? e.message : "";
      const isNetwork = e instanceof TypeError || /Failed to fetch|NetworkError|network/i.test(msg);
      toast({
        title: "Не удалось обработать",
        description: isNetwork
          ? "Документ слишком большой — расчёт прервался. Оставьте 1–3 главные страницы или вставьте текст сметы в поле и повторите."
          : msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result && !analyzeResult) return;
    if (!canSaveEstimates()) {
      const email = (window.prompt("Укажите email, чтобы сохранять сметы и открывать их с любого устройства:", "") || "").trim();
      if (!email) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({ title: "Некорректный email", variant: "destructive" });
        return;
      }
      localStorage.setItem("tender_email", email);
    }
    setSaving(true);
    try {
      let title = "Смета по ТЗ";
      let total = 0;
      if (result) {
        title = result.title || title;
        total = computeTenderTotals(result, workCoeff, markupPct, overheads, profitPct, discount).total;
      } else if (analyzeResult) {
        title = analyzeResult.title || "Анализ сметы";
        total = analyzeResult.analysis?.revenue || 0;
      }
      const payload: EstimatePayload = {
        result, analyzeResult: analyzeResult ?? undefined,
        regionId, seasonId, markupPct, profitPct, overheads, discount,
      };
      const id = await saveEstimate({
        id: currentId ?? undefined,
        title,
        mode: analyzeResult ? "analyze" : "estimate",
        total,
        payload,
      });
      setCurrentId(id);
      toast({ title: currentId ? "Смета обновлена" : "Смета сохранена", description: "Доступна в разделе «Мои сметы»" });
    } catch (e) {
      toast({ title: "Не удалось сохранить", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenSaved = async (id: number, duplicate = false) => {
    setShowMyEstimates(false);
    try {
      const est = await getEstimate(id);
      const p = est.payload;
      if (p.regionId) setRegionId(p.regionId);
      if (p.seasonId) setSeasonId(p.seasonId as SeasonId);
      setMarkupPct(p.markupPct ?? 0);
      setProfitPct(p.profitPct ?? 0);
      if (p.overheads) updateOverheads(p.overheads as OverheadState);
      setDiscount(p.discount ?? DEFAULT_DISCOUNT);
      setResult((p.result as TenderResult) ?? null);
      setAnalyzeResult((p.analyzeResult as AnalyzeResult) ?? null);
      setMode(p.analyzeResult ? "analyze" : "estimate");
      setCurrentId(duplicate ? null : id);
      if (master || localStorage.getItem(PAID_KEY) === "1") setPaid(true);
      toast({ title: duplicate ? "Создана копия" : "Смета открыта", description: duplicate ? "Сохраните как новую" : est.title });
    } catch (e) {
      toast({ title: "Не удалось открыть", description: e instanceof Error ? e.message : "", variant: "destructive" });
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

      <TenderHeader master={master} onOpenMyEstimates={() => setShowMyEstimates(true)} />

      <div className="container mx-auto px-4 py-6 grid lg:grid-cols-5 gap-6">
        {/* Левая колонка — ввод */}
        <div className="lg:col-span-2 space-y-4">
          <TenderInputPanel
            mode={mode}
            onModeChange={setMode}
            onFiles={handleFiles}
            parsing={parsing}
            fileNames={fileNames}
            extracted={extracted}
            text={text}
            onTextChange={setText}
          />

          <TenderParamsCard
            mode={mode}
            regionId={regionId}
            onRegionChange={setRegionId}
            seasonId={seasonId}
            onSeasonChange={setSeasonId}
            workCoeff={workCoeff}
            sCoeff={sCoeff}
            markupPct={markupPct}
            onMarkupChange={setMarkupPct}
            profitPct={profitPct}
            onProfitChange={setProfitPct}
            overheads={overheads}
            onOverheadsChange={updateOverheads}
            onRun={runEstimate}
            loading={loading}
            parsing={parsing}
          />
        </div>

        {/* Правая колонка — результат */}
        <div className="lg:col-span-3 space-y-4">
          <TenderResultPanel
            mode={mode}
            seasonId={seasonId}
            result={result}
            onResultChange={setResult}
            analyzeResult={analyzeResult}
            paid={paid}
            onUnlock={handleUnlock}
            unlocking={unlocking}
            price={TENDER_PRICE}
            workCoeff={workCoeff}
            markupPct={markupPct}
            overheads={overheads}
            profitPct={profitPct}
            discount={discount}
            onDiscountChange={setDiscount}
            onSave={handleSave}
            saving={saving}
            currentId={currentId}
            onOpenContract={() => setShowContract(true)}
          />
        </div>
      </div>

      {showMyEstimates && (
        <MyEstimatesModal onClose={() => setShowMyEstimates(false)} onOpen={handleOpenSaved} />
      )}

      {showContract && result && (
        <ContractModal
          totalWithDiscount={computeTenderTotals(result, workCoeff, markupPct, overheads, profitPct, discount).total}
          onClose={() => setShowContract(false)}
          onPrint={(party: ContractParty) => {
            printContract(result, workCoeff, markupPct, overheads, profitPct, discount, party);
            setShowContract(false);
          }}
        />
      )}
    </div>
  );
}
