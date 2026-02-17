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
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import type { Region } from "@/pages/Calculator";

interface CalculatorSidebarProps {
  lemanaItemsCount: number;
  onExportPdf?: () => void;
  regions: Region[];
  selectedRegion: string;
  onRegionChange: (code: string) => void;
  coefficient: number;
  grandTotal: number;
}

export default function CalculatorSidebar({
  lemanaItemsCount,
  onExportPdf,
  regions,
  selectedRegion,
  onRegionChange,
  coefficient,
  grandTotal,
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
                      {region.coefficient !== 1.0 && (
                        <span className="text-xs text-gray-400">
                          ×{region.coefficient.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {coefficient !== 1.0 && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
              <div className="flex items-center gap-2 text-amber-700">
                <Icon name="Info" size={14} />
                <span>
                  Коэффициент региона: <strong>×{coefficient.toFixed(2)}</strong>
                </span>
              </div>
              <p className="text-xs text-amber-600 mt-1">
                {coefficient > 1
                  ? "Цены выше среднего для данного региона"
                  : "Цены ниже среднего для данного региона"}
              </p>
            </div>
          )}
        </div>
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
