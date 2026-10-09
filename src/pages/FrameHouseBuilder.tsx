import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import SEOMeta from "@/components/SEOMeta";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { toast } from "sonner";
import {
  DEFAULT_FRAME_SPEC,
  generateFrameMaterials,
  sectionVolumeM3,
  PRICE_PER_M3,
  type FrameHouseSpec,
} from "@/lib/frameHouseGenerator";
import { cutStock, groupPieces } from "@/lib/cutting";
import { formatMoney } from "@/components/framehouse/builder/builderShared";
import FrameBuilderParams from "@/components/framehouse/builder/FrameBuilderParams";
import FrameBuilderVisual from "@/components/framehouse/builder/FrameBuilderVisual";
import FrameBuilderResults from "@/components/framehouse/builder/FrameBuilderResults";

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
          <FrameBuilderParams
            spec={spec}
            setSpec={setSpec}
            stockLength={stockLength}
            setStockLength={setStockLength}
            kerf={kerf}
            setKerf={setKerf}
          />

          {/* ── ПРАВАЯ ПАНЕЛЬ: РЕЗУЛЬТАТЫ */}
          <div className="lg:col-span-8 space-y-4">
            <FrameBuilderVisual spec={spec} />

            <FrameBuilderResults totals={totals} cuttingResults={cuttingResults} stockLength={stockLength} />
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
