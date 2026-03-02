import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { FREE_PRINTS_LIMIT } from "@/hooks/useCalculatorState";

interface CalculatorHeaderProps {
  currentRegionName: string | undefined;
  userId: number | null;
  itemsCount: number;
  savedToDb: boolean;
  loading: boolean;
  hasPaidPlan: boolean;
  hasFreePrints: boolean;
  freePrintsUsed: number;
  canExport: boolean;
  onShowTemplates: () => void;
  onExport: () => void;
}

export default function CalculatorHeader({
  currentRegionName,
  userId,
  itemsCount,
  savedToDb,
  loading,
  hasPaidPlan,
  hasFreePrints,
  freePrintsUsed,
  canExport,
  onShowTemplates,
  onExport,
}: CalculatorHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <Icon name="ArrowLeft" className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Калькулятор стоимости</h1>
              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                {currentRegionName ? currentRegionName : "Загрузка..."}
                {userId && itemsCount > 0 && (
                  <span className={`text-xs ${savedToDb ? "text-green-500" : "text-gray-400"}`}>
                    · {savedToDb ? "сохранено" : "сохраняем..."}
                  </span>
                )}
                {" · "}{itemsCount} позиций
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => navigate("/prices")}>
              <Icon name="ClipboardList" className="mr-2 h-4 w-4" />
              Прайс-лист
            </Button>
            <Button variant="outline" size="sm" onClick={onShowTemplates} disabled={loading}>
              <Icon name={loading ? "Loader2" : "LayoutTemplate"} className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Шаблоны
            </Button>
            <div className="relative">
              <Button onClick={onExport}>
                <Icon name={canExport ? "Download" : "Lock"} className="mr-2 h-4 w-4" />
                Скачать PDF
              </Button>
              {!hasPaidPlan && hasFreePrints && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {FREE_PRINTS_LIMIT - freePrintsUsed}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
