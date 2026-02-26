import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import {
  REGIONS, HOUSE_STYLES, HOUSE_LAYOUTS, FRAME_WALL_TECHS, FRAME_INSULATIONS,
  FOUNDATION_TYPES, ROOF_TYPES, ROOFING_MATERIALS, FACADE_TYPES,
  WINDOW_TYPES, HEATING_TYPES, INTERIOR_FINISHES,
} from "@/components/calculator/framehouse/FrameHouseTypes";
import type { FrameHouseConfig } from "@/components/calculator/framehouse/FrameHouseTypes";
import type { FrameHouseBreakdown } from "@/components/calculator/framehouse/frameHouseUtils";
import { fmt } from "@/components/calculator/framehouse/frameHouseUtils";

interface ExportState {
  showExportPanel: boolean;
  customer: string;
  contractor: string;
  address: string;
  phone: string;
  email: string;
  docType: "smeta" | "kp";
  validDays: string;
}

interface Props {
  config: FrameHouseConfig;
  bd: FrameHouseBreakdown;
  regionId: string;
  markupPct: number;
  exportState: ExportState;
  onExportChange: (patch: Partial<ExportState>) => void;
  onPrint: () => void;
  onFindMasters: () => void;
}

interface BreakdownRow {
  label: string;
  value: number;
  icon: string;
  highlight?: boolean;
}

export default function FrameHouseTabResult({
  config, bd, regionId, markupPct, exportState, onExportChange, onPrint, onFindMasters,
}: Props) {
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
    <div className="lg:grid lg:grid-cols-[1fr_360px] gap-6">
      {/* Смета */}
      <div className="space-y-4">
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

          {/* Итоги */}
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

        {/* CTA */}
        <Card className="p-4 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <h3 className="font-bold text-green-900 text-sm mb-1">Найти строителей каркасных домов</h3>
          <p className="text-xs text-gray-600 mb-3">
            Получите предложения от проверенных бригад в вашем регионе — сравните цены и отзывы
          </p>
          <Button
            onClick={onFindMasters}
            className="bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            <Icon name="Users" size={14} className="mr-2" />
            Найти мастеров
          </Button>
        </Card>
      </div>

      {/* Правая панель */}
      <div className="space-y-4">
        {/* Экспорт */}
        <Card className="p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Icon name="FileText" size={14} />
            Сформировать документ
          </h3>
          <div className="flex gap-2 mb-3">
            {(["smeta", "kp"] as const).map(t => (
              <button
                key={t}
                onClick={() => onExportChange({ docType: t })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                  exportState.docType === t
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 text-gray-600 hover:border-green-300"
                }`}
              >
                {t === "smeta" ? "Смета" : "Коммерческое предложение"}
              </button>
            ))}
          </div>

          {!exportState.showExportPanel ? (
            <Button
              variant="outline"
              className="w-full text-sm border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => onExportChange({ showExportPanel: true })}
            >
              <Icon name="ChevronDown" size={14} className="mr-1" />
              Добавить реквизиты
            </Button>
          ) : (
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-gray-600">Заказчик</Label>
                <Input
                  value={exportState.customer}
                  onChange={e => onExportChange({ customer: e.target.value })}
                  placeholder="ФИО или компания"
                  className="h-8 text-sm mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Подрядчик / ваша компания</Label>
                <Input
                  value={exportState.contractor}
                  onChange={e => onExportChange({ contractor: e.target.value })}
                  placeholder="Название компании"
                  className="h-8 text-sm mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Адрес объекта</Label>
                <Input
                  value={exportState.address}
                  onChange={e => onExportChange({ address: e.target.value })}
                  placeholder="Адрес / участок"
                  className="h-8 text-sm mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">Телефон</Label>
                  <Input
                    value={exportState.phone}
                    onChange={e => onExportChange({ phone: e.target.value })}
                    placeholder="+7 (999)"
                    className="h-8 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Email</Label>
                  <Input
                    value={exportState.email}
                    onChange={e => onExportChange({ email: e.target.value })}
                    placeholder="mail@example.com"
                    className="h-8 text-sm mt-1"
                  />
                </div>
              </div>
              {exportState.docType === "kp" && (
                <div>
                  <Label className="text-xs text-gray-600">Срок действия (дней)</Label>
                  <Input
                    value={exportState.validDays}
                    onChange={e => onExportChange({ validDays: e.target.value })}
                    className="h-8 text-sm mt-1 w-20"
                  />
                </div>
              )}
            </div>
          )}

          <Button
            onClick={onPrint}
            className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            <Icon name="Printer" size={14} className="mr-2" />
            Печать / PDF
          </Button>
        </Card>

        {/* Что влияет на цену */}
        <Card className="p-4 border-gray-200">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Icon name="TrendingUp" size={14} />
            Что влияет на цену
          </h3>
          <div className="space-y-2 text-xs text-gray-600">
            {[
              ["Площадь дома",      "Основной фактор — каждый м² увеличивает смету пропорционально"],
              ["Технология каркаса","SIP дороже OSB на 30-40%, но ускоряет монтаж"],
              ["Тип фундамента",    "Монолитная плита в 4× дороже свай, но надёжнее на сложных грунтах"],
              ["Отопление",         "Тепловой насос дороже при покупке, но самый выгодный в эксплуатации"],
              ["Внутренняя отделка","Переход с «эконом» на «стандарт» добавляет ~700 тыс. ₽ для 80 м²"],
              ["Регион",            "Самара и Воронеж в среднем на 20–25% дешевле Москвы"],
            ].map(([factor, desc], i) => (
              <div key={i} className="flex gap-2">
                <Icon name="ArrowRight" size={12} className="text-green-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-700">{factor}</span>
                  <span className="text-gray-500"> — {desc}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Этапы строительства */}
        <Card className="p-4 border-gray-200">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Icon name="ListChecks" size={14} />
            Этапы строительства
          </h3>
          <div className="space-y-2">
            {[
              ["1", "Фундамент",             "1–2 нед."],
              ["2", "Каркас и кровля",        "2–4 нед."],
              ["3", "Утепление и фасад",      "2–3 нед."],
              ["4", "Окна и двери",           "1 нед."],
              ["5", "Инженерные системы",     "3–4 нед."],
              ["6", "Внутренняя отделка",     "4–8 нед."],
              ["7", "Финишные работы",        "1–2 нед."],
            ].map(([n, step, time]) => (
              <div key={n} className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {n}
                </div>
                <span className="text-gray-700 flex-1">{step}</span>
                <span className="text-gray-400">{time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
