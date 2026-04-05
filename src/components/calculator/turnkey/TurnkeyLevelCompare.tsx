import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import {
  RENOVATION_LEVELS, DEFAULT_TURNKEY_CONFIG,
  FLOOR_TYPES, CEILING_TYPES, BATHROOM_LEVELS,
} from "./TurnkeyTypes";
import type { TurnkeyConfig } from "./TurnkeyTypes";
import { calcTurnkeyPrice, fmt } from "./turnkeyUtils";
import type { TurnkeyPriceBreakdown } from "./turnkeyUtils";

interface Props {
  currentLevel: string;
  area: number;
  regionId?: string;
  onSelect: (levelId: string) => void;
}

interface LevelBreakdown {
  id: string;
  label: string;
  color: string;
  priceCoeff: number;
  bd: TurnkeyPriceBreakdown;
  total: number;
  perM2: number;
}

const COMPARE_ROWS: { key: keyof TurnkeyPriceBreakdown; label: string; icon: string }[] = [
  { key: "demolitionCost", label: "Демонтаж", icon: "Hammer" },
  { key: "electricsCost", label: "Электрика", icon: "Zap" },
  { key: "plumbingCost", label: "Сантехника", icon: "Droplets" },
  { key: "plasterCost", label: "Штукатурка + стяжка", icon: "Layers" },
  { key: "floorsCost", label: "Напольное покрытие", icon: "Square" },
  { key: "ceilingsCost", label: "Потолки", icon: "ArrowUp" },
  { key: "bathroomsCost", label: "Санузлы под ключ", icon: "Bath" },
  { key: "doorsCost", label: "Двери", icon: "DoorOpen" },
  { key: "windowSlopesCost", label: "Откосы", icon: "AppWindow" },
  { key: "cleaningCost", label: "Уборка", icon: "Sparkles" },
];

const LEVEL_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  economy:  { bg: "bg-gray-50",    border: "border-gray-200",   text: "text-gray-700",   badge: "bg-gray-200 text-gray-700" },
  standard: { bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-700",   badge: "bg-blue-100 text-blue-700" },
  comfort:  { bg: "bg-green-50",   border: "border-green-200",  text: "text-green-700",  badge: "bg-green-100 text-green-700" },
  premium:  { bg: "bg-purple-50",  border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-700" },
  luxury:   { bg: "bg-amber-50",   border: "border-amber-200",  text: "text-amber-700",  badge: "bg-amber-100 text-amber-700" },
};

const LEVEL_MATERIALS: Record<string, { floor: string; ceiling: string; bathroom: string; walls: string; electrics: string }> = {
  economy:  { floor: "Линолеум", ceiling: "Покраска", bathroom: "Плитка базовая, санфаянс стандарт", walls: "Обои бумажные", electrics: "Базовая разводка" },
  standard: { floor: "Ламинат 33 класс", ceiling: "Покраска 2 слоя", bathroom: "Хорошая плитка, гидроизоляция, тёплый пол", walls: "Покраска латексная", electrics: "Полная разводка, автоматы" },
  comfort:  { floor: "Паркетная доска", ceiling: "Натяжные потолки", bathroom: "Дизайнерская плитка, подвесная сантехника", walls: "Декоративная штукатурка", electrics: "Расширенная, диммеры" },
  premium:  { floor: "Паркет из массива / мрамор", ceiling: "Многоуровневые ГКЛ + подсветка", bathroom: "Премиум-плитка, инсталляция Geberit", walls: "Венецианская штукатурка", electrics: "Умный дом, сценарии света" },
  luxury:   { floor: "Итальянский мрамор / палубный паркет", ceiling: "Авторские решения + арт-свет", bathroom: "Эксклюзивные бренды, хамам", walls: "Панели из натурального дерева / камня", electrics: "Полная автоматизация KNX" },
};

export default function TurnkeyLevelCompare({ currentLevel, area, regionId, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  const levels = useMemo(() => {
    const result: LevelBreakdown[] = [];
    const effectiveArea = area || DEFAULT_TURNKEY_CONFIG.totalAreaM2;
    for (const lv of RENOVATION_LEVELS) {
      const testCfg = { ...DEFAULT_TURNKEY_CONFIG, renovationLevel: lv.id, totalAreaM2: effectiveArea };
      const bd = calcTurnkeyPrice(testCfg, regionId || "other", 0);
      result.push({
        id: lv.id,
        label: lv.label,
        color: lv.color,
        priceCoeff: lv.priceCoeff,
        bd,
        total: bd.total,
        perM2: Math.round(bd.total / effectiveArea),
      });
    }
    return result;
  }, [area, regionId]);

  const current = levels.find(l => l.id === currentLevel);
  const maxTotal = Math.max(...levels.map(l => l.total));

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="w-full gap-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
      >
        <Icon name="ArrowLeftRight" size={15} />
        Сравнить уровни ремонта
      </Button>
    );
  }

  return (
    <Card className="p-0 overflow-hidden border-2 border-emerald-200">
      <div className="flex items-center justify-between px-5 py-3 bg-emerald-50 border-b border-emerald-200">
        <div className="flex items-center gap-2">
          <Icon name="ArrowLeftRight" size={16} className="text-emerald-600" />
          <span className="font-bold text-sm text-gray-900">Сравнение уровней ремонта</span>
          <span className="text-xs text-gray-500">({area || DEFAULT_TURNKEY_CONFIG.totalAreaM2} м²)</span>
        </div>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <Icon name="X" size={16} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3 font-medium text-gray-500 w-[140px] sticky left-0 bg-gray-50 z-10"></th>
              {levels.map(lv => {
                const colors = LEVEL_COLORS[lv.id] || LEVEL_COLORS.standard;
                const isCurrent = lv.id === currentLevel;
                return (
                  <th key={lv.id} className={`p-3 text-center min-w-[130px] ${isCurrent ? colors.bg : ""}`}>
                    <div className="space-y-1.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${colors.badge}`}>
                        {lv.label}
                      </span>
                      <div className="font-bold text-base text-gray-900">{fmt(lv.perM2)} ₽/м²</div>
                      <div className="text-gray-500 font-normal">{fmt(lv.total)} ₽</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full transition-all ${isCurrent ? "bg-emerald-500" : "bg-gray-400"}`}
                          style={{ width: `${(lv.total / maxTotal) * 100}%` }}
                        />
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map(row => {
              const maxVal = Math.max(...levels.map(l => (l.bd[row.key] as number) || 0));
              return (
                <tr key={row.key} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="p-3 sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-1.5">
                      <Icon name={row.icon} size={12} className="text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-700">{row.label}</span>
                    </div>
                  </td>
                  {levels.map(lv => {
                    const val = (lv.bd[row.key] as number) || 0;
                    const isCurrent = lv.id === currentLevel;
                    const colors = LEVEL_COLORS[lv.id] || LEVEL_COLORS.standard;
                    const diff = current && val > 0 && (lv.bd[row.key] as number) !== (current.bd[row.key] as number)
                      ? val - (current.bd[row.key] as number)
                      : null;
                    return (
                      <td key={lv.id} className={`p-3 text-center ${isCurrent ? colors.bg : ""}`}>
                        {val > 0 ? (
                          <div>
                            <span className={`font-medium ${isCurrent ? colors.text : "text-gray-700"}`}>
                              {fmt(val)} ₽
                            </span>
                            {diff !== null && diff !== 0 && (
                              <div className={`text-[10px] mt-0.5 ${diff > 0 ? "text-red-500" : "text-green-600"}`}>
                                {diff > 0 ? "+" : ""}{fmt(diff)}
                              </div>
                            )}
                            {maxVal > 0 && (
                              <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                                <div
                                  className={`h-1 rounded-full ${isCurrent ? "bg-emerald-400" : "bg-gray-300"}`}
                                  style={{ width: `${(val / maxVal) * 100}%` }}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            <tr className="border-b-2 border-gray-200 bg-gray-50 font-bold">
              <td className="p-3 sticky left-0 bg-gray-50 z-10 text-gray-700">Итого</td>
              {levels.map(lv => {
                const isCurrent = lv.id === currentLevel;
                const colors = LEVEL_COLORS[lv.id] || LEVEL_COLORS.standard;
                return (
                  <td key={lv.id} className={`p-3 text-center ${isCurrent ? colors.bg : ""}`}>
                    <span className={`text-sm ${isCurrent ? colors.text : "text-gray-900"}`}>{fmt(lv.total)} ₽</span>
                  </td>
                );
              })}
            </tr>

            <tr className="border-b border-gray-100">
              <td className="p-3 sticky left-0 bg-white z-10">
                <div className="flex items-center gap-1.5">
                  <Icon name="Square" size={12} className="text-gray-400" />
                  <span className="font-medium text-gray-700">Полы</span>
                </div>
              </td>
              {levels.map(lv => {
                const mat = LEVEL_MATERIALS[lv.id];
                const isCurrent = lv.id === currentLevel;
                const colors = LEVEL_COLORS[lv.id] || LEVEL_COLORS.standard;
                return (
                  <td key={lv.id} className={`p-3 text-center ${isCurrent ? colors.bg : ""}`}>
                    <span className="text-gray-600">{mat?.floor}</span>
                  </td>
                );
              })}
            </tr>
            <tr className="border-b border-gray-100">
              <td className="p-3 sticky left-0 bg-white z-10">
                <div className="flex items-center gap-1.5">
                  <Icon name="ArrowUp" size={12} className="text-gray-400" />
                  <span className="font-medium text-gray-700">Потолки</span>
                </div>
              </td>
              {levels.map(lv => {
                const mat = LEVEL_MATERIALS[lv.id];
                const isCurrent = lv.id === currentLevel;
                const colors = LEVEL_COLORS[lv.id] || LEVEL_COLORS.standard;
                return (
                  <td key={lv.id} className={`p-3 text-center ${isCurrent ? colors.bg : ""}`}>
                    <span className="text-gray-600">{mat?.ceiling}</span>
                  </td>
                );
              })}
            </tr>
            <tr className="border-b border-gray-100">
              <td className="p-3 sticky left-0 bg-white z-10">
                <div className="flex items-center gap-1.5">
                  <Icon name="PaintBucket" size={12} className="text-gray-400" />
                  <span className="font-medium text-gray-700">Стены</span>
                </div>
              </td>
              {levels.map(lv => {
                const mat = LEVEL_MATERIALS[lv.id];
                const isCurrent = lv.id === currentLevel;
                const colors = LEVEL_COLORS[lv.id] || LEVEL_COLORS.standard;
                return (
                  <td key={lv.id} className={`p-3 text-center ${isCurrent ? colors.bg : ""}`}>
                    <span className="text-gray-600">{mat?.walls}</span>
                  </td>
                );
              })}
            </tr>
            <tr className="border-b border-gray-100">
              <td className="p-3 sticky left-0 bg-white z-10">
                <div className="flex items-center gap-1.5">
                  <Icon name="Bath" size={12} className="text-gray-400" />
                  <span className="font-medium text-gray-700">Санузел</span>
                </div>
              </td>
              {levels.map(lv => {
                const mat = LEVEL_MATERIALS[lv.id];
                const isCurrent = lv.id === currentLevel;
                const colors = LEVEL_COLORS[lv.id] || LEVEL_COLORS.standard;
                return (
                  <td key={lv.id} className={`p-3 text-center ${isCurrent ? colors.bg : ""}`}>
                    <span className="text-gray-600">{mat?.bathroom}</span>
                  </td>
                );
              })}
            </tr>
            <tr className="border-b border-gray-100">
              <td className="p-3 sticky left-0 bg-white z-10">
                <div className="flex items-center gap-1.5">
                  <Icon name="Zap" size={12} className="text-gray-400" />
                  <span className="font-medium text-gray-700">Электрика</span>
                </div>
              </td>
              {levels.map(lv => {
                const mat = LEVEL_MATERIALS[lv.id];
                const isCurrent = lv.id === currentLevel;
                const colors = LEVEL_COLORS[lv.id] || LEVEL_COLORS.standard;
                return (
                  <td key={lv.id} className={`p-3 text-center ${isCurrent ? colors.bg : ""}`}>
                    <span className="text-gray-600">{mat?.electrics}</span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-gray-50 border-t flex flex-wrap gap-2">
        {levels.map(lv => {
          const isCurrent = lv.id === currentLevel;
          const colors = LEVEL_COLORS[lv.id] || LEVEL_COLORS.standard;
          return (
            <Button
              key={lv.id}
              size="sm"
              variant={isCurrent ? "default" : "outline"}
              onClick={() => onSelect(lv.id)}
              className={isCurrent ? "bg-emerald-600 hover:bg-emerald-700" : `${colors.text} ${colors.border}`}
            >
              {isCurrent && <Icon name="Check" size={14} className="mr-1" />}
              {lv.label} — {fmt(lv.perM2)} ₽/м²
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
