import { useState } from "react";
import { Product } from "@/types";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface Props {
  products: Product[];
  onAdd: (name: string, volume: number, category: string) => void;
  onUpdate: (id: string, name: string, volume: number, category: string) => void;
  onDelete: (id: string) => void;
}

export default function CatalogPage({ products, onAdd, onUpdate, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [volume, setVolume] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort();

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditId(null);
    setName("");
    setVolume("");
    setCategory("");
    setNewCategory("");
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setName(p.name);
    setVolume(String(p.volume));
    setCategory(p.category || "");
    setNewCategory("");
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!name.trim() || !volume) return;
    const vol = parseFloat(volume);
    if (isNaN(vol) || vol <= 0) return;
    const cat = newCategory.trim() || category;
    if (editId) {
      onUpdate(editId, name.trim(), vol, cat);
    } else {
      onAdd(name.trim(), vol, cat);
    }
    setShowForm(false);
    setName("");
    setVolume("");
    setCategory("");
    setNewCategory("");
    setEditId(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Каталог товаров</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{products.length} позиций в базе</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon name="Plus" size={16} />
          Добавить товар
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-all"
          />
        </div>
        {categories.length > 0 && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring min-w-[160px]"
          >
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 animate-scale-in">
          <h3 className="font-semibold mb-4">{editId ? "Редактировать товар" : "Новый товар"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Название товара</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Моторное масло 5W-30"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Объём заказа, л</label>
              <input
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                type="number"
                min="0.1"
                step="0.1"
                placeholder="0.0"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-muted-foreground mb-1.5">Категория</label>
              <div className="flex gap-2">
                {categories.length > 0 && (
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setNewCategory(""); }}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Без категории</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
                <input
                  value={newCategory}
                  onChange={(e) => { setNewCategory(e.target.value); setCategory(""); }}
                  placeholder={categories.length > 0 ? "Или введите новую..." : "Введите категорию..."}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {editId ? "Сохранить" : "Добавить"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-md text-sm border border-border hover:bg-secondary transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Products grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Icon name="PackageOpen" size={32} className="mx-auto mb-3 opacity-30" />
          <p>Товары не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((product, i) => (
            <div
              key={product.id}
              className="bg-card border border-border rounded-xl p-4 group hover:border-primary/20 hover:shadow-sm transition-all duration-200"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                  <Icon name="Droplets" size={14} className="text-muted-foreground" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(product)}
                    className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon name="Pencil" size={13} />
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              </div>
              <div className="font-medium text-sm leading-tight mb-1">{product.name}</div>
              {product.category && (
                <div className="mt-2">
                  <span className={cn(
                    "inline-block text-xs px-2 py-0.5 rounded-full",
                    "bg-primary/10 text-primary font-medium"
                  )}>
                    {product.category}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}