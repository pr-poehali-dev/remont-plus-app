import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { type EstimateSavedItem, saveEstimateItems } from "@/lib/lemanapro-data";

interface LemanaProTabProps {
  lemanaItems: EstimateSavedItem[];
  setLemanaItems: (items: EstimateSavedItem[]) => void;
}

export default function LemanaProTab({ lemanaItems, setLemanaItems }: LemanaProTabProps) {
  const navigate = useNavigate();

  const removeLemanaItem = (id: string) => {
    const updated = lemanaItems.filter((i) => i.id !== id);
    setLemanaItems(updated);
    saveEstimateItems(updated);
  };

  const updateLemanaQuantity = (id: string, quantity: number) => {
    const updated = lemanaItems.map((i) =>
      i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
    );
    setLemanaItems(updated);
    saveEstimateItems(updated);
  };

  const updateLemanaNote = (id: string, note: string) => {
    const updated = lemanaItems.map((i) => (i.id === id ? { ...i, note } : i));
    setLemanaItems(updated);
    saveEstimateItems(updated);
  };

  const lemanaByCategory = lemanaItems.reduce<Record<string, EstimateSavedItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

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
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(lemanaByCategory).map(([cat, catItems]) => (
            <div key={cat}>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-green-500 rounded-full" />
                {cat}
              </h4>
              <div className="space-y-2">
                {catItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{item.name}</span>
                          <button
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                            onClick={() => window.open(item.url, "_blank", "noopener")}
                            title="Открыть на сайте ЛеманаПро"
                          >
                            <Icon name="ExternalLink" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-500">Кол-во:</span>
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                updateLemanaQuantity(item.id, parseInt(e.target.value) || 1)
                              }
                              className="w-20 h-8 text-sm"
                            />
                          </div>
                          <Input
                            placeholder="Заметка (арт., цвет, размер...)"
                            value={item.note}
                            onChange={(e) => updateLemanaNote(item.id, e.target.value)}
                            className="flex-1 h-8 text-sm"
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
                ))}
              </div>
            </div>
          ))}

          <Card className="p-4 bg-green-50/50 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="Package" className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">
                    Итого: {lemanaItems.length} позиций,{" "}
                    {lemanaItems.reduce((s, i) => s + i.quantity, 0)} ед.
                  </p>
                  <p className="text-xs text-gray-500">Цены уточняйте на сайте ЛеманаПро</p>
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
