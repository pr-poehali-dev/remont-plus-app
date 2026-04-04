import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import FurnitureStylePicker from "./FurnitureStylePicker";
import FurnitureLeadModal from "./FurnitureLeadModal";
import CalcEmailCapture from "@/components/calculator/CalcEmailCapture";
import {
  STYLES,
  APARTMENTS,
  ALL_ITEMS,
  BUDGET_LABELS,
  formatPrice,
  type FurnitureItem,
} from "./furnitureData";

export default function HomeFurnitureCalculator() {
  const [step, setStep] = useState<"style" | "config">("style");
  const [selectedStyle, setSelectedStyle] = useState<string>("modern");
  const [selectedApartment, setSelectedApartment] = useState<string>("one");
  const [budgetLevel, setBudgetLevel] = useState<number[]>([50]);
  const [excludedItems, setExcludedItems] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);

  const style = STYLES.find((s) => s.id === selectedStyle)!;
  const apartment = APARTMENTS.find((a) => a.id === selectedApartment)!;

  const availableItems = useMemo(
    () => ALL_ITEMS.filter((item) => apartment.rooms.includes(item.room)),
    [apartment]
  );

  const roomGroups = useMemo(() => {
    const groups: Record<string, FurnitureItem[]> = {};
    for (const item of availableItems) {
      if (!groups[item.room]) groups[item.room] = [];
      groups[item.room].push(item);
    }
    return Object.entries(groups);
  }, [availableItems]);

  const budgetPercent = budgetLevel[0] / 100;

  const getItemPrice = (item: FurnitureItem) => {
    const [min, max] = item.price;
    const base = min + (max - min) * budgetPercent;
    return base * style.priceMultiplier;
  };

  const selectedItems = availableItems.filter((i) => !excludedItems.has(i.id));
  const totalPrice = selectedItems.reduce((sum, item) => sum + getItemPrice(item), 0);

  const toggleItem = (id: string) => {
    setExcludedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setExcludedItems(new Set());
  const deselectAll = () => setExcludedItems(new Set(availableItems.map((i) => i.id)));

  if (step === "style") {
    return (
      <FurnitureStylePicker
        selectedStyle={selectedStyle}
        onSelectStyle={setSelectedStyle}
        onNext={() => setStep("config")}
      />
    );
  }

  return (
    <section className="py-10">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setStep("style")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <Icon name="ArrowLeft" size={16} />
          Назад к стилю
        </button>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: style.accent + "18", color: style.accent }}>
          <span className="w-3 h-3 rounded-full" style={{ background: style.accent }} />
          {style.title}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Соберите комплект мебели</h2>
            <p className="text-gray-500 text-sm">Включайте и выключайте предметы — итог пересчитается автоматически</p>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
            {APARTMENTS.map((a) => {
              const active = a.id === selectedApartment;
              return (
                <button
                  key={a.id}
                  onClick={() => { setSelectedApartment(a.id); setExcludedItems(new Set()); }}
                  className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                  style={{
                    background: active ? style.accent : "white",
                    color: active ? "white" : "#374151",
                    boxShadow: active ? `0 4px 12px ${style.accent}40` : "0 1px 3px rgba(0,0,0,.06)",
                    border: active ? "none" : "1px solid #e5e7eb",
                  }}
                >
                  {a.title}
                  <span className="ml-1 opacity-70">{a.subtitle}</span>
                </button>
              );
            })}
          </div>

          <Card className="p-4 mb-6 border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="SlidersHorizontal" size={15} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">Уровень отделки</span>
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: style.accent + "15",
                  color: style.accent,
                }}
              >
                {budgetPercent < 0.33 ? BUDGET_LABELS[0] : budgetPercent < 0.66 ? BUDGET_LABELS[1] : BUDGET_LABELS[2]}
              </span>
            </div>
            <Slider
              value={budgetLevel}
              onValueChange={setBudgetLevel}
              min={0}
              max={100}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-wider">
              {BUDGET_LABELS.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </Card>

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-400">
              Выбрано {selectedItems.length} из {availableItems.length} предметов
            </span>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs text-orange-500 hover:text-orange-700 transition-colors">
                Выбрать все
              </button>
              <span className="text-gray-300">|</span>
              <button onClick={deselectAll} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Сбросить
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {roomGroups.map(([roomName, items]) => (
              <div key={roomName}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon
                    name={
                      roomName === "Кухня" ? "CookingPot" :
                      roomName === "Спальня" ? "Bed" :
                      roomName === "Гостиная" || roomName === "Жилая зона" ? "Tv" :
                      roomName === "Детская" ? "Baby" :
                      roomName === "Прихожая" ? "DoorOpen" :
                      "Home"
                    }
                    fallback="Home"
                    size={14}
                    className="text-gray-400"
                  />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{roomName}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {items.map((item) => {
                    const included = !excludedItems.has(item.id);
                    const price = getItemPrice(item);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className="group relative rounded-xl overflow-hidden transition-all duration-200 text-left"
                        style={{
                          boxShadow: included
                            ? `0 0 0 2px ${style.accent}, 0 4px 12px ${style.accent}20`
                            : "0 1px 3px rgba(0,0,0,.06)",
                          opacity: included ? 1 : 0.55,
                        }}
                      >
                        <div className="aspect-square relative bg-gray-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div
                            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                            style={{
                              background: included ? style.accent : "rgba(255,255,255,.8)",
                              border: included ? "none" : "1px solid #d1d5db",
                            }}
                          >
                            {included && <Icon name="Check" size={14} className="text-white" />}
                          </div>
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-medium text-gray-800 leading-tight line-clamp-2">{item.name}</p>
                          <p className="text-xs mt-1" style={{ color: included ? style.accent : "#9ca3af", fontWeight: 600 }}>
                            {formatPrice(price)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-80 flex-shrink-0">
          <div className="lg:sticky lg:top-4 space-y-4">
            <Card className="overflow-hidden border-gray-200">
              <div className="aspect-video relative">
                <img src={style.image} alt={style.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-xs opacity-80">{apartment.title} · {apartment.area}</p>
                  <p className="text-white font-bold text-sm">Стиль «{style.title}»</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Wallet" size={16} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">Итого</span>
              </div>

              <div className="text-3xl font-bold mb-1" style={{ color: style.accent }}>
                {formatPrice(totalPrice)}
              </div>
              <p className="text-xs text-gray-400 mb-4">
                {selectedItems.length} предметов · {BUDGET_LABELS[budgetPercent < 0.33 ? 0 : budgetPercent < 0.66 ? 1 : 2]}
              </p>

              <div className="space-y-2 mb-5">
                {roomGroups.map(([roomName, items]) => {
                  const roomItems = items.filter((i) => !excludedItems.has(i.id));
                  if (roomItems.length === 0) return null;
                  const roomTotal = roomItems.reduce((s, i) => s + getItemPrice(i), 0);
                  return (
                    <div key={roomName} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{roomName}</span>
                      <span className="font-medium text-gray-700">{formatPrice(roomTotal)}</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setModalOpen(true)}
                disabled={selectedItems.length === 0}
                className="w-full py-3 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(to right, ${style.accent}, ${style.accent}dd)`,
                }}
              >
                Заказать подбор мебели
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                цены ориентировочные · менеджер уточнит детали
              </p>
            </Card>
            <CalcEmailCapture calcType="Мебель" totalSum={totalPrice} />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,.1)] px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <p className="text-xs text-gray-400">{selectedItems.length} предметов</p>
            <p className="text-lg font-bold" style={{ color: style.accent }}>{formatPrice(totalPrice)}</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            disabled={selectedItems.length === 0}
            className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-40"
            style={{ background: style.accent }}
          >
            Заказать подбор
          </button>
        </div>
      </div>

      <FurnitureLeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        apartmentTitle={apartment.title}
        styleName={style.title}
        totalPrice={formatPrice(totalPrice)}
        selectedItems={selectedItems.map((i) => i.name)}
      />
    </section>
  );
}