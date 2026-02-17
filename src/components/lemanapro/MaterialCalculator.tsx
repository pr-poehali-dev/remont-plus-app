import { useState, useMemo } from "react";
import {
  type EstimateSavedItem,
  type Subcategory,
  categories,
  saveEstimateItems,
  roundUpToPackaging,
  subcategoryUrl,
} from "@/lib/lemanapro-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";

interface MaterialCalculatorProps {
  estimateItems: EstimateSavedItem[];
  setEstimateItems: (items: EstimateSavedItem[]) => void;
}

type AreaType = "floor" | "wall" | "ceiling";

interface Room {
  id: string;
  name: string;
  length: string;
  width: string;
  height: string;
  doors: string;
  windows: string;
}

interface MaterialNorm {
  subcategory: string;
  consumptionPer: string;
  rate: number;
  area: AreaType;
  note: string;
}

const materialNorms: MaterialNorm[] = [
  { subcategory: "Ламинат", consumptionPer: "м²", rate: 1.1, area: "floor", note: "+10% на подрезку" },
  { subcategory: "Линолеум", consumptionPer: "м²", rate: 1.05, area: "floor", note: "+5% на подрезку" },
  { subcategory: "Керамогранит", consumptionPer: "м²", rate: 1.1, area: "floor", note: "+10% на подрезку" },
  { subcategory: "Подложка под напольные покрытия", consumptionPer: "м²", rate: 1.05, area: "floor", note: "+5% запас" },
  { subcategory: "Клей для плитки", consumptionPer: "кг", rate: 5, area: "floor", note: "5 кг/м² пола" },
  { subcategory: "Настенная плитка", consumptionPer: "м²", rate: 1.1, area: "wall", note: "+10% на подрезку" },
  { subcategory: "Виниловые обои", consumptionPer: "рулон", rate: 0.2, area: "wall", note: "~5 м² на рулон" },
  { subcategory: "Флизелиновые обои", consumptionPer: "рулон", rate: 0.2, area: "wall", note: "~5 м² на рулон" },
  { subcategory: "Обои под покраску", consumptionPer: "рулон", rate: 0.2, area: "wall", note: "~5 м² на рулон" },
  { subcategory: "Клей для обоев", consumptionPer: "упак", rate: 0.04, area: "wall", note: "1 упак на 25 м²" },
  { subcategory: "Интерьерные краски", consumptionPer: "л", rate: 0.25, area: "wall", note: "0.25 л/м² (2 слоя)" },
  { subcategory: "Грунтовки", consumptionPer: "л", rate: 0.15, area: "wall", note: "0.15 л/м²" },
  { subcategory: "Интерьерные краски", consumptionPer: "л", rate: 0.25, area: "ceiling", note: "0.25 л/м² потолок" },
  { subcategory: "Сухие смеси и грунтовки", consumptionPer: "кг", rate: 10, area: "wall", note: "10 кг/м² стен" },
  { subcategory: "Затирки", consumptionPer: "кг", rate: 0.3, area: "floor", note: "0.3 кг/м²" },
];

const areaLabels: Record<AreaType, string> = {
  floor: "Пол",
  wall: "Стены",
  ceiling: "Потолок",
};

const areaIcons: Record<AreaType, string> = {
  floor: "Layers",
  wall: "PanelLeft",
  ceiling: "ArrowUpFromLine",
};

const defaultRoomNames = [
  "Комната 1", "Комната 2", "Комната 3", "Кухня", "Коридор",
  "Ванная", "Санузел", "Спальня", "Гостиная", "Детская",
];

interface ApartmentPreset {
  label: string;
  icon: string;
  area: string;
  rooms: Omit<Room, "id">[];
}

const presets: ApartmentPreset[] = [
  {
    label: "Студия",
    icon: "Square",
    area: "~28 м²",
    rooms: [
      { name: "Студия", length: "6", width: "3.5", height: "2.7", doors: "1", windows: "1" },
      { name: "Санузел", length: "2.2", width: "1.5", height: "2.7", doors: "1", windows: "0" },
      { name: "Коридор", length: "3", width: "1.2", height: "2.7", doors: "1", windows: "0" },
    ],
  },
  {
    label: "Однушка",
    icon: "LayoutGrid",
    area: "~38 м²",
    rooms: [
      { name: "Комната", length: "5", width: "3.5", height: "2.7", doors: "1", windows: "1" },
      { name: "Кухня", length: "3.5", width: "2.8", height: "2.7", doors: "1", windows: "1" },
      { name: "Ванная", length: "2.2", width: "1.5", height: "2.7", doors: "1", windows: "0" },
      { name: "Коридор", length: "4", width: "1.3", height: "2.7", doors: "2", windows: "0" },
    ],
  },
  {
    label: "Двушка",
    icon: "Columns2",
    area: "~54 м²",
    rooms: [
      { name: "Гостиная", length: "5.5", width: "3.5", height: "2.7", doors: "1", windows: "1" },
      { name: "Спальня", length: "4", width: "3", height: "2.7", doors: "1", windows: "1" },
      { name: "Кухня", length: "3.5", width: "3", height: "2.7", doors: "1", windows: "1" },
      { name: "Ванная", length: "2.5", width: "1.7", height: "2.7", doors: "1", windows: "0" },
      { name: "Коридор", length: "5", width: "1.4", height: "2.7", doors: "3", windows: "0" },
    ],
  },
  {
    label: "Трёшка",
    icon: "Columns3",
    area: "~72 м²",
    rooms: [
      { name: "Гостиная", length: "5.5", width: "4", height: "2.7", doors: "1", windows: "1" },
      { name: "Спальня", length: "4.5", width: "3", height: "2.7", doors: "1", windows: "1" },
      { name: "Детская", length: "4", width: "3", height: "2.7", doors: "1", windows: "1" },
      { name: "Кухня", length: "4", width: "3", height: "2.7", doors: "1", windows: "1" },
      { name: "Ванная", length: "2.5", width: "1.7", height: "2.7", doors: "1", windows: "0" },
      { name: "Коридор", length: "6", width: "1.5", height: "2.7", doors: "4", windows: "0" },
    ],
  },
];

function makeRoom(index: number): Room {
  return {
    id: `room_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: defaultRoomNames[index] || `Комната ${index + 1}`,
    length: "",
    width: "",
    height: "2.7",
    doors: "1",
    windows: "1",
  };
}

function roomAreas(room: Room) {
  const l = parseFloat(room.length) || 0;
  const w = parseFloat(room.width) || 0;
  const h = parseFloat(room.height) || 0;
  const d = parseInt(room.doors) || 0;
  const win = parseInt(room.windows) || 0;
  const floor = l * w;
  const wall = Math.max(0, 2 * (l + w) * h - d * 1.8 - win * 1.5);
  return { floor, wall, ceiling: floor, valid: l > 0 && w > 0 && h > 0 };
}

function normId(norm: MaterialNorm): string {
  return `${norm.subcategory}__${norm.area}`;
}

function findSubcategoryData(name: string): Subcategory | undefined {
  for (const cat of categories) {
    const found = cat.subcategories.find((s) => s.name === name);
    if (found) return found;
  }
  return undefined;
}

function findCategoryName(subcategoryName: string): string {
  for (const cat of categories) {
    if (cat.subcategories.some((s) => s.name === subcategoryName)) {
      return cat.name;
    }
  }
  return "Прочее";
}

export default function MaterialCalculator({
  estimateItems,
  setEstimateItems,
}: MaterialCalculatorProps) {
  const [rooms, setRooms] = useState<Room[]>([makeRoom(0)]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<{ added: number; updated: number } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(rooms[0]?.id ?? null);

  const totals = useMemo(() => {
    let floor = 0, wall = 0, ceiling = 0, validCount = 0;
    for (const room of rooms) {
      const a = roomAreas(room);
      if (a.valid) {
        floor += a.floor;
        wall += a.wall;
        ceiling += a.ceiling;
        validCount++;
      }
    }
    return { floor, wall, ceiling, validCount, hasValid: validCount > 0 };
  }, [rooms]);

  const areaByType: Record<AreaType, number> = {
    floor: totals.floor,
    wall: totals.wall,
    ceiling: totals.ceiling,
  };

  const normsGrouped = useMemo(() => {
    const groups: Record<AreaType, MaterialNorm[]> = { floor: [], wall: [], ceiling: [] };
    for (const norm of materialNorms) {
      groups[norm.area].push(norm);
    }
    return groups;
  }, []);

  function calcQuantity(norm: MaterialNorm): number {
    const area = areaByType[norm.area];
    return Math.ceil(area * norm.rate * 100) / 100;
  }

  function toggleNorm(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
    setResult(null);
  }

  function toggleAll(area: AreaType) {
    const norms = normsGrouped[area];
    const allChecked = norms.every((n) => checked[normId(n)]);
    const next = { ...checked };
    for (const n of norms) {
      next[normId(n)] = !allChecked;
    }
    setChecked(next);
    setResult(null);
  }

  function applyPreset(preset: ApartmentPreset) {
    const newRooms: Room[] = preset.rooms.map((r) => ({
      ...r,
      id: `room_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    }));
    setRooms(newRooms);
    setExpanded(newRooms[0]?.id ?? null);
    setResult(null);
  }

  function addRoom() {
    const newRoom = makeRoom(rooms.length);
    setRooms([...rooms, newRoom]);
    setExpanded(newRoom.id);
    setResult(null);
  }

  function removeRoom(id: string) {
    if (rooms.length <= 1) return;
    const updated = rooms.filter((r) => r.id !== id);
    setRooms(updated);
    if (expanded === id) setExpanded(updated[0]?.id ?? null);
    setResult(null);
  }

  function updateRoom(id: string, field: Partial<Room>) {
    setRooms(rooms.map((r) => (r.id === id ? { ...r, ...field } : r)));
    setResult(null);
  }

  function handleCalculate() {
    if (!totals.hasValid) return;

    const selectedNorms = materialNorms.filter((n) => checked[normId(n)]);

    const combinedQuantities: Record<string, number> = {};
    for (const norm of selectedNorms) {
      const qty = calcQuantity(norm);
      combinedQuantities[norm.subcategory] = (combinedQuantities[norm.subcategory] || 0) + qty;
    }

    let added = 0;
    let updated = 0;
    const items = [...estimateItems];

    for (const [subcategoryName, rawQty] of Object.entries(combinedQuantities)) {
      const subData = findSubcategoryData(subcategoryName);
      const packaging = subData?.packaging || 1;
      const unit = subData?.unit || "шт";
      const quantity = roundUpToPackaging(rawQty, packaging);

      const existingIdx = items.findIndex((item) => item.subcategory === subcategoryName);
      if (existingIdx !== -1) {
        items[existingIdx] = { ...items[existingIdx], quantity };
        updated++;
      } else {
        const roomNames = rooms
          .filter((r) => roomAreas(r).valid)
          .map((r) => r.name)
          .join(", ");
        const newItem: EstimateSavedItem = {
          id: `calc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: subcategoryName,
          category: findCategoryName(subcategoryName),
          subcategory: subcategoryName,
          url: subcategoryUrl(subcategoryName),
          quantity,
          price: 0,
          unit,
          packaging,
          note: `Авторасчёт: ${roomNames}`,
          addedAt: new Date().toISOString(),
        };
        items.push(newItem);
        added++;
      }
    }

    saveEstimateItems(items);
    setEstimateItems(items);
    setResult({ added, updated });
  }

  const hasChecked = Object.values(checked).some(Boolean);

  function renderAreaGroup(area: AreaType) {
    const norms = normsGrouped[area];
    if (norms.length === 0) return null;
    const allChecked = norms.every((n) => checked[normId(n)]);
    const someChecked = norms.some((n) => checked[normId(n)]) && !allChecked;

    return (
      <div key={area} className="space-y-1">
        <div
          className="flex items-center gap-2 py-1.5 px-2 bg-amber-50 rounded cursor-pointer select-none"
          onClick={() => toggleAll(area)}
        >
          <Checkbox
            checked={allChecked}
            className={someChecked ? "opacity-60" : ""}
            onCheckedChange={() => toggleAll(area)}
          />
          <Icon name={areaIcons[area]} className="h-4 w-4 text-amber-700" />
          <span className="font-medium text-sm text-amber-900">{areaLabels[area]}</span>
          {totals.hasValid && (
            <Badge variant="outline" className="ml-auto text-xs border-amber-300 text-amber-700">
              {areaByType[area].toFixed(1)} м²
            </Badge>
          )}
        </div>
        <div className="space-y-0.5">
          {norms.map((norm) => {
            const id = normId(norm);
            const qty = totals.hasValid ? calcQuantity(norm) : 0;
            const subData = findSubcategoryData(norm.subcategory);
            const rounded = subData ? roundUpToPackaging(qty, subData.packaging) : Math.ceil(qty);

            return (
              <label
                key={id}
                className="flex items-center gap-2 py-1 px-2 rounded hover:bg-amber-50/50 cursor-pointer text-sm"
              >
                <Checkbox
                  checked={!!checked[id]}
                  onCheckedChange={() => toggleNorm(id)}
                />
                <span className="flex-1 min-w-0 truncate">{norm.subcategory}</span>
                {totals.hasValid && (
                  <span className="text-xs font-mono text-amber-800 whitespace-nowrap">
                    {rounded} {norm.consumptionPer}
                  </span>
                )}
                <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
                  {norm.note}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon name="Calculator" className="h-5 w-5 text-amber-600" />
          Калькулятор материалов по площади
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              className="h-auto py-1.5 px-2 border-amber-200 hover:bg-amber-50 hover:border-amber-400 flex flex-col items-center gap-0.5"
              onClick={() => applyPreset(preset)}
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
                  onClick={() => setExpanded(isExpanded ? null : room.id)}
                >
                  <Icon
                    name={isExpanded ? "ChevronDown" : "ChevronRight"}
                    className="h-4 w-4 text-gray-400 shrink-0"
                  />
                  <Input
                    value={room.name}
                    onChange={(e) => updateRoom(room.id, { name: e.target.value })}
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
                      onClick={(e) => { e.stopPropagation(); removeRoom(room.id); }}
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
                          onChange={(e) => updateRoom(room.id, { length: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Ширина (м)</label>
                        <Input
                          type="number" min="0" step="0.1" placeholder="0"
                          value={room.width}
                          onChange={(e) => updateRoom(room.id, { width: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Высота (м)</label>
                        <Input
                          type="number" min="0" step="0.1"
                          value={room.height}
                          onChange={(e) => updateRoom(room.id, { height: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Дверей</label>
                        <Input
                          type="number" min="0" step="1"
                          value={room.doors}
                          onChange={(e) => updateRoom(room.id, { doors: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Окон</label>
                        <Input
                          type="number" min="0" step="1"
                          value={room.windows}
                          onChange={(e) => updateRoom(room.id, { windows: e.target.value })}
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
            onClick={addRoom}
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

        <div className="space-y-3">
          {(["floor", "wall", "ceiling"] as AreaType[]).map(renderAreaGroup)}
        </div>

        <Button
          onClick={handleCalculate}
          disabled={!totals.hasValid || !hasChecked}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Icon name="Calculator" className="h-4 w-4" />
          Рассчитать и добавить в смету
        </Button>

        {result && (
          <div className="flex items-center gap-2 p-2 rounded bg-green-50 border border-green-200 text-sm text-green-800">
            <Icon name="CheckCircle2" className="h-4 w-4 text-green-600 shrink-0" />
            <span>
              {result.added > 0 && <>Добавлено: {result.added} поз. </>}
              {result.updated > 0 && <>Обновлено: {result.updated} поз. </>}
              {result.added === 0 && result.updated === 0 && "Нет изменений"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}