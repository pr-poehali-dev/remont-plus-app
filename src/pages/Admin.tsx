import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  unit: string;
  image_url: string | null;
  in_stock: boolean;
  delivery_cost: number;
  floor_lifting_cost: number;
  supplier: {
    id: number;
    name: string;
  };
}

export default function Admin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    unit: '',
    delivery_cost: '',
    floor_lifting_cost: '',
    in_stock: true
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/735f02a5-eb3f-4e4b-b378-7564c92b8e00');
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory || '',
      price: product.price.toString(),
      unit: product.unit,
      delivery_cost: product.delivery_cost.toString(),
      floor_lifting_cost: product.floor_lifting_cost.toString(),
      in_stock: product.in_stock
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      subcategory: '',
      price: '',
      unit: 'шт',
      delivery_cost: '0',
      floor_lifting_cost: '0',
      in_stock: true
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingProduct) {
        const response = await fetch('https://functions.poehali.dev/735f02a5-eb3f-4e4b-b378-7564c92b8e00', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingProduct.id,
            ...formData,
            price: parseFloat(formData.price),
            delivery_cost: parseFloat(formData.delivery_cost),
            floor_lifting_cost: parseFloat(formData.floor_lifting_cost)
          })
        });
        
        if (response.ok) {
          alert('Товар успешно обновлен!');
        }
      } else {
        const response = await fetch('https://functions.poehali.dev/735f02a5-eb3f-4e4b-b378-7564c92b8e00', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_product',
            supplier_id: 1,
            ...formData,
            price: parseFloat(formData.price),
            delivery_cost: parseFloat(formData.delivery_cost),
            floor_lifting_cost: parseFloat(formData.floor_lifting_cost)
          })
        });
        
        if (response.ok) {
          alert('Товар успешно добавлен!');
        }
      }
      
      setIsModalOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Ошибка при сохранении товара');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Удалить этот товар?')) {
      try {
        const response = await fetch(`https://functions.poehali.dev/735f02a5-eb3f-4e4b-b378-7564c92b8e00?id=${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert('Товар удален');
          loadProducts();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Ошибка при удалении');
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Админ-панель</h1>
                <p className="text-sm text-gray-600">Управление товарами и поставщиками</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleAdd}>
                <Icon name="Plus" className="mr-2 h-4 w-4" />
                Добавить товар
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">
              <Icon name="Package" className="h-4 w-4 mr-2" />
              Товары
            </TabsTrigger>
            <TabsTrigger value="suppliers">
              <Icon name="Store" className="h-4 w-4 mr-2" />
              Поставщики
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Icon name="BarChart3" className="h-4 w-4 mr-2" />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Управление товарами</h2>
                <div className="flex gap-4">
                  <Input placeholder="Поиск по названию..." className="max-w-md" />
                  <Button variant="outline">
                    <Icon name="Filter" className="h-4 w-4 mr-2" />
                    Фильтры
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Загрузка...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Название</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Категория</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Цена</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Доставка</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Подъем</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Статус</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{product.id}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.supplier.name}</div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant="outline">{product.category}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {formatPrice(product.price)} ₽/{product.unit}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatPrice(product.delivery_cost)} ₽
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatPrice(product.floor_lifting_cost)} ₽
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={product.in_stock ? "default" : "outline"}>
                              {product.in_stock ? 'В наличии' : 'Нет в наличии'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEdit(product)}
                              >
                                <Icon name="Edit" className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Icon name="Trash2" className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="suppliers">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Поставщики</h2>
              <p className="text-gray-600">Управление поставщиками будет доступно в следующей версии</p>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Всего товаров</h3>
                  <Icon name="Package" className="h-5 w-5 text-primary" />
                </div>
                <div className="text-3xl font-bold">{products.length}</div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">В наличии</h3>
                  <Icon name="CheckCircle2" className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold">
                  {products.filter(p => p.in_stock).length}
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Категорий</h3>
                  <Icon name="FolderOpen" className="h-5 w-5 text-primary" />
                </div>
                <div className="text-3xl font-bold">
                  {new Set(products.map(p => p.category)).size}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                  <Icon name="X" className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Название товара</label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Например: Ламинат Дуб натуральный"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Описание</label>
                  <textarea 
                    className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Подробное описание товара"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Категория</label>
                    <Input 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="Напольные покрытия"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Подкатегория</label>
                    <Input 
                      value={formData.subcategory}
                      onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                      placeholder="Ламинат"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Цена</label>
                    <Input 
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="1250"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Единица измерения</label>
                    <Input 
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      placeholder="м²"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Стоимость доставки</label>
                    <Input 
                      type="number"
                      value={formData.delivery_cost}
                      onChange={(e) => setFormData({...formData, delivery_cost: e.target.value})}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Стоимость подъема на этаж</label>
                    <Input 
                      type="number"
                      value={formData.floor_lifting_cost}
                      onChange={(e) => setFormData({...formData, floor_lifting_cost: e.target.value})}
                      placeholder="150"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.in_stock}
                      onChange={(e) => setFormData({...formData, in_stock: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Товар в наличии</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <Button onClick={handleSave} className="flex-1">
                    {editingProduct ? 'Сохранить изменения' : 'Добавить товар'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Отмена
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}