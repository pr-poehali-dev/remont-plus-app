import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { type EstimateSavedItem, saveEstimateItems, roundUpToPackaging } from "@/lib/lemanapro-data";
import MaterialCalculator from "@/components/lemanapro/MaterialCalculator";

interface LemanaProTabProps {
  lemanaItems: EstimateSavedItem[];
  setLemanaItems: (items: EstimateSavedItem[]) => void;
}

export default function LemanaProTab({ lemanaItems, setLemanaItems }: LemanaProTabProps) {
  const navigate = useNavigate();

  const update = (updated: EstimateSavedItem[]) => {
    setLemanaItems(updated);
    saveEstimateItems(updated);
  };

  const removeLemanaItem = (id: string) => {
    update(lemanaItems.filter((i) => i.id !== id));
  };

  const updateField = (id: string, field: Partial<EstimateSavedItem>) => {
    update(lemanaItems.map((i) => (i.id === id ? { ...i, ...field } : i)));
  };

  const lemanaByCategory = lemanaItems.reduce<Record<string, EstimateSavedItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const totalSum = lemanaItems.reduce((s, i) => {
    const rounded = roundUpToPackaging(i.quantity, i.packaging || 1);
    return s + (i.price || 0) * rounded;
  }, 0);
  const hasPrices = lemanaItems.some((i) => i.price > 0);
  const formatPrice = (n: number) => n.toLocaleString("ru-RU");

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Товары из ЛеманаПро</h3>
          <p className="text-sm text-gray-500">Сохранённые позиции из каталога</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/lemanapro")}>
          <Icon name="ShoppingCart" className="mr-2 h-4 w-4" />
          В каталог
        </Button>
      </div>

      {lemanaItems.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="ShoppingCart" className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Нет сохранённых товаров</p>
          <p className="text-gray-400 text-sm mb-4">
            Перейдите в каталог ЛеманаПро и добавьте нужные товары в смету
          </p>
          <Button onClick={() => navigate("/lemanapro")}>
            <Icon name="ShoppingCart" className="mr-2 h-4 w-4" />
            Открыть каталог ЛеманаПро
          </Button>
          <div className="mt-6 w-full max-w-lg mx-auto">
            <MaterialCalculator
              estimateItems={lemanaItems}
              setEstimateItems={setLemanaItems}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(lemanaByCategory).map(([cat, catItems]) => {
            const catTotal = catItems.reduce((s, i) => {
              const rounded = roundUpToPackaging(i.quantity, i.packaging || 1);
              return s + (i.price || 0) * rounded;
            }, 0);
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-1 h-4 bg-green-500 rounded-full" />
                    {cat}
                  </h4>
                  {catTotal > 0 && (
                    <span className="text-sm font-medium text-gray-600">
                      {formatPrice(catTotal)} ₽
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {catItems.map((item) => {
                    const pkg = item.packaging || 1;
                    const unit = item.unit || "шт";
                    const rounded = roundUpToPackaging(item.quantity, pkg);
                    const wasRounded = rounded !== item.quantity;
                    const lineTotal = (item.price || 0) * rounded;
                    return (
                      <Card key={item.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="font-medium">{item.name}</span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                                {unit}
                                {pkg > 1 && ` × ${pkg}`}
                              </Badge>
                              <button
                                className="text-gray-400 hover:text-blue-500 transition-colors"
                                onClick={() => window.open(item.url, "_blank", "noopener")}
                                title="Открыть на сайте ЛеманаПро"
                              >
                                <Icon name="ExternalLink" className="h-3.5 w-3.5" />
                              </button>
                              {lineTotal > 0 && (
                                <span className="ml-auto text-sm font-semibold text-primary">
                                  {formatPrice(lineTotal)} ₽
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-500">Нужно, {unit}:</span>
                                <Input
                                  type="number"
                                  min={0.1}
                                  step={pkg > 1 ? pkg : 1}
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateField(item.id, {
                                      quantity: Math.max(0.1, parseFloat(e.target.value) || 0.1),
                                    })
                                  }
                                  className="w-20 h-8 text-sm"
                                />
                              </div>
                              {wasRounded && (
                                <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                  <Icon name="ArrowUp" className="h-3 w-3" />
                                  к закупке: {rounded} {unit}
                                </span>
                              )}
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-500">Цена/{unit}:</span>
                                <Input
                                  type="number"
                                  min={0}
                                  step={1}
                                  placeholder="0"
                                  value={item.price || ""}
                                  onChange={(e) =>
                                    updateField(item.id, {
                                      price: Math.max(0, parseFloat(e.target.value) || 0),
                                    })
                                  }
                                  className="w-28 h-8 text-sm"
                                />
                              </div>
                              <Input
                                placeholder="Заметка (арт., цвет, размер...)"
                                value={item.note}
                                onChange={(e) => updateField(item.id, { note: e.target.value })}
                                className="flex-1 min-w-[120px] h-8 text-sm"
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-500 flex-shrink-0"
                            onClick={() => removeLemanaItem(item.id)}
                          >
                            <Icon name="Trash2" className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <MaterialCalculator
            estimateItems={lemanaItems}
            setEstimateItems={setLemanaItems}
          />

          <Card className="p-4 bg-green-50/50 border-green-200">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Icon name="Package" className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">
                    Итого: {lemanaItems.length} позиций
                  </p>
                  {hasPrices ? (
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(totalSum)} ₽
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Укажите цены, чтобы увидеть сумму
                    </p>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/lemanapro")}>
                <Icon name="Plus" className="mr-1.5 h-4 w-4" />
                Добавить ещё
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}