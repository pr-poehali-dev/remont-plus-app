import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Wall, Opening, Tool } from './types';
import { wallLength, formatDimension, generateId } from './canvasEngine';

interface SidebarProps {
  walls: Wall[];
  selectedId: string | null;
  tool: Tool;
  isDrawing: boolean;
  wallThickness: number;
  onWallThicknessChange: (thickness: number) => void;
  onAddOpening: (wallId: string, opening: Opening) => void;
  onDeleteOpening: (wallId: string, openingId: string) => void;
  onDeleteWall: (wallId: string) => void;
  onSelect: (id: string | null) => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] tracking-wider uppercase text-gray-500 mb-1.5">
      {children}
    </div>
  );
}

function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs text-white font-mono">{value}</span>
    </div>
  );
}

export default function ConstructorSidebar({
  walls,
  selectedId,
  tool,
  isDrawing,
  wallThickness,
  onWallThicknessChange,
  onAddOpening,
  onDeleteOpening,
  onDeleteWall,
  onSelect,
}: SidebarProps) {
  const selectedWall = walls.find((w) => w.id === selectedId);

  // Calculate total wall length and estimated floor area
  const totalLength = walls.reduce((acc, w) => acc + wallLength(w), 0);

  // Very rough area estimate from bounding box of all walls
  const estimateArea = () => {
    if (walls.length === 0) return 0;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const w of walls) {
      minX = Math.min(minX, w.start.x, w.end.x);
      minY = Math.min(minY, w.start.y, w.end.y);
      maxX = Math.max(maxX, w.start.x, w.end.x);
      maxY = Math.max(maxY, w.start.y, w.end.y);
    }
    return ((maxX - minX) * (maxY - minY)) / 1_000_000; // m^2
  };

  const totalArea = estimateArea();

  return (
    <div className="w-[280px] bg-[#252536] border-l border-[#3a3a5c] flex flex-col overflow-hidden select-none">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Drawing mode instructions */}
        {isDrawing && tool === 'wall' && (
          <div className="space-y-2">
            <Label>Рисование стены</Label>
            <div className="bg-[#1e1e2e] rounded-lg p-3 space-y-1.5">
              <p className="text-xs text-gray-300 leading-relaxed">
                Кликните, чтобы добавить точки стены. Двойной клик или Enter — завершить.
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Shift — привязка к углам (0/45/90°). Escape — отмена.
              </p>
            </div>
          </div>
        )}

        {tool === 'door' && !selectedWall && (
          <div className="space-y-2">
            <Label>Установка двери</Label>
            <div className="bg-[#1e1e2e] rounded-lg p-3">
              <p className="text-xs text-gray-300 leading-relaxed">
                Кликните на стену, чтобы добавить дверной проём (900 мм).
              </p>
            </div>
          </div>
        )}

        {tool === 'window' && !selectedWall && (
          <div className="space-y-2">
            <Label>Установка окна</Label>
            <div className="bg-[#1e1e2e] rounded-lg p-3">
              <p className="text-xs text-gray-300 leading-relaxed">
                Кликните на стену, чтобы добавить оконный проём (1 200 мм).
              </p>
            </div>
          </div>
        )}

        {tool === 'measure' && (
          <div className="space-y-2">
            <Label>Измерение</Label>
            <div className="bg-[#1e1e2e] rounded-lg p-3">
              <p className="text-xs text-gray-300 leading-relaxed">
                Кликните две точки, чтобы измерить расстояние.
              </p>
            </div>
          </div>
        )}

        {tool === 'eraser' && (
          <div className="space-y-2">
            <Label>Ластик</Label>
            <div className="bg-[#1e1e2e] rounded-lg p-3">
              <p className="text-xs text-gray-300 leading-relaxed">
                Кликните на стену, чтобы удалить её.
              </p>
            </div>
          </div>
        )}

        {/* Selected wall properties */}
        {selectedWall && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Выбранная стена</Label>
              <div className="bg-[#1e1e2e] rounded-lg p-3 space-y-1">
                <PropertyRow
                  label="Длина"
                  value={`${formatDimension(wallLength(selectedWall))} мм`}
                />
                <PropertyRow
                  label="Толщина"
                  value={`${selectedWall.thickness} мм`}
                />
                <PropertyRow
                  label="Начало"
                  value={`${Math.round(selectedWall.start.x)}, ${Math.round(selectedWall.start.y)}`}
                />
                <PropertyRow
                  label="Конец"
                  value={`${Math.round(selectedWall.end.x)}, ${Math.round(selectedWall.end.y)}`}
                />
              </div>
            </div>

            {/* Thickness control */}
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

            {/* Openings */}
            <div className="space-y-2">
              <Label>Проёмы</Label>
              {selectedWall.openings.length === 0 && (
                <p className="text-xs text-gray-500 italic">Нет проёмов</p>
              )}
              {selectedWall.openings.map((op) => (
                <div
                  key={op.id}
                  className="flex items-center justify-between bg-[#1e1e2e] rounded-md px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      name={op.type === 'door' ? 'DoorOpen' : 'AppWindow'}
                      fallback="Square"
                      size={14}
                      className={op.type === 'door' ? 'text-[#4ade80]' : 'text-[#60a5fa]'}
                    />
                    <span className="text-xs text-gray-300">{op.type === 'door' ? 'Дверь' : 'Окно'}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{op.width} мм</span>
                  </div>
                  <button
                    onClick={() => onDeleteOpening(selectedWall.id, op.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ))}

              <div className="flex gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onAddOpening(selectedWall.id, {
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
                    onAddOpening(selectedWall.id, {
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

            {/* Delete wall */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onDeleteWall(selectedWall.id);
                onSelect(null);
              }}
              className="w-full h-8 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <Icon name="Trash2" size={14} className="mr-1.5" />
              Удалить стену
            </Button>
          </div>
        )}

        {/* General project info (when nothing selected and not drawing) */}
        {!selectedWall && !isDrawing && tool === 'select' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Сводка проекта</Label>
              <div className="bg-[#1e1e2e] rounded-lg p-3 space-y-1">
                <PropertyRow label="Стены" value={`${walls.length}`} />
                <PropertyRow
                  label="Общая длина"
                  value={`${formatDimension(totalLength)} мм`}
                />
                <PropertyRow
                  label="Площадь"
                  value={`${totalArea.toFixed(1)} м\u00B2`}
                />
                <PropertyRow
                  label="Двери"
                  value={`${walls.reduce((a, w) => a + w.openings.filter((o) => o.type === 'door').length, 0)}`}
                />
                <PropertyRow
                  label="Окна"
                  value={`${walls.reduce((a, w) => a + w.openings.filter((o) => o.type === 'window').length, 0)}`}
                />
              </div>
            </div>

            {/* Default wall thickness */}
            <div className="space-y-2">
              <Label>Толщина стен по умолчанию</Label>
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

            {/* Wall list */}
            {walls.length > 0 && (
              <div className="space-y-2">
                <Label>Список стен</Label>
                <div className="space-y-1 max-h-[240px] overflow-y-auto">
                  {walls.map((wall, i) => (
                    <button
                      key={wall.id}
                      onClick={() => onSelect(wall.id)}
                      className="w-full flex items-center justify-between bg-[#1e1e2e] rounded-md px-3 py-2 hover:bg-[#3a3a5c] transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 font-mono w-5">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-xs text-gray-300">Стена</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {formatDimension(wallLength(wall))} мм
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Keyboard shortcuts footer */}
      <div className="border-t border-[#3a3a5c] px-4 py-3">
        <Label>Горячие клавиши</Label>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1">
          {[
            ['Esc', 'Отмена'],
            ['Del', 'Удалить'],
            ['Ctrl+Z', 'Назад'],
            ['G', 'Сетка'],
            ['S', 'Привязка'],
            ['Shift', 'Углы'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center gap-1.5">
              <kbd className="text-[9px] bg-[#1e1e2e] text-gray-500 px-1.5 py-0.5 rounded font-mono">
                {key}
              </kbd>
              <span className="text-[9px] text-gray-600">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}