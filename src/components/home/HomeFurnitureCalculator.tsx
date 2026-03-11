import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FurnitureItem {
  name: string;
  price: [number, number];
}

interface ApartmentPackage {
  id: string;
  title: string;
  subtitle: string;
  area: string;
  image: string;
  totalMin: number;
  totalMax: number;
  rooms: {
    name: string;
    items: FurnitureItem[];
  }[];
}

const PACKAGES: ApartmentPackage[] = [
  {
    id: "studio",
    title: "Квартира-студия",
    subtitle: "до 35 м²",
    area: "20–35 м²",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/7abaf9b2-589e-4778-b76b-e0b3b92412ca.jpg",
    totalMin: 180000,
    totalMax: 380000,
    rooms: [
      {
        name: "Жилая зона",
        items: [
          { name: "Диван-кровать", price: [25000, 65000] },
          { name: "Шкаф-купе", price: [30000, 80000] },
          { name: "Журнальный столик", price: [5000, 15000] },
          { name: "Тумба под ТВ", price: [8000, 20000] },
        ],
      },
      {
        name: "Кухня",
        items: [
          { name: "Кухонный гарнитур", price: [35000, 90000] },
          { name: "Обеденный стол", price: [10000, 30000] },
          { name: "Стулья (2 шт.)", price: [6000, 18000] },
        ],
      },
      {
        name: "Прихожая",
        items: [
          { name: "Вешалка / тумба", price: [8000, 20000] },
          { name: "Зеркало", price: [3000, 12000] },
        ],
      },
    ],
  },
  {
    id: "one",
    title: "Однокомнатная",
    subtitle: "35–50 м²",
    area: "35–50 м²",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/81c52bde-19a2-4035-a738-a53d9a61a3c7.jpg",
    totalMin: 280000,
    totalMax: 560000,
    rooms: [
      {
        name: "Спальня",
        items: [
          { name: "Кровать двуспальная", price: [30000, 80000] },
          { name: "Шкаф-купе", price: [35000, 90000] },
          { name: "Прикроватные тумбы (2 шт.)", price: [8000, 24000] },
          { name: "Комод", price: [12000, 30000] },
        ],
      },
      {
        name: "Гостиная",
        items: [
          { name: "Диван угловой", price: [35000, 90000] },
          { name: "Стенка / горка", price: [25000, 65000] },
          { name: "Журнальный столик", price: [6000, 18000] },
        ],
      },
      {
        name: "Кухня",
        items: [
          { name: "Кухонный гарнитур", price: [40000, 110000] },
          { name: "Обеденный стол", price: [12000, 35000] },
          { name: "Стулья (4 шт.)", price: [12000, 36000] },
        ],
      },
      {
        name: "Прихожая",
        items: [
          { name: "Шкаф для прихожей", price: [20000, 55000] },
          { name: "Банкетка", price: [5000, 15000] },
        ],
      },
    ],
  },
  {
    id: "two",
    title: "Двухкомнатная",
    subtitle: "50–70 м²",
    area: "50–70 м²",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/20a97e69-bb48-4388-8f67-08083eb8a6f3.jpg",
    totalMin: 420000,
    totalMax: 850000,
    rooms: [
      {
        name: "Спальня",
        items: [
          { name: "Кровать двуспальная", price: [35000, 90000] },
          { name: "Шкаф-купе", price: [40000, 100000] },
          { name: "Прикроватные тумбы (2 шт.)", price: [10000, 28000] },
          { name: "Туалетный столик", price: [12000, 35000] },
        ],
      },
      {
        name: "Детская / 2-я спальня",
        items: [
          { name: "Кровать / двухъярусная", price: [25000, 70000] },
          { name: "Шкаф", price: [25000, 65000] },
          { name: "Письменный стол", price: [10000, 30000] },
          { name: "Стеллаж", price: [8000, 22000] },
        ],
      },
      {
        name: "Гостиная",
        items: [
          { name: "Диван угловой", price: [40000, 100000] },
          { name: "Стенка / горка", price: [30000, 75000] },
          { name: "Журнальный столик", price: [8000, 22000] },
          { name: "Кресло", price: [12000, 35000] },
        ],
      },
      {
        name: "Кухня",
        items: [
          { name: "Кухонный гарнитур", price: [50000, 130000] },
          { name: "Обеденный стол", price: [15000, 45000] },
          { name: "Стулья (4–6 шт.)", price: [16000, 48000] },
        ],
      },
      {
        name: "Прихожая",
        items: [
          { name: "Шкаф-купе в прихожую", price: [30000, 80000] },
          { name: "Банкетка + зеркало", price: [10000, 25000] },
        ],
      },
    ],
  },
  {
    id: "three",
    title: "Трёхкомнатная",
    subtitle: "70–100 м²",
    area: "70–100 м²",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/1166b33a-6018-4ea1-8793-754554f1a150.jpg",
    totalMin: 650000,
    totalMax: 1400000,
    rooms: [
      {
        name: "Спальня (мастер)",
        items: [
          { name: "Кровать двуспальная", price: [45000, 120000] },
          { name: "Шкаф-купе", price: [50000, 130000] },
          { name: "Прикроватные тумбы (2 шт.)", price: [14000, 36000] },
          { name: "Туалетный столик + зеркало", price: [18000, 50000] },
          { name: "Комод", price: [15000, 40000] },
        ],
      },
      {
        name: "Детская",
        items: [
          { name: "Кровать / двухъярусная", price: [28000, 75000] },
          { name: "Шкаф", price: [28000, 70000] },
          { name: "Письменный стол", price: [12000, 35000] },
          { name: "Стеллаж / полки", price: [10000, 28000] },
        ],
      },
      {
        name: "Гостевая спальня",
        items: [
          { name: "Кровать / диван-кровать", price: [25000, 70000] },
          { name: "Шкаф", price: [25000, 65000] },
        ],
      },
      {
        name: "Гостиная",
        items: [
          { name: "Диван угловой", price: [50000, 130000] },
          { name: "Кресла (2 шт.)", price: [24000, 70000] },
          { name: "Стенка / горка", price: [40000, 100000] },
          { name: "Журнальный столик", price: [10000, 28000] },
        ],
      },
      {
        name: "Кухня / столовая",
        items: [
          { name: "Кухонный гарнитур", price: [65000, 170000] },
          { name: "Обеденный стол", price: [20000, 60000] },
          { name: "Стулья (6 шт.)", price: [24000, 72000] },
        ],
      },
      {
        name: "Прихожая",
        items: [
          { name: "Шкаф-купе в прихожую", price: [40000, 100000] },
          { name: "Банкетка + зеркало", price: [14000, 35000] },
        ],
      },
    ],
  },
];

function formatPrice(value: number): string {
  return value.toLocaleString("ru-RU") + " ₽";
}

function FurnitureLeadModal({ isOpen, onClose, apartmentTitle }: { isOpen: boolean; onClose: () => void; apartmentTitle: string }) {
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
      await fetch("https://functions.poehali.dev/9f15d013-9fa0-4040-999f-157c863f46b6", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone.replace(/\D/g, ""),
          apartment: apartmentTitle,
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
      <DialogContent className="sm:max-w-[420px]">
        {!sent ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Подбор мебели
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Комплект для: <span className="font-semibold text-orange-500">{apartmentTitle}</span>
                <br />Оставьте контакты — менеджер свяжется и поможет с выбором
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <Label htmlFor="fur-name" className="text-sm font-medium text-gray-700">Ваше имя *</Label>
                <Input
                  id="fur-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="fur-phone" className="text-sm font-medium text-gray-700">Телефон *</Label>
                <Input
                  id="fur-phone"
                  type="tel"
                  value={phone || "+7 "}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  onFocus={() => { if (!phone) setPhone("+7 "); }}
                  placeholder="+7 (___) ___-__-__"
                  required
                  maxLength={18}
                  className="mt-1"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                <Icon name="Send" size={18} />
                Отправить заявку
              </button>
              <p className="text-xs text-gray-400 text-center">Нажимая кнопку, вы соглашаетесь на обработку персональных данных</p>
            </form>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Icon name="Check" size={28} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Заявка отправлена!</h3>
            <p className="text-gray-500 mb-6">Менеджер свяжется с вами в ближайшее время</p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
            >
              Закрыть
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function HomeFurnitureCalculator() {
  const [activeId, setActiveId] = useState<string>("studio");
  const [bookingOpen, setBookingOpen] = useState(false);

  const active = PACKAGES.find((p) => p.id === activeId)!;

  return (
    <section className="py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-500 mb-3">
          Комплекты мебели
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Мебель для вашей квартиры
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto text-base">
          Выберите тип квартиры — увидите список необходимой мебели и примерный бюджет
        </p>
      </div>

      {/* Табы */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {PACKAGES.map((pkg) => (
          <button
            key={pkg.id}
            onClick={() => setActiveId(pkg.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${
              activeId === pkg.id
                ? "bg-orange-500 text-white border-orange-500 shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
            }`}
          >
            {pkg.title}
          </button>
        ))}
      </div>

      {/* Карточка */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="grid md:grid-cols-2">
          {/* Фото */}
          <div className="relative h-72 md:h-auto">
            <img
              src={active.image}
              alt={active.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <div className="text-sm font-medium opacity-80 mb-1">{active.area}</div>
              <div className="text-2xl font-bold">{active.title}</div>
              <div className="mt-3 inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                <Icon name="Wallet" size={16} />
                {formatPrice(active.totalMin)} — {formatPrice(active.totalMax)}
              </div>
            </div>
          </div>

          {/* Список мебели */}
          <div className="p-6 overflow-y-auto max-h-[520px]">
            <div className="flex items-center gap-2 mb-5 text-gray-800">
              <Icon name="LayoutList" size={18} className="text-orange-500" />
              <span className="font-semibold text-base">Что входит в комплект</span>
            </div>

            <div className="space-y-5">
              {active.rooms.map((room) => (
                <div key={room.name}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {room.name}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {room.items.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm text-gray-700">{item.name}</span>
                        <span className="text-sm font-medium text-gray-900 whitespace-nowrap ml-4">
                          {formatPrice(item.price[0])} – {formatPrice(item.price[1])}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Итого бюджет</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(active.totalMin)} — {formatPrice(active.totalMax)}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Icon name="Info" size={13} />
                цены ориентировочные
              </div>
            </div>

            <button
              onClick={() => setBookingOpen(true)}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <Icon name="ShoppingCart" size={18} />
              Заказать подбор мебели
            </button>
          </div>
        </div>
      </div>

      <FurnitureLeadModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} apartmentTitle={active.title} />
    </section>
  );
}