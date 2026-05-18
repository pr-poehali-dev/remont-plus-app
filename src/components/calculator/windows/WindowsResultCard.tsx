import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import {
  CONSTRUCTION_TYPES, PROFILE_SYSTEMS, GLASS_UNITS, LAMINATION_TYPES, WINDOW_REGIONS,
} from "@/components/calculator/windows/WindowTypes";
import type { WindowConfig } from "@/components/calculator/windows/WindowTypes";
import { fmt } from "@/components/calculator/windows/windowUtils";

interface Props {
  cfg: Omit<WindowConfig, "id" | "totalPrice">;
  basePrice: number;
  markup: number;
  markupPct: number;
  price: number;
  onAdd: () => void;
}

export default function WindowsResultCard({
  cfg,
  basePrice,
  markup,
  markupPct,
  price,
  onAdd,
}: Props) {
  return (
    <Card className="p-5 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">Стоимость конструкции</p>

      <div className="space-y-1.5 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>Тип</span>
          <span className="font-medium text-gray-900 text-right">
            {CONSTRUCTION_TYPES.find(c => c.value === cfg.constructionType)?.label}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Размер</span>
          <span className="font-medium text-gray-900">{cfg.width}×{cfg.height} мм</span>
        </div>
        <div className="flex justify-between">
          <span>Площадь</span>
          <span className="font-medium text-gray-900">
            {cfg.hasTransom && cfg.constructionType !== "transom"
              ? ((cfg.width / 1000) * ((cfg.height + cfg.transomHeight) / 1000)).toFixed(2)
              : ((cfg.width / 1000) * (cfg.height / 1000)).toFixed(2)} м²
          </span>
        </div>
        {cfg.hasTransom && cfg.constructionType !== "transom" && (
          <div className="flex justify-between">
            <span>Фрамуга</span>
            <span className="font-medium text-gray-900">{cfg.transomHeight} мм</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Профиль</span>
          <span className="font-medium text-gray-900 text-right">
            {PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId)?.brand}{" "}
            {PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId)?.series}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Стеклопакет</span>
          <span className="font-medium text-gray-900">
            {GLASS_UNITS.find(g => g.id === cfg.glassUnitId)?.name}
          </span>
        </div>
        {cfg.laminationId !== "none" && (
          <div className="flex justify-between">
            <span>Ламинация</span>
            <span className="font-medium text-gray-900">
              {LAMINATION_TYPES.find(l => l.id === cfg.laminationId)?.name}
              {cfg.laminationBothSides && " (2 стороны)"}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Регион</span>
          <span className="font-medium text-gray-900">
            {WINDOW_REGIONS.find(r => r.id === cfg.regionId)?.name ?? cfg.regionId}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Кол-во</span>
          <span className="font-medium text-gray-900">{cfg.quantity} шт.</span>
        </div>
      </div>

      {markupPct > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3 space-y-1 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Себестоимость</span>
            <span>{fmt(basePrice)} ₽</span>
          </div>
          <div className="flex justify-between text-orange-600">
            <span>Наценка {markupPct}%</span>
            <span>+{fmt(markup)} ₽</span>
          </div>
        </div>
      )}

      <div className="border-t border-blue-200 pt-3 mb-4">
        <div className="flex justify-between items-end">
          <span className="text-sm text-gray-600">Цена за 1 шт.</span>
          <span className="text-lg font-bold text-gray-900">{fmt(Math.round(price / cfg.quantity))} ₽</span>
        </div>
        <div className="flex justify-between items-end mt-1">
          <span className="text-sm text-gray-600">
            {cfg.quantity > 1 ? `Итого ${cfg.quantity} шт.` : "Итого"}
          </span>
          <span className="text-2xl font-bold text-blue-700">{fmt(price)} ₽</span>
        </div>
      </div>

      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        onClick={onAdd}
        disabled={price === 0}
      >
        <Icon name="Plus" size={16} className="mr-2" />
        Добавить в список
      </Button>
      <p className="text-[11px] text-center text-gray-400 mt-2">
        Расчёт ориентировочный. Точная цена — после замера.
      </p>
    </Card>
  );
}
