import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/874af9cd-edd6-471e-b6d4-e68c828e6dca";

export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  area: string;
  duration: string;
  price: string;
  category: string;
  sort_order: number;
  is_active: boolean;
}

interface Props {
  items: PortfolioItem[];
  onReload: () => void;
}

const empty: Omit<PortfolioItem, "id"> = {
  title: "", description: "", image_url: "", area: "",
  duration: "", price: "", category: "Ремонт", sort_order: 0, is_active: true,
};

export default function AdminPortfolioTab({ items, onReload }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const token = "admin2025";

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  };

  const openEdit = (item: PortfolioItem) => {
    setEditing(item);
    setForm(item);
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    const method = editing ? "PUT" : "POST";
    const body = editing
      ? { ...form, id: editing.id, entity: "project" }
      : form;

    await fetch(`${API_URL}?action=portfolio`, {
      method,
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setShowForm(false);
    onReload();
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить проект из портфолио?")) return;
    await fetch(`${API_URL}?action=portfolio`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify({ id }),
    });
    onReload();
  };

  const toggleActive = async (item: PortfolioItem) => {
    await fetch(`${API_URL}?action=portfolio`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify({ id: item.id, is_active: !item.is_active }),
    });
    onReload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold">Портфолио</h2>
          <p className="text-sm text-gray-500">{items.length} проектов</p>
        </div>
        <Button onClick={openCreate}>
          <Icon name="Plus" className="mr-2 h-4 w-4" />
          Добавить проект
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className={`overflow-hidden ${!item.is_active ? "opacity-50" : ""}`}>
            <div className="aspect-video relative overflow-hidden bg-gray-100">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300">
                  <Icon name="Image" size={40} />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => openEdit(item)}>
                  <Icon name="Pencil" size={14} />
                </Button>
                <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => remove(item.id)}>
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{item.title}</h3>
                <Switch checked={item.is_active} onCheckedChange={() => toggleActive(item)} />
              </div>
              <div className="flex gap-2 text-xs text-gray-500">
                {item.area && <span>{item.area}</span>}
                {item.duration && <span>· {item.duration}</span>}
                {item.price && <span>· {item.price}</span>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Редактировать проект" : "Новый проект"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ванная комната" />
            </div>
            <div>
              <Label>URL изображения</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Описание</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Современный дизайн..." />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Площадь</Label>
                <Input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="8 м²" />
              </div>
              <div>
                <Label>Срок</Label>
                <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="14 дней" />
              </div>
              <div>
                <Label>Цена</Label>
                <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="от 320 000 ₽" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Категория</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ремонт" />
              </div>
              <div>
                <Label>Порядок</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
            </div>
            <Button onClick={save} disabled={saving || !form.title || !form.image_url} className="w-full">
              {saving ? "Сохранение..." : editing ? "Сохранить" : "Добавить"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
