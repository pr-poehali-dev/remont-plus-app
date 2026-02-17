import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import {
  type Room,
  type ApartmentPreset,
  type AreaTotals,
  presets,
  roomAreas,
} from "./calc-data";

interface RoomEditorProps {
  rooms: Room[];
  expanded: string | null;
  totals: AreaTotals;
  onUpdateRoom: (id: string, field: Partial<Room>) => void;
  onRemoveRoom: (id: string) => void;
  onAddRoom: () => void;
  onApplyPreset: (preset: ApartmentPreset) => void;
  onSetExpanded: (id: string | null) => void;
}

export default function RoomEditor({
  rooms,
  expanded,
  totals,
  onUpdateRoom,
  onRemoveRoom,
  onAddRoom,
  onApplyPreset,
  onSetExpanded,
}: RoomEditorProps) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            className="h-auto py-1.5 px-2 border-amber-200 hover:bg-amber-50 hover:border-amber-400 flex flex-col items-center gap-0.5"
            onClick={() => onApplyPreset(preset)}
          >
            <div className="flex items-center gap-1">
              <Icon name={preset.icon} className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-medium">{preset.label}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{preset.area}</span>
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {rooms.map((room, idx) => {
          const areas = roomAreas(room);
          const isExpanded = expanded === room.id;

          return (
            <div key={room.id} className="border rounded-lg bg-white overflow-hidden">
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none hover:bg-gray-50"
                onClick={() => onSetExpanded(isExpanded ? null : room.id)}
              >
                <Icon
                  name={isExpanded ? "ChevronDown" : "ChevronRight"}
                  className="h-4 w-4 text-gray-400 shrink-0"
                />
                <Input
                  value={room.name}
                  onChange={(e) => onUpdateRoom(room.id, { name: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="h-7 text-sm font-medium border-0 shadow-none px-1 bg-transparent focus-visible:ring-1 max-w-[140px]"
                />
                {areas.valid && (
                  <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 ml-auto shrink-0">
                    {areas.floor.toFixed(1)} м²
                  </Badge>
                )}
                {!areas.valid && idx === 0 && (
                  <span className="text-xs text-gray-400 ml-auto">Укажите размеры</span>
                )}
                {rooms.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-red-500 shrink-0"
                    onClick={(e) => { e.stopPropagation(); onRemoveRoom(room.id); }}
                  >
                    <Icon name="X" className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Длина (м)</label>
                      <Input
                        type="number" min="0" step="0.1" placeholder="0"
                        value={room.length}
                        onChange={(e) => onUpdateRoom(room.id, { length: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Ширина (м)</label>
                      <Input
                        type="number" min="0" step="0.1" placeholder="0"
                        value={room.width}
                        onChange={(e) => onUpdateRoom(room.id, { width: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Высота (м)</label>
                      <Input
                        type="number" min="0" step="0.1"
                        value={room.height}
                        onChange={(e) => onUpdateRoom(room.id, { height: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Дверей</label>
                      <Input
                        type="number" min="0" step="1"
                        value={room.doors}
                        onChange={(e) => onUpdateRoom(room.id, { doors: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Окон</label>
                      <Input
                        type="number" min="0" step="1"
                        value={room.windows}
                        onChange={(e) => onUpdateRoom(room.id, { windows: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  {areas.valid && (
                    <div className="flex flex-wrap gap-1.5 mt-2 text-[10px]">
                      <span className="text-gray-500">Пол: {areas.floor.toFixed(1)} м²</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-500">Стены: {areas.wall.toFixed(1)} м²</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-500">Потолок: {areas.ceiling.toFixed(1)} м²</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          className="w-full border-dashed border-amber-300 text-amber-700 hover:bg-amber-50"
          onClick={onAddRoom}
        >
          <Icon name="Plus" className="h-3.5 w-3.5 mr-1.5" />
          Добавить комнату
        </Button>
      </div>

      {totals.hasValid && (
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className="border-amber-300 bg-white text-amber-800">
            <Icon name="Home" className="h-3 w-3 mr-1" />
            {totals.validCount} {totals.validCount === 1 ? "комната" : totals.validCount < 5 ? "комнаты" : "комнат"}
          </Badge>
          <Badge variant="outline" className="border-amber-300 bg-white text-amber-800">
            <Icon name="Layers" className="h-3 w-3 mr-1" />
            Пол: {totals.floor.toFixed(1)} м²
          </Badge>
          <Badge variant="outline" className="border-amber-300 bg-white text-amber-800">
            <Icon name="PanelLeft" className="h-3 w-3 mr-1" />
            Стены: {totals.wall.toFixed(1)} м²
          </Badge>
          <Badge variant="outline" className="border-amber-300 bg-white text-amber-800">
            <Icon name="ArrowUpFromLine" className="h-3 w-3 mr-1" />
            Потолок: {totals.ceiling.toFixed(1)} м²
          </Badge>
        </div>
      )}
    </>
  );
}
