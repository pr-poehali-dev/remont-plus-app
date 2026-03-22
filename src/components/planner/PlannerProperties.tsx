import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { Wall, PlacedFurniture, Opening } from "./plannerTypes";
import { FURNITURE_CATALOG } from "./furnitureCatalog";
import type { FurnitureItem } from "./furnitureCatalog";

interface PlannerPropertiesProps {
  selectedId: string | null;
  selectedType: "wall" | "furniture" | null;
  walls: Wall[];
  furniture: PlacedFurniture[];
  ceilingHeight: number;
  floorColor: string;
  wallColor: string;
  onUpdateWall: (id: string, updates: Partial<Wall>) => void;
  onDeleteWall: (id: string) => void;
  onUpdateFurniture: (id: string, updates: Partial<PlacedFurniture>) => void;
  onDeleteFurniture: (id: string) => void;
  onSetCeilingHeight: (h: number) => void;
  onSetFloorColor: (c: string) => void;
  onSetWallColor: (c: string) => void;
  onAddOpening: (wallId: string, type: "door" | "window") => void;
  onDeleteOpening: (wallId: string, openingId: string) => void;
}

const FLOOR_PALETTE = ["#E8DCC8", "#D4C4A8", "#C9B99A", "#BEB5A0", "#A09080", "#F5F0E8"];
const WALL_PALETTE = ["#F5F0E8", "#EDEAE2", "#E0DDD5", "#D6D0C4", "#C8C0B0", "#FFFFFF"];

const catalogMap = new Map<string, FurnitureItem>();
for (const item of FURNITURE_CATALOG) {
  catalogMap.set(item.id, item);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </div>
  );
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <span className="shrink-0 text-xs text-gray-400">{label}</span>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}

function formatMm(mm: number): string {
  return Math.round(mm)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function PlannerProperties({
  selectedId,
  selectedType,
  walls,
  furniture,
  ceilingHeight,
  floorColor,
  wallColor,
  onUpdateWall,
  onDeleteWall,
  onUpdateFurniture,
  onDeleteFurniture,
  onSetCeilingHeight,
  onSetFloorColor,
  onSetWallColor,
  onAddOpening,
  onDeleteOpening,
}: PlannerPropertiesProps) {
  const selectedWall = useMemo(() => {
    if (selectedType !== "wall" || !selectedId) return null;
    return walls.find((w) => w.id === selectedId) || null;
  }, [selectedId, selectedType, walls]);

  const selectedFurniture = useMemo(() => {
    if (selectedType !== "furniture" || !selectedId) return null;
    return furniture.find((f) => f.id === selectedId) || null;
  }, [selectedId, selectedType, furniture]);

  const catalogItem = useMemo(() => {
    if (!selectedFurniture) return null;
    return catalogMap.get(selectedFurniture.itemId) || null;
  }, [selectedFurniture]);

  const totalPerimeter = useMemo(() => {
    return walls.reduce(
      (sum, w) => sum + Math.hypot(w.end.x - w.start.x, w.end.y - w.start.y),
      0
    );
  }, [walls]);

  const renderGeneralSettings = () => (
    <>
      <SectionTitle>Общие настройки</SectionTitle>

      <PropRow label="Потолок">
        <span className="text-xs text-white tabular-nums w-14 text-right">
          {ceilingHeight} мм
        </span>
      </PropRow>
      <input
        type="range"
        min={2000}
        max={4000}
        step={100}
        value={ceilingHeight}
        onChange={(e) => onSetCeilingHeight(Number(e.target.value))}
        className="mb-4 w-full accent-blue-500"
      />

      <PropRow label="Цвет пола">
        <input
          type="color"
          value={floorColor}
          onChange={(e) => onSetFloorColor(e.target.value)}
          className="h-6 w-6 cursor-pointer rounded border border-gray-600 bg-transparent"
        />
      </PropRow>
      <div className="mb-4 flex gap-1">
        {FLOOR_PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => onSetFloorColor(c)}
            className={`h-6 w-6 rounded border transition-colors ${
              floorColor === c ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-600"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <PropRow label="Цвет стен">
        <input
          type="color"
          value={wallColor}
          onChange={(e) => onSetWallColor(e.target.value)}
          className="h-6 w-6 cursor-pointer rounded border border-gray-600 bg-transparent"
        />
      </PropRow>
      <div className="mb-4 flex gap-1">
        {WALL_PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => onSetWallColor(c)}
            className={`h-6 w-6 rounded border transition-colors ${
              wallColor === c ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-600"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <SectionTitle>Статистика</SectionTitle>
      <div className="space-y-1 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Стен</span>
          <span className="text-white">{walls.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Мебели</span>
          <span className="text-white">{furniture.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Периметр</span>
          <span className="text-white">{formatMm(totalPerimeter)} мм</span>
        </div>
      </div>
    </>
  );

  const renderWallProps = () => {
    if (!selectedWall) return null;
    const len = Math.hypot(
      selectedWall.end.x - selectedWall.start.x,
      selectedWall.end.y - selectedWall.start.y
    );

    return (
      <>
        <SectionTitle>Стена</SectionTitle>

        <PropRow label="Длина">
          <span className="text-xs text-white tabular-nums">
            {formatMm(len)} мм
          </span>
        </PropRow>

        <PropRow label="Толщина">
          <span className="text-xs text-white tabular-nums w-14 text-right">
            {selectedWall.thickness} мм
          </span>
        </PropRow>
        <input
          type="range"
          min={80}
          max={400}
          step={10}
          value={selectedWall.thickness}
          onChange={(e) =>
            onUpdateWall(selectedWall.id, { thickness: Number(e.target.value) })
          }
          className="mb-4 w-full accent-blue-500"
        />

        <SectionTitle>Проёмы ({selectedWall.openings.length})</SectionTitle>
        {selectedWall.openings.length > 0 && (
          <div className="mb-2 space-y-1">
            {selectedWall.openings.map((op) => (
              <div
                key={op.id}
                className="flex items-center justify-between rounded bg-gray-800 px-2 py-1"
              >
                <div className="flex items-center gap-1.5">
                  <Icon
                    name={op.type === "door" ? "DoorOpen" : "AppWindow"}
                    size={12}
                    className={op.type === "door" ? "text-green-400" : "text-blue-400"}
                  />
                  <span className="text-[11px] text-gray-300">
                    {op.type === "door" ? "Дверь" : "Окно"} {op.width} мм
                  </span>
                </div>
                <button
                  onClick={() => onDeleteOpening(selectedWall.id, op.id)}
                  className="flex h-5 w-5 items-center justify-center rounded text-gray-500 hover:bg-red-900/50 hover:text-red-400 transition-colors"
                >
                  <Icon name="X" size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mb-4 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddOpening(selectedWall.id, "door")}
            className="flex-1 h-7 gap-1 text-[11px] text-green-400 hover:bg-green-900/30 hover:text-green-300"
          >
            <Icon name="DoorOpen" size={12} />
            Дверь
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddOpening(selectedWall.id, "window")}
            className="flex-1 h-7 gap-1 text-[11px] text-blue-400 hover:bg-blue-900/30 hover:text-blue-300"
          >
            <Icon name="AppWindow" size={12} />
            Окно
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteWall(selectedWall.id)}
          className="w-full h-8 text-xs text-red-400 hover:bg-red-900/30 hover:text-red-300"
        >
          <Icon name="Trash2" size={14} />
          Удалить стену
        </Button>
      </>
    );
  };

  const renderFurnitureProps = () => {
    if (!selectedFurniture || !catalogItem) return null;

    return (
      <>
        <SectionTitle>Мебель</SectionTitle>

        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">{catalogItem.icon}</span>
          <div>
            <div className="text-sm font-medium text-white">{catalogItem.name}</div>
            <div className="text-[10px] text-gray-500">
              {catalogItem.width} x {catalogItem.depth} x {catalogItem.height} мм
            </div>
          </div>
        </div>

        <SectionTitle>Поворот</SectionTitle>
        <div className="mb-3 flex gap-1">
          {[0, 90, 180, 270].map((deg) => (
            <button
              key={deg}
              onClick={() =>
                onUpdateFurniture(selectedFurniture.id, { rotation: deg })
              }
              className={`flex h-8 flex-1 items-center justify-center rounded text-xs font-medium transition-colors ${
                selectedFurniture.rotation === deg
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600"
              }`}
            >
              {deg}\u00B0
            </button>
          ))}
        </div>

        <PropRow label="Отразить">
          <button
            onClick={() =>
              onUpdateFurniture(selectedFurniture.id, {
                flipped: !selectedFurniture.flipped,
              })
            }
            className={`flex h-7 items-center gap-1 rounded px-2 text-xs transition-colors ${
              selectedFurniture.flipped
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
            }`}
          >
            <Icon name="FlipHorizontal2" size={12} />
            {selectedFurniture.flipped ? "Вкл" : "Выкл"}
          </button>
        </PropRow>

        <SectionTitle>Координаты</SectionTitle>
        <div className="mb-1 flex gap-2">
          <div className="flex-1">
            <label className="mb-0.5 block text-[10px] text-gray-500">X (мм)</label>
            <input
              type="number"
              value={Math.round(selectedFurniture.x)}
              onChange={(e) =>
                onUpdateFurniture(selectedFurniture.id, { x: Number(e.target.value) })
              }
              className="w-full rounded bg-gray-800 px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500 tabular-nums"
            />
          </div>
          <div className="flex-1">
            <label className="mb-0.5 block text-[10px] text-gray-500">Y (мм)</label>
            <input
              type="number"
              value={Math.round(selectedFurniture.y)}
              onChange={(e) =>
                onUpdateFurniture(selectedFurniture.id, { y: Number(e.target.value) })
              }
              className="w-full rounded bg-gray-800 px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500 tabular-nums"
            />
          </div>
        </div>

        <div className="mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteFurniture(selectedFurniture.id)}
            className="w-full h-8 text-xs text-red-400 hover:bg-red-900/30 hover:text-red-300"
          >
            <Icon name="Trash2" size={14} />
            Удалить
          </Button>
        </div>
      </>
    );
  };

  const hasSelection = selectedId && selectedType;

  return (
    <div className="flex h-full w-72 flex-col border-l border-gray-700 bg-[#1e1e2e] text-white select-none">
      <div className="border-b border-gray-700 px-3 py-2">
        <span className="text-sm font-semibold">
          {!hasSelection && "Свойства"}
          {selectedType === "wall" && "Стена"}
          {selectedType === "furniture" && "Мебель"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {!hasSelection && renderGeneralSettings()}
        {selectedType === "wall" && renderWallProps()}
        {selectedType === "furniture" && renderFurnitureProps()}
      </div>
    </div>
  );
}

export default PlannerProperties;
