import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const SUPPLIERS_URL = 'https://functions.poehali.dev/735f02a5-eb3f-4e4b-b378-7564c92b8e00';
const MATERIALS_URL = 'https://functions.poehali.dev/dd454a25-9f55-4cfb-9e59-736a4a1256fd';

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
  supplier: { id: number; name: string };
}

interface Material {
  id: number;
  name: string;
  price: string;
  category: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMaterialsLoading, setIsMaterialsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const [formData, setFormData] = useState({
    name: '', description: '', category: '', subcategory: '',
    price: '', unit: '', delivery_cost: '', floor_lifting_cost: '', in_stock: true
  });

  const [materialForm, setMaterialForm] = useState({
    name: '', price: '', category: '', description: '', is_active: true, sort_order: 0
  });

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
    setIsMaterialsLoading(true);
    try {
      const response = await fetch(MATERIALS_URL);
      if (response.ok) {
        const data = await response.json();
        setMaterials(data.materials || []);
      }
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setIsMaterialsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, description: product.description,
      category: product.category, subcategory: product.subcategory || '',
      price: product.price.toString(), unit: product.unit,
      delivery_cost: product.delivery_cost.toString(),
      floor_lifting_cost: product.floor_lifting_cost.toString(),
      in_stock: product.in_stock
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '', description: '', category: '', subcategory: '',
      price: '', unit: 'шт', delivery_cost: '0', floor_lifting_cost: '0', in_stock: true
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...(editingProduct ? { id: editingProduct.id } : { action: 'create_product', supplier_id: 1 }),
        ...formData,
        price: parseFloat(formData.price),
        delivery_cost: parseFloat(formData.delivery_cost),
        floor_lifting_cost: parseFloat(formData.floor_lifting_cost)
      };
      const response = await fetch(SUPPLIERS_URL, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert(editingProduct ? 'Товар обновлен!' : 'Товар добавлен!');
      }
      setIsModalOpen(false);
      loadProducts();
    } catch {
      alert('Ошибка при сохранении товара');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Удалить этот товар?')) {
      try {
        const response = await fetch(`${SUPPLIERS_URL}?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          alert('Товар удален');
          loadProducts();
        }
      } catch {
        alert('Ошибка при удалении');
      }
    }
  };

  const handleMaterialAdd = () => {
    setEditingMaterial(null);
    setMaterialForm({ name: '', price: '', category: '', description: '', is_active: true, sort_order: 0 });
    setIsMaterialModalOpen(true);
  };

  const handleMaterialEdit = (m: Material) => {
    setEditingMaterial(m);
    setMaterialForm({
      name: m.name, price: m.price, category: m.category,
      description: m.description, is_active: m.is_active, sort_order: m.sort_order
    });
    setIsMaterialModalOpen(true);
  };

  const handleMaterialSave = async () => {
    try {
      const payload = editingMaterial
        ? { id: editingMaterial.id, ...materialForm }
        : materialForm;
      const response = await fetch(MATERIALS_URL, {
        method: editingMaterial ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert(editingMaterial ? 'Материал обновлен!' : 'Материал добавлен!');
      }
      setIsMaterialModalOpen(false);
      loadMaterials();
    } catch {
      alert('Ошибка при сохранении');
    }
  };

  const handleMaterialDelete = async (id: number) => {
    if (confirm('Удалить этот материал?')) {
      try {
        const response = await fetch(`${MATERIALS_URL}?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          loadMaterials();
        }
      } catch {
        alert('Ошибка при удалении');
      }
    }
  };

  const handleMaterialToggle = async (m: Material) => {
    try {
      await fetch(MATERIALS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...m, is_active: !m.is_active })
      });
      loadMaterials();
    } catch {
      alert('Ошибка');
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU').format(price);

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
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Материалы</h2>
                  <p className="text-sm text-gray-600">Эти материалы показываются в конструкторе дизайн-проектов</p>
                </div>
                <Button onClick={handleMaterialAdd}>
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Добавить материал
                </Button>
              </div>

              {isMaterialsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                  <p className="text-gray-600">Загрузка...</p>
                </div>
              ) : materials.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Package" className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Материалов пока нет</h3>
                  <p className="text-gray-600 mb-4">Добавьте первый материал для конструктора</p>
                  <Button onClick={handleMaterialAdd}>
                    <Icon name="Plus" className="mr-2 h-4 w-4" />
                    Добавить
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {materials.map((m) => (
                    <div key={m.id} className={`flex items-center gap-4 p-4 rounded-lg border ${m.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name="Layers" className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{m.name}</h3>
                          {!m.is_active && <Badge variant="outline">Скрыт</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="font-medium text-primary">{m.price}</span>
                          <span>·</span>
                          <span>{m.category}</span>
                          {m.description && (
                            <>
                              <span>·</span>
                              <span className="truncate">{m.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => handleMaterialToggle(m)} title={m.is_active ? 'Скрыть' : 'Показать'}>
                          <Icon name={m.is_active ? 'Eye' : 'EyeOff'} className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleMaterialEdit(m)}>
                          <Icon name="Edit" className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleMaterialDelete(m.id)}>
                          <Icon name="Trash2" className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Товары каталога</h2>
                <Button onClick={handleAdd}>
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Добавить товар
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
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
                            <div className="text-xs text-gray-500">{product.supplier?.name}</div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant="outline">{product.category}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {formatPrice(product.price)} ₽/{product.unit}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={product.in_stock ? "default" : "outline"}>
                              {product.in_stock ? 'В наличии' : 'Нет'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                                <Icon name="Edit" className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
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

          <TabsContent value="stats">
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
                  <label className="text-sm font-medium mb-2 block">Название</label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Описание</label>
                  <textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Категория</label>
                    <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Подкатегория</label>
                    <Input value={formData.subcategory} onChange={(e) => setFormData({...formData, subcategory: e.target.value})} />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Цена</label>
                    <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ед. измерения</label>
                    <Input value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.in_stock} onChange={(e) => setFormData({...formData, in_stock: e.target.checked})} className="w-5 h-5" />
                      <span className="text-sm font-medium">В наличии</span>
                    </label>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Стоимость доставки</label>
                    <Input type="number" value={formData.delivery_cost} onChange={(e) => setFormData({...formData, delivery_cost: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Стоимость подъема</label>
                    <Input type="number" value={formData.floor_lifting_cost} onChange={(e) => setFormData({...formData, floor_lifting_cost: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Отмена</Button>
                <Button onClick={handleSave}>Сохранить</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {isMaterialModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingMaterial ? 'Редактировать материал' : 'Добавить материал'}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsMaterialModalOpen(false)}>
                  <Icon name="X" className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Название материала</label>
                  <Input value={materialForm.name} onChange={(e) => setMaterialForm({...materialForm, name: e.target.value})} placeholder="Например: Ламинат Premium" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Цена (текст)</label>
                  <Input value={materialForm.price} onChange={(e) => setMaterialForm({...materialForm, price: e.target.value})} placeholder="1 200 ₽/м²" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Категория</label>
                  <Input value={materialForm.category} onChange={(e) => setMaterialForm({...materialForm, category: e.target.value})} placeholder="Напольные покрытия" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Описание</label>
                  <textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md" value={materialForm.description} onChange={(e) => setMaterialForm({...materialForm, description: e.target.value})} placeholder="Краткое описание" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Порядок сортировки</label>
                    <Input type="number" value={materialForm.sort_order} onChange={(e) => setMaterialForm({...materialForm, sort_order: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={materialForm.is_active} onChange={(e) => setMaterialForm({...materialForm, is_active: e.target.checked})} className="w-5 h-5" />
                      <span className="text-sm font-medium">Активен</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsMaterialModalOpen(false)}>Отмена</Button>
                <Button onClick={handleMaterialSave}>Сохранить</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}