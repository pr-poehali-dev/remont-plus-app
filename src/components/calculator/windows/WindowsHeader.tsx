import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { loadPriceOverrides } from "@/components/calculator/windows/windowUtils";
import type { PriceOverrides } from "@/components/calculator/windows/windowUtils";

interface Props {
  priceOverrides: PriceOverrides;
  markupPct: number;
  showMarkup: boolean;
  price: number;
  onShowPriceSettings: () => void;
  onToggleMarkup: () => void;
  onMarkupChange: (v: string) => void;
  onCreateDocument: () => void;
}

export default function WindowsHeader({
  priceOverrides,
  markupPct,
  showMarkup,
  price,
  onShowPriceSettings,
  onToggleMarkup,
  onMarkupChange,
  onCreateDocument,
}: Props) {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <Icon name="ArrowLeft" className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Icon name="AppWindow" size={20} className="text-blue-600" />
                Окна и остекление
              </h1>
              <p className="text-sm text-gray-500">ПВХ и алюминиевые конструкции</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onShowPriceSettings}
              className={JSON.stringify(priceOverrides) !== JSON.stringify(loadPriceOverrides()) ? "" : ""}
            >
              <Icon name="Settings" size={15} className="mr-1.5" />
              Мои цены
            </Button>
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
              disabled={price === 0}
              onClick={onCreateDocument}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Icon name="FileText" size={15} className="mr-1.5" />
              Создать документ
            </Button>
          </div>
        </div>

        {showMarkup && (
          <div className="mt-3 pb-3 border-t pt-3 flex items-center gap-3 max-w-sm">
            <Label className="text-sm whitespace-nowrap">Наценка на все позиции, %</Label>
            <Input
              type="number"
              min={0}
              max={200}
              value={markupPct}
              onChange={e => onMarkupChange(e.target.value)}
              className="w-24 h-8 text-sm"
            />
            <span className="text-xs text-gray-400">от 0 до 200%</span>
          </div>
        )}
      </div>
    </header>
  );
}
