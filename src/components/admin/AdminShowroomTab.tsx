import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import {
  type ShowroomItemDB,
  EMPTY_ITEM,
  SHOWROOM_URL,
} from "./showroomHelpers";
import ShowroomAdminCard from "./ShowroomAdminCard";
import ShowroomItemForm from "./ShowroomItemForm";

export type { ShowroomItemDB };

interface Props {
  items: ShowroomItemDB[];
  onReload: () => void;
}

export default function AdminShowroomTab({ items, onReload }: Props) {
  const [editing, setEditing] = useState<ShowroomItemDB | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<ShowroomItemDB, "id">>(EMPTY_ITEM);

  const openNew = () => {
    setForm(EMPTY_ITEM);
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
        <ShowroomItemForm
          form={form}
          isNew={isNew}
          saving={saving}
          onFieldChange={setField}
          onFormChange={setForm}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <ShowroomAdminCard
            key={item.id}
            item={item}
            deleting={deleting === item.id}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
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
