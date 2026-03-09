import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import type { Material } from "./AdminMaterialsTab";
import type { Product } from "./AdminProductsTab";

interface AdminStatsTabProps {
  materials: Material[];
  products: Product[];
}

export default function AdminStatsTab({ materials, products }: AdminStatsTabProps) {
  const inactiveCount = materials.filter(m => !m.is_active).length;
  const outOfStockCount = products.filter(p => !p.in_stock).length;
  const categoriesCount = new Set(products.map(p => p.category)).size;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Статистика каталога</h2>
        <p className="text-sm text-gray-500">Общий срез по содержимому — материалам и товарам в системе. Помогает быстро оценить актуальность базы.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Материалов</h3>
            <Icon name="Layers" className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold">{materials.length}</div>
          <p className="text-xs text-gray-500 mt-1">Активных: {materials.filter(m => m.is_active).length}</p>
          {inactiveCount > 0 && (
            <p className="text-xs text-amber-500 mt-1">Скрытых: {inactiveCount} — не видны клиентам</p>
          )}
          <p className="text-xs text-gray-400 mt-2">Материалы используются в калькуляторе и сметах. Неактивные не попадают в расчёты.</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Товаров</h3>
            <Icon name="Package" className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold">{products.length}</div>
          <p className="text-xs text-gray-500 mt-1">Всего позиций в каталоге</p>
          <p className="text-xs text-gray-400 mt-2">Товары отображаются в каталоге для клиентов. Следите, чтобы количество росло и база не устаревала.</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">В наличии</h3>
            <Icon name="CheckCircle2" className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold">{products.filter(p => p.in_stock).length}</div>
          {outOfStockCount > 0 && (
            <p className="text-xs text-red-400 mt-1">Нет в наличии: {outOfStockCount}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">Товары не в наличии видны клиентам как недоступные. Обновляйте статус своевременно.</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Категорий</h3>
            <Icon name="FolderOpen" className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold">{categoriesCount}</div>
          <p className="text-xs text-gray-500 mt-1">Уникальных групп товаров</p>
          <p className="text-xs text-gray-400 mt-2">Категории помогают клиентам быстро найти нужное. Старайтесь не дублировать и не дробить избыточно.</p>
        </Card>
      </div>
    </div>
  );
}
