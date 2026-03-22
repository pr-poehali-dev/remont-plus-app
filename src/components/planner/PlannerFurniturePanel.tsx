import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import {
  FURNITURE_CATALOG,
  CATEGORY_LABELS,
  type FurnitureCategory,
} from "./furnitureCatalog";

interface PlannerFurniturePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDragStart: (itemId: string) => void;
  onAddFurniture: (itemId: string) => void;
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as FurnitureCategory[];

function PlannerFurniturePanel({
  isOpen,
  onClose,
  onDragStart,
  onAddFurniture,
}: PlannerFurniturePanelProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<FurnitureCategory | "all">("all");

  const filtered = useMemo(() => {
    let items = FURNITURE_CATALOG;
    if (activeCategory !== "all") {
      items = items.filter((i) => i.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q));
    }
    return items;
  }, [search, activeCategory]);

  if (!isOpen) return null;

  return (
    <div className="flex h-full w-72 flex-col border-l border-gray-700 bg-[#1e1e2e] text-white select-none">
      <div className="flex items-center justify-between border-b border-gray-700 px-3 py-2">
        <span className="text-sm font-semibold">Мебель</span>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-700 transition-colors"
        >
          <Icon name="X" size={14} />
        </button>
      </div>

      <div className="px-3 py-2">
        <div className="flex items-center gap-2 rounded bg-gray-800 px-2 py-1.5">
          <Icon name="Search" size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск мебели..."
            className="w-full bg-transparent text-xs text-white placeholder-gray-500 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="shrink-0 text-gray-500 hover:text-gray-300"
            >
              <Icon name="X" size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto px-3 pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory("all")}
          className={`shrink-0 rounded px-2 py-1 text-[10px] font-medium transition-colors ${
            activeCategory === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-200"
          }`}
        >
          Все
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded px-2 py-1 text-[10px] font-medium transition-colors ${
              activeCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-200"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {filtered.length === 0 && (
          <div className="py-8 text-center text-xs text-gray-500">
            Ничего не найдено
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((item) => (
            <button
              key={item.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", item.id);
                onDragStart(item.id);
              }}
              onClick={() => onAddFurniture(item.id)}
              className="group flex flex-col items-center gap-1 rounded border border-gray-700 bg-gray-800/50 px-2 py-2.5 transition-colors hover:border-blue-500 hover:bg-gray-700/70 cursor-grab active:cursor-grabbing"
            >
              <span className="text-2xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-medium text-gray-300 leading-tight text-center line-clamp-2">
                {item.name}
              </span>
              <span className="text-[9px] text-gray-500">
                {item.width}x{item.depth}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-700 px-3 py-2 text-[10px] text-gray-500">
        {filtered.length} шт. | Перетащите или кликните
      </div>
    </div>
  );
}

export default PlannerFurniturePanel;
