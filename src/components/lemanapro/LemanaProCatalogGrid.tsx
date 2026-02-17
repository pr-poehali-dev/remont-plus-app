import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  type Category,
  type Subcategory,
  type EstimateSavedItem,
  saveEstimateItems,
  filterCategories,
  groupCategories,
  subcategoryUrl,
  categoryUrl,
} from "@/lib/lemanapro-data";

interface LemanaProCatalogGridProps {
  estimateItems: EstimateSavedItem[];
  setEstimateItems: (items: EstimateSavedItem[]) => void;
}

export default function LemanaProCatalogGrid({
  estimateItems,
  setEstimateItems,
}: LemanaProCatalogGridProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filterCategories(search);

  const addToEstimate = (sub: Subcategory, categoryName: string) => {
    const url = subcategoryUrl(sub.name);
    const existing = estimateItems.find(
      (i) => i.subcategory === sub.name && i.category === categoryName
    );
    if (existing) {
      toast({ title: "Уже в смете", description: `${sub.name} уже добавлен` });
      return;
    }
    const newItem: EstimateSavedItem = {
      id: crypto.randomUUID(),
      name: sub.name,
      category: categoryName,
      subcategory: sub.name,
      url,
      quantity: sub.packaging > 1 ? sub.packaging : 1,
      price: 0,
      unit: sub.unit,
      packaging: sub.packaging,
      note: "",
      addedAt: new Date().toISOString(),
    };
    const updated = [...estimateItems, newItem];
    setEstimateItems(updated);
    saveEstimateItems(updated);
    toast({ title: "Добавлено в смету", description: sub.name });
  };

  const removeFromEstimate = (id: string) => {
    const updated = estimateItems.filter((i) => i.id !== id);
    setEstimateItems(updated);
    saveEstimateItems(updated);
  };

  const isInEstimate = (subcategoryName: string, categoryName: string) =>
    estimateItems.some(
      (i) => i.subcategory === subcategoryName && i.category === categoryName
    );

  const openSubcategory = (name: string) => {
    window.open(subcategoryUrl(name), "_blank", "noopener");
  };

  const openCategory = (slug: string) => {
    window.open(categoryUrl(slug), "_blank", "noopener");
  };

  return (
    <>
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Icon
            name="Search"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
          />
          <Input
            placeholder="Найти категорию: плитка, сантехника, краски..."
            className="pl-11 h-12 text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setSearch("")}
            >
              <Icon name="X" className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Icon name="SearchX" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Ничего не найдено</p>
          <p className="text-gray-400 text-sm">Попробуйте изменить запрос</p>
        </div>
      )}

      {groupCategories(filtered, !!search.trim()).map((group) => (
        <div key={group.label} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            {group.label}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {group.items.map((cat) => (
              <CategoryCard
                key={cat.slug}
                category={cat}
                isExpanded={expanded === cat.slug}
                onToggle={() =>
                  expanded === cat.slug ? setExpanded(null) : setExpanded(cat.slug)
                }
                isInEstimate={isInEstimate}
                estimateItems={estimateItems}
                onAddToEstimate={addToEstimate}
                onRemoveFromEstimate={removeFromEstimate}
                onOpenSubcategory={openSubcategory}
                onOpenCategory={openCategory}
              />
            ))}
          </div>
        </div>
      ))}

      <Card className="p-6 mt-4 bg-blue-50/50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Icon name="Info" className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-700 mb-1">
              Каталог ведёт на официальный сайт{" "}
              <span className="font-medium">ЛеманаПро (Самара)</span>. Все цены, наличие и
              условия доставки — на стороне поставщика.
            </p>
            <p className="text-xs text-gray-500">
              Телефон: 8 (800) 700-00-99 · Бесплатно по России
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}

interface CategoryCardProps {
  category: Category;
  isExpanded: boolean;
  onToggle: () => void;
  isInEstimate: (subcategoryName: string, categoryName: string) => boolean;
  estimateItems: EstimateSavedItem[];
  onAddToEstimate: (sub: Subcategory, categoryName: string) => void;
  onRemoveFromEstimate: (id: string) => void;
  onOpenSubcategory: (name: string) => void;
  onOpenCategory: (slug: string) => void;
}

function CategoryCard({
  category: cat,
  isExpanded,
  onToggle,
  isInEstimate,
  estimateItems,
  onAddToEstimate,
  onRemoveFromEstimate,
  onOpenSubcategory,
  onOpenCategory,
}: CategoryCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
      <div className="p-5 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name={cat.icon} className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-center gap-1.5">
            {cat.subcategories.some((s) => isInEstimate(s.name, cat.name)) && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                <Icon name="Check" className="h-3 w-3 mr-0.5" />
                в смете
              </Badge>
            )}
            <Icon
              name={isExpanded ? "ChevronUp" : "ChevronDown"}
              className="h-4 w-4 text-gray-400"
            />
          </div>
        </div>
        <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
          {cat.name}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">{cat.description}</p>
      </div>

      {isExpanded && (
        <div className="border-t bg-gray-50/50 px-5 py-3 space-y-1">
          {cat.subcategories.map((sub) => {
            const inEstimate = isInEstimate(sub.name, cat.name);
            return (
              <div
                key={sub.slug}
                className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white transition-colors"
              >
                <button
                  className="text-sm hover:text-primary transition-colors flex items-center gap-1.5 group/link"
                  onClick={() => onOpenSubcategory(sub.name)}
                >
                  <span>{sub.name}</span>
                  <span className="text-[10px] text-gray-400 font-normal">{sub.unit}</span>
                  <Icon
                    name="ExternalLink"
                    className="h-3 w-3 text-gray-300 group-hover/link:text-primary"
                  />
                </button>
                <Button
                  variant={inEstimate ? "secondary" : "ghost"}
                  size="sm"
                  className={`h-7 text-xs px-2 ${inEstimate ? "text-green-700" : "text-gray-500 hover:text-primary"}`}
                  onClick={() => {
                    if (inEstimate) {
                      const item = estimateItems.find(
                        (i) => i.subcategory === sub.name && i.category === cat.name
                      );
                      if (item) onRemoveFromEstimate(item.id);
                    } else {
                      onAddToEstimate(sub, cat.name);
                    }
                  }}
                >
                  <Icon
                    name={inEstimate ? "Check" : "Plus"}
                    className="h-3 w-3 mr-1"
                  />
                  {inEstimate ? "В смете" : "В смету"}
                </Button>
              </div>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => onOpenCategory(cat.slug)}
          >
            Все товары раздела
            <Icon name="ArrowRight" className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </Card>
  );
}