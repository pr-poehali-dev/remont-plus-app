import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import funcUrls from "@/../backend/func2url.json";

interface FurnitureItem {
  id: string;
  name: string;
  price: [number, number];
  image: string;
  room: string;
}

interface InteriorStyle {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  priceMultiplier: number;
  accent: string;
}

interface ApartmentType {
  id: string;
  title: string;
  subtitle: string;
  area: string;
  rooms: string[];
}

const STYLES: InteriorStyle[] = [
  {
    id: "modern",
    title: "Современный",
    subtitle: "Чистые линии, функциональность",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/73854242-4b2d-48e2-be29-768825c6700a.jpg",
    priceMultiplier: 1.0,
    accent: "#f97316",
  },
  {
    id: "scandi",
    title: "Скандинавский",
    subtitle: "Светлое дерево, уют, хюгге",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/48a5de48-7594-40c6-af92-00f00c5fa60d.jpg",
    priceMultiplier: 1.1,
    accent: "#0ea5e9",
  },
  {
    id: "classic",
    title: "Классика",
    subtitle: "Элегантность, богатые текстуры",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/e21786e0-7646-40e2-9e70-a070520fce48.jpg",
    priceMultiplier: 1.35,
    accent: "#a855f7",
  },
  {
    id: "loft",
    title: "Лофт",
    subtitle: "Кирпич, металл, индустриальный шик",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/e3cfb18a-63ec-4dc2-9731-c91c0e701a88.jpg",
    priceMultiplier: 1.2,
    accent: "#ef4444",
  },
];

const APARTMENTS: ApartmentType[] = [
  { id: "studio", title: "Студия", subtitle: "до 35 м²", area: "20–35 м²", rooms: ["Жилая зона", "Кухня", "Прихожая"] },
  { id: "one", title: "1-комнатная", subtitle: "35–50 м²", area: "35–50 м²", rooms: ["Спальня", "Гостиная", "Кухня", "Прихожая"] },
  { id: "two", title: "2-комнатная", subtitle: "50–70 м²", area: "50–70 м²", rooms: ["Спальня", "Детская", "Гостиная", "Кухня", "Прихожая"] },
  { id: "three", title: "3-комнатная", subtitle: "70–100 м²", area: "70–100 м²", rooms: ["Спальня", "Детская", "Гостевая", "Гостиная", "Кухня", "Прихожая"] },
];

const IMG = {
  sofa: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/97f2955c-803c-41ba-94b7-15a955d6254d.jpg",
  wardrobe: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/a47f97ee-9ddb-4d56-b3b1-d2efc37ed3d2.jpg",
  kitchen: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/0a2e43a1-e6f8-4456-a0c8-64329f27893b.jpg",
  bed: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/271af53d-2252-452f-b882-08e0abc4756c.jpg",
  coffeeTable: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/64c1621c-75bd-434c-97e0-ee550304d96b.jpg",
  tvStand: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/5015f788-17e6-4289-b304-327998c48e25.jpg",
  diningTable: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/e67ea18a-8879-4d7d-9dbb-9664db9866ac.jpg",
  chairs: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/66d88e56-363b-4c5b-a2d7-0cbd41f3d368.jpg",
  hallway: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/39f5019f-3e8a-4e38-b4d0-4de95e305a09.jpg",
  cornerSofa: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/8439c393-0b8b-4682-9326-42ecf81f7904.jpg",
  wallUnit: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/44ac4b16-4045-42d0-bee1-21c9847fbab0.jpg",
  nightstands: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/997513dc-f398-414e-90f8-91f6bdc29b18.jpg",
  dresser: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/449ca11d-73eb-46c8-8c50-0c4537d5d08b.jpg",
  vanity: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/af079fa7-4a3a-45d4-bff4-bedf97b3b274.jpg",
  bunkBed: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/5ce223fa-149d-48ec-a32e-2c02d4123b0a.jpg",
  desk: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/808a7511-9d62-422a-8354-e5cb668e92ad.jpg",
  shelf: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/8cf7bbc3-b309-4a55-b788-5b486d266b67.jpg",
  armchair: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/feb8f8ea-2784-4358-83d5-7ae651203856.jpg",
  bench: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/433c9f50-89e5-43f5-8599-eac8d6d8a6d1.jpg",
};

const ALL_ITEMS: FurnitureItem[] = [
  { id: "sofa-bed", name: "Диван-кровать", price: [25000, 65000], image: IMG.sofa, room: "Жилая зона" },
  { id: "wardrobe-studio", name: "Шкаф-купе", price: [30000, 80000], image: IMG.wardrobe, room: "Жилая зона" },
  { id: "coffee-studio", name: "Журнальный столик", price: [5000, 15000], image: IMG.coffeeTable, room: "Жилая зона" },
  { id: "tv-studio", name: "Тумба под ТВ", price: [8000, 20000], image: IMG.tvStand, room: "Жилая зона" },

  { id: "bed-1", name: "Кровать двуспальная", price: [30000, 80000], image: IMG.bed, room: "Спальня" },
  { id: "wardrobe-bed-1", name: "Шкаф-купе", price: [35000, 90000], image: IMG.wardrobe, room: "Спальня" },
  { id: "nightstands-1", name: "Прикроватные тумбы (2 шт.)", price: [8000, 24000], image: IMG.nightstands, room: "Спальня" },
  { id: "dresser-1", name: "Комод", price: [12000, 30000], image: IMG.dresser, room: "Спальня" },
  { id: "vanity-1", name: "Туалетный столик", price: [12000, 35000], image: IMG.vanity, room: "Спальня" },

  { id: "corner-sofa", name: "Диван угловой", price: [35000, 100000], image: IMG.cornerSofa, room: "Гостиная" },
  { id: "wall-unit", name: "Стенка / горка", price: [25000, 75000], image: IMG.wallUnit, room: "Гостиная" },
  { id: "coffee-table", name: "Журнальный столик", price: [6000, 22000], image: IMG.coffeeTable, room: "Гостиная" },
  { id: "armchair", name: "Кресло", price: [12000, 35000], image: IMG.armchair, room: "Гостиная" },

  { id: "kitchen-set", name: "Кухонный гарнитур", price: [35000, 130000], image: IMG.kitchen, room: "Кухня" },
  { id: "dining-table", name: "Обеденный стол", price: [10000, 45000], image: IMG.diningTable, room: "Кухня" },
  { id: "chairs", name: "Стулья (4 шт.)", price: [12000, 48000], image: IMG.chairs, room: "Кухня" },

  { id: "kids-bed", name: "Кровать / двухъярусная", price: [25000, 75000], image: IMG.bunkBed, room: "Детская" },
  { id: "kids-wardrobe", name: "Шкаф", price: [25000, 70000], image: IMG.wardrobe, room: "Детская" },
  { id: "kids-desk", name: "Письменный стол", price: [10000, 35000], image: IMG.desk, room: "Детская" },
  { id: "kids-shelf", name: "Стеллаж / полки", price: [8000, 28000], image: IMG.shelf, room: "Детская" },

  { id: "guest-bed", name: "Кровать / диван-кровать", price: [25000, 70000], image: IMG.sofa, room: "Гостевая" },
  { id: "guest-wardrobe", name: "Шкаф", price: [25000, 65000], image: IMG.wardrobe, room: "Гостевая" },

  { id: "hallway-wardrobe", name: "Шкаф для прихожей", price: [20000, 80000], image: IMG.hallway, room: "Прихожая" },
  { id: "hallway-bench", name: "Банкетка + зеркало", price: [8000, 25000], image: IMG.bench, room: "Прихожая" },
];

const BUDGET_LABELS = ["Бюджет", "Комфорт", "Премиум"];

function formatPrice(value: number): string {
  return Math.round(value).toLocaleString("ru-RU") + " ₽";
}

function FurnitureLeadModal({
  isOpen,
  onClose,
  apartmentTitle,
  styleName,
  totalPrice,
  selectedItems,
}: {
  isOpen: boolean;
  onClose: () => void;
  apartmentTitle: string;
  styleName: string;
  totalPrice: string;
  selectedItems: string[];
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  const formatPhone = (value: string) => {
    const n = value.replace(/\D/g, "");
    if (n.length <= 1) return "+7 ";
    if (n.length <= 4) return `+7 (${n.slice(1)}`;
    if (n.length <= 7) return `+7 (${n.slice(1, 4)}) ${n.slice(4)}`;
    if (n.length <= 9) return `+7 (${n.slice(1, 4)}) ${n.slice(4, 7)}-${n.slice(7)}`;
    return `+7 (${n.slice(1, 4)}) ${n.slice(4, 7)}-${n.slice(7, 9)}-${n.slice(9, 11)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(funcUrls["furniture-lead"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone.replace(/\D/g, ""),
          apartment: apartmentTitle,
          style: styleName,
          totalPrice,
          items: selectedItems,
        }),
      });
    } catch (err) {
      console.error(err);
    }
    setSent(true);
  };

  const handleClose = () => {
    setSent(false);
    setName("");
    setPhone("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{sent ? "Заявка отправлена!" : "Заказать подбор мебели"}</DialogTitle>
          <DialogDescription>
            {sent
              ? "Мы свяжемся с вами в ближайшее время для уточнения деталей"
              : `${apartmentTitle} · ${styleName} · ${totalPrice}`}
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="Check" size={32} className="text-green-600" />
            </div>
            <p className="text-sm text-gray-500">Наш менеджер подберёт лучшие варианты под ваш бюджет и стиль</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Имя</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Как к вам обращаться?" required />
            </div>
            <div>
              <Label>Телефон</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="+7 (___) ___-__-__"
                required
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
              <p className="font-medium text-gray-700 mb-1">Выбрано {selectedItems.length} предметов</p>
              <p>{selectedItems.slice(0, 5).join(", ")}{selectedItems.length > 5 ? ` и ещё ${selectedItems.length - 5}` : ""}</p>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
            >
              Отправить заявку
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

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
      <section className="py-10">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-2">Шаг 1 из 2</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Выберите стиль интерьера</h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Стиль влияет на подбор мебели, материалы и итоговую стоимость комплекта
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
          {STYLES.map((s) => {
            const active = s.id === selectedStyle;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedStyle(s.id)}
                className="group relative rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  boxShadow: active ? `0 0 0 3px ${s.accent}` : "0 1px 3px rgba(0,0,0,.08)",
                }}
              >
                <div className="aspect-[4/5] relative">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {active && (
                    <div
                      className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: s.accent }}
                    >
                      <Icon name="Check" size={16} className="text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                    <p className="text-white font-bold text-sm">{s.title}</p>
                    <p className="text-white/70 text-xs mt-0.5">{s.subtitle}</p>
                    {s.priceMultiplier > 1 && (
                      <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white/90 backdrop-blur-sm">
                        +{Math.round((s.priceMultiplier - 1) * 100)}% к стоимости
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => setStep("config")}
            className="px-8 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          >
            Далее — подбор мебели
            <Icon name="ArrowRight" size={18} />
          </button>
        </div>
      </section>
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
        {/* Left: Config */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Соберите комплект мебели</h2>
            <p className="text-gray-500 text-sm">Включайте и выключайте предметы — итог пересчитается автоматически</p>
          </div>

          {/* Apartment type tabs */}
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

          {/* Budget slider */}
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

          {/* Toggle all */}
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

          {/* Room groups with furniture cards */}
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

        {/* Right: Sticky summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="lg:sticky lg:top-4 space-y-4">
            {/* Style preview */}
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

            {/* Price summary */}
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

              {/* Breakdown by room */}
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
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
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
