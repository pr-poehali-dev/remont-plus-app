import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import {
  REGIONS, HOUSE_STYLES, HOUSE_LAYOUTS, FRAME_WALL_TECHS, FRAME_INSULATIONS,
  ROOFING_MATERIALS, FACADE_TYPES, WINDOW_TYPES, HEATING_TYPES, INTERIOR_FINISHES,
} from "@/components/calculator/framehouse/FrameHouseTypes";
import type { FrameHouseConfig } from "@/components/calculator/framehouse/FrameHouseTypes";
import type { FrameHouseBreakdown } from "@/components/calculator/framehouse/frameHousePricing";
import { fmt } from "@/components/calculator/framehouse/frameHouseUtils";

interface BreakdownRow {
  label: string;
  value: number;
  icon: string;
  highlight?: boolean;
}

interface Props {
  config: FrameHouseConfig;
  bd: FrameHouseBreakdown;
  regionId: string;
  markupPct: number;
}

export default function FrameHouseBreakdownCard({ config, bd, regionId, markupPct }: Props) {
  const region = REGIONS[regionId] ?? REGIONS["samara"];

  const rows: BreakdownRow[] = [
    { label: "Фундамент", value: bd.foundation, icon: "Building2" },
    { label: "Каркас стен (" + FRAME_WALL_TECHS[config.wallTech]?.label.split(" (")[0] + ")", value: bd.frame, icon: "Layers" },
    { label: "Утепление (" + FRAME_INSULATIONS[config.insulation]?.label.split(" (")[0] + ")", value: bd.insulation, icon: "Wind" },
    { label: "Кровельная конструкция", value: bd.roofStructure, icon: "Home" },
    { label: "Кровельный материал (" + ROOFING_MATERIALS[config.roofingMaterial]?.label + ")", value: bd.roofing, icon: "CloudRain" },
    { label: "Фасад (" + FACADE_TYPES[config.facade]?.label.split(" (")[0] + ")", value: bd.facade, icon: "PaintBucket" },
    { label: `Окна (${config.windowCount} шт. · ${WINDOW_TYPES[config.windowType]?.label})`, value: bd.windows, icon: "AppWindow" },
    { label: "Полы", value: bd.floor, icon: "Square" },
    { label: "Тёплый пол", value: bd.underfloorHeating, icon: "Thermometer" },
    { label: "Отопление (" + HEATING_TYPES[config.heating]?.label.split(" (")[0] + ")", value: bd.heating, icon: "Flame" },
    { label: "Электрика", value: bd.electrical, icon: "Zap" },
    { label: "Водоснабжение", value: bd.plumbing, icon: "Droplets" },
    { label: "Канализация / Септик", value: bd.sewage, icon: "Filter" },
    { label: "Внутренняя отделка (" + INTERIOR_FINISHES[config.interiorFinish]?.label + ")", value: bd.interiorFinish, icon: "PaintRoller" },
    { label: "Терраса", value: bd.terrace, icon: "Armchair" },
    { label: "Гараж", value: bd.garage, icon: "Car" },
    { label: "Монтажные работы", value: bd.assembly, icon: "Hammer", highlight: true },
    { label: `Прораб (${config.foremanPct}%)`, value: bd.foreman, icon: "User" },
    { label: `Снабженец (${config.supplierPct}%)`, value: bd.supplier, icon: "Package" },
  ].filter(r => r.value > 0);

  return (
    <Card className="p-4 md:p-6">
      <h2 className="font-bold text-gray-900 text-base mb-1 flex items-center gap-2">
        <Icon name="ClipboardList" size={16} className="text-green-600" />
        Детализация сметы
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        {HOUSE_STYLES[config.style]?.label} · {config.totalArea} м² · {config.floors} эт. ·{" "}
        {HOUSE_LAYOUTS[config.layout]?.label} · {region.label} (×{bd.regionCoeff})
      </p>

      <div className="space-y-1">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex items-center justify-between gap-2 py-2 px-3 rounded-lg ${
              row.highlight ? "bg-green-50 border border-green-100" : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon name={row.icon as Parameters<typeof Icon>[0]["name"]} size={14} className={row.highlight ? "text-green-600" : "text-gray-400"} />
              <span className={`text-sm ${row.highlight ? "font-semibold text-green-800" : "text-gray-700"}`}>
                {row.label}
              </span>
            </div>
            <span className={`text-sm font-medium shrink-0 ${row.highlight ? "text-green-700" : "text-gray-800"}`}>
              {fmt(row.value)} ₽
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Работы</span>
          <span className="font-medium">{fmt(bd.worksCost)} ₽</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Материалы</span>
          <span className="font-medium">{fmt(bd.materialsCost)} ₽</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Регион × {bd.regionCoeff}</span>
        </div>
        {markupPct > 0 && (
          <div className="flex justify-between text-sm text-orange-600">
            <span>Наценка {markupPct}%</span>
            <span>+ {fmt(bd.markupAmount)} ₽</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-extrabold text-green-700 pt-2 border-t">
          <span>ИТОГО</span>
          <span>{fmt(bd.total)} ₽</span>
        </div>
        <div className="text-xs text-gray-400 text-right">
          {fmt(bd.total / Math.max(config.totalArea, 1))} ₽/м²
        </div>
      </div>
    </Card>
  );
}
