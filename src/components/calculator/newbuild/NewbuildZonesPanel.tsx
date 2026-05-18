import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { REGIONS, ROOM_TYPES, RENOVATION_LEVELS } from "@/components/calculator/newbuild/NewbuildTypes";
import type { NewbuildConfig } from "@/components/calculator/newbuild/NewbuildTypes";
import { fmt } from "@/components/calculator/newbuild/newbuildUtils";
import EstimateActions from "@/components/calculator/EstimateActions";
import ScreenProtection from "@/components/print/ScreenProtection";
import CalcInlineLeadForm from "@/components/calculator/CalcInlineLeadForm";
import CalcEmailCapture from "@/components/calculator/CalcEmailCapture";
import CalcFindMaster from "@/components/calculator/CalcFindMaster";
import CalcCreateProject from "@/components/calculator/CalcCreateProject";

const ROOM_PRESETS = ["Спальня", "Гостиная", "Кухня", "Ванная", "Прихожая", "Балкон", "Детская", "Кабинет"];

interface ProjectTotals {
  total: number;
  worksTotal: number;
  materialsTotal: number;
  foremanCost: number;
  supplierCost: number;
}

interface Props {
  zones: NewbuildConfig[];
  activeId: string;
  renamingId: string | null;
  totalSum: number;
  totalArea: number;
  markupPct: number;
  regionId: string;
  projectTotals: ProjectTotals;
  foremanIncluded: boolean;
  foremanPct: number;
  supplierIncluded: boolean;
  supplierPct: number;
  onSelectZone: (id: string) => void;
  onAddZone: (name?: string) => void;
  onRemoveZone: (id: string) => void;
  onDuplicateZone: (id: string) => void;
  onRenameZone: (id: string, name: string) => void;
  onSetRenamingId: (id: string | null) => void;
  onShowExport: () => void;
}

export default function NewbuildZonesPanel({
  zones,
  activeId,
  renamingId,
  totalSum,
  totalArea,
  markupPct,
  regionId,
  projectTotals,
  foremanIncluded,
  foremanPct,
  supplierIncluded,
  supplierPct,
  onSelectZone,
  onAddZone,
  onRemoveZone,
  onDuplicateZone,
  onRenameZone,
  onSetRenamingId,
  onShowExport,
}: Props) {
  return (
    <div className="lg:col-span-2 space-y-3">
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
              className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-orange-400 hover:text-orange-700 hover:bg-orange-50 transition-all"
            >
              + {name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onAddZone()}
            className="px-2.5 py-1 bg-white border border-dashed border-gray-300 rounded-full text-xs text-gray-400 hover:border-orange-400 hover:text-orange-600 transition-all"
          >
            + Своё
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {zones.map((z, i) => {
          const isActive = z.id === activeId;
          const rt = ROOM_TYPES.find(r => r.id === z.roomType);
          const lv = RENOVATION_LEVELS.find(l => l.id === z.renovationLevel);
          return (
            <div
              key={z.id}
              onClick={() => onSelectZone(z.id)}
              className={`group relative rounded-xl border p-3 cursor-pointer transition-all ${
                isActive
                  ? "border-orange-400 bg-orange-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isActive ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    {renamingId === z.id ? (
                      <input
                        autoFocus
                        className="w-full text-sm font-semibold border-b border-orange-400 bg-transparent outline-none pb-0.5"
                        value={z.roomName}
                        onChange={e => onRenameZone(z.id, e.target.value)}
                        onBlur={() => onSetRenamingId(null)}
                        onKeyDown={e => e.key === "Enter" && onSetRenamingId(null)}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {z.roomName || `Помещение ${i + 1}`}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {rt?.label} · {z.area} м² · {lv?.label}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${isActive ? "text-orange-700" : "text-gray-700"}`}>
                    {fmt(z.totalPrice)} ₽
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {z.area > 0 ? `${fmt(Math.round(z.totalPrice / z.area))} ₽/м²` : ""}
                  </p>
                </div>
              </div>

              <div className={`flex gap-1 mt-2 pt-2 border-t border-gray-100 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onSetRenamingId(z.id); }}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-orange-600 px-1.5 py-0.5 rounded transition-colors"
                >
                  <Icon name="Pencil" size={11} />
                  Переименовать
                </button>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onDuplicateZone(z.id); }}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-orange-600 px-1.5 py-0.5 rounded transition-colors"
                >
                  <Icon name="Copy" size={11} />
                  Копировать
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
      <ScreenProtection>
      <Card className="p-4 bg-gradient-to-br from-orange-600 to-orange-800 border-0 text-white">
        <p className="text-xs font-semibold opacity-70 uppercase tracking-wide mb-2">Итого по всем помещениям</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{fmt(totalSum)} ₽</p>
            <p className="text-xs opacity-60 mt-0.5">
              {fmt(Math.round(totalArea * 10) / 10)} м² · {zones.length} {zones.length === 1 ? "зона" : zones.length < 5 ? "зоны" : "зон"}
            </p>
          </div>
          <Button
            size="sm"
            onClick={onShowExport}
            className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs"
          >
            <Icon name="FileText" size={13} className="mr-1" />
            Документ
          </Button>
        </div>
        <div className="mt-3 pt-2 border-t border-white/20 grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="opacity-60">Работы</p>
            <p className="font-semibold">{fmt(projectTotals.worksTotal - projectTotals.materialsTotal)} ₽</p>
          </div>
          <div>
            <p className="opacity-60">Материалы</p>
            <p className="font-semibold">{fmt(projectTotals.materialsTotal)} ₽</p>
          </div>
        </div>
        {markupPct > 0 && (
          <p className="text-xs opacity-60 mt-2 flex items-center gap-1">
            <Icon name="Info" size={11} />
            Включая наценку {markupPct}%
          </p>
        )}
        <div className="mt-3 pt-3 border-t border-white/20 [&_button]:border-white/30 [&_button]:text-white [&_button]:hover:bg-white/10 [&_input]:bg-white/10 [&_input]:border-white/30 [&_input]:text-white [&_input]:placeholder:text-white/50">
          <EstimateActions
            onPrint={() => {
              const now = new Date();
              const printState = {
                zones,
                markupPct,
                regionId,
                totalSum,
                foremanIncluded, foremanPct,
                supplierIncluded, supplierPct,
                docNum: String(now.getTime()).slice(-6),
                date: now.toLocaleDateString("ru-RU"),
                docType: "smeta" as const,
              };
              sessionStorage.setItem("newbuild_print_state", JSON.stringify(printState));
              window.open("/newbuild/print", "_blank");
            }}
            calcName="Ремонт в новостройке"
            totalSum={totalSum}
            items={[
              ...zones.map(z => ({ name: z.roomName || "Помещение", price: z.totalPrice })),
              ...(foremanIncluded ? [{ name: `Прораб ${foremanPct}%`, price: projectTotals.foremanCost }] : []),
              ...(supplierIncluded ? [{ name: `Снабженец ${supplierPct}%`, price: projectTotals.supplierCost }] : []),
            ]}
            params={{
              "Помещений": `${zones.length}`,
              "Общая площадь": `${fmt(Math.round(totalArea * 10) / 10)} м²`,
              "Регион": REGIONS.find(r => r.id === regionId)?.label ?? "",
              ...(markupPct > 0 ? { "Наценка": `${markupPct}%` } : {}),
            }}
          />
        </div>
        <CalcInlineLeadForm calcType="Новостройка" totalSum={totalSum} />
      </Card>
      </ScreenProtection>

      <CalcEmailCapture
        calcType="Ремонт в новостройке"
        totalSum={totalSum}
        items={[
          ...zones.map(z => ({ name: z.roomName || "Помещение", price: z.totalPrice })),
          ...(foremanIncluded ? [{ name: `Прораб ${foremanPct}%`, price: projectTotals.foremanCost }] : []),
          ...(supplierIncluded ? [{ name: `Снабженец ${supplierPct}%`, price: projectTotals.supplierCost }] : []),
        ]}
        params={{
          "Помещений": `${zones.length}`,
          "Общая площадь": `${fmt(Math.round(totalArea * 10) / 10)} м²`,
          "Регион": REGIONS.find(r => r.id === regionId)?.label ?? "",
          ...(markupPct > 0 ? { "Наценка": `${markupPct}%` } : {}),
        }}
      />
      <CalcFindMaster calcType="Ремонт в новостройке" totalSum={totalSum} />
      <CalcCreateProject calcType="Ремонт в новостройке" totalSum={totalSum} />
    </div>
  );
}
