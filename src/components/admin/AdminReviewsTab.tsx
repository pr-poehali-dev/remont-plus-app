import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/874af9cd-edd6-471e-b6d4-e68c828e6dca";

export interface ReviewItem {
  id: number;
  name: string;
  text: string;
  rating: number;
  date_label: string;
  emoji: string;
  sort_order: number;
  is_active: boolean;
}

interface Props {
  items: ReviewItem[];
  onReload: () => void;
}

const emojis = ["👩", "👨", "👩‍💼", "👨‍💼", "👷", "👷‍♀️", "🧑", "👤"];

const empty: Omit<ReviewItem, "id"> = {
  name: "", text: "", rating: 5, date_label: "", emoji: "👤", sort_order: 0, is_active: true,
};

export default function AdminReviewsTab({ items, onReload }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ReviewItem | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const token = "admin2025";

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  };

  const openEdit = (item: ReviewItem) => {
    setEditing(item);
    setForm(item);
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, id: editing.id } : form;

    await fetch(`${API_URL}?action=reviews`, {
      method,
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setShowForm(false);
    onReload();
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить отзыв?")) return;
    await fetch(`${API_URL}?action=reviews`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify({ id }),
    });
    onReload();
  };

  const toggleActive = async (item: ReviewItem) => {
    await fetch(`${API_URL}?action=reviews`, {
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
          <h2 className="text-lg font-bold">Отзывы</h2>
          <p className="text-sm text-gray-500">{items.length} отзывов</p>
        </div>
        <Button onClick={openCreate}>
          <Icon name="Plus" className="mr-2 h-4 w-4" />
          Добавить отзыв
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className={`p-5 ${!item.is_active ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.date_label}</p>
                </div>
              </div>
              <Switch checked={item.is_active} onCheckedChange={() => toggleActive(item)} />
            </div>
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-sm ${i < item.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
              ))}
            </div>
            <p className="text-sm text-gray-600 line-clamp-3 mb-3">«{item.text}»</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                <Icon name="Pencil" size={14} className="mr-1" />
                Изменить
              </Button>
              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => remove(item.id)}>
                <Icon name="Trash2" size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Редактировать отзыв" : "Новый отзыв"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Имя клиента</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Анна К." />
            </div>
            <div>
              <Label>Текст отзыва</Label>
              <Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Отличная работа..." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Рейтинг (1–5)</Label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, rating: r })}
                      className={`text-2xl transition-colors ${r <= form.rating ? "text-amber-400" : "text-gray-200"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Дата</Label>
                <Input value={form.date_label} onChange={(e) => setForm({ ...form, date_label: e.target.value })} placeholder="Февраль 2026" />
              </div>
            </div>
            <div>
              <Label>Аватар</Label>
              <div className="flex gap-2 mt-1">
                {emojis.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setForm({ ...form, emoji: e })}
                    className={`text-2xl p-1 rounded-lg transition-colors ${form.emoji === e ? "bg-orange-100 ring-2 ring-orange-300" : "hover:bg-gray-100"}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Порядок сортировки</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
            <Button onClick={save} disabled={saving || !form.name || !form.text} className="w-full">
              {saving ? "Сохранение..." : editing ? "Сохранить" : "Добавить"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
