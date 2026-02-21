import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import type { Region } from "@/pages/Calculator";

interface CalculatorSidebarProps {
  lemanaItemsCount: number;
  onExportPdf?: () => void;
  regions: Region[];
  selectedRegion: string;
  onRegionChange: (code: string) => void;
  grandTotal: number;
  materialSurcharge: number;
  deliveryEnabled: boolean;
  deliveryFloor: number;
  deliveryHasElevator: boolean;
  deliveryCost: number;
  onDeliveryEnabledChange: (v: boolean) => void;
  onDeliveryFloorChange: (v: number) => void;
  onDeliveryElevatorChange: (v: boolean) => void;
}

export default function CalculatorSidebar({
  lemanaItemsCount,
  onExportPdf,
  regions,
  selectedRegion,
  onRegionChange,
  grandTotal,
  materialSurcharge,
  deliveryEnabled,
  deliveryFloor,
  deliveryHasElevator,
  deliveryCost,
  onDeliveryEnabledChange,
  onDeliveryFloorChange,
  onDeliveryElevatorChange,
}: CalculatorSidebarProps) {
  const navigate = useNavigate();

  const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Icon name="MapPin" className="h-5 w-5 text-purple-600" />
          Регион выполнения
        </h3>
        <div className="space-y-4">
          <div>
            <Label>Регион</Label>
            <Select value={selectedRegion} onValueChange={onRegionChange}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Выберите регион" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.code} value={region.code}>
                    <div className="flex items-center justify-between w-full gap-3">
                      <span>{region.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


        </div>
      </Card>

      <Card className="p-6">
        <button
          className="flex items-center justify-between w-full"
          onClick={() => onDeliveryEnabledChange(!deliveryEnabled)}
        >
          <h3 className="font-semibold flex items-center gap-2">
            <Icon name="Truck" className="h-5 w-5 text-orange-500" />
            Доставка и подъём
          </h3>
          <div className={`w-10 h-6 rounded-full transition-colors relative ${deliveryEnabled ? "bg-primary" : "bg-gray-200"}`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${deliveryEnabled ? "translate-x-5" : "translate-x-1"}`} />
          </div>
        </button>

        {deliveryEnabled && (
          <div className="mt-4 space-y-4">
            <div>
              <Label className="text-sm">Этаж</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  className="w-8 h-8 rounded-lg border flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors"
                  onClick={() => onDeliveryFloorChange(Math.max(1, deliveryFloor - 1))}
                >−</button>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={deliveryFloor}
                  onChange={(e) => onDeliveryFloorChange(Math.max(1, Number(e.target.value) || 1))}
                  className="w-16 text-center h-8"
                />
                <button
                  className="w-8 h-8 rounded-lg border flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors"
                  onClick={() => onDeliveryFloorChange(Math.min(50, deliveryFloor + 1))}
                >+</button>
                <span className="text-sm text-gray-500">этаж</span>
              </div>
            </div>

            <div>
              <Label className="text-sm mb-2 block">Лифт в доме</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => onDeliveryElevatorChange(true)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-medium transition-colors ${deliveryHasElevator ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                >
                  <Icon name="ArrowUpSquare" size={15} />
                  С лифтом
                </button>
                <button
                  onClick={() => onDeliveryElevatorChange(false)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-medium transition-colors ${!deliveryHasElevator ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                >
                  <Icon name="Footprints" size={15} />
                  Без лифта
                </button>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Базовая доставка</span>
                <span>3 500 ₽</span>
              </div>
              {deliveryFloor > 1 && (
                <div className="flex justify-between text-gray-600">
                  <span>Подъём на {deliveryFloor} эт. {deliveryHasElevator ? "(лифт)" : "(пешком)"}</span>
                  <span>+{fmt(deliveryCost - 3500)} ₽</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-orange-700 border-t border-orange-200 pt-1 mt-1">
                <span>Итого доставка</span>
                <span>{fmt(deliveryCost)} ₽</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {grandTotal > 0 && (
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Icon name="Calculator" className="h-5 w-5 text-purple-600" />
            Итого по смете
          </h3>
          <p className="text-3xl font-bold text-purple-600">{fmt(grandTotal)} ₽</p>
          <p className="text-xs text-gray-500 mt-1">
            Цены на работы с учётом региона
          </p>
          {materialSurcharge > 0 && (
            <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
              <Icon name="Info" className="h-3 w-3" />
              Вкл. наценку +{fmt(materialSurcharge)} ₽ за материалы
            </p>
          )}
        </Card>
      )}

      {lemanaItemsCount > 0 && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="ShoppingCart" className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">ЛеманаПро</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {lemanaItemsCount} товаров сохранено в смете
          </p>
          <Button
            variant="outline"
            className="w-full border-green-300 hover:bg-green-100"
            onClick={() => navigate("/lemanapro")}
          >
            <Icon name="Plus" className="mr-2 h-4 w-4" />
            Добавить из каталога
          </Button>
        </Card>
      )}

      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <Icon name="Lightbulb" className="h-8 w-8 text-blue-600 mb-3" />
        <h3 className="font-semibold mb-2">Рекомендации</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <Icon name="Check" className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Выберите регион для точных цен</span>
          </li>
          <li className="flex gap-2">
            <Icon name="Check" className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Добавьте работы из прайс-листа</span>
          </li>
          <li className="flex gap-2">
            <Icon name="Check" className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Укажите точные объёмы для расчёта</span>
          </li>
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-3">Экспорт сметы</h3>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={onExportPdf}>
            <Icon name="FileText" className="mr-2 h-4 w-4" />
            PDF документ
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate("/prices")}
          >
            <Icon name="ClipboardList" className="mr-2 h-4 w-4" />
            Открыть полный прайс-лист
          </Button>
        </div>
      </Card>
    </div>
  );
}