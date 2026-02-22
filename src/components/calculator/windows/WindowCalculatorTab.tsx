import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { EstimateItem } from "@/pages/Calculator";
import {
  CONSTRUCTION_TYPES, GLASS_UNITS, LAMINATION_TYPES, PROFILE_SYSTEMS,
} from "./WindowTypes";
import type { WindowConfig, ProfileMaterial, OpeningType } from "./WindowTypes";
import { calcPrice, DEFAULT_CONFIG, syncSashes } from "./windowUtils";
import WindowConfigForm from "./WindowConfigForm";
import WindowSummaryPanel from "./WindowSummaryPanel";

interface Props {
  onAddToEstimate: (item: EstimateItem) => void;
}

export default function WindowCalculatorTab({ onAddToEstimate }: Props) {
  const [cfg, setCfg] = useState<Omit<WindowConfig, "id" | "totalPrice">>(DEFAULT_CONFIG);
  const [configs, setConfigs] = useState<WindowConfig[]>([]);
  const [matFilter, setMatFilter] = useState<ProfileMaterial | "all">("all");

  const update = (patch: Partial<typeof cfg>) => setCfg(prev => ({ ...prev, ...patch }));

  const price = calcPrice(cfg);

  const handleSashOpeningChange = (idx: number, val: OpeningType) => {
    const arr = [...cfg.openingTypes];
    arr[idx] = val;
    update({ openingTypes: arr });
  };

  const handleSyncSashes = (type: typeof cfg.constructionType) => {
    update({ constructionType: type, openingTypes: syncSashes(type, CONSTRUCTION_TYPES) });
  };

  const handleAdd = () => {
    const id = `win-${Date.now()}`;
    const total = price;
    const newCfg: WindowConfig = { ...cfg, id, totalPrice: total };
    setConfigs(prev => [...prev, newCfg]);

    const profile = PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId);
    const ct = CONSTRUCTION_TYPES.find(c => c.value === cfg.constructionType);
    const lam = LAMINATION_TYPES.find(l => l.id === cfg.laminationId);
    const glass = GLASS_UNITS.find(g => g.id === cfg.glassUnitId);

    const name = [
      ct?.label,
      `${cfg.width}×${cfg.height} мм`,
      profile ? `${profile.brand} ${profile.series}` : "",
      glass?.name,
      lam?.id !== "none" ? lam?.name : "",
    ].filter(Boolean).join(", ");

    onAddToEstimate({
      id,
      category: "Окна и остекление",
      name,
      unit: "шт.",
      quantity: cfg.quantity,
      price: Math.round(total / cfg.quantity),
      total,
    });
  };

  const removeConfig = (id: string) => setConfigs(prev => prev.filter(c => c.id !== id));

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Расчёт окон и остекления</h3>
          <p className="text-sm text-gray-500">ПВХ и алюминиевые конструкции любых производителей</p>
        </div>
        {configs.length > 0 && (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            {configs.length} позиц. в смете
          </Badge>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <WindowConfigForm
            cfg={cfg}
            matFilter={matFilter}
            onUpdate={update}
            onMatFilterChange={setMatFilter}
            onSashOpeningChange={handleSashOpeningChange}
            onSyncSashes={handleSyncSashes}
          />
        </div>

        <div className="lg:col-span-2">
          <WindowSummaryPanel
            cfg={cfg}
            price={price}
            configs={configs}
            onAdd={handleAdd}
            onRemove={removeConfig}
          />
        </div>
      </div>
    </div>
  );
}
