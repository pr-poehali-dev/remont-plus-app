import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { BATHROOM_TYPES } from "@/components/calculator/bathroom/BathroomTypes";
import type { BathroomConfig } from "@/components/calculator/bathroom/BathroomTypes";
import { fmt } from "@/components/calculator/bathroom/bathroomUtils";
import CalcOrderForm from "@/components/calculator/CalcOrderForm";

const ROOM_PRESETS = ["Ванная", "Туалет", "Совмещённый", "Гостевой санузел", "Душевая", "Постирочная"];

interface Props {
  zones: BathroomConfig[];
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
  onSetRenamingId: (id: string | null) => void;
  onOpenExport: () => void;
}

export default function BathroomZoneList({
  zones,
  activeId,
  renamingId,
  markupPct,
  totalSum,
  totalArea,
  onSelectZone,
  onAddZone,
  onRemoveZone,
  onDuplicateZone,
  onRenameZone,
  onSetRenamingId,
  onOpenExport,
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
              type="button"
              onClick={() => onAddZone(name)}
              className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition-all"
            >
              + {name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onAddZone()}
            className="px-2.5 py-1 bg-white border border-dashed border-gray-300 rounded-full text-xs text-gray-400 hover:border-teal-400 hover:text-teal-600 transition-all"
          >
            + Своё
          </button>
        </div>
      </div>

      {/* Список зон */}
      <div className="space-y-2">
        {zones.map((z, i) => {
          const isActive = z.id === activeId;
          const bt = BATHROOM_TYPES.find(b => b.id === z.bathroomType);
          return (
            <div
              key={z.id}
              onClick={() => onSelectZone(z.id)}
              className={`group relative rounded-xl border p-3 cursor-pointer transition-all ${
                isActive
                  ? "border-teal-400 bg-teal-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-teal-200 hover:bg-teal-50/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isActive ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    {renamingId === z.id ? (
                      <input
                        autoFocus
                        className="w-full text-sm font-semibold border-b border-teal-400 bg-transparent outline-none pb-0.5"
                        value={z.roomName}
                        onChange={e => onRenameZone(z.id, e.target.value)}
                        onBlur={() => onSetRenamingId(null)}
                        onKeyDown={e => e.key === "Enter" && onSetRenamingId(null)}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {z.roomName || `Санузел ${i + 1}`}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {bt?.label} · {z.area} м² пол / {z.wallArea} м² стены
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${isActive ? "text-teal-700" : "text-gray-700"}`}>
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
                  type="button"
                  onClick={e => { e.stopPropagation(); onSetRenamingId(z.id); }}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-teal-600 px-1.5 py-0.5 rounded transition-colors"
                >
                  <Icon name="Pencil" size={11} />
                  Переименовать
                </button>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onDuplicateZone(z.id); }}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-teal-600 px-1.5 py-0.5 rounded transition-colors"
                >
                  <Icon name="Copy" size={11} />
                  Дублировать
                </button>
                {zones.length > 1 && (
                  <button
                    type="button"
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
      <Card className="p-4 bg-gradient-to-br from-teal-600 to-teal-800 border-0 text-white">
        <p className="text-xs font-semibold opacity-70 uppercase tracking-wide mb-2">Итого по всем санузлам</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{fmt(totalSum)} ₽</p>
            <p className="text-xs opacity-60 mt-0.5">
              {fmt(Math.round(totalArea * 10) / 10)} м² · {zones.length} {zones.length === 1 ? "санузел" : zones.length < 5 ? "санузла" : "санузлов"}
            </p>
          </div>
          <Button
            size="sm"
            onClick={onOpenExport}
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
        calcType="Санузел"
        total={`от ${fmt(totalSum)} ₽`}
      />
    </div>
  );
}