import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import type { EstimateItem, PriceCategory, PriceItem } from "@/pages/Calculator";
import MaterialSuggest from "@/components/calculator/MaterialSuggest";

interface EstimateTabProps {
  items: EstimateItem[];
  totalMaterials: number;
  totalWorks: number;
  adjustedWorks: number;
  materialSurcharge: number;
  grandTotal: number;
  priceCatalog: PriceCategory[];
  loading: boolean;
  onAddFromPriceList: (item: PriceItem, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<EstimateItem>) => void;
  onAddItem: (item: EstimateItem) => void;
  regionName?: string;
  selectedRegion?: string;
  deliveryCost?: number;
}

export default function EstimateTab({
  items,
  totalMaterials,
  totalWorks,
  adjustedWorks,
  materialSurcharge,
  grandTotal,
  priceCatalog,
  loading,
  onAddFromPriceList,
  onRemoveItem,
  onUpdateItem,
  onAddItem,
  regionName,
  selectedRegion,
  deliveryCost = 0,
}: EstimateTabProps) {
  const [showPricePicker, setShowPricePicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerCategory, setPickerCategory] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

  const filteredCatalog = priceCatalog
    .filter((c) => !pickerCategory || c.slug === pickerCategory)
    .map((c) => ({
      ...c,
      items: c.items.filter(
        (i) =>
          !pickerSearch ||
          i.name.toLowerCase().includes(pickerSearch.toLowerCase())
      ),
    }))
    .filter((c) => c.items.length > 0);

  const handleAdd = (item: PriceItem) => {
    const qty = quantities[item.id] || 1;
    onAddFromPriceList(item, qty);
    setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Смета работ и материалов</h3>
        <Button size="sm" onClick={() => setShowPricePicker(true)}>
          <Icon name="Plus" className="mr-2 h-4 w-4" />
          Добавить из прайса
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Icon name="ClipboardList" className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 mb-1">Смета пока пуста</p>
          <p className="text-sm text-gray-400 mb-4">
            Добавьте работы из прайс-листа для расчёта стоимости
          </p>
          <Button onClick={() => setShowPricePicker(true)} variant="outline">
            <Icon name="Plus" className="mr-2 h-4 w-4" />
            Выбрать работы из прайса
          </Button>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-[35%]">Наименование</TableHead>
                <TableHead className="text-center">Ед.</TableHead>
                <TableHead className="text-center">Кол-во</TableHead>
                <TableHead className="text-right">Цена</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <>
                  <TableRow key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={item.category === "Работы" ? "default" : "secondary"}
                          className="text-[10px] px-1.5 py-0 shrink-0"
                        >
                          {item.category === "Работы" ? "Работа" : "Материал"}
                        </Badge>
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-gray-500 text-sm">
                      {item.unit}
                    </TableCell>
                    <TableCell className="text-center">
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            onUpdateItem(item.id, { quantity: Number(e.target.value) || 1 })
                          }
                          onBlur={() => setEditingId(null)}
                          onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                          className="w-20 h-8 text-center mx-auto"
                          autoFocus
                        />
                      ) : (
                        <span
                          className="cursor-pointer hover:text-primary font-medium"
                          onClick={() => setEditingId(item.id)}
                        >
                          {item.quantity}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {fmt(item.price)} ₽
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {fmt(item.total)} ₽
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Icon name="X" className="h-4 w-4 text-gray-400 hover:text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {item.category === "Работы" && (
                    <TableRow key={`mat-${item.id}`} className="border-0">
                      <TableCell colSpan={6} className="py-0 pb-2">
                        <MaterialSuggest
                          workItem={item}
                          region={selectedRegion}
                          onAddMaterial={onAddItem}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {items.length > 0 && (
        <Card className="mt-6 p-6 bg-gray-50">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Материалы</p>
              <p className="text-2xl font-bold">{fmt(totalMaterials)} ₽</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Работы</p>
              <p className="text-2xl font-bold">{fmt(adjustedWorks)} ₽</p>
              {materialSurcharge > 0 && (
                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                  <Icon name="Info" className="h-3 w-3" />
                  +{fmt(materialSurcharge)} ₽ (коэфф. за материалы)
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Общая стоимость</p>
              <p className="text-3xl font-bold text-purple-600">{fmt(grandTotal + deliveryCost)} ₽</p>
              {regionName && (
                <p className="text-xs text-gray-400 mt-1">
                  {regionName}
                </p>
              )}
            </div>
          </div>
          {deliveryCost > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-gray-600">
                <Icon name="Truck" className="h-4 w-4 text-orange-500" />
                Доставка и подъём материалов
              </span>
              <span className="font-semibold text-orange-600">+{fmt(deliveryCost)} ₽</span>
            </div>
          )}
          {materialSurcharge > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Icon name="AlertCircle" className="h-3.5 w-3.5 text-orange-500" />
                Стоимость работ увеличена до ×1,3 от стоимости материалов ({fmt(totalWorks)} → {fmt(adjustedWorks)} ₽)
              </p>
            </div>
          )}
        </Card>
      )}

      <Dialog open={showPricePicker} onOpenChange={setShowPricePicker}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="ClipboardList" className="h-5 w-5 text-primary" />
              Добавить работы из прайс-листа
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 mt-2">
            <div className="relative flex-1">
              <Icon
                name="Search"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Поиск работ..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex gap-1.5 flex-wrap mt-2">
            <Badge
              variant={!pickerCategory ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setPickerCategory(null)}
            >
              Все
            </Badge>
            {priceCatalog.map((c) => (
              <Badge
                key={c.slug}
                variant={pickerCategory === c.slug ? "default" : "outline"}
                className="cursor-pointer gap-1"
                onClick={() =>
                  setPickerCategory(pickerCategory === c.slug ? null : c.slug)
                }
              >
                <Icon name={c.icon} size={12} />
                {c.name}
              </Badge>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto mt-3 -mx-6 px-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Icon name="SearchX" className="mx-auto h-8 w-8 mb-2" />
                Ничего не найдено
              </div>
            ) : (
              filteredCatalog.map((cat) => (
                <div key={cat.slug}>
                  <div className="flex items-center gap-2 mb-2 sticky top-0 bg-white py-1 z-10">
                    <Icon name={cat.icon} size={16} className="text-primary" />
                    <span className="font-semibold text-sm">{cat.name}</span>
                    <span className="text-xs text-gray-400">
                      ({cat.items.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {cat.items.map((item) => {
                      const alreadyAdded = items.some(
                        (i) => i.name === item.name && i.category === "Работы"
                      );
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                            alreadyAdded
                              ? "bg-green-50 border-green-200"
                              : "hover:bg-gray-50 border-transparent hover:border-gray-200"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="text-xs text-gray-400 truncate">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 shrink-0">
                            {item.unit}
                          </span>
                          <span className="font-semibold text-sm shrink-0 w-20 text-right">
                            {fmt(item.price)} ₽
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Input
                              type="number"
                              min={1}
                              value={quantities[item.id] || 1}
                              onChange={(e) =>
                                setQuantities((prev) => ({
                                  ...prev,
                                  [item.id]: Number(e.target.value) || 1,
                                }))
                              }
                              className="w-16 h-8 text-center text-sm"
                            />
                            <Button
                              size="sm"
                              variant={alreadyAdded ? "secondary" : "default"}
                              className="h-8 px-3"
                              onClick={() => handleAdd(item)}
                            >
                              <Icon
                                name={alreadyAdded ? "Plus" : "Plus"}
                                size={14}
                              />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}