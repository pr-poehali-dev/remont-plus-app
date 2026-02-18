import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import funcUrls from "../../backend/func2url.json";

const API_URL = funcUrls["user-addresses"];

interface Address {
  id: number;
  user_id: number;
  region: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
  postal_code: string;
  is_default: boolean;
  label: string;
}

interface AddressFormData {
  region: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
  postal_code: string;
  label: string;
}

const emptyForm: AddressFormData = {
  region: "",
  city: "",
  street: "",
  house: "",
  apartment: "",
  postal_code: "",
  label: "",
};

export default function AddressForm({ userId, projectId }: { userId: number; projectId?: number | null }) {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AddressFormData>(emptyForm);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API_URL}?user_id=${userId}`;
      if (projectId) url += `&project_id=${projectId}`;
      const res = await fetch(url);
      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch {
      toast({ title: "Ошибка загрузки адресов", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [userId, projectId, toast]);

  useEffect(() => {
    if (userId) loadAddresses();
  }, [userId, projectId, loadAddresses]);

  const handleSave = async () => {
    if (!form.region || !form.city || !form.street || !form.house) {
      toast({ title: "Заполните область, город, улицу и дом", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body: Record<string, unknown> = { ...form, user_id: userId, is_default: true };
      if (projectId) body.project_id = projectId;
      if (editingId) body.id = editingId;

      const res = await fetch(API_URL, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        toast({ title: err.error || "Ошибка сохранения", variant: "destructive" });
        return;
      }

      toast({ title: editingId ? "Адрес обновлён" : "Адрес добавлен" });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadAddresses();
    } catch {
      toast({ title: "Ошибка сети", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      region: addr.region,
      city: addr.city,
      street: addr.street,
      house: addr.house,
      apartment: addr.apartment,
      postal_code: addr.postal_code,
      label: addr.label,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, user_id: userId }),
      });
      toast({ title: "Адрес удалён" });
      await loadAddresses();
    } catch {
      toast({ title: "Ошибка удаления", variant: "destructive" });
    }
  };

  const formatAddress = (a: Address) => {
    const parts = [a.region, a.city, a.street, `д. ${a.house}`];
    if (a.apartment) parts.push(`кв. ${a.apartment}`);
    if (a.postal_code) parts.push(a.postal_code);
    return parts.join(", ");
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const updateField = (field: keyof AddressFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Icon name="Loader2" className="h-6 w-6 animate-spin mr-2" />
          Загрузка адресов...
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.length > 0 && !showForm && (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <Card key={addr.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="MapPin" className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-medium">
                      {addr.label || "Адрес доставки"}
                    </span>
                    {addr.is_default && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        основной
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 ml-6">{formatAddress(addr)}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(addr)}>
                    <Icon name="Pencil" className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(addr.id)}>
                    <Icon name="Trash2" className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">
            {editingId ? "Редактирование адреса" : "Новый адрес доставки"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Название (необязательно)</label>
              <Input
                placeholder="Дом, офис, дача..."
                value={form.label}
                onChange={(e) => updateField("label", e.target.value)}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Область / Край <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Московская область"
                  value={form.region}
                  onChange={(e) => updateField("region", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Город / Населённый пункт <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Москва"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Улица <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="ул. Ленина"
                value={form.street}
                onChange={(e) => updateField("street", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Дом <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="10"
                  value={form.house}
                  onChange={(e) => updateField("house", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Квартира</label>
                <Input
                  placeholder="25"
                  value={form.apartment}
                  onChange={(e) => updateField("apartment", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Индекс</label>
                <Input
                  placeholder="123456"
                  value={form.postal_code}
                  onChange={(e) => updateField("postal_code", e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Icon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Icon name="Check" className="h-4 w-4 mr-2" />
                    Сохранить адрес
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Отмена
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!showForm && (
        <Button
          variant="outline"
          className="w-full border-2 border-dashed py-6"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
        >
          <Icon name="Plus" className="h-5 w-5 mr-2" />
          Добавить адрес доставки
        </Button>
      )}
    </div>
  );
}