import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Wall, Opening } from './types';
import { wallLength, formatDimension, generateId } from './canvasEngine';
import { Label, PropertyRow } from './sidebarShared';

interface WallPropertiesProps {
  wall: Wall;
  wallThickness: number;
  onWallThicknessChange: (thickness: number) => void;
  onAddOpening: (wallId: string, opening: Opening) => void;
  onUpdateOpening: (wallId: string, openingId: string, updates: Partial<Opening>) => void;
  onDeleteOpening: (wallId: string, openingId: string) => void;
  onDeleteWall: (wallId: string) => void;
  onSelect: (id: string | null) => void;
}

export default function WallProperties({
  wall,
  wallThickness,
  onWallThicknessChange,
  onAddOpening,
  onUpdateOpening,
  onDeleteOpening,
  onDeleteWall,
  onSelect,
}: WallPropertiesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Выбранная стена</Label>
        <div className="bg-[#1e1e2e] rounded-lg p-3 space-y-1">
          <PropertyRow
            label="Длина"
            value={`${formatDimension(wallLength(wall))} мм`}
          />
          <PropertyRow
            label="Толщина"
            value={`${wall.thickness} мм`}
          />
          <PropertyRow
            label="Начало"
            value={`${Math.round(wall.start.x)}, ${Math.round(wall.start.y)}`}
          />
          <PropertyRow
            label="Конец"
            value={`${Math.round(wall.end.x)}, ${Math.round(wall.end.y)}`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Толщина стены</Label>
        <div className="space-y-2">
          <Slider
            value={[wallThickness]}
            min={80}
            max={400}
            step={10}
            onValueChange={([val]) => onWallThicknessChange(val)}
            className="[&_[role=slider]]:bg-[#00d4ff] [&_[role=slider]]:border-[#00d4ff] [&_.bg-primary]:bg-[#00d4ff]"
          />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={wallThickness}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (v >= 80 && v <= 400) onWallThicknessChange(v);
              }}
              className="h-7 bg-[#1e1e2e] border-[#3a3a5c] text-white text-xs font-mono w-20"
            />
            <span className="text-[10px] text-gray-500">мм</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Проёмы</Label>
        {wall.openings.length === 0 && (
          <p className="text-xs text-gray-500 italic">Нет проёмов</p>
        )}
        {wall.openings.map((op) => (
          <div key={op.id} className="bg-[#1e1e2e] rounded-md px-3 py-2 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon
                  name={op.type === 'door' ? 'DoorOpen' : 'AppWindow'}
                  fallback="Square"
                  size={14}
                  className={op.type === 'door' ? 'text-[#4ade80]' : 'text-[#60a5fa]'}
                />
                <span className="text-xs text-gray-300">{op.type === 'door' ? 'Дверь' : 'Окно'}</span>
              </div>
              <button
                onClick={() => onDeleteOpening(wall.id, op.id)}
                className="text-gray-500 hover:text-red-400 transition-colors"
              >
                <Icon name="X" size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 w-12">Ширина</span>
              <Input
                type="number"
                value={op.width}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (v >= 400 && v <= 3000) onUpdateOpening(wall.id, op.id, { width: v });
                }}
                className="h-6 bg-[#252536] border-[#3a3a5c] text-white text-xs font-mono w-20"
              />
              <span className="text-[10px] text-gray-500">мм</span>
            </div>
            {op.type === 'door' && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-12">Откр.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdateOpening(wall.id, op.id, { direction: op.direction === 'left' ? 'right' : 'left' })}
                  className="h-6 text-[10px] text-gray-300 px-2"
                >
                  <Icon name={op.direction === 'left' ? 'ArrowLeftToLine' : 'ArrowRightToLine'} fallback="ArrowRight" size={12} className="mr-1" />
                  {op.direction === 'left' ? 'Влево' : 'Вправо'}
                </Button>
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onAddOpening(wall.id, {
                id: generateId(),
                type: 'door',
                position: 0.5,
                width: 900,
                direction: 'left',
              });
            }}
            className="h-7 text-xs text-[#4ade80] hover:bg-[#4ade80]/10 hover:text-[#4ade80] flex-1"
          >
            <Icon name="Plus" size={12} className="mr-1" />
            Дверь
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onAddOpening(wall.id, {
                id: generateId(),
                type: 'window',
                position: 0.5,
                width: 1200,
              });
            }}
            className="h-7 text-xs text-[#60a5fa] hover:bg-[#60a5fa]/10 hover:text-[#60a5fa] flex-1"
          >
            <Icon name="Plus" size={12} className="mr-1" />
            Окно
          </Button>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          onDeleteWall(wall.id);
          onSelect(null);
        }}
        className="w-full h-8 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-400"
      >
        <Icon name="Trash2" size={14} className="mr-1.5" />
        Удалить стену
      </Button>
    </div>
  );
}
