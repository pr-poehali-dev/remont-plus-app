import Icon from '@/components/ui/icon';
import { Wall, Opening, Tool } from './types';
import { Label } from './sidebarShared';
import WallProperties from './WallProperties';
import ProjectSummary from './ProjectSummary';

interface SidebarProps {
  walls: Wall[];
  selectedId: string | null;
  tool: Tool;
  isDrawing: boolean;
  wallThickness: number;
  onWallThicknessChange: (thickness: number) => void;
  onAddOpening: (wallId: string, opening: Opening) => void;
  onUpdateOpening: (wallId: string, openingId: string, updates: Partial<Opening>) => void;
  onDeleteOpening: (wallId: string, openingId: string) => void;
  onDeleteWall: (wallId: string) => void;
  onSelect: (id: string | null) => void;
}

export default function ConstructorSidebar({
  walls,
  selectedId,
  tool,
  isDrawing,
  wallThickness,
  onWallThicknessChange,
  onAddOpening,
  onUpdateOpening,
  onDeleteOpening,
  onDeleteWall,
  onSelect,
}: SidebarProps) {
  const selectedWall = walls.find((w) => w.id === selectedId);

  return (
    <div className="w-[280px] bg-[#252536] border-l border-[#3a3a5c] flex flex-col overflow-hidden select-none">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
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

        {selectedWall && (
          <WallProperties
            wall={selectedWall}
            wallThickness={wallThickness}
            onWallThicknessChange={onWallThicknessChange}
            onAddOpening={onAddOpening}
            onUpdateOpening={onUpdateOpening}
            onDeleteOpening={onDeleteOpening}
            onDeleteWall={onDeleteWall}
            onSelect={onSelect}
          />
        )}

        {!selectedWall && !isDrawing && tool === 'select' && (
          <ProjectSummary
            walls={walls}
            wallThickness={wallThickness}
            onWallThicknessChange={onWallThicknessChange}
            onSelect={onSelect}
          />
        )}
      </div>

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
