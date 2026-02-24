import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { FLOOR_TILES, WALL_TILES } from "./BathroomTypes";
import type { BathroomConfig } from "./BathroomTypes";
import { fmt } from "./bathroomUtils";

interface Props {
  cfg: BathroomConfig;
  onUpdate: (patch: Partial<Omit<BathroomConfig, "id">>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BathroomStepTiles({ cfg, onUpdate, onNext, onBack }: Props) {
  const selectedFloorTile = FLOOR_TILES.find(t => t.id === cfg.floorTileId);
  const selectedWallTile = WALL_TILES.find(t => t.id === cfg.wallTileId);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Icon name="Grid3x3" size={12} />
          Плитка пола
        </p>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {FLOOR_TILES.map(tile => (
            <button
              key={tile.id}
              type="button"
              onClick={() => onUpdate({ floorTileId: tile.id })}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                cfg.floorTileId === tile.id
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-200 hover:border-teal-200"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{tile.label}</p>
                <p className="text-xs text-gray-500">{tile.description}</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className={`text-sm font-bold ${cfg.floorTileId === tile.id ? "text-teal-700" : "text-gray-600"}`}>
                  {fmt(tile.materialPriceM2)} ₽/м²
                </p>
                <p className="text-[10px] text-gray-400">+ {fmt(tile.installPriceM2)} укл.</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Icon name="LayoutGrid" size={12} />
          Плитка стен
        </p>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {WALL_TILES.map(tile => (
            <button
              key={tile.id}
              type="button"
              onClick={() => onUpdate({ wallTileId: tile.id })}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                cfg.wallTileId === tile.id
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-200 hover:border-teal-200"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{tile.label}</p>
                <p className="text-xs text-gray-500">{tile.description}</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className={`text-sm font-bold ${cfg.wallTileId === tile.id ? "text-teal-700" : "text-gray-600"}`}>
                  {fmt(tile.materialPriceM2)} ₽/м²
                </p>
                <p className="text-[10px] text-gray-400">+ {fmt(tile.installPriceM2)} укл.</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-1 block">Высота укладки плитки на стены, м</Label>
        <Input
          type="number" min={0.5} max={4} step={0.1}
          value={cfg.wallTileHeightM}
          onChange={e => onUpdate({ wallTileHeightM: parseFloat(e.target.value) || 0.5 })}
          className="h-9"
        />
      </div>

      {selectedFloorTile && selectedWallTile && (
        <div className="bg-teal-50 rounded-lg p-3 text-sm">
          <p className="font-semibold text-teal-800 mb-1">Итог выбора плитки</p>
          <p className="text-xs text-gray-600">Пол: {selectedFloorTile.label} — {fmt(selectedFloorTile.materialPriceM2 + selectedFloorTile.installPriceM2)} ₽/м² (с укладкой)</p>
          <p className="text-xs text-gray-600">Стены: {selectedWallTile.label} — {fmt(selectedWallTile.materialPriceM2 + selectedWallTile.installPriceM2)} ₽/м² (с укладкой)</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 h-10 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Назад
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 h-10 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Далее: сантехника →
        </button>
      </div>
    </div>
  );
}
