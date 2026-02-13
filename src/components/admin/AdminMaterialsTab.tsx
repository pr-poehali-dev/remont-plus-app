import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";

const MATERIALS_URL = 'https://functions.poehali.dev/dd454a25-9f55-4cfb-9e59-736a4a1256fd';

export interface Material {
  id: number;
  name: string;
  price: string;
  category: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

interface AdminMaterialsTabProps {
  materials: Material[];
  onReload: () => void;
}

export default function AdminMaterialsTab({ materials, onReload }: AdminMaterialsTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [materialForm, setMaterialForm] = useState({
    name: '', price: '', category: '', description: '', is_active: true, sort_order: 0
  });

  const handleAdd = () => {
    setEditingMaterial(null);
    setMaterialForm({ name: '', price: '', category: '', description: '', is_active: true, sort_order: 0 });
    setIsModalOpen(true);
  };

  const handleEdit = (m: Material) => {
    setEditingMaterial(m);
    setMaterialForm({
      name: m.name, price: m.price, category: m.category,
      description: m.description, is_active: m.is_active, sort_order: m.sort_order
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
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
      setIsModalOpen(false);
      onReload();
    } catch {
      alert('Ошибка при сохранении');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Удалить этот материал?')) {
      try {
        const response = await fetch(`${MATERIALS_URL}?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          onReload();
        }
      } catch {
        alert('Ошибка при удалении');
      }
    }
  };

  const handleToggle = async (m: Material) => {
    try {
      await fetch(MATERIALS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...m, is_active: !m.is_active })
      });
      onReload();
    } catch {
      alert('Ошибка');
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Материалы</h2>
            <p className="text-sm text-gray-600">Эти материалы показываются в конструкторе дизайн-проектов</p>
          </div>
          <Button onClick={handleAdd}>
            <Icon name="Plus" className="mr-2 h-4 w-4" />
            Добавить материал
          </Button>
        </div>

        {materials.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Package" className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Материалов пока нет</h3>
            <p className="text-gray-600 mb-4">Добавьте первый материал для конструктора</p>
            <Button onClick={handleAdd}>
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
                  <Button variant="ghost" size="sm" onClick={() => handleToggle(m)} title={m.is_active ? 'Скрыть' : 'Показать'}>
                    <Icon name={m.is_active ? 'Eye' : 'EyeOff'} className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(m)}>
                    <Icon name="Edit" className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)}>
                    <Icon name="Trash2" className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingMaterial ? 'Редактировать материал' : 'Добавить материал'}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
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