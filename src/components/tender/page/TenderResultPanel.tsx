import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { seasonLabel } from "@/components/calculator/shared/seasonality";
import type { SeasonId } from "@/components/calculator/shared/seasonality";
import TenderEstimateTable from "@/components/tender/TenderEstimateTable";
import type { TenderResult } from "@/components/tender/TenderEstimateTable";
import type { OverheadState } from "@/components/calculator/shared/overheads";
import { exportTenderToExcel } from "@/components/tender/tenderExport";
import { printTenderKP } from "@/components/tender/tenderPrint";
import TenderAnalysisView from "@/components/tender/TenderAnalysisView";
import type { AnalyzeResult } from "@/components/tender/tenderAnalysis";
import { computeTenderTotals, type DiscountState } from "@/components/tender/tenderTotals";
import DiscountPanel from "@/components/tender/DiscountPanel";

interface Props {
  mode: "estimate" | "analyze";
  seasonId: SeasonId;
  result: TenderResult | null;
  onResultChange: (result: TenderResult) => void;
  analyzeResult: AnalyzeResult | null;
  paid: boolean;
  onUnlock: () => void;
  unlocking: boolean;
  price: number;
  workCoeff: number;
  markupPct: number;
  overheads: OverheadState;
  profitPct: number;
  discount: DiscountState;
  onDiscountChange: (d: DiscountState) => void;
  onSave: () => void;
  saving: boolean;
  currentId: number | null;
  onOpenContract: () => void;
}

export default function TenderResultPanel({
  mode,
  seasonId,
  result,
  onResultChange,
  analyzeResult,
  paid,
  onUnlock,
  unlocking,
  price,
  workCoeff,
  markupPct,
  overheads,
  profitPct,
  discount,
  onDiscountChange,
  onSave,
  saving,
  currentId,
  onOpenContract,
}: Props) {
  return analyzeResult ? (
    <>
      <TenderAnalysisView
        data={analyzeResult}
        locked={!paid}
        onUnlock={onUnlock}
        unlocking={unlocking}
        price={price}
      />
      {paid && (
        <Button onClick={onSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
          {saving ? (
            <><Icon name="LoaderCircle" size={16} className="mr-2 animate-spin" /> Сохраняем…</>
          ) : (
            <><Icon name="Save" size={16} className="mr-2" /> {currentId ? "Обновить" : "Сохранить анализ"}</>
          )}
        </Button>
      )}
    </>
  ) : result ? (
    <>
    <TenderEstimateTable
      result={result}
      workCoeff={workCoeff}
      markupPct={markupPct}
      overheads={overheads}
      profitPct={profitPct}
      locked={!paid}
      onUnlock={onUnlock}
      unlocking={unlocking}
      price={price}
      onItemsChange={(items) => onResultChange({ ...result, items })}
      discount={discount}
    />
    {paid && (
      <DiscountPanel
        value={discount}
        onChange={onDiscountChange}
        discountAmount={computeTenderTotals(result, workCoeff, markupPct, overheads, profitPct, discount).discount}
      />
    )}
    {paid && (
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onSave}
          disabled={saving}
          className="flex-1 bg-teal-600 hover:bg-teal-700 min-w-[140px]"
        >
          {saving ? (
            <><Icon name="LoaderCircle" size={16} className="mr-2 animate-spin" /> Сохраняем…</>
          ) : (
            <><Icon name="Save" size={16} className="mr-2" /> {currentId ? "Обновить смету" : "Сохранить смету"}</>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => exportTenderToExcel(result, workCoeff, markupPct, overheads, profitPct, discount)}
          className="flex-1 min-w-[140px]"
        >
          <Icon name="Sheet" size={16} className="mr-2" /> Скачать Excel
        </Button>
        <Button
          variant="outline"
          onClick={() => printTenderKP(result, workCoeff, markupPct, overheads, profitPct, discount)}
          className="flex-1 min-w-[140px]"
        >
          <Icon name="Printer" size={16} className="mr-2" /> Печать / PDF
        </Button>
        <Button
          variant="outline"
          onClick={onOpenContract}
          className="flex-1 min-w-[140px] border-teal-300 text-teal-700 hover:bg-teal-50"
        >
          <Icon name="FileSignature" size={16} className="mr-2" /> Договор
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
  );
}
