import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { REGIONS } from "@/components/calculator/bathhouse/BathHouseTypes";
import type { BathHouseConfig } from "@/components/calculator/bathhouse/BathHouseTypes";
import type { BathHouseBreakdown } from "@/components/calculator/bathhouse/bathHouseUtils";
import { fmt, calcBathHouseMaterials } from "@/components/calculator/bathhouse/bathHouseUtils";
import MaterialsTable from "@/components/calculator/shared/MaterialsTable";
import CalcOrderForm from "@/components/calculator/CalcOrderForm";

const BREAKDOWN_LABELS: { key: string; label: string; icon: string }[] = [
  { key: "foundation", label: "Фундамент", icon: "Building2" },
  { key: "walls", label: "Стены (коробка)", icon: "Layers" },
  { key: "roofStructure", label: "Кровельная конструкция", icon: "Home" },
  { key: "roofing", label: "Кровельный материал", icon: "CloudRain" },
  { key: "insulation", label: "Утепление", icon: "Wind" },
  { key: "wallFinishSteam", label: "Отделка парной", icon: "Paintbrush" },
  { key: "wallFinishWash", label: "Отделка мойки", icon: "Paintbrush" },
  { key: "wallFinishRest", label: "Отделка комнаты отдыха", icon: "Paintbrush" },
  { key: "floor", label: "Полы", icon: "Grid3x3" },
  { key: "stove", label: "Печь", icon: "Flame" },
  { key: "ventilation", label: "Вентиляция", icon: "AirVent" },
  { key: "shelves", label: "Полок", icon: "AlignVerticalJustifyCenter" },
  { key: "windows", label: "Окна", icon: "AppWindow" },
  { key: "chimney", label: "Дымоход", icon: "ChevronsUp" },
  { key: "tank", label: "Бак для воды", icon: "Droplets" },
  { key: "terrace", label: "Терраса", icon: "Trees" },
  { key: "electrical", label: "Электрика", icon: "Zap" },
  { key: "assembly", label: "Монтаж и работа", icon: "Wrench" },
];

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
  config: BathHouseConfig;
  bd: BathHouseBreakdown;
  regionId: string;
  markupPct: number;
  exportState: ExportState;
  onExportChange: (patch: Partial<ExportState>) => void;
  onPrint: () => void;
  onFindMasters: () => void;
}

export default function BathHouseTabResult({
  config, bd, regionId, markupPct,
  exportState, onExportChange, onPrint, onFindMasters,
}: Props) {
  const { showExportPanel, customer, contractor, address, phone, email, docType, validDays } = exportState;

  const breakdownItems = BREAKDOWN_LABELS
    .map(({ key, label, icon }) => ({ label, icon, key, value: (bd as Record<string, number>)[key] ?? 0 }))
    .filter(i => i.value > 0);

  const matItems = calcBathHouseMaterials(config, bd, regionId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
      {/* Детализация */}
      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Icon name="ClipboardList" size={16} className="text-amber-600" />
              Детализация сметы
            </h2>
            <span className="text-xs text-gray-400">{REGIONS[regionId]?.label}</span>
          </div>

          <div className="space-y-0.5">
            {breakdownItems.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                  item.key === "assembly" ? "bg-amber-50 font-semibold" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon name={item.icon as Parameters<typeof Icon>[0]["name"]} size={13} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800 tabular-nums">{fmt(item.value)} ₽</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t-2 border-gray-200 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Материалы + монтаж</span>
              <span className="tabular-nums">{fmt(bd.subtotal / bd.regionCoeff)} ₽</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Региональный коэффициент ×{bd.regionCoeff} ({REGIONS[regionId]?.label})</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>С учётом региона</span>
              <span className="tabular-nums">{fmt(bd.subtotal)} ₽</span>
            </div>
            {markupPct > 0 && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>Наценка {markupPct}%</span>
                <span className="tabular-nums">+ {fmt(bd.markupAmount)} ₽</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-extrabold text-amber-700 pt-2 border-t-2 border-amber-200">
              <span>ИТОГО</span>
              <span className="tabular-nums">{fmt(bd.total)} ₽</span>
            </div>
            <div className="text-center text-xs text-gray-400">
              {fmt(bd.total / Math.max(config.totalArea, 1))} ₽ за 1 м² · площадь {config.totalArea} м²
            </div>
          </div>

          <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
            * Ориентировочный расчёт. Точная стоимость зависит от типа грунта, особенностей проекта, сезона и подрядчика. Для точной сметы обратитесь к партнёрам АВАНГАРД.
          </p>
        </Card>

        {/* Ведомость материалов */}
        <MaterialsTable items={matItems} accentColor="amber" />

        <CalcOrderForm
          calcType="Баня"
          total={`от ${fmt(bd.total)} ₽`}
        />

        {/* CTA партнёры */}
        <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
          <h3 className="font-bold text-amber-900 mb-2">Получить предложения от строителей</h3>
          <p className="text-sm text-gray-600 mb-4">
            Партнёры вашего региона пришлют конкретные предложения с готовой сметой. Сравните и выберите лучшее.
          </p>
          <Button
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            onClick={onFindMasters}
          >
            <Icon name="HardHat" size={15} className="mr-2" />
            Найти строителей бани
          </Button>
        </Card>
      </div>

      {/* Правая панель: экспорт + рекомендации */}
      <div className="space-y-4">

        {/* Экспорт / Печать */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
              <Icon name="Printer" size={14} className="text-amber-600" />
              Печать сметы
            </h3>
            <button
              onClick={() => onExportChange({ showExportPanel: !showExportPanel })}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              {showExportPanel ? "Скрыть" : "Настроить"}
            </button>
          </div>

          {/* Тип документа */}
          <div className="flex gap-2 mb-3">
            {(["smeta", "kp"] as const).map(t => (
              <button
                key={t}
                onClick={() => onExportChange({ docType: t })}
                className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                  docType === t ? "border-amber-500 bg-amber-50 text-amber-800" : "border-gray-200 text-gray-600"
                }`}
              >
                {t === "smeta" ? "📋 Смета" : "📄 Коммерческое предложение"}
              </button>
            ))}
          </div>

          {showExportPanel && (
            <div className="space-y-2 mb-3">
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Заказчик</Label>
                <Input value={customer} onChange={e => onExportChange({ customer: e.target.value })} placeholder="ФИО или компания" className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Подрядчик / ваше название</Label>
                <Input value={contractor} onChange={e => onExportChange({ contractor: e.target.value })} placeholder="Название компании / ИП" className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Адрес объекта</Label>
                <Input value={address} onChange={e => onExportChange({ address: e.target.value })} placeholder="Адрес строительства" className="h-8 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Телефон</Label>
                  <Input value={phone} onChange={e => onExportChange({ phone: e.target.value })} placeholder="+7..." className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">E-mail</Label>
                  <Input value={email} onChange={e => onExportChange({ email: e.target.value })} placeholder="email" className="h-8 text-sm" />
                </div>
              </div>
              {docType === "kp" && (
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Срок действия КП (дней)</Label>
                  <Input value={validDays} onChange={e => onExportChange({ validDays: e.target.value })} type="number" min={1} max={365} className="h-8 text-sm" />
                </div>
              )}
            </div>
          )}

          <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" onClick={onPrint}>
            <Icon name="Printer" size={15} className="mr-2" />
            Печать / Сохранить PDF
          </Button>
        </Card>

        {/* Рекомендации */}
        <Card className="p-4 space-y-2.5">
          <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
            <Icon name="Lightbulb" size={14} className="text-amber-500" />
            Рекомендации
          </h3>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
            <div className="text-xs font-bold text-orange-700 mb-1">🔥 Печь</div>
            <p className="text-xs text-gray-600 leading-relaxed">{bd.stoveRecommendation}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <div className="text-xs font-bold text-blue-700 mb-1">💨 Вентиляция</div>
            <p className="text-xs text-gray-600 leading-relaxed">{bd.ventRecommendation}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="text-xs font-bold text-amber-700 mb-1">🛖 Полок</div>
            <p className="text-xs text-gray-600 leading-relaxed">{bd.shelfRecommendation}</p>
          </div>
        </Card>

        {/* Что влияет на цену */}
        <Card className="p-4">
          <h3 className="font-bold text-sm text-gray-800 mb-3">Что больше всего влияет на цену</h3>
          <div className="space-y-2 text-xs text-gray-600">
            {[
              ["🪵", "Материал стен — разница до 3× (каркас vs клееный брус)"],
              ["🏗", "Фундамент — сваи дешевле монолита на ~120 000 ₽"],
              ["🔥", "Кирпичная печь дороже металлической в 5–7 раз"],
              ["🌡", "Тёплый пол добавляет 8–15% к смете"],
              ["🪟", "Терраса и лишние окна: +10–25%"],
              ["🗺", `Ваш регион — коэффициент ×${REGIONS[regionId]?.coeff}`],
            ].map(([icon, text], i) => (
              <div key={i} className="flex gap-2">
                <span className="text-base leading-none shrink-0">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}