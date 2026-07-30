import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import type { OverheadState } from "@/components/calculator/shared/overheads";
import { computeTenderTotals } from "./tenderTotals";

export interface TenderItem {
  name: string;
  type: "work" | "material";
  unit: string;
  qty: number;
  pricePerUnit: number;
  total: number;
  source: "book" | "estimated";
  note: string;
}

export interface TenderResult {
  title: string;
  summary: string;
  items: TenderItem[];
  worksTotal: number;
  materialsTotal: number;
  subtotal: number;
  warnings: string[];
}

const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU");

interface Props {
  result: TenderResult;
  /** множитель к работам (регион × сезон) */
  workCoeff: number;
  markupPct: number;
  overheads: OverheadState;
  profitPct: number;
  /** true — детали скрыты (не оплачено), показываем только итог */
  locked?: boolean;
  onUnlock?: () => void;
  unlocking?: boolean;
}

export default function TenderEstimateTable({ result, workCoeff, markupPct, overheads, profitPct, locked = false, onUnlock, unlocking }: Props) {
  const t = computeTenderTotals(result, workCoeff, markupPct, overheads, profitPct);
  const { works, materials, worksTotal, materialsTotal, total } = t;

  const renderRows = (rows: TenderItem[]) =>
    rows.map((it, i) => (
      <tr key={i} className="border-b border-gray-100">
        <td className="py-2 pr-2">
          <div className="text-sm text-gray-900">{it.name}</div>
          {it.note && <div className="text-xs text-amber-600">{it.note}</div>}
        </td>
        <td className="py-2 px-2 text-right text-sm tabular-nums whitespace-nowrap">
          {it.qty} {it.unit}
        </td>
        <td className="py-2 px-2 text-right text-sm tabular-nums whitespace-nowrap">{fmt(it.pricePerUnit)} ₽</td>
        <td className="py-2 pl-2 text-right text-sm font-medium tabular-nums whitespace-nowrap">{fmt(it.total)} ₽</td>
        <td className="py-2 pl-2 text-center">
          {it.source === "book" ? (
            <span title="Ваша расценка" className="text-emerald-600"><Icon name="BadgeCheck" size={15} /></span>
          ) : (
            <span title="Оценка ИИ по рынку" className="text-gray-400"><Icon name="Sparkles" size={15} /></span>
          )}
        </td>
      </tr>
    ));

  return (
    <Card className="p-5">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">{result.title}</h2>
        {result.summary && <p className="text-sm text-gray-500 mt-1">{result.summary}</p>}
      </div>

      {result.warnings.length > 0 && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
            <Icon name="TriangleAlert" size={13} /> Уточнить у заказчика
          </p>
          <ul className="text-xs text-amber-700 list-disc pl-4 space-y-0.5">
            {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className={`overflow-x-auto relative ${locked ? "select-none" : ""}`}>
        {locked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-lg">
            <div className="bg-white shadow-lg border border-gray-200 rounded-xl px-6 py-5 text-center max-w-xs">
              <Icon name="Lock" size={28} className="mx-auto text-teal-600 mb-2" />
              <p className="text-sm font-semibold text-gray-900">Детализация скрыта</p>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Итоговая сумма видна. Откройте позиции, цены и экспорт за разовую оплату.
              </p>
              {onUnlock && (
                <Button onClick={onUnlock} disabled={unlocking} className="w-full bg-teal-600 hover:bg-teal-700">
                  {unlocking ? (
                    <><Icon name="LoaderCircle" size={15} className="animate-spin mr-2" /> Открываем…</>
                  ) : (
                    <><Icon name="Unlock" size={15} className="mr-2" /> Открыть смету — 490 ₽</>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
        <table className={`w-full ${locked ? "blur-[6px] pointer-events-none" : ""}`}>
          <thead>
            <tr className="border-b-2 border-gray-200 text-xs text-gray-500 uppercase">
              <th className="py-2 pr-2 text-left font-medium">Наименование</th>
              <th className="py-2 px-2 text-right font-medium">Кол-во</th>
              <th className="py-2 px-2 text-right font-medium">Цена</th>
              <th className="py-2 pl-2 text-right font-medium">Сумма</th>
              <th className="py-2 pl-2 text-center font-medium">Ист.</th>
            </tr>
          </thead>
          <tbody>
            {works.length > 0 && (
              <>
                <tr><td colSpan={5} className="pt-3 pb-1 text-xs font-bold text-teal-700 uppercase">Работы</td></tr>
                {renderRows(works)}
                <tr className="border-b border-gray-200">
                  <td colSpan={3} className="py-2 text-right text-sm font-semibold text-gray-600">Итого работы</td>
                  <td className="py-2 pl-2 text-right text-sm font-bold tabular-nums">{fmt(worksTotal)} ₽</td>
                  <td></td>
                </tr>
              </>
            )}
            {materials.length > 0 && (
              <>
                <tr><td colSpan={5} className="pt-3 pb-1 text-xs font-bold text-orange-700 uppercase">Материалы</td></tr>
                {renderRows(materials)}
                <tr className="border-b border-gray-200">
                  <td colSpan={3} className="py-2 text-right text-sm font-semibold text-gray-600">Итого материалы</td>
                  <td className="py-2 pl-2 text-right text-sm font-bold tabular-nums">{fmt(materialsTotal)} ₽</td>
                  <td></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t-2 border-gray-200 space-y-1">
        {!locked && t.extraLines.map((l) => (
          <div key={l.key} className="flex justify-between text-sm text-gray-500">
            <span>{l.label}</span>
            <span className="tabular-nums">+ {fmt(l.amount)} ₽</span>
          </div>
        ))}
        <div className="flex justify-between items-baseline">
          <span className="text-base font-bold text-gray-900">ИТОГО по смете</span>
          <span className="text-xl font-extrabold text-teal-700 tabular-nums">{fmt(total)} ₽</span>
        </div>
        <p className="text-xs text-gray-400 flex items-center gap-1 pt-1">
          <Icon name="BadgeCheck" size={12} className="text-emerald-600" /> — ваша расценка,
          <Icon name="Sparkles" size={12} className="text-gray-400 ml-1" /> — оценка ИИ по рынку
        </p>
      </div>
    </Card>
  );
}