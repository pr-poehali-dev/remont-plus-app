import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { type EstimateSavedItem, saveEstimateItems } from "@/lib/lemanapro-data";

interface LemanaProEstimateProps {
  estimateItems: EstimateSavedItem[];
  setEstimateItems: (items: EstimateSavedItem[]) => void;
  setShowEstimate: (show: boolean) => void;
}

export default function LemanaProEstimate({
  estimateItems,
  setEstimateItems,
  setShowEstimate,
}: LemanaProEstimateProps) {
  const navigate = useNavigate();

  const removeFromEstimate = (id: string) => {
    const updated = estimateItems.filter((i) => i.id !== id);
    setEstimateItems(updated);
    saveEstimateItems(updated);
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    const updated = estimateItems.map((i) =>
      i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
    );
    setEstimateItems(updated);
    saveEstimateItems(updated);
  };

  const updateItemNote = (id: string, note: string) => {
    const updated = estimateItems.map((i) => (i.id === id ? { ...i, note } : i));
    setEstimateItems(updated);
    saveEstimateItems(updated);
  };

  const estimateByCategory = estimateItems.reduce<Record<string, EstimateSavedItem[]>>(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Моя смета</h2>
          <p className="text-gray-500 text-sm">
            {estimateItems.length > 0
              ? `${estimateItems.length} позиций из каталога ЛеманаПро`
              : "Пока пусто — добавьте товары из каталога"}
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowEstimate(false)}>
          <Icon name="ArrowLeft" className="mr-1.5 h-4 w-4" />
          К каталогу
        </Button>
      </div>

      {estimateItems.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="ClipboardList" className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Смета пуста</p>
          <p className="text-gray-400 text-sm mb-6">
            Раскройте категорию в каталоге и нажмите «В смету» рядом с нужным товаром
          </p>
          <Button onClick={() => setShowEstimate(false)}>
            <Icon name="ShoppingCart" className="mr-2 h-4 w-4" />
            Перейти к каталогу
          </Button>
        </Card>
      ) : (
        <>
          {Object.entries(estimateByCategory).map(([cat, items]) => (
            <div key={cat} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full" />
                {cat}
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
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
                                updateItemQuantity(item.id, parseInt(e.target.value) || 1)
                              }
                              className="w-20 h-8 text-sm"
                            />
                          </div>
                          <Input
                            placeholder="Заметка (арт., цвет...)"
                            value={item.note}
                            onChange={(e) => updateItemNote(item.id, e.target.value)}
                            className="flex-1 h-8 text-sm"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500 flex-shrink-0"
                        onClick={() => removeFromEstimate(item.id)}
                      >
                        <Icon name="Trash2" className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          <Card className="p-5 bg-primary/5 border-primary/20 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Итого: {estimateItems.length} позиций</p>
                <p className="text-sm text-gray-500">
                  Общее количество единиц:{" "}
                  {estimateItems.reduce((s, i) => s + i.quantity, 0)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/calculator")}>
                  <Icon name="Calculator" className="mr-1.5 h-4 w-4" />
                  В калькулятор
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setEstimateItems([]);
                    saveEstimateItems([]);
                  }}
                >
                  <Icon name="Trash2" className="mr-1.5 h-4 w-4" />
                  Очистить
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
