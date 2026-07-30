import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { VERDICT_META, fmtRub } from "./tenderAnalysis";
import type { AnalyzeResult } from "./tenderAnalysis";

interface Props {
  data: AnalyzeResult;
  locked?: boolean;
  onUnlock?: () => void;
  unlocking?: boolean;
}

export default function TenderAnalysisView({ data, locked = false, onUnlock, unlocking }: Props) {
  const a = data.analysis;
  const marginPositive = a.margin >= 0;
  const verdictTone =
    a.marginPct >= 20 ? "emerald" : a.marginPct >= 8 ? "amber" : "red";
  const toneCls = {
    emerald: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-orange-500",
    red: "from-red-500 to-rose-600",
  }[verdictTone];

  return (
    <>
      {/* Сводка анализа */}
      <Card className="overflow-hidden">
        <div className={`bg-gradient-to-r ${toneCls} p-5 text-white`}>
          <div className="flex items-center gap-2 text-sm opacity-90 mb-1">
            <Icon name="ChartLine" size={16} /> Анализ выгоды по смете заказчика
          </div>
          <h2 className="text-lg font-bold">{data.title}</h2>
          {data.summary && <p className="text-sm opacity-90 mt-1">{data.summary}</p>}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div>
              <div className="text-xs opacity-80">Выручка (заказчик)</div>
              <div className="text-lg font-extrabold tabular-nums">{fmtRub(a.revenue)} ₽</div>
            </div>
            <div>
              <div className="text-xs opacity-80">Себестоимость</div>
              <div className="text-lg font-extrabold tabular-nums">{fmtRub(a.cost)} ₽</div>
            </div>
            <div>
              <div className="text-xs opacity-80">{marginPositive ? "Ваша прибыль" : "Убыток"}</div>
              <div className="text-lg font-extrabold tabular-nums">
                {marginPositive ? "+" : ""}{fmtRub(a.margin)} ₽
                <span className="text-sm font-semibold opacity-90"> · {a.marginPct}%</span>
              </div>
            </div>
          </div>
        </div>
        {a.recommendation && (
          <div className="p-4 flex items-start gap-2">
            <Icon name="Lightbulb" size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700"><span className="font-semibold">Вывод: </span>{a.recommendation}</p>
          </div>
        )}
      </Card>

      {/* Коэффициенты сметы */}
      {a.coeffsSummary && a.coeffsSummary.length > 0 && (
        <Card className="p-4">
          <p className="text-xs font-semibold text-indigo-600 uppercase mb-2 flex items-center gap-1">
            <Icon name="Percent" size={13} /> Учтённые коэффициенты и индексы
          </p>
          <div className="flex flex-wrap gap-2">
            {a.coeffsSummary.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700">
                <Icon name="X" size={11} /> {c}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Цены заказчика в анализе приведены с учётом этих коэффициентов и индексов пересчёта.
          </p>
        </Card>
      )}

      {/* Риски и забытые работы */}
      {(a.risks.length > 0 || a.missingWorks.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {a.risks.length > 0 && (
            <Card className="p-4">
              <p className="text-xs font-semibold text-red-600 uppercase mb-2 flex items-center gap-1">
                <Icon name="TriangleAlert" size={13} /> Риски
              </p>
              <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1">
                {a.risks.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </Card>
          )}
          {a.missingWorks.length > 0 && (
            <Card className="p-4">
              <p className="text-xs font-semibold text-teal-700 uppercase mb-2 flex items-center gap-1">
                <Icon name="ListPlus" size={13} /> Возможно забытые работы
              </p>
              <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1">
                {a.missingWorks.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Таблица позиций с метками */}
      <Card className="p-5 relative">
        {locked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-lg">
            <div className="bg-white shadow-lg border border-gray-200 rounded-xl px-6 py-5 text-center max-w-xs">
              <Icon name="Lock" size={28} className="mx-auto text-teal-600 mb-2" />
              <p className="text-sm font-semibold text-gray-900">Детализация скрыта</p>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Сводка выгоды видна. Откройте разбор по позициям и себестоимость за разовую оплату.
              </p>
              {onUnlock && (
                <button
                  onClick={onUnlock}
                  disabled={unlocking}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2"
                >
                  {unlocking
                    ? <><Icon name="LoaderCircle" size={15} className="animate-spin" /> Открываем…</>
                    : <><Icon name="Unlock" size={15} /> Открыть анализ — 490 ₽</>}
                </button>
              )}
            </div>
          </div>
        )}
        <div className={`overflow-x-auto ${locked ? "blur-[6px] pointer-events-none" : ""}`}>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 text-xs text-gray-500 uppercase">
                <th className="py-2 pr-2 text-left font-medium">Позиция</th>
                <th className="py-2 px-2 text-right font-medium">Кол-во</th>
                <th className="py-2 px-2 text-right font-medium">Цена зак.</th>
                <th className="py-2 px-2 text-right font-medium">Себест.</th>
                <th className="py-2 px-2 text-right font-medium">Прибыль</th>
                <th className="py-2 pl-2 text-center font-medium">Оценка</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it, i) => {
                const v = VERDICT_META[it.verdict];
                return (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 pr-2">
                      <div className="text-sm text-gray-900">{it.name}</div>
                      {it.coeff && (
                        <div className="text-xs text-indigo-600 flex items-center gap-1 mt-0.5">
                          <Icon name="Percent" size={10} /> {it.coeff}
                        </div>
                      )}
                      {it.note && <div className="text-xs text-amber-600">{it.note}</div>}
                    </td>
                    <td className="py-2 px-2 text-right text-sm tabular-nums whitespace-nowrap">{it.qty} {it.unit}</td>
                    <td className="py-2 px-2 text-right text-sm tabular-nums whitespace-nowrap">{fmtRub(it.customerPrice)} ₽</td>
                    <td className="py-2 px-2 text-right text-sm tabular-nums whitespace-nowrap text-gray-500">{fmtRub(it.costPrice)} ₽</td>
                    <td className={`py-2 px-2 text-right text-sm font-semibold tabular-nums whitespace-nowrap ${it.margin < 0 ? "text-red-600" : "text-emerald-700"}`}>
                      {it.margin >= 0 ? "+" : ""}{fmtRub(it.margin)} ₽
                    </td>
                    <td className="py-2 pl-2 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${v.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} /> {v.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}