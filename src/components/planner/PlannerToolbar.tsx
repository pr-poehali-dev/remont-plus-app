import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { PlannerTool, ViewMode } from "./plannerTypes";

interface PlannerToolbarProps {
  tool: PlannerTool;
  viewMode: ViewMode;
  showGrid: boolean;
  showDimensions: boolean;
  snapToGrid: boolean;
  zoom: number;
  onSetTool: (tool: PlannerTool) => void;
  onSetViewMode: (mode: ViewMode) => void;
  onToggleGrid: () => void;
  onToggleDimensions: () => void;
  onToggleSnap: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAddPreset: (preset: string) => void;
}

const PRESETS = [
  { id: "studio", label: "Студия 28 м\u00B2" },
  { id: "living", label: "Гостиная 20 м\u00B2" },
  { id: "bedroom", label: "Спальня 15 м\u00B2" },
  { id: "kitchen", label: "Кухня 12 м\u00B2" },
  { id: "bathroom", label: "Ванная 5 м\u00B2" },
  { id: "hallway", label: "Коридор 8 м\u00B2" },
];

const TOOLS: { id: PlannerTool; icon: string; label: string; key: string }[] = [
  { id: "select", icon: "MousePointer2", label: "Выбор", key: "V" },
  { id: "wall", icon: "Square", label: "Стена", key: "W" },
  { id: "door", icon: "DoorOpen", label: "Дверь", key: "D" },
  { id: "window", icon: "AppWindow", label: "Окно", key: "N" },
  { id: "furniture", icon: "Armchair", label: "Мебель", key: "F" },
];

const UTILS: { id: PlannerTool; icon: string; label: string; key: string }[] = [
  { id: "measure", icon: "Ruler", label: "Измерение", key: "M" },
  { id: "eraser", icon: "Eraser", label: "Ластик", key: "E" },
];

function ToolBtn({
  active,
  icon,
  label,
  hotkey,
  onClick,
  variant,
}: {
  active: boolean;
  icon: string;
  label: string;
  hotkey?: string;
  onClick: () => void;
  variant?: "green" | "default";
}) {
  const activeClass =
    variant === "green" && active
      ? "bg-green-600 text-white"
      : active
        ? "bg-blue-600 text-white"
        : "bg-gray-700 text-gray-300 hover:bg-gray-600";

  return (
    <button
      onClick={onClick}
      className={`relative flex h-8 w-8 items-center justify-center rounded transition-colors ${activeClass}`}
      title={`${label}${hotkey ? ` (${hotkey})` : ""}`}
    >
      <Icon name={icon} size={16} />
      {hotkey && (
        <span className="absolute -bottom-0.5 -right-0.5 text-[8px] text-gray-400 leading-none">
          {hotkey}
        </span>
      )}
    </button>
  );
}

function Divider() {
  return <div className="mx-1.5 h-6 w-px bg-gray-600" />;
}

function PlannerToolbar({
  tool,
  viewMode,
  showGrid,
  showDimensions,
  snapToGrid,
  zoom,
  onSetTool,
  onSetViewMode,
  onToggleGrid,
  onToggleDimensions,
  onToggleSnap,
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  onAddPreset,
}: PlannerToolbarProps) {
  const [presetsOpen, setPresetsOpen] = useState(false);
  const presetsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setPresetsOpen(false);
      }
    }
    if (presetsOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [presetsOpen]);

  const is2d = viewMode === "2d";
  const zoomPct = Math.round(zoom * 1000);

  return (
    <div className="flex h-10 items-center gap-1 bg-[#1e1e2e] px-2 border-b border-gray-700 select-none">
      <button
        onClick={() => onSetViewMode("2d")}
        className={`h-8 rounded-l px-3 text-xs font-bold transition-colors ${
          is2d ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        2D
      </button>
      <button
        onClick={() => onSetViewMode("3d")}
        className={`h-8 rounded-r px-3 text-xs font-bold transition-colors ${
          !is2d ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        3D
      </button>

      {is2d && (
        <>
          <Divider />
          {TOOLS.map((t) => (
            <ToolBtn
              key={t.id}
              active={tool === t.id}
              icon={t.icon}
              label={t.label}
              hotkey={t.key}
              onClick={() => onSetTool(t.id)}
              variant={t.id === "furniture" ? "green" : "default"}
            />
          ))}
          <Divider />
          {UTILS.map((u) => (
            <ToolBtn
              key={u.id}
              active={tool === u.id}
              icon={u.icon}
              label={u.label}
              hotkey={u.key}
              onClick={() => onSetTool(u.id)}
            />
          ))}
        </>
      )}

      <Divider />
      <div className="relative" ref={presetsRef}>
        <button
          onClick={() => setPresetsOpen((v) => !v)}
          className={`flex h-8 items-center gap-1 rounded px-2 text-xs transition-colors ${
            presetsOpen
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <Icon name="LayoutTemplate" size={14} />
          <span>Шаблон</span>
          <Icon name="ChevronDown" size={12} />
        </button>
        {presetsOpen && (
          <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded border border-gray-600 bg-[#1e1e2e] py-1 shadow-xl">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onAddPreset(p.id);
                  setPresetsOpen(false);
                }}
                className="block w-full px-3 py-1.5 text-left text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <Divider />
      <ToolBtn
        active={false}
        icon="Undo2"
        label="Отменить"
        hotkey="Ctrl+Z"
        onClick={onUndo}
      />
      <ToolBtn
        active={false}
        icon="Redo2"
        label="Повторить"
        hotkey="Ctrl+Y"
        onClick={onRedo}
      />

      {is2d && (
        <>
          <Divider />
          <ToolBtn
            active={showGrid}
            icon="Grid3x3"
            label="Сетка"
            onClick={onToggleGrid}
          />
          <ToolBtn
            active={showDimensions}
            icon="Ruler"
            label="Размеры"
            onClick={onToggleDimensions}
          />
          <ToolBtn
            active={snapToGrid}
            icon="Magnet"
            label="Привязка"
            onClick={onToggleSnap}
          />
        </>
      )}

      <Divider />
      <button
        onClick={onZoomOut}
        className="flex h-8 w-8 items-center justify-center rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        title="Уменьшить"
      >
        <Icon name="Minus" size={14} />
      </button>
      <span className="w-12 text-center text-xs text-gray-300 tabular-nums">
        {zoomPct}%
      </span>
      <button
        onClick={onZoomIn}
        className="flex h-8 w-8 items-center justify-center rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        title="Увеличить"
      >
        <Icon name="Plus" size={14} />
      </button>
      <button
        onClick={onFitView}
        className="flex h-8 w-8 items-center justify-center rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        title="Вписать"
      >
        <Icon name="Maximize2" size={14} />
      </button>
    </div>
  );
}

export default PlannerToolbar;
