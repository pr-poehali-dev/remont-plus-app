import { lazy, Suspense, useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import House3D, { type ViewMode } from "./House3D";
import type { FrameHouseSpec } from "@/lib/frameHouseGenerator";

const House3DAR = lazy(() => import("./House3DAR"));

interface Props {
  spec: FrameHouseSpec;
}

const MODES: Array<{ id: ViewMode; label: string; icon: string }> = [
  { id: "frame", label: "Каркас", icon: "Grip" },
  { id: "sheathed", label: "Обшит", icon: "Layers" },
  { id: "finished", label: "Готовый", icon: "Home" },
];

const TIMES: Array<{ id: "day" | "sunset" | "night"; label: string; icon: string }> = [
  { id: "day", label: "День", icon: "Sun" },
  { id: "sunset", label: "Закат", icon: "Sunset" },
  { id: "night", label: "Ночь", icon: "Moon" },
];

export default function House3DPanel({ spec }: Props) {
  const [mode, setMode] = useState<ViewMode>("finished");
  const [time, setTime] = useState<"day" | "sunset" | "night">("day");
  const [shadows, setShadows] = useState(true);
  const [grid, setGrid] = useState(false);
  const [quality, setQuality] = useState<"high" | "medium">("high");
  const [fullscreen, setFullscreen] = useState(false);
  const [arOpen, setArOpen] = useState(false);

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-[80] bg-slate-900"
          : "relative w-full h-[520px] rounded-xl overflow-hidden bg-gradient-to-b from-sky-100 to-slate-200 dark:from-slate-700 dark:to-slate-900 border border-slate-200 dark:border-slate-700"
      }
    >
      <House3D
        spec={spec}
        mode={mode}
        timeOfDay={time}
        showShadows={shadows}
        showGrid={grid}
        quality={quality}
      />

      {/* Верхняя панель: режим отображения */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
        <div className="flex gap-1 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-lg p-1 shadow-lg border border-slate-200 dark:border-slate-700 pointer-events-auto">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${
                mode === m.id
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon name={m.icon} size={14} />
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <Button
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-orange-500/30"
            onClick={() => setArOpen(true)}
            title="Посмотреть в дополненной реальности на телефоне"
          >
            <Icon name="ScanLine" size={14} className="mr-1" />
            AR
            <span className="ml-1.5 text-[9px] uppercase font-bold bg-white/25 px-1 py-0.5 rounded">
              new
            </span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md shadow-lg"
            onClick={() => setFullscreen(!fullscreen)}
            title={fullscreen ? "Свернуть" : "На весь экран"}
          >
            <Icon name={fullscreen ? "Minimize2" : "Maximize2"} size={14} />
          </Button>
        </div>
      </div>

      {/* Нижняя панель: время суток + опции */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2 pointer-events-none">
        <div className="flex gap-1 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-lg p-1 shadow-lg border border-slate-200 dark:border-slate-700 pointer-events-auto">
          {TIMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTime(t.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${
                time === t.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon name={t.icon} size={14} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-lg p-1 shadow-lg border border-slate-200 dark:border-slate-700 pointer-events-auto">
          <button
            onClick={() => setShadows(!shadows)}
            className={`p-1.5 rounded transition-colors ${
              shadows ? "bg-amber-500 text-white" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Мягкие тени"
          >
            <Icon name="CloudFog" size={14} />
          </button>
          <button
            onClick={() => setGrid(!grid)}
            className={`p-1.5 rounded transition-colors ${
              grid ? "bg-amber-500 text-white" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Сетка"
          >
            <Icon name="Grid3x3" size={14} />
          </button>
          <button
            onClick={() => setQuality(quality === "high" ? "medium" : "high")}
            className={`p-1.5 rounded transition-colors text-[10px] font-bold ${
              quality === "high"
                ? "bg-emerald-500 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            }`}
            title={`Качество: ${quality === "high" ? "высокое" : "среднее"}`}
          >
            {quality === "high" ? "HD" : "SD"}
          </button>
        </div>
      </div>

      {/* Подсказка */}
      <div className="absolute top-1/2 right-3 -translate-y-1/2 hidden md:flex flex-col gap-1 text-[10px] text-white/80 bg-black/30 backdrop-blur rounded-md px-2 py-1.5 pointer-events-none">
        <div>🖱 ЛКМ — вращать</div>
        <div>🖱 ПКМ — двигать</div>
        <div>🖱 Колесо — приближать</div>
      </div>

      {/* AR-режим */}
      {arOpen && (
        <Suspense fallback={null}>
          <House3DAR spec={spec} mode={mode} onClose={() => setArOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}