import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { REGIONS, HOUSE_STYLES } from "@/components/calculator/framehouse/FrameHouseTypes";
import type { FrameHouseConfig } from "@/components/calculator/framehouse/FrameHouseTypes";
import type { FrameHouseBreakdown } from "@/components/calculator/framehouse/frameHouseUtils";
import { fmt } from "@/components/calculator/framehouse/frameHouseUtils";

export type ViewTab = "config" | "result";

interface Props {
  config: FrameHouseConfig;
  bd: FrameHouseBreakdown;
  regionId: string;
  markupPct: number;
  viewTab: ViewTab;
  onNavigateBack: () => void;
  onPrintClick: () => void;
  onRegionChange: (v: string) => void;
  onMarkupChange: (v: string) => void;
  onTabChange: (tab: ViewTab) => void;
}

const TABS: { id: ViewTab; label: string; icon: string }[] = [
  { id: "config", label: "Параметры", icon: "Settings2" },
  { id: "result", label: "Смета",     icon: "ClipboardList" },
];

export default function FrameHouseHeader({
  config, bd, regionId, markupPct, viewTab,
  onNavigateBack, onPrintClick, onRegionChange, onMarkupChange, onTabChange,
}: Props) {
  const style = HOUSE_STYLES[config.style];

  return (
    <>
      {/* Шапка */}
      <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-start gap-3">
              <button
                onClick={onNavigateBack}
                className="mt-1 text-white/70 hover:text-white transition-colors"
              >
                <Icon name="ArrowLeft" size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">🏗</span>
                  <h1 className="text-xl md:text-3xl font-extrabold">Калькулятор каркасного дома</h1>
                  <Badge className="bg-white/20 text-white border-0 text-xs hidden sm:inline-flex">Бета</Badge>
                </div>
                <p className="text-green-100 text-sm">
                  Каркас, фундамент, крыша, фасад, отопление, отделка — полная смета
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs shrink-0"
              onClick={onPrintClick}
            >
              <Icon name="Printer" size={14} className="mr-1" />
              Печать
            </Button>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <div className="text-xl md:text-2xl font-extrabold">{fmt(bd.total)} ₽</div>
              <div className="text-green-200 text-xs mt-0.5">Итого под ключ</div>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <div className="text-lg md:text-xl font-bold">{fmt(bd.total / Math.max(config.totalArea, 1))} ₽</div>
              <div className="text-green-200 text-xs mt-0.5">За 1 м²</div>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <div className="text-lg md:text-xl font-bold">{config.totalArea} м²</div>
              <div className="text-green-200 text-xs mt-0.5">{config.floors} эт. · {config.floors > 1 ? `${Math.round(config.totalArea / config.floors)} м²/эт.` : "одноэтажный"}</div>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <div className="text-base md:text-lg font-bold">{style?.emoji} {style?.label}</div>
              <div className="text-green-200 text-xs mt-0.5">Стиль дома</div>
            </div>
          </div>
        </div>
      </div>

      {/* Регион + наценка */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="container mx-auto px-4 py-2.5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Icon name="MapPin" size={13} className="text-green-600" />
            <select
              value={regionId}
              onChange={e => onRegionChange(e.target.value)}
              className="text-sm border border-green-300 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {Object.entries(REGIONS).map(([k, r]) => (
                <option key={k} value={k}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Percent" size={13} className="text-green-600" />
            <label className="text-xs text-green-800">Наценка</label>
            <input
              type="number" min={0} max={200} value={markupPct}
              onChange={e => onMarkupChange(e.target.value)}
              className="w-16 text-sm border border-green-300 rounded-xl px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="%"
            />
            <span className="text-xs text-green-700">%</span>
          </div>
          {markupPct > 0 && (
            <span className="text-xs text-orange-600 font-medium ml-auto">
              + {fmt(bd.markupAmount)} ₽ наценки
            </span>
          )}
        </div>
      </div>

      {/* Табы */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  viewTab === t.id ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon name={t.icon as Parameters<typeof Icon>[0]["name"]} size={14} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
