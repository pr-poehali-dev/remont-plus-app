import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import type { TurnkeyConfig } from "@/components/calculator/turnkey/TurnkeyTypes";
import TurnkeyConfigForm from "@/components/calculator/turnkey/TurnkeyConfigForm";
import TurnkeyLevelCompare from "@/components/calculator/turnkey/TurnkeyLevelCompare";

interface Props {
  cfg: TurnkeyConfig;
  regionId: string;
  onUpdate: (patch: Partial<Omit<TurnkeyConfig, "id">>) => void;
}

export default function TurnkeyConfigPanel({ cfg, regionId, onUpdate }: Props) {
  return (
    <div className="lg:col-span-3">
      {/* Карточка квартиры */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
          <Icon name="Home" size={14} />
        </div>
        <h2 className="text-base font-bold text-gray-900">Конфигурация квартиры</h2>
        <span className="text-sm text-gray-400 ml-1">— все параметры</span>
      </div>

      <Card className="p-5">
        <TurnkeyConfigForm cfg={cfg} regionId={regionId} onUpdate={onUpdate} />
      </Card>

      <div className="mt-4">
        <TurnkeyLevelCompare
          currentLevel={cfg.renovationLevel}
          area={cfg.totalAreaM2}
          regionId={regionId}
          onSelect={(levelId) => onUpdate({ renovationLevel: levelId })}
        />
      </div>
    </div>
  );
}
