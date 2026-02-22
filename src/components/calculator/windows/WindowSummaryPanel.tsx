import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import {
  CONSTRUCTION_TYPES, PROFILE_SYSTEMS, GLASS_UNITS, GLASS_COATINGS, LAMINATION_TYPES,
} from "./WindowTypes";
import type { WindowConfig } from "./WindowTypes";
import { fmt } from "./windowUtils";

interface Props {
  cfg: Omit<WindowConfig, "id" | "totalPrice">;
  price: number;
  configs: WindowConfig[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export default function WindowSummaryPanel({ cfg, price, configs, onAdd, onRemove }: Props) {
  const selectedConstruction = CONSTRUCTION_TYPES.find(c => c.value === cfg.constructionType);

  return (
    <div className="sticky top-20 space-y-4">
      <Card className="p-5 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">Итог по конструкции</p>

        <div className="space-y-1.5 text-sm text-gray-600 mb-4">
          <div className="flex justify-between">
            <span>Тип</span>
            <span className="font-medium text-gray-900 text-right">{selectedConstruction?.label}</span>
          </div>
          <div className="flex justify-between">
            <span>Размер</span>
            <span className="font-medium text-gray-900">{cfg.width}×{cfg.height} мм</span>
          </div>
          <div className="flex justify-between">
            <span>Площадь</span>
            <span className="font-medium text-gray-900">
              {((cfg.width / 1000) * (cfg.height / 1000)).toFixed(2)} м²
            </span>
          </div>
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
          {cfg.glassCoatingId !== "none" && (
            <div className="flex justify-between">
              <span>Покрытие</span>
              <span className="font-medium text-gray-900">
                {GLASS_COATINGS.find(c => c.id === cfg.glassCoatingId)?.name}
              </span>
            </div>
          )}
          {cfg.laminationId !== "none" && (
            <div className="flex justify-between">
              <span>Ламинация</span>
              <span className="font-medium text-gray-900">
                {LAMINATION_TYPES.find(l => l.id === cfg.laminationId)?.name}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Количество</span>
            <span className="font-medium text-gray-900">{cfg.quantity} шт.</span>
          </div>
        </div>

        <div className="border-t border-blue-200 pt-3 mb-4">
          <div className="flex justify-between items-end">
            <span className="text-sm text-gray-600">Цена за 1 шт.</span>
            <span className="text-lg font-bold text-gray-900">{fmt(Math.round(price / cfg.quantity))} ₽</span>
          </div>
          {cfg.quantity > 1 && (
            <div className="flex justify-between items-end mt-1">
              <span className="text-sm text-gray-600">Итого {cfg.quantity} шт.</span>
              <span className="text-2xl font-bold text-blue-700">{fmt(price)} ₽</span>
            </div>
          )}
          {cfg.quantity === 1 && (
            <div className="flex justify-between items-end mt-1">
              <span className="text-sm text-gray-600">Итого</span>
              <span className="text-2xl font-bold text-blue-700">{fmt(price)} ₽</span>
            </div>
          )}
        </div>

        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onAdd}
          disabled={price === 0}
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить в смету
        </Button>
        <p className="text-[11px] text-center text-gray-400 mt-2">
          Расчёт ориентировочный. Точная цена — после замера.
        </p>
      </Card>

      {configs.length > 0 && (
        <Card className="p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Добавлено в смету
          </p>
          <div className="space-y-2">
            {configs.map((c) => {
              const ct = CONSTRUCTION_TYPES.find(x => x.value === c.constructionType);
              const pf = PROFILE_SYSTEMS.find(x => x.id === c.profileSystemId);
              return (
                <div key={c.id} className="flex items-start justify-between gap-2 text-xs border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{ct?.label}</p>
                    <p className="text-gray-500">{c.width}×{c.height} · {pf?.brand} · {c.quantity} шт.</p>
                    <p className="text-blue-600 font-semibold">{fmt(c.totalPrice)} ₽</p>
                  </div>
                  <button
                    onClick={() => onRemove(c.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                  >
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              );
            })}
            <div className="flex justify-between font-bold text-sm pt-1 border-t">
              <span>Итого окна</span>
              <span className="text-blue-700">
                {fmt(configs.reduce((s, c) => s + c.totalPrice, 0))} ₽
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
