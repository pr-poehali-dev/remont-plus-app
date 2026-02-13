import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useState } from "react";

const SUPPLIERS_URL = 'https://functions.poehali.dev/735f02a5-eb3f-4e4b-b378-7564c92b8e00';

export interface Product {
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

interface AdminProductsTabProps {
  products: Product[];
  isLoading: boolean;
  onReload: () => void;
}

export default function AdminProductsTab({ products, isLoading, onReload }: AdminProductsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '', description: '', category: '', subcategory: '',
    price: '', unit: '', delivery_cost: '', floor_lifting_cost: '', in_stock: true
  });

  const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU').format(price);

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
      onReload();
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
          onReload();
        }
      } catch {
        alert('Ошибка при удалении');
      }
    }
  };

  return (
    <>
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
    </>
  );
}