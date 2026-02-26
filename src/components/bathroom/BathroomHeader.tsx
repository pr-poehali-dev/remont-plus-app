import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { REGIONS } from "@/components/calculator/bathroom/BathroomTypes";
import { fmt } from "@/components/calculator/bathroom/bathroomUtils";

interface Props {
  zonesCount: number;
  totalArea: number;
  regionId: string;
  markupPct: number;
  showMarkup: boolean;
  onNavigateBack: () => void;
  onRegionChange: (rg: string) => void;
  onMarkupChange: (v: string) => void;
  onToggleMarkup: () => void;
  onOpenExport: () => void;
}

export default function BathroomHeader({
  zonesCount,
  totalArea,
  regionId,
  markupPct,
  showMarkup,
  onNavigateBack,
  onRegionChange,
  onMarkupChange,
  onToggleMarkup,
  onOpenExport,
}: Props) {
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onNavigateBack}>
              <Icon name="ArrowLeft" className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Icon name="Bath" size={20} className="text-teal-600" />
                Ремонт санузла
              </h1>
              <p className="text-sm text-gray-500">
                {zonesCount} {zonesCount === 1 ? "помещение" : zonesCount < 5 ? "помещения" : "помещений"} · {fmt(Math.round(totalArea * 10) / 10)} м²
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={regionId}
              onChange={e => onRegionChange(e.target.value)}
              className="h-9 text-sm border border-gray-200 rounded-md px-2 bg-white text-gray-700 cursor-pointer hover:border-teal-400 transition-colors"
            >
              {REGIONS.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleMarkup}
              className={markupPct > 0 ? "border-orange-300 text-orange-600" : ""}
            >
              <Icon name="Percent" size={15} className="mr-1.5" />
              Наценка{markupPct > 0 ? ` ${markupPct}%` : ""}
            </Button>
            <Button
              size="sm"
              onClick={onOpenExport}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Icon name="FileText" size={15} className="mr-1.5" />
              Документ
            </Button>
          </div>
        </div>

        {showMarkup && (
          <div className="mt-3 pb-3 border-t pt-3 flex items-center gap-3 max-w-sm">
            <Label className="text-sm whitespace-nowrap">Наценка на все зоны, %</Label>
            <Input
              type="number" min={0} max={200}
              value={markupPct}
              onChange={e => onMarkupChange(e.target.value)}
              className="w-24 h-8 text-sm"
            />
            <span className="text-xs text-gray-400">0–200%</span>
          </div>
        )}
      </div>
    </header>
  );
}
