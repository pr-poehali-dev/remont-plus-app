import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { FLOORING_PRODUCTS, FLOORING_CATEGORIES } from "@/components/calculator/flooring/FlooringTypes";
import type { FlooringConfig } from "@/components/calculator/flooring/FlooringTypes";
import { fmt } from "@/components/calculator/flooring/flooringUtils";
import CalcOrderForm from "@/components/calculator/CalcOrderForm";

const ROOM_PRESETS = ["Гостиная", "Спальня", "Кухня", "Детская", "Коридор", "Прихожая", "Кабинет", "Ванная"];

interface Props {
  zones: FlooringConfig[];
  activeId: string;
  renamingId: string | null;
  markupPct: number;
  totalSum: number;
  totalArea: number;
  onSelectZone: (id: string) => void;
  onAddZone: (name?: string) => void;
  onRemoveZone: (id: string) => void;
  onDuplicateZone: (id: string) => void;
  onRenameZone: (id: string, name: string) => void;
  onStartRename: (id: string) => void;
  onStopRename: () => void;
  onExport: () => void;
}

export default function FlooringZoneList({
  zones, activeId, renamingId, markupPct, totalSum, totalArea,
  onSelectZone, onAddZone, onRemoveZone, onDuplicateZone,
  onRenameZone, onStartRename, onStopRename, onExport,
}: Props) {
  return (
    <div className="lg:col-span-2 space-y-3">
      {/* Быстрые пресеты */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Icon name="Zap" size={11} />
          Быстрое добавление
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ROOM_PRESETS.map(name => (
            <button
              key={name}
              onClick={() => onAddZone(name)}
              className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50 transition-all"
            >
              + {name}
            </button>
          ))}
          <button
            onClick={() => onAddZone()}
            className="px-2.5 py-1 bg-white border border-dashed border-gray-300 rounded-full text-xs text-gray-400 hover:border-amber-400 hover:text-amber-600 transition-all"
          >
            + Своё
          </button>
        </div>
      </div>

      {/* Список зон */}
      <div className="space-y-2">
        {zones.map((z, i) => {
          const isActive = z.id === activeId;
          const prod = FLOORING_PRODUCTS.find(p => p.id === z.productId);
          const cat = FLOORING_CATEGORIES.find(c => c.value === prod?.category);
          return (
            <div
              key={z.id}
              onClick={() => onSelectZone(z.id)}
              className={`group relative rounded-xl border p-3 cursor-pointer transition-all ${
                isActive
                  ? "border-amber-400 bg-amber-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isActive ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    {renamingId === z.id ? (
                      <input
                        autoFocus
                        className="w-full text-sm font-semibold border-b border-amber-400 bg-transparent outline-none pb-0.5"
                        value={z.roomName}
                        onChange={e => onRenameZone(z.id, e.target.value)}
                        onBlur={onStopRename}
                        onKeyDown={e => e.key === "Enter" && onStopRename()}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {z.roomName || `Помещение ${i + 1}`}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {cat?.icon} {cat?.label} · {z.area} м²
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${isActive ? "text-amber-700" : "text-gray-700"}`}>
                    {fmt(z.totalPrice)} ₽
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {z.area > 0 ? `${fmt(Math.round(z.totalPrice / z.area))} ₽/м²` : ""}
                  </p>
                </div>
              </div>

              {/* Действия */}
              <div className={`flex gap-1 mt-2 pt-2 border-t border-gray-100 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
                <button
                  onClick={e => { e.stopPropagation(); onStartRename(z.id); }}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-amber-600 px-1.5 py-0.5 rounded transition-colors"
                >
                  <Icon name="Pencil" size={11} />
                  Переименовать
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDuplicateZone(z.id); }}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-amber-600 px-1.5 py-0.5 rounded transition-colors"
                >
                  <Icon name="Copy" size={11} />
                  Дублировать
                </button>
                {zones.length > 1 && (
                  <button
                    onClick={e => { e.stopPropagation(); onRemoveZone(z.id); }}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 px-1.5 py-0.5 rounded transition-colors ml-auto"
                  >
                    <Icon name="Trash2" size={11} />
                    Удалить
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Итого */}
      <Card className="p-4 bg-gradient-to-br from-amber-600 to-orange-700 border-0 text-white">
        <p className="text-xs font-semibold opacity-70 uppercase tracking-wide mb-2">Итого по всем зонам</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{fmt(totalSum)} ₽</p>
            <p className="text-xs opacity-60 mt-0.5">
              {fmt(Math.round(totalArea * 10) / 10)} м² · {zones.length} {zones.length === 1 ? "зона" : zones.length < 5 ? "зоны" : "зон"}
            </p>
          </div>
          <Button
            size="sm"
            onClick={onExport}
            className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs"
          >
            <Icon name="FileText" size={13} className="mr-1" />
            Документ
          </Button>
        </div>
        {markupPct > 0 && (
          <p className="text-xs opacity-60 mt-2 flex items-center gap-1">
            <Icon name="Info" size={11} />
            Включая наценку {markupPct}%
          </p>
        )}
      </Card>

      <CalcOrderForm
        calcType="Полы"
        total={`от ${fmt(totalSum)} ₽`}
      />
    </div>
  );
}
