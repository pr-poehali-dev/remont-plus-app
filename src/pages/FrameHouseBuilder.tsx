import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import SEOMeta from "@/components/SEOMeta";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HousePlan2D from "@/components/framehouse/HousePlan2D";
import House3DPanel from "@/components/framehouse/House3DPanel";
import CuttingDiagram from "@/components/framehouse/CuttingDiagram";
import { toast } from "sonner";
import {
  DEFAULT_FRAME_SPEC,
  generateFrameMaterials,
  sectionVolumeM3,
  PRICE_PER_M3,
  type FrameHouseSpec,
} from "@/lib/frameHouseGenerator";
import { cutStock, groupPieces } from "@/lib/cutting";

const STOCK_OPTIONS = [3000, 4000, 6000];

function formatMoney(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n));
}

function NumberField({
  label,
  value,
  onChange,
  step = 100,
  min = 0,
  suffix = "мм",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  suffix?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-slate-600 dark:text-slate-400">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={value}
          step={step}
          min={min}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          className="pr-12"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          {suffix}
        </span>
      </div>
    </div>
  );
}

export default function FrameHouseBuilder() {
  const navigate = useNavigate();
  const [spec, setSpec] = useState<FrameHouseSpec>(DEFAULT_FRAME_SPEC);
  const [stockLength, setStockLength] = useState<number>(6000);
  const [kerf, setKerf] = useState<number>(3);

  const materials = useMemo(() => generateFrameMaterials(spec), [spec]);

  const cuttingResults = useMemo(
    () =>
      materials.map((m) => ({
        ...m,
        cutting: cutStock(m.pieces, { length: stockLength, kerf }),
      })),
    [materials, stockLength, kerf]
  );

  const totals = useMemo(() => {
    let totalSheets = 0;
    let totalUsefulMm = 0;
    let totalStockMm = 0;
    let totalCost = 0;
    let totalWeightKg = 0;

    cuttingResults.forEach((mat) => {
      totalSheets += mat.cutting.totalStock;
      totalUsefulMm += mat.cutting.totalUsefulMm;
      totalStockMm += mat.cutting.totalStockMm;

      const volumeM3 = sectionVolumeM3(mat.section, mat.cutting.totalStockMm);
      const pricePerM3 = PRICE_PER_M3[mat.section] || 16000;
      totalCost += volumeM3 * pricePerM3;
      // 1 м³ сосны ≈ 520 кг
      totalWeightKg += volumeM3 * 520;
    });

    const wasteMm = totalStockMm - totalUsefulMm;
    const wastePct = totalStockMm > 0 ? (wasteMm / totalStockMm) * 100 : 0;

    return { totalSheets, totalUsefulMm, totalStockMm, wasteMm, wastePct, totalCost, totalWeightKg };
  }, [cuttingResults]);

  const handleExport = () => {
    const lines: string[] = [];
    lines.push("СПЕЦИФИКАЦИЯ КАРКАСНОГО ДОМА");
    lines.push("");
    lines.push(`Дом: ${spec.length / 1000}×${spec.width / 1000} м, ${spec.floors} эт., высота ${spec.wallHeight / 1000} м`);
    lines.push(`Окна: ${spec.windowsCount} шт, двери: ${spec.doorsCount} шт`);
    lines.push("");
    lines.push("ИТОГО:");
    lines.push(`  Хлыстов: ${totals.totalSheets} шт по ${stockLength} мм`);
    lines.push(`  Объём: ${((totals.totalStockMm / 1000) * 0.01).toFixed(2)} м (общий)`);
    lines.push(`  Отход: ${totals.wastePct.toFixed(1)}%`);
    lines.push(`  Стоимость: ${formatMoney(totals.totalCost)} ₽`);
    lines.push("");

    cuttingResults.forEach((mat) => {
      lines.push(`── ${mat.title}`);
      lines.push(`   Закупка: ${mat.cutting.totalStock} шт × ${stockLength} мм`);
      const grouped = groupPieces(mat.pieces);
      grouped.forEach((g) => {
        lines.push(`   • ${g.label.replace(/\s+\d+$/, "")} — ${g.length} мм × ${g.qty} шт`);
      });
      lines.push("");
    });

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `karkasnik-${spec.length}x${spec.width}-spec.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Спецификация скачана");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <SEOMeta
        title="Конструктор каркасного дома с раскроем пиломатериалов"
        description="Интерактивный конструктор каркасного дома: задайте размеры, окна и двери — получите точную спецификацию пиломатериалов и оптимальный план раскроя."
        keywords="конструктор каркасного дома, раскрой пиломатериалов, спецификация бруса"
      />
      <SiteHeader />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        {/* Breadcrumbs + title */}
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <button onClick={() => navigate("/framehouse")} className="hover:text-slate-700">
            Каркасный дом
          </button>
          <Icon name="ChevronRight" size={14} />
          <span className="text-slate-700 dark:text-slate-200">Конструктор + раскрой</span>
        </div>

        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">
              Конструктор каркасника с раскроем
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Настройте размеры — получите спецификацию пиломатериалов и оптимальный план раскроя
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Icon name="Printer" className="w-4 h-4 mr-1" />
              Печать
            </Button>
            <Button onClick={handleExport} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
              <Icon name="Download" className="w-4 h-4 mr-1" />
              Скачать спецификацию
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-4">
          {/* ── ЛЕВАЯ ПАНЕЛЬ: ПАРАМЕТРЫ */}
          <div className="lg:col-span-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="Ruler" className="w-4 h-4 text-orange-500" />
                  Габариты
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <NumberField
                    label="Длина дома"
                    value={spec.length}
                    onChange={(v) => setSpec({ ...spec, length: v })}
                    step={500}
                    min={2000}
                  />
                  <NumberField
                    label="Ширина дома"
                    value={spec.width}
                    onChange={(v) => setSpec({ ...spec, width: v })}
                    step={500}
                    min={2000}
                  />
                  <NumberField
                    label="Высота стены"
                    value={spec.wallHeight}
                    onChange={(v) => setSpec({ ...spec, wallHeight: v })}
                    step={100}
                    min={2200}
                  />
                  <NumberField
                    label="Шаг стоек"
                    value={spec.studPitch}
                    onChange={(v) => setSpec({ ...spec, studPitch: v })}
                    step={50}
                    min={400}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600 dark:text-slate-400">Этажность</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2].map((f) => (
                      <Button
                        key={f}
                        size="sm"
                        variant={spec.floors === f ? "default" : "outline"}
                        onClick={() => setSpec({ ...spec, floors: f as 1 | 2 })}
                      >
                        {f} этаж{f === 2 ? "а" : ""}
                      </Button>
                    ))}
                  </div>
                </div>
                <NumberField
                  label="Длина перегородок (всего)"
                  value={spec.partitionsLength}
                  onChange={(v) => setSpec({ ...spec, partitionsLength: v })}
                  step={500}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="DoorOpen" className="w-4 h-4 text-orange-500" />
                  Проёмы
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <NumberField
                    label="Окон, шт"
                    value={spec.windowsCount}
                    onChange={(v) => setSpec({ ...spec, windowsCount: v })}
                    step={1}
                    suffix="шт"
                  />
                  <NumberField
                    label="Ширина окна"
                    value={spec.windowWidth}
                    onChange={(v) => setSpec({ ...spec, windowWidth: v })}
                    step={100}
                  />
                  <NumberField
                    label="Высота окна"
                    value={spec.windowHeight}
                    onChange={(v) => setSpec({ ...spec, windowHeight: v })}
                    step={100}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <NumberField
                    label="Дверей, шт"
                    value={spec.doorsCount}
                    onChange={(v) => setSpec({ ...spec, doorsCount: v })}
                    step={1}
                    suffix="шт"
                  />
                  <NumberField
                    label="Ширина двери"
                    value={spec.doorWidth}
                    onChange={(v) => setSpec({ ...spec, doorWidth: v })}
                    step={50}
                  />
                  <NumberField
                    label="Высота двери"
                    value={spec.doorHeight}
                    onChange={(v) => setSpec({ ...spec, doorHeight: v })}
                    step={50}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="Mountain" className="w-4 h-4 text-orange-500" />
                  Кровля
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <NumberField
                    label="Свес кровли"
                    value={spec.roofOverhang}
                    onChange={(v) => setSpec({ ...spec, roofOverhang: v })}
                    step={50}
                  />
                  <NumberField
                    label="Уклон"
                    value={spec.roofPitchDeg}
                    onChange={(v) => setSpec({ ...spec, roofPitchDeg: v })}
                    step={1}
                    suffix="°"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="Scissors" className="w-4 h-4 text-orange-500" />
                  Параметры раскроя
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600 dark:text-slate-400">Длина хлыста</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {STOCK_OPTIONS.map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={stockLength === s ? "default" : "outline"}
                        onClick={() => setStockLength(s)}
                      >
                        {s / 1000} м
                      </Button>
                    ))}
                  </div>
                </div>
                <NumberField
                  label="Пропил (kerf)"
                  value={kerf}
                  onChange={setKerf}
                  step={1}
                />
              </CardContent>
            </Card>
          </div>

          {/* ── ПРАВАЯ ПАНЕЛЬ: РЕЗУЛЬТАТЫ */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 flex-wrap justify-between">
                  <span className="flex items-center gap-2">
                    <Icon name="Box" className="w-4 h-4 text-orange-500" />
                    Визуализация дома
                  </span>
                  <span className="text-[11px] font-normal text-slate-500 inline-flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-semibold">
                      <Icon name="Sparkles" size={10} />
                      PBR
                    </span>
                    Реалистичный рендер в реальном времени
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="3d">
                  <TabsList>
                    <TabsTrigger value="3d">
                      <Icon name="Box" className="w-4 h-4 mr-1.5" />
                      3D-вид
                    </TabsTrigger>
                    <TabsTrigger value="plan">
                      <Icon name="Map" className="w-4 h-4 mr-1.5" />
                      План этажа
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="3d" className="mt-3">
                    <House3DPanel spec={spec} />
                  </TabsContent>
                  <TabsContent value="plan" className="mt-3">
                    <HousePlan2D spec={spec} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

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
          </div>
        </div>
      </main>

      <SiteFooter />

      <style>{`
        @media print {
          header, footer, button, [role="tablist"] { display: none !important; }
          main { padding: 0 !important; }
          .container { max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}