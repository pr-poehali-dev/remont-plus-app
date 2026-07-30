import { useState, useRef, useCallback } from "react";
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
import funcUrls from "@/../backend/func2url.json";

const TENDER_URL = (funcUrls as Record<string, string>)["tender-estimate"];

export default function TenderEstimate() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [extracted, setExtracted] = useState<{ text: string; images: string[] } | null>(null);
  const [parsing, setParsing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TenderResult | null>(null);

  const [regionId, setRegionId] = useState("moscow");
  const [seasonId, setSeasonId] = useState<SeasonId>("auto");
  const [markupPct, setMarkupPct] = useState(0);
  const [overheads, setOverheads] = useState<OverheadState>(loadOverheads);

  const updateOverheads = (next: OverheadState) => {
    setOverheads(next);
    saveOverheads(next);
  };

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
      toast({ title: "Добавьте ТЗ", description: "Загрузите документ или вставьте текст задания", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch(TENDER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: payloadText, images }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Ошибка расчёта");
      setResult(data as TenderResult);
      toast({ title: "Смета готова", description: `Позиций: ${data.items?.length ?? 0}` });
    } catch (e) {
      toast({ title: "Не удалось рассчитать", description: e instanceof Error ? e.message : "", variant: "destructive" });
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
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 grid lg:grid-cols-5 gap-6">
        {/* Левая колонка — ввод */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">1. Загрузите документы</p>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/40 transition"
            >
              <Icon name="Upload" size={28} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">PDF, JPG, PNG — ТЗ, смета Estimate, фото документа</p>
              <p className="text-xs text-gray-400 mt-1">Нажмите или перетащите файлы</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
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

            <OverheadsPanel value={overheads} onChange={updateOverheads} className="pt-1" />

            <Button onClick={runEstimate} disabled={loading || parsing} className="w-full bg-teal-600 hover:bg-teal-700">
              {loading ? (
                <><Icon name="LoaderCircle" size={16} className="animate-spin mr-2" /> Считаем смету…</>
              ) : (
                <><Icon name="Calculator" size={16} className="mr-2" /> Рассчитать смету</>
              )}
            </Button>
          </Card>
        </div>

        {/* Правая колонка — результат */}
        <div className="lg:col-span-3">
          {result ? (
            <TenderEstimateTable result={result} workCoeff={workCoeff} markupPct={markupPct} overheads={overheads} />
          ) : (
            <Card className="p-10 text-center text-gray-400 h-full flex flex-col items-center justify-center">
              <Icon name="FileSearch" size={44} className="mb-3 opacity-40" />
              <p className="text-sm max-w-xs">
                Загрузите ТЗ или вставьте текст — ИИ распознает позиции и оценит стоимость
                работ и материалов по вашим расценкам 2026 и рынку.
              </p>
              <p className="text-xs mt-3 text-gray-400">
                Сезон учтён: {seasonLabel(seasonId)} · работы ×{workCoeff.toFixed(2)}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}