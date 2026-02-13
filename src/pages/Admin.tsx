import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminMaterialsTab, { type Material } from "@/components/admin/AdminMaterialsTab";
import AdminProductsTab, { type Product } from "@/components/admin/AdminProductsTab";
import AdminStatsTab from "@/components/admin/AdminStatsTab";

const SUPPLIERS_URL = 'https://functions.poehali.dev/735f02a5-eb3f-4e4b-b378-7564c92b8e00';
const MATERIALS_URL = 'https://functions.poehali.dev/dd454a25-9f55-4cfb-9e59-736a4a1256fd';

export default function Admin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
    loadMaterials();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(SUPPLIERS_URL);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      const response = await fetch(MATERIALS_URL);
      if (response.ok) {
        const data = await response.json();
        setMaterials(data.materials || []);
      }
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumbs
        items={[
          { label: "Главная", path: "/" },
          { label: "Личный кабинет", path: "/profile" },
          { label: "Админ-панель", path: "/admin" }
        ]}
      />
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Админ-панель</h1>
                <p className="text-sm text-gray-600">Управление товарами, материалами и поставщиками</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="materials" className="space-y-6">
          <TabsList>
            <TabsTrigger value="materials">
              <Icon name="Layers" className="h-4 w-4 mr-2" />
              Материалы
            </TabsTrigger>
            <TabsTrigger value="products">
              <Icon name="Package" className="h-4 w-4 mr-2" />
              Товары каталога
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Icon name="BarChart3" className="h-4 w-4 mr-2" />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials">
            <AdminMaterialsTab materials={materials} onReload={loadMaterials} />
          </TabsContent>

          <TabsContent value="products">
            <AdminProductsTab products={products} isLoading={isLoading} onReload={loadProducts} />
          </TabsContent>

          <TabsContent value="stats">
            <AdminStatsTab materials={materials} products={products} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}