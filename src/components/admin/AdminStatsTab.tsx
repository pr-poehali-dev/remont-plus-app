import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import type { Material } from "./AdminMaterialsTab";
import type { Product } from "./AdminProductsTab";

interface AdminStatsTabProps {
  materials: Material[];
  products: Product[];
}

export default function AdminStatsTab({ materials, products }: AdminStatsTabProps) {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Материалов</h3>
          <Icon name="Layers" className="h-5 w-5 text-primary" />
        </div>
        <div className="text-3xl font-bold">{materials.length}</div>
        <p className="text-xs text-gray-500 mt-1">Активных: {materials.filter(m => m.is_active).length}</p>
      </Card>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Товаров</h3>
          <Icon name="Package" className="h-5 w-5 text-primary" />
        </div>
        <div className="text-3xl font-bold">{products.length}</div>
      </Card>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">В наличии</h3>
          <Icon name="CheckCircle2" className="h-5 w-5 text-green-500" />
        </div>
        <div className="text-3xl font-bold">{products.filter(p => p.in_stock).length}</div>
      </Card>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Категорий</h3>
          <Icon name="FolderOpen" className="h-5 w-5 text-primary" />
        </div>
        <div className="text-3xl font-bold">{new Set(products.map(p => p.category)).size}</div>
      </Card>
    </div>
  );
}