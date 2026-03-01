import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { CEILING_TYPES } from "./CeilingTypes";
import type { CeilingConfig } from "./CeilingTypes";
import { calcPrice, fmt } from "./ceilingUtils";
import CalcOrderForm from "@/components/calculator/CalcOrderForm";

const ROOM_PRESETS = ["Гостиная", "Спальня", "Кухня", "Детская", "Коридор", "Ванная", "Кабинет"];

interface Props {
  zones: CeilingConfig[];
  activeId: string;
  markupPct: number;
  totalSum: number;
  totalArea: number;
  renamingId: string | null;
  onSelectZone: (id: string) => void;
  onAddZone: (name?: string) => void;
  onRemoveZone: (id: string) => void;
  onDuplicateZone: (id: string) => void;
  onRenameStart: (id: string) => void;
  onRenameEnd: () => void;
  onRenameChange: (id: string, name: string) => void;
  onExportOpen: () => void;
}

export default function CeilingsZoneList({
  zones,
  activeId,
  markupPct,
  totalSum,
  totalArea,
  renamingId,
  onSelectZone,
  onAddZone,
  onRemoveZone,
  onDuplicateZone,
  onRenameStart,
  onRenameEnd,
  onRenameChange,
  onExportOpen,
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
              className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
            >
              + {name}
            </button>
          ))}
          <button
            onClick={() => onAddZone()}
            className="px-2.5 py-1 bg-white border border-dashed border-gray-300 rounded-full text-xs text-gray-400 hover:border-violet-400 hover:text-violet-600 transition-all"
          >
            + Своё помещение
          </button>
        </div>
      </div>

      {/* Список зон */}
      <div className="space-y-2">
        {zones.map((z, i) => {
          const isActive = z.id === activeId;
          const zBase = calcPrice(z);
          const zPrice = zBase + (markupPct > 0 ? Math.round(zBase * markupPct / 100) : 0);
          const zType = CEILING_TYPES.find(t => t.value === z.ceilingType);
          return (
            <div
              key={z.id}
              onClick={() => onSelectZone(z.id)}
              className={`group relative rounded-xl border p-3 cursor-pointer transition-all ${
                isActive
                  ? "border-violet-400 bg-violet-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isActive ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    {renamingId === z.id ? (
                      <input
                        autoFocus
                        className="w-full text-sm font-semibold border-b border-violet-400 bg-transparent outline-none pb-0.5"
                        value={z.roomName}
                        onChange={e => onRenameChange(z.id, e.target.value)}
                        onBlur={onRenameEnd}
                        onKeyDown={e => e.key === "Enter" && onRenameEnd()}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {z.roomName || `Помещение ${i + 1}`}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {zType?.label} · {z.area} м²
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${isActive ? "text-violet-700" : "text-gray-700"}`}>
                    {fmt(zPrice)} ₽
                  </p>
                  <p className="text-[10px] text-gray-400">{z.area > 0 ? `${fmt(Math.round(zPrice / z.area))} ₽/м²` : ""}</p>
                </div>
              </div>

              {/* Действия */}
              <div className={`flex gap-1 mt-2 pt-2 border-t border-gray-100 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
                <button
                  onClick={e => { e.stopPropagation(); onRenameStart(z.id); }}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-violet-600 px-1.5 py-0.5 rounded transition-colors"
                >
                  <Icon name="Pencil" size={11} />
                  Переименовать
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDuplicateZone(z.id); }}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-violet-600 px-1.5 py-0.5 rounded transition-colors"
                >
                  <Icon name="Copy" size={11} />
                  Копировать
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

      {/* Итого по смете */}
      <Card className="p-4 bg-gradient-to-br from-violet-600 to-purple-700 border-0 text-white">
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
            onClick={onExportOpen}
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
        calcType="Потолки"
        total={`от ${fmt(totalSum)} ₽`}
      />
    </div>
  );
}