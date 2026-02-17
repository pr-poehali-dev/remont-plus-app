import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import { roundUpToPackaging } from "@/lib/lemanapro-data";
import {
  type AreaType,
  type AreaTotals,
  type MaterialNorm,
  areaLabels,
  areaIcons,
  materialNorms,
  groupNorms,
  normId,
  calcQuantity,
  findSubcategoryData,
} from "./calc-data";

interface NormSelectorProps {
  checked: Record<string, boolean>;
  totals: AreaTotals;
  areaByType: Record<AreaType, number>;
  onToggleNorm: (id: string) => void;
  onToggleAll: (area: AreaType) => void;
}

export default function NormSelector({
  checked,
  totals,
  areaByType,
  onToggleNorm,
  onToggleAll,
}: NormSelectorProps) {
  const normsGrouped = useMemo(() => groupNorms(), []);

  function renderAreaGroup(area: AreaType) {
    const norms = normsGrouped[area];
    if (norms.length === 0) return null;
    const allChecked = norms.every((n) => checked[normId(n)]);
    const someChecked = norms.some((n) => checked[normId(n)]) && !allChecked;

    return (
      <div key={area} className="space-y-1">
        <div
          className="flex items-center gap-2 py-1.5 px-2 bg-amber-50 rounded cursor-pointer select-none"
          onClick={() => onToggleAll(area)}
        >
          <Checkbox
            checked={allChecked}
            className={someChecked ? "opacity-60" : ""}
            onCheckedChange={() => onToggleAll(area)}
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
            const qty = totals.hasValid ? calcQuantity(norm, areaByType) : 0;
            const subData = findSubcategoryData(norm.subcategory);
            const rounded = subData ? roundUpToPackaging(qty, subData.packaging) : Math.ceil(qty);

            return (
              <label
                key={id}
                className="flex items-center gap-2 py-1 px-2 rounded hover:bg-amber-50/50 cursor-pointer text-sm"
              >
                <Checkbox
                  checked={!!checked[id]}
                  onCheckedChange={() => onToggleNorm(id)}
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
    <div className="space-y-3">
      {(["floor", "wall", "ceiling"] as AreaType[]).map(renderAreaGroup)}
    </div>
  );
}
