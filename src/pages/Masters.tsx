import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";

const GUARANTEE_LABELS: Record<string, string> = {
  none: "Без гарантии",
  "3m": "3 месяца",
  "6m": "6 месяцев",
  "1y": "1 год",
  "2y": "2 года",
  "3y": "3 года",
};

const BUSINESS_LABELS: Record<string, string> = {
  self_employed: "Самозанятый",
  ip: "ИП",
  ooo: "ООО",
  individual: "Физлицо",
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Наличные",
  card: "Карта",
  transfer: "Перевод",
  invoice: "По счёту",
};

interface Master {
  id: number;
  full_name: string;
  location: string;
  experience_years: number | null;
  specializations: string[];
  business_status: string;
  description: string;
  guarantee_period: string;
  guarantee_description: string;
  payment_methods: string[];
  payment_schedule: string;
  certificates: string[];
  portfolio_links: string[];
  phone: string;
  email: string;
  telegram: string;
  whatsapp: string;
  instagram: string;
  website: string;
  has_tools: boolean;
  work_style: string;
  verified: boolean;
  rating: number;
  reviews: number;
}

const MOCK_MASTERS: Master[] = [
  {
    id: 1,
    full_name: "Сергей Иванов",
    location: "Москва",
    experience_years: 12,
    specializations: ["Штукатурка", "Покраска", "Гипсокартон", "Поклейка обоев"],
    business_status: "self_employed",
    description: "Профессиональный отделочник с 12-летним опытом. Работаю аккуратно, в срок. Использую только качественные материалы. Консультирую по выбору материалов бесплатно.",
    guarantee_period: "1y",
    guarantee_description: "Гарантия на все виды отделочных работ. При обнаружении дефектов — устраняю за свой счёт.",
    payment_methods: ["cash", "card", "transfer"],
    payment_schedule: "split",
    certificates: ["Сертификат Knauf", "Курс по декоративной штукатурке"],
    portfolio_links: ["https://vk.com/sergeivanov_master"],
    phone: "+7 (916) 123-45-67",
    email: "sergei@master.ru",
    telegram: "sergeivanov",
    whatsapp: "+79161234567",
    instagram: "sergei_master",
    website: "",
    has_tools: true,
    work_style: "solo",
    verified: true,
    rating: 4.9,
    reviews: 87,
  },
  {
    id: 2,
    full_name: "Команда «РемПроф»",
    location: "Москва и МО",
    experience_years: 8,
    specializations: ["Укладка плитки", "Стяжка пола", "Ламинат/паркет", "Сантехника", "Электрика"],
    business_status: "ip",
    description: "Команда из 4 мастеров. Берёмся за полный цикл ремонта — от черновых работ до чистовой отделки. Работаем по договору, предоставляем смету.",
    guarantee_period: "2y",
    guarantee_description: "2 года на все виды работ. Договор с гарантийными обязательствами.",
    payment_methods: ["card", "transfer", "invoice"],
    payment_schedule: "staged",
    certificates: ["ИП Петров А.В.", "Допуск СРО"],
    portfolio_links: ["https://remprof.ru", "https://instagram.com/remprof_msk"],
    phone: "+7 (499) 234-56-78",
    email: "info@remprof.ru",
    telegram: "remprof_msk",
    whatsapp: "+74992345678",
    instagram: "remprof_msk",
    website: "https://remprof.ru",
    has_tools: true,
    work_style: "team",
    verified: true,
    rating: 4.8,
    reviews: 134,
  },
  {
    id: 3,
    full_name: "Алексей Чернов",
    location: "Москва",
    experience_years: 5,
    specializations: ["Натяжные потолки", "Демонтаж", "Покраска"],
    business_status: "individual",
    description: "Специализируюсь на натяжных потолках и сопутствующих работах. Быстро, качественно. Замер бесплатно.",
    guarantee_period: "6m",
    guarantee_description: "6 месяцев на монтаж натяжных потолков.",
    payment_methods: ["cash", "transfer"],
    payment_schedule: "prepay",
    certificates: [],
    portfolio_links: [],
    phone: "+7 (926) 345-67-89",
    email: "",
    telegram: "alexey_ceiling",
    whatsapp: "+79263456789",
    instagram: "",
    website: "",
    has_tools: true,
    work_style: "solo",
    verified: false,
    rating: 4.6,
    reviews: 32,
  },
];

function MasterCard({ master }: { master: Master }) {
  const [expanded, setExpanded] = useState(false);
  const initials = master.full_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex gap-5">
          {/* Аватар */}
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
            {initials}
          </div>

          {/* Основная информация */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-gray-900">{master.full_name}</h3>
                  {master.verified && (
                    <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      <Icon name="ShieldCheck" size={12} /> Проверен
                    </span>
                  )}
                  {master.business_status && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {BUSINESS_LABELS[master.business_status] ?? master.business_status}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Icon name="Star" size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-700">{master.rating}</span>
                    <span>({master.reviews} отз.)</span>
                  </span>
                  {master.experience_years && (
                    <span className="flex items-center gap-1">
                      <Icon name="Briefcase" size={13} />
                      Опыт {master.experience_years} {master.experience_years === 1 ? "год" : master.experience_years < 5 ? "года" : "лет"}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Icon name="MapPin" size={13} />
                    {master.location}
                  </span>
                </div>
              </div>

              {/* Гарантия */}
              {master.guarantee_period && master.guarantee_period !== "none" && (
                <div className="flex-shrink-0 text-center bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
                  <Icon name="ShieldCheck" size={16} className="text-orange-500 mx-auto mb-0.5" />
                  <p className="text-xs font-semibold text-orange-700">{GUARANTEE_LABELS[master.guarantee_period]}</p>
                  <p className="text-xs text-orange-500">гарантия</p>
                </div>
              )}
            </div>

            {/* Специализации */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {master.specializations.map((spec) => (
                <Badge key={spec} variant="secondary" className="text-xs">{spec}</Badge>
              ))}
            </div>

            {/* Описание */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{master.description}</p>

            {/* Нижняя строка */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                {master.has_tools && (
                  <span className="flex items-center gap-1"><Icon name="Wrench" size={12} /> Свой инструмент</span>
                )}
                {master.payment_methods.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Icon name="CreditCard" size={12} />
                    {master.payment_methods.map((m) => PAYMENT_LABELS[m]).join(", ")}
                  </span>
                )}
              </div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
              >
                {expanded ? "Скрыть" : "Подробнее"}
                <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Развёрнутый блок */}
        {expanded && (
          <div className="mt-5 pt-5 border-t border-gray-100 space-y-4">
            {/* Контакты */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Icon name="Phone" size={14} className="text-orange-500" /> Контакты
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {master.phone && (
                  <a href={`tel:${master.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-600 transition-colors">
                    <Icon name="Phone" size={14} className="text-gray-400" /> {master.phone}
                  </a>
                )}
                {master.email && (
                  <a href={`mailto:${master.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-600 transition-colors">
                    <Icon name="Mail" size={14} className="text-gray-400" /> {master.email}
                  </a>
                )}
                {master.telegram && (
                  <a href={`https://t.me/${master.telegram}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors">
                    <Icon name="Send" size={14} /> @{master.telegram}
                  </a>
                )}
                {master.whatsapp && (
                  <a href={`https://wa.me/${master.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors">
                    <Icon name="MessageCircle" size={14} /> WhatsApp
                  </a>
                )}
                {master.instagram && (
                  <a href={`https://instagram.com/${master.instagram}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 transition-colors">
                    <Icon name="Camera" size={14} /> @{master.instagram}
                  </a>
                )}
                {master.website && (
                  <a href={master.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-600 transition-colors">
                    <Icon name="Globe" size={14} className="text-gray-400" /> Сайт
                  </a>
                )}
              </div>
            </div>

            {/* Гарантии */}
            {master.guarantee_description && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Icon name="ShieldCheck" size={14} className="text-orange-500" /> Условия гарантии
                </h4>
                <p className="text-sm text-gray-600">{master.guarantee_description}</p>
              </div>
            )}

            {/* Портфолио */}
            {master.portfolio_links.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Icon name="Award" size={14} className="text-orange-500" /> Портфолио
                </h4>
                <div className="flex flex-wrap gap-2">
                  {master.portfolio_links.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
                    >
                      <Icon name="Link" size={13} /> Смотреть работы
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Сертификаты */}
            {master.certificates.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Icon name="FileText" size={14} className="text-orange-500" /> Сертификаты
                </h4>
                <div className="flex flex-wrap gap-2">
                  {master.certificates.map((cert, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                      <Icon name="CheckCircle" size={12} className="text-green-500" /> {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Кнопки действий */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          {master.phone && (
            <a href={`tel:${master.phone}`} className="flex-1">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 gap-2">
                <Icon name="Phone" size={16} /> Позвонить
              </Button>
            </a>
          )}
          {master.telegram && (
            <a href={`https://t.me/${master.telegram}`} target="_blank" rel="noreferrer" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <Icon name="Send" size={16} /> Telegram
              </Button>
            </a>
          )}
          <Button variant="outline" size="icon">
            <Icon name="Heart" size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function Masters() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  const filtered = MOCK_MASTERS.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(q) ||
      m.specializations.some((s) => s.toLowerCase().includes(q)) ||
      m.location.toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "experience") return (b.experience_years ?? 0) - (a.experience_years ?? 0);
    if (sortBy === "reviews") return b.reviews - a.reviews;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Мастера</h1>
                <p className="text-sm text-gray-500">Проверенные специалисты по ремонту</p>
              </div>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => navigate("/register")}>
              <Icon name="UserPlus" size={16} className="mr-2" />
              Стать мастером
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Поиск и сортировка */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Поиск по имени, специализации, городу..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">По рейтингу</SelectItem>
              <SelectItem value="experience">По опыту</SelectItem>
              <SelectItem value="reviews">По отзывам</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Счётчик */}
        <p className="text-sm text-gray-500 mb-4">Найдено: {filtered.length} мастеров</p>

        {/* Список карточек */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Icon name="SearchX" size={48} className="mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">Мастера не найдены</p>
              <p className="text-sm">Попробуйте изменить запрос</p>
            </div>
          ) : (
            filtered.map((master) => <MasterCard key={master.id} master={master} />)
          )}
        </div>
      </div>
    </div>
  );
}
