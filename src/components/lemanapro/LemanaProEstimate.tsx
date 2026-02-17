import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { type EstimateSavedItem, saveEstimateItems, roundUpToPackaging } from "@/lib/lemanapro-data";
import { exportLemanaProPdf } from "@/lib/export-pdf";
import MaterialCalculator from "./MaterialCalculator";

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

  const update = (updated: EstimateSavedItem[]) => {
    setEstimateItems(updated);
    saveEstimateItems(updated);
  };

  const removeFromEstimate = (id: string) => {
    update(estimateItems.filter((i) => i.id !== id));
  };

  const updateField = (id: string, field: Partial<EstimateSavedItem>) => {
    update(estimateItems.map((i) => (i.id === id ? { ...i, ...field } : i)));
  };

  const estimateByCategory = estimateItems.reduce<Record<string, EstimateSavedItem[]>>(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {}
  );

  const totalSum = estimateItems.reduce((s, i) => {
    const rounded = roundUpToPackaging(i.quantity, i.packaging || 1);
    return s + (i.price || 0) * rounded;
  }, 0);
  const hasPrices = estimateItems.some((i) => i.price > 0);

  const formatPrice = (n: number) => n.toLocaleString("ru-RU");

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
        <div className="space-y-6">
          <Card className="p-12 text-center">
            <Icon name="ClipboardList" className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">Смета пуста</p>
            <p className="text-gray-400 text-sm mb-6">
              Рассчитайте материалы по площади или добавьте товары из каталога вручную
            </p>
            <Button onClick={() => setShowEstimate(false)}>
              <Icon name="ShoppingCart" className="mr-2 h-4 w-4" />
              Перейти к каталогу
            </Button>
          </Card>
          <Card className="p-4 bg-amber-50/60 border-amber-200">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="Lightbulb" className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-sm space-y-1">
                <p className="font-medium text-amber-900">Как пользоваться калькулятором</p>
                <ol className="text-amber-800 space-y-0.5 list-decimal list-inside text-xs leading-relaxed">
                  <li>Выберите шаблон планировки или задайте размеры комнат вручную</li>
                  <li>Отметьте галочками нужные материалы (пол, стены, потолок)</li>
                  <li>Нажмите «Рассчитать» — позиции добавятся в смету с учётом упаковки</li>
                  <li>Укажите цены вручную или посмотрите на сайте ЛеманаПро</li>
                </ol>
              </div>
            </div>
          </Card>
          <MaterialCalculator
            estimateItems={estimateItems}
            setEstimateItems={setEstimateItems}
          />
        </div>
      ) : (
        <>
          {Object.entries(estimateByCategory).map(([cat, items]) => {
            const catTotal = items.reduce((s, i) => {
              const rounded = roundUpToPackaging(i.quantity, i.packaging || 1);
              return s + (i.price || 0) * rounded;
            }, 0);
            return (
              <div key={cat} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full" />
                    {cat}
                  </h3>
                  {catTotal > 0 && (
                    <span className="text-sm font-medium text-gray-600">
                      {formatPrice(catTotal)} ₽
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {items.map((item) => {
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
                                placeholder="Заметка (арт., цвет...)"
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
                            onClick={() => removeFromEstimate(item.id)}
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
            estimateItems={estimateItems}
            setEstimateItems={setEstimateItems}
          />

          <Card className="p-5 bg-primary/5 border-primary/20 mt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-semibold">
                  Итого: {estimateItems.length} позиций
                </p>
                {hasPrices ? (
                  <p className="text-2xl font-bold text-primary mt-1">
                    {formatPrice(totalSum)} ₽
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Укажите цены, чтобы увидеть итоговую сумму
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={() => exportLemanaProPdf(estimateItems)}>
                  <Icon name="Download" className="mr-1.5 h-4 w-4" />
                  PDF
                </Button>
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