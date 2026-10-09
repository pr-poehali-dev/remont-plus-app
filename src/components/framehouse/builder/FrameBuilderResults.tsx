import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import CuttingDiagram from "@/components/framehouse/CuttingDiagram";
import { sectionVolumeM3, PRICE_PER_M3, generateFrameMaterials } from "@/lib/frameHouseGenerator";
import { cutStock, groupPieces } from "@/lib/cutting";
import { formatMoney } from "./builderShared";

export type CuttingResult = ReturnType<typeof generateFrameMaterials>[number] & {
  cutting: ReturnType<typeof cutStock>;
};

export interface FrameTotals {
  totalSheets: number;
  totalUsefulMm: number;
  totalStockMm: number;
  wasteMm: number;
  wastePct: number;
  totalCost: number;
  totalWeightKg: number;
}

interface Props {
  totals: FrameTotals;
  cuttingResults: CuttingResult[];
  stockLength: number;
}

export default function FrameBuilderResults({ totals, cuttingResults, stockLength }: Props) {
  return (
    <>
      {/* Итоги */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Хлыстов</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {totals.totalSheets} <span className="text-sm font-normal text-slate-500">шт</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Отход</div>
              <div className="text-xl font-bold text-amber-600">
                {totals.wastePct.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Вес</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {Math.round(totals.totalWeightKg)} <span className="text-sm font-normal text-slate-500">кг</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Стоимость</div>
              <div className="text-xl font-bold text-emerald-600">
                {formatMoney(totals.totalCost)} ₽
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-3">
            * Ориентировочно для региона Самара. Цены сосны могут отличаться.
          </div>
        </CardContent>
      </Card>

      {/* Спецификация / раскрой */}
      <Tabs defaultValue="cutting">
        <TabsList>
          <TabsTrigger value="cutting">
            <Icon name="Scissors" className="w-4 h-4 mr-1.5" />
            Раскрой
          </TabsTrigger>
          <TabsTrigger value="spec">
            <Icon name="ListOrdered" className="w-4 h-4 mr-1.5" />
            Спецификация
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cutting" className="space-y-4 mt-4">
          {cuttingResults.map((mat, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between gap-2 flex-wrap">
                  <span>{mat.title}</span>
                  <span className="text-sm font-normal text-slate-500">
                    {mat.cutting.totalStock} шт × {stockLength / 1000} м
                    <span className="ml-2 text-amber-600">отход {mat.cutting.wastePct.toFixed(1)}%</span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CuttingDiagram sheets={mat.cutting.sheets} stockLength={stockLength} />
                {mat.cutting.oversized.length > 0 && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs rounded">
                    ⚠ {mat.cutting.oversized.length} деталей длиннее {stockLength} мм — нужны сращивания
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="spec" className="space-y-4 mt-4">
          {cuttingResults.map((mat, idx) => {
            const grouped = groupPieces(mat.pieces);
            const volume = sectionVolumeM3(mat.section, mat.cutting.totalStockMm);
            const pricePerM3 = PRICE_PER_M3[mat.section] || 16000;
            const cost = volume * pricePerM3;
            return (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{mat.title}</CardTitle>
                  <CardDescription>
                    {mat.cutting.totalStock} шт · {volume.toFixed(2)} м³ · {formatMoney(cost)} ₽
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-slate-500 border-b border-slate-200 dark:border-slate-700">
                          <th className="pb-2 pr-2">Деталь</th>
                          <th className="pb-2 pr-2 text-right">Длина, мм</th>
                          <th className="pb-2 text-right">Кол-во</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grouped.map((g, i) => (
                          <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <td className="py-1.5 pr-2 text-slate-700 dark:text-slate-300">
                              {g.label.replace(/\s+\d+$/, "")}
                            </td>
                            <td className="py-1.5 pr-2 text-right tabular-nums">{g.length}</td>
                            <td className="py-1.5 text-right tabular-nums font-medium">{g.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-900">
        <CardContent className="p-4 flex items-start gap-3">
          <Icon name="Lightbulb" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
              Алгоритм раскроя First Fit Decreasing
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Детали сортируются по убыванию длины и размещаются в первом подходящем хлысте.
              Это даёт результат, близкий к оптимальному, и снижает отход в среднем на 30% по сравнению с произвольным распилом.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
