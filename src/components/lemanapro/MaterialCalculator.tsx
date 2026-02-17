import { useState, useMemo, useEffect, useCallback } from "react";
import {
  type EstimateSavedItem,
  saveEstimateItems,
  roundUpToPackaging,
  subcategoryUrl,
} from "@/lib/lemanapro-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import {
  type Room,
  type AreaType,
  type ApartmentPreset,
  materialNorms,
  makeRoom,
  roomAreas,
  normId,
  calcTotals,
  calcQuantity,
  groupNorms,
  findSubcategoryData,
  findCategoryName,
  saveRooms,
  loadRooms,
} from "./calc-data";
import RoomEditor from "./RoomEditor";
import NormSelector from "./NormSelector";

interface MaterialCalculatorProps {
  estimateItems: EstimateSavedItem[];
  setEstimateItems: (items: EstimateSavedItem[]) => void;
}

export default function MaterialCalculator({
  estimateItems,
  setEstimateItems,
}: MaterialCalculatorProps) {
  const [rooms, setRooms] = useState<Room[]>(() => loadRooms() || [makeRoom(0)]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<{ added: number; updated: number } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(rooms[0]?.id ?? null);

  useEffect(() => {
    saveRooms(rooms);
  }, [rooms]);

  const totals = useMemo(() => calcTotals(rooms), [rooms]);

  const areaByType: Record<AreaType, number> = {
    floor: totals.floor,
    wall: totals.wall,
    ceiling: totals.ceiling,
  };

  const normsGrouped = useMemo(() => groupNorms(), []);

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
      const qty = calcQuantity(norm, areaByType);
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

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon name="Calculator" className="h-5 w-5 text-amber-600" />
          Калькулятор материалов по площади
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <RoomEditor
          rooms={rooms}
          expanded={expanded}
          totals={totals}
          onUpdateRoom={updateRoom}
          onRemoveRoom={removeRoom}
          onAddRoom={addRoom}
          onApplyPreset={applyPreset}
          onSetExpanded={setExpanded}
        />

        <NormSelector
          checked={checked}
          totals={totals}
          areaByType={areaByType}
          onToggleNorm={toggleNorm}
          onToggleAll={toggleAll}
        />

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