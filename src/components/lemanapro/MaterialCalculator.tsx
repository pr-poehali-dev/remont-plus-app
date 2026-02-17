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
  const [length, setLength] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("2.7");
  const [doors, setDoors] = useState<string>("1");
  const [windows, setWindows] = useState<string>("1");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<{ added: number; updated: number } | null>(null);

  const l = parseFloat(length) || 0;
  const w = parseFloat(width) || 0;
  const h = parseFloat(height) || 0;
  const d = parseInt(doors) || 0;
  const win = parseInt(windows) || 0;

  const floorArea = l * w;
  const wallArea = Math.max(0, 2 * (l + w) * h - d * 1.8 - win * 1.5);
  const ceilingArea = floorArea;

  const isValid = l > 0 && w > 0 && h > 0;

  const areaByType: Record<AreaType, number> = {
    floor: floorArea,
    wall: wallArea,
    ceiling: ceilingArea,
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

  function handleCalculate() {
    if (!isValid) return;

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
          note: "Авторасчёт по площади",
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
          {isValid && (
            <Badge variant="outline" className="ml-auto text-xs border-amber-300 text-amber-700">
              {areaByType[area].toFixed(1)} м²
            </Badge>
          )}
        </div>
        <div className="space-y-0.5">
          {norms.map((norm) => {
            const id = normId(norm);
            const qty = isValid ? calcQuantity(norm) : 0;
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
                {isValid && (
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Длина комнаты (м)</label>
            <Input
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              value={length}
              onChange={(e) => { setLength(e.target.value); setResult(null); }}
              className="h-8 text-sm bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Ширина комнаты (м)</label>
            <Input
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              value={width}
              onChange={(e) => { setWidth(e.target.value); setResult(null); }}
              className="h-8 text-sm bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Высота потолков (м)</label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={height}
              onChange={(e) => { setHeight(e.target.value); setResult(null); }}
              className="h-8 text-sm bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Кол-во дверей</label>
            <Input
              type="number"
              min="0"
              step="1"
              value={doors}
              onChange={(e) => { setDoors(e.target.value); setResult(null); }}
              className="h-8 text-sm bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Кол-во окон</label>
            <Input
              type="number"
              min="0"
              step="1"
              value={windows}
              onChange={(e) => { setWindows(e.target.value); setResult(null); }}
              className="h-8 text-sm bg-white"
            />
          </div>
        </div>

        {isValid && (
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline" className="border-amber-300 bg-white text-amber-800">
              <Icon name="Layers" className="h-3 w-3 mr-1" />
              Пол: {floorArea.toFixed(1)} м²
            </Badge>
            <Badge variant="outline" className="border-amber-300 bg-white text-amber-800">
              <Icon name="PanelLeft" className="h-3 w-3 mr-1" />
              Стены: {wallArea.toFixed(1)} м²
            </Badge>
            <Badge variant="outline" className="border-amber-300 bg-white text-amber-800">
              <Icon name="ArrowUpFromLine" className="h-3 w-3 mr-1" />
              Потолок: {ceilingArea.toFixed(1)} м²
            </Badge>
          </div>
        )}

        <div className="space-y-3">
          {(["floor", "wall", "ceiling"] as AreaType[]).map(renderAreaGroup)}
        </div>

        <Button
          onClick={handleCalculate}
          disabled={!isValid || !hasChecked}
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
