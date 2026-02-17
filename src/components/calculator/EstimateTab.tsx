import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Icon from "@/components/ui/icon";

export interface EstimateItem {
  id: string;
  category: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  total: number;
}

interface EstimateTabProps {
  items: EstimateItem[];
  totalMaterials: number;
  totalWorks: number;
  grandTotal: number;
}

export default function EstimateTab({
  items,
  totalMaterials,
  totalWorks,
  grandTotal,
}: EstimateTabProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Детализация расходов</h3>
        <Button variant="outline" size="sm">
          <Icon name="Plus" className="mr-2 h-4 w-4" />
          Добавить позицию
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Категория</TableHead>
              <TableHead>Наименование</TableHead>
              <TableHead>Ед.</TableHead>
              <TableHead>Кол-во</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.category}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.price.toLocaleString('ru-RU')} ₽</TableCell>
                <TableCell className="font-semibold">{item.total.toLocaleString('ru-RU')} ₽</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <Icon name="Pencil" className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Icon name="Trash2" className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Card className="mt-6 p-6 bg-gray-50">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Материалы</p>
            <p className="text-2xl font-bold">{totalMaterials.toLocaleString('ru-RU')} ₽</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Работы</p>
            <p className="text-2xl font-bold">{totalWorks.toLocaleString('ru-RU')} ₽</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Общая стоимость</p>
            <p className="text-3xl font-bold text-purple-600">{grandTotal.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>
      </Card>
    </>
  );
}
