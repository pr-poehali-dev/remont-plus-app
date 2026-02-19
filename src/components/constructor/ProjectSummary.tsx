import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Wall } from './types';
import { wallLength, formatDimension } from './canvasEngine';
import { calculateEstimate, formatPrice, exportEstimatePDF } from './materialsEstimate';
import { Label, PropertyRow } from './sidebarShared';

interface ProjectSummaryProps {
  walls: Wall[];
  wallThickness: number;
  onWallThicknessChange: (v: number) => void;
  onSelect: (id: string | null) => void;
}

export default function ProjectSummary({
  walls,
  wallThickness,
  onWallThicknessChange,
  onSelect,
}: ProjectSummaryProps) {
  const [ceilingHeight, setCeilingHeight] = useState(2700);
  const [showEstimate, setShowEstimate] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const estimate = useMemo(
    () => calculateEstimate(walls, ceilingHeight),
    [walls, ceilingHeight]
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Сводка проекта</Label>
        <div className="bg-[#1e1e2e] rounded-lg p-3 space-y-1">
          <PropertyRow label="Стены" value={`${walls.length}`} />
          <PropertyRow label="Периметр" value={`${estimate.perimeterM} м`} />
          <PropertyRow label="Площадь пола" value={`${estimate.floorArea} м²`} />
          <PropertyRow label="Площадь стен" value={`${estimate.wallArea} м²`} />
          <PropertyRow label="Двери" value={`${estimate.doorsCount}`} />
          <PropertyRow label="Окна" value={`${estimate.windowsCount}`} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Высота потолка</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={ceilingHeight}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (v >= 2000 && v <= 5000) setCeilingHeight(v);
            }}
            className="h-7 bg-[#1e1e2e] border-[#3a3a5c] text-white text-xs font-mono w-20"
          />
          <span className="text-[10px] text-gray-500">мм</span>
        </div>
      </div>

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

      {walls.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowEstimate(!showEstimate)}
            className="w-full flex items-center justify-between"
          >
            <Label>Смета материалов</Label>
            <Icon
              name={showEstimate ? 'ChevronUp' : 'ChevronDown'}
              size={14}
              className="text-gray-500"
            />
          </button>

          {!showEstimate && (
            <div
              className="bg-gradient-to-r from-[#00d4ff]/10 to-[#4ade80]/10 border border-[#3a3a5c] rounded-lg p-3 cursor-pointer hover:border-[#00d4ff]/40 transition-colors"
              onClick={() => setShowEstimate(true)}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Итого материалы</span>
                <span className="text-sm font-bold text-[#00d4ff] font-mono">
                  {formatPrice(estimate.grandTotal)} ₽
                </span>
              </div>
              <p className="text-[10px] text-gray-600 mt-1">
                Нажмите для детализации
              </p>
            </div>
          )}

          {showEstimate && (
            <div className="space-y-2">
              {estimate.categories.map((cat) => (
                <div key={cat.title} className="bg-[#1e1e2e] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedCat(expandedCat === cat.title ? null : cat.title)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#3a3a5c]/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon name={cat.icon} fallback="Package" size={13} className="text-[#00d4ff]" />
                      <span className="text-xs text-gray-300">{cat.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-gray-400">
                        {formatPrice(cat.subtotal)} ₽
                      </span>
                      <Icon
                        name={expandedCat === cat.title ? 'ChevronUp' : 'ChevronDown'}
                        size={12}
                        className="text-gray-600"
                      />
                    </div>
                  </button>

                  {expandedCat === cat.title && (
                    <div className="px-3 pb-2 space-y-1.5">
                      {cat.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-0.5">
                          <div className="flex-1 min-w-0 mr-2">
                            <span className="text-[10px] text-gray-400 block truncate">
                              {item.name}
                            </span>
                            <span className="text-[9px] text-gray-600">
                              {item.quantity} {item.unit} × {formatPrice(item.pricePerUnit)} ₽
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-300 font-mono whitespace-nowrap">
                            {formatPrice(item.total)} ₽
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="bg-gradient-to-r from-[#00d4ff]/15 to-[#4ade80]/15 border border-[#00d4ff]/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-300">ИТОГО</span>
                  <span className="text-sm font-bold text-[#00d4ff] font-mono">
                    {formatPrice(estimate.grandTotal)} ₽
                  </span>
                </div>
                <p className="text-[9px] text-gray-600 mt-1">
                  С учётом запаса 10%. Цены ориентировочные.
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => exportEstimatePDF(estimate, ceilingHeight)}
                className="w-full h-8 text-xs text-[#4ade80] hover:bg-[#4ade80]/10 hover:text-[#4ade80] border border-[#4ade80]/30"
              >
                <Icon name="FileDown" size={14} className="mr-1.5" />
                Скачать смету PDF
              </Button>
            </div>
          )}
        </div>
      )}

      {walls.length > 0 && (
        <div className="space-y-2">
          <Label>Список стен</Label>
          <div className="space-y-1 max-h-[180px] overflow-y-auto">
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
                  {wall.openings.length > 0 && (
                    <span className="text-[9px] text-gray-600">
                      ({wall.openings.filter(o => o.type === 'door').length}D {wall.openings.filter(o => o.type === 'window').length}W)
                    </span>
                  )}
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
  );
}