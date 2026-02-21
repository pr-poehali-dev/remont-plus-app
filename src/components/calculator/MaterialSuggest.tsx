import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { getSuggestionsForWork, type MaterialVariant, type MaterialSuggestion } from "@/lib/materials-data";
import type { EstimateItem } from "@/pages/Calculator";

interface MaterialSuggestProps {
  workItem: EstimateItem;
  region?: string;
  onAddMaterial: (item: EstimateItem) => void;
}

const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

function VariantCard({
  variant,
  workQuantity,
  onAdd,
}: {
  variant: MaterialVariant;
  workQuantity: number;
  onAdd: (v: MaterialVariant, qty: number) => void;
}) {
  const [qty, setQty] = useState(workQuantity || 1);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{variant.name}</span>
          {variant.popular && (
            <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-amber-200">
              Популярный
            </Badge>
          )}
          {variant.regions && variant.regions.length > 0 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-blue-600 border-blue-200">
              Для региона
            </Badge>
          )}
        </div>
        {variant.coverage && (
          <p className="text-xs text-gray-400 mt-0.5">Расход: {variant.coverage}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold text-gray-700 w-24 text-right">
          {fmt(variant.pricePerUnit)} ₽/{variant.unit}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="w-6 h-6 rounded border text-gray-400 hover:text-primary hover:border-primary text-sm flex items-center justify-center transition-colors"
            onClick={() => setQty(Math.max(1, qty - 1))}
          >−</button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            className="w-12 h-6 text-center text-sm border rounded"
          />
          <button
            className="w-6 h-6 rounded border text-gray-400 hover:text-primary hover:border-primary text-sm flex items-center justify-center transition-colors"
            onClick={() => setQty(qty + 1)}
          >+</button>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onAdd(variant, qty)}
        >
          <Icon name="Plus" size={12} className="mr-1" />
          Добавить
        </Button>
      </div>
    </div>
  );
}

export default function MaterialSuggest({ workItem, region, onAddMaterial }: MaterialSuggestProps) {
  const [expanded, setExpanded] = useState(false);
  const [addedVariants, setAddedVariants] = useState<Set<string>>(new Set());

  const suggestions: MaterialSuggestion[] = getSuggestionsForWork(workItem.name, region);

  if (suggestions.length === 0) return null;

  const handleAdd = (suggestion: MaterialSuggestion, variant: MaterialVariant, qty: number) => {
    const key = `${variant.name}-${variant.brand}`;
    const newItem: EstimateItem = {
      id: `mat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: "Материалы",
      name: `${suggestion.materialName}: ${variant.name}`,
      unit: variant.unit,
      quantity: qty,
      price: variant.pricePerUnit,
      total: variant.pricePerUnit * qty,
    };
    onAddMaterial(newItem);
    setAddedVariants((prev) => new Set([...prev, key]));
  };

  return (
    <div className="mt-1 ml-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
      >
        <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size={12} />
        <Icon name="Package" size={12} />
        Материалы для этой работы ({suggestions.length} тип{suggestions.length > 1 ? "а" : ""})
      </button>

      {expanded && (
        <div className="mt-2 pl-2 border-l-2 border-primary/20 space-y-3">
          {suggestions.map((s) => (
            <div key={s.materialName}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-gray-600">{s.materialName}</span>
                <span className="text-xs text-gray-400">— {s.description}</span>
              </div>
              <div className="space-y-1">
                {s.variants.map((v) => {
                  const key = `${v.name}-${v.brand}`;
                  const added = addedVariants.has(key);
                  return (
                    <div key={key} className={added ? "opacity-50 pointer-events-none" : ""}>
                      {added ? (
                        <div className="flex items-center gap-2 p-2 text-xs text-green-600">
                          <Icon name="CheckCircle" size={12} />
                          {v.name} — добавлено в смету
                        </div>
                      ) : (
                        <VariantCard
                          variant={v}
                          workQuantity={workItem.quantity}
                          onAdd={(variant, qty) => handleAdd(s, variant, qty)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
