import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

interface CalculatorSidebarProps {
  lemanaItemsCount: number;
  onExportPdf?: () => void;
}

export default function CalculatorSidebar({ lemanaItemsCount, onExportPdf }: CalculatorSidebarProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Icon name="Settings" className="h-5 w-5 text-purple-600" />
          Параметры расчета
        </h3>
        <div className="space-y-4">
          <div>
            <Label>Площадь помещения</Label>
            <Input type="number" defaultValue="20" className="mt-2" />
          </div>
          <div>
            <Label>Регион</Label>
            <Select defaultValue="msk">
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="msk">Москва</SelectItem>
                <SelectItem value="spb">Санкт-Петербург</SelectItem>
                <SelectItem value="other">Другой регион</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Срочность</Label>
            <Select defaultValue="normal">
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Обычная</SelectItem>
                <SelectItem value="fast">Срочно (+20%)</SelectItem>
                <SelectItem value="very-fast">Очень срочно (+40%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full">Пересчитать</Button>
        </div>
      </Card>

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
            <span>Заказывайте материалы с запасом 10-15%</span>
          </li>
          <li className="flex gap-2">
            <Icon name="Check" className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Сравните предложения минимум 3 мастеров</span>
          </li>
          <li className="flex gap-2">
            <Icon name="Check" className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Проверяйте наличие материалов у поставщика</span>
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
          <Button variant="outline" className="w-full justify-start">
            <Icon name="FileSpreadsheet" className="mr-2 h-4 w-4" />
            Excel таблица
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Icon name="Mail" className="mr-2 h-4 w-4" />
            Отправить на email
          </Button>
        </div>
      </Card>
    </div>
  );
}