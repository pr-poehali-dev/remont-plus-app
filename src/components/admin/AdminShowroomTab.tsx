import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";

const SHOWROOM_URL = "https://functions.poehali.dev/00d5617d-4889-4550-bc82-d94492e380ba";

export interface ShowroomItemDB {
  id: number;
  title: string;
  description: string;
  room: string;
  style: string;
  area: string;
  materials: string[];
  image: string;
  designer: string;
  features: string[];
  aspect_ratio: string;
  color: string;
  sort_order: number;
}

const EMPTY_ITEM: Omit<ShowroomItemDB, "id" | "created_at" | "updated_at"> = {
  title: "",
  description: "",
  room: "Гостиная",
  style: "Современный",
  area: "",
  materials: [],
  image: "",
  designer: "Студия АВАНГАРД",
  features: [],
  aspect_ratio: "square",
  color: "#ffffff",
  sort_order: 0,
};

const ROOMS = ["Гостиная", "Спальня", "Ванная", "Кухня", "Детская"];
const STYLES = ["Минимализм", "Современный", "Современная классика", "Скандинавский", "Лофт", "Japandi", "Эко"];
const RATIOS = ["square", "tall", "wide"];

interface Props {
  items: ShowroomItemDB[];
  onReload: () => void;
}

export default function AdminShowroomTab({ items, onReload }: Props) {
  const [editing, setEditing] = useState<ShowroomItemDB | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<ShowroomItemDB, "id">>(EMPTY_ITEM as Omit<ShowroomItemDB, "id">);

  const openNew = () => {
    setForm(EMPTY_ITEM as Omit<ShowroomItemDB, "id">);
    setEditing(null);
    setIsNew(true);
  };

  const openEdit = (item: ShowroomItemDB) => {
    setForm({ ...item });
    setEditing(item);
    setIsNew(false);
  };

  const closeForm = () => {
    setEditing(null);
    setIsNew(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        await fetch(SHOWROOM_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else if (editing) {
        await fetch(`${SHOWROOM_URL}?id=${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      onReload();
      closeForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить карточку?")) return;
    setDeleting(id);
    try {
      await fetch(`${SHOWROOM_URL}?id=${id}`, { method: "DELETE" });
      onReload();
    } finally {
      setDeleting(null);
    }
  };

  const setField = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setArrayField = (k: "materials" | "features", val: string) =>
    setField(k, val.split("\n").filter(Boolean));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Шоурум</h2>
          <p className="text-sm text-gray-500">{items.length} карточек</p>
        </div>
        <Button onClick={openNew} size="sm">
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить
        </Button>
      </div>

      {(isNew || editing) && (
        <div className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold">{isNew ? "Новая карточка" : "Редактирование"}</h3>
            <button onClick={closeForm} className="p-1 rounded hover:bg-gray-100">
              <Icon name="X" size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Название</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Название интерьера"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Площадь</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={form.area}
                onChange={(e) => setField("area", e.target.value)}
                placeholder="25 м²"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Комната</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={form.room}
                onChange={(e) => setField("room", e.target.value)}
              >
                {ROOMS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Стиль</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={form.style}
                onChange={(e) => setField("style", e.target.value)}
              >
                {STYLES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Пропорции карточки</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={form.aspect_ratio}
                onChange={(e) => setField("aspect_ratio", e.target.value)}
              >
                {RATIOS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Цвет акцента</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-10 h-9 border rounded-lg cursor-pointer"
                  value={form.color}
                  onChange={(e) => setField("color", e.target.value)}
                />
                <input
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  value={form.color}
                  onChange={(e) => setField("color", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Дизайнер</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={form.designer}
                onChange={(e) => setField("designer", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Порядок сортировки</label>
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={form.sort_order}
                onChange={(e) => setField("sort_order", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">URL изображения</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              value={form.image}
              onChange={(e) => setField("image", e.target.value)}
              placeholder="https://..."
            />
            {form.image && (
              <img src={form.image} alt="" className="mt-2 h-28 rounded-lg object-cover" />
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Описание</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              rows={3}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Описание проекта"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Материалы (каждый с новой строки)</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                rows={4}
                value={form.materials.join("\n")}
                onChange={(e) => setArrayField("materials", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Особенности (каждая с новой строки)</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                rows={4}
                value={form.features.join("\n")}
                onChange={(e) => setArrayField("features", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeForm}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Сохраняю..." : "Сохранить"}
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            {item.image && (
              <div className="aspect-video w-full overflow-hidden bg-gray-100">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Icon name="Pencil" size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <Badge variant="secondary" className="text-[10px]">{item.room}</Badge>
                <Badge variant="outline" className="text-[10px]">{item.style}</Badge>
                <Badge variant="outline" className="text-[10px]">{item.area}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !isNew && (
        <div className="text-center py-16 text-gray-400">
          <Icon name="Image" size={40} className="mx-auto mb-3 opacity-30" />
          <p>Карточек пока нет</p>
        </div>
      )}
    </div>
  );
}
