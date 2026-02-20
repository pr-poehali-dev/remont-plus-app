import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MasterQuestionnaire from "@/components/master/MasterQuestionnaire";

const AUTH_URL = "https://functions.poehali.dev/2642096f-c763-42ef-8dc1-67e3acce37b3";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  user_type: string;
}

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

interface Master {
  id: number;
  full_name: string;
  location: string;
  experience_years: number;
  specializations: string[];
  business_status: string;
  has_tools: boolean;
  verified: boolean;
  rating: number;
  reviews: number;
  guarantee_period: string;
  guarantee_description?: string;
  payment_methods: string[];
  certificates: string[];
  portfolio_links: string[];
  phone?: string;
  email?: string;
  telegram?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  description?: string;
}

function MasterCard({ master }: { master: Master }) {
  const [expanded, setExpanded] = useState(false);
  const initials = master.full_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{master.full_name}</span>
            {master.verified && (
              <Icon name="BadgeCheck" size={16} className="text-blue-500" />
            )}
            {master.business_status && (
              <Badge variant="secondary" className="text-xs">
                {BUSINESS_LABELS[master.business_status] || master.business_status}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
            {master.rating > 0 && (
              <span className="flex items-center gap-1">
                <Icon name="Star" size={14} className="text-yellow-400 fill-yellow-400" />
                {master.rating.toFixed(1)} ({master.reviews} отзывов)
              </span>
            )}
            {master.experience_years > 0 && (
              <span className="flex items-center gap-1">
                <Icon name="Briefcase" size={14} />
                {master.experience_years} лет
              </span>
            )}
            {master.location && (
              <span className="flex items-center gap-1">
                <Icon name="MapPin" size={14} />
                {master.location}
              </span>
            )}
          </div>
          {master.guarantee_period && master.guarantee_period !== "none" && (
            <div className="mt-2">
              <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                Гарантия: {GUARANTEE_LABELS[master.guarantee_period]}
              </Badge>
            </div>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {master.specializations.map((s) => (
              <Badge key={s} variant="outline" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
          {master.description && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{master.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 flex-wrap">
        {master.phone && (
          <a href={`tel:${master.phone}`}>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
              <Icon name="Phone" size={13} className="mr-1" /> Позвонить
            </Button>
          </a>
        )}
        {master.telegram && (
          <a href={`https://t.me/${master.telegram.replace("@", "")}`} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="text-xs">
              <Icon name="Send" size={13} className="mr-1" /> Telegram
            </Button>
          </a>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-auto text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
        >
          {expanded ? "Свернуть" : "Подробнее"}
          <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size={14} />
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Контакты</p>
            <div className="space-y-1 text-sm text-gray-600">
              {master.phone && (
                <a href={`tel:${master.phone}`} className="flex items-center gap-2 hover:text-orange-500">
                  <Icon name="Phone" size={14} /> {master.phone}
                </a>
              )}
              {master.email && (
                <a href={`mailto:${master.email}`} className="flex items-center gap-2 hover:text-orange-500">
                  <Icon name="Mail" size={14} /> {master.email}
                </a>
              )}
              {master.telegram && (
                <a href={`https://t.me/${master.telegram.replace("@", "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-orange-500">
                  <Icon name="Send" size={14} /> {master.telegram}
                </a>
              )}
              {master.whatsapp && (
                <a href={`https://wa.me/${master.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-orange-500">
                  <Icon name="MessageCircle" size={14} /> {master.whatsapp}
                </a>
              )}
              {master.instagram && (
                <span className="flex items-center gap-2">
                  <Icon name="Instagram" size={14} /> {master.instagram}
                </span>
              )}
              {master.website && (
                <a href={master.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-orange-500">
                  <Icon name="Globe" size={14} /> {master.website}
                </a>
              )}
            </div>
          </div>
          {master.guarantee_description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Условия гарантии</p>
              <p className="text-sm text-gray-600">{master.guarantee_description}</p>
            </div>
          )}
          {master.certificates && master.certificates.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Сертификаты</p>
              <ul className="space-y-1">
                {master.certificates.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon name="Award" size={14} className="text-orange-400" /> {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {master.portfolio_links && master.portfolio_links.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Портфолио</p>
              <ul className="space-y-1">
                {master.portfolio_links.map((link) => (
                  <li key={link}>
                    <a href={link} target="_blank" rel="noreferrer" className="text-sm text-orange-500 hover:underline flex items-center gap-1">
                      <Icon name="ExternalLink" size={13} /> {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Masters() {
  const navigate = useNavigate();
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("rating");
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [completed, setCompleted] = useState(false);

  const stored = localStorage.getItem("avangard_user");
  const user: User | null = stored ? JSON.parse(stored) : null;

  useEffect(() => {
    fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_masters_list" }),
    })
      .then((r) => r.json())
      .then((data) => setMasters(data.masters || []))
      .finally(() => setLoading(false));
  }, [completed]);

  const handleBecomeMaster = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.user_type !== "contractor") {
      navigate("/dashboard");
      return;
    }
    setShowQuestionnaire(true);
  };

  const filtered = masters
    .filter((m) => {
      const q = search.toLowerCase();
      return (
        m.full_name.toLowerCase().includes(q) ||
        (m.specializations || []).some((s) => s.toLowerCase().includes(q)) ||
        (m.location || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "experience") return b.experience_years - a.experience_years;
      if (sort === "reviews") return b.reviews - a.reviews;
      return 0;
    });

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="CheckCircle" size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Анкета заполнена!</h2>
          <p className="text-gray-500 mb-6">
            Ваш профиль мастера сохранён. Теперь вы будете появляться в каталоге.
          </p>
          <Button
            onClick={() => { setCompleted(false); setShowQuestionnaire(false); }}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Вернуться к каталогу
          </Button>
        </div>
      </div>
    );
  }

  if (showQuestionnaire && user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <button
              onClick={() => setShowQuestionnaire(false)}
              className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm"
            >
              <Icon name="ArrowLeft" size={16} /> Назад к каталогу
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Анкета мастера</h1>
            <p className="text-gray-500 mt-1">Заполните данные, чтобы начать получать заказы</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <MasterQuestionnaire
            userId={user.id}
            userName={user.name}
            userPhone={user.phone}
            userEmail={user.email}
            onComplete={() => setCompleted(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm"
          >
            <Icon name="ArrowLeft" size={16} /> Назад
          </button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Мастера</h1>
              <p className="text-gray-500 mt-1">Проверенные специалисты по ремонту</p>
            </div>
            <Button
              onClick={handleBecomeMaster}
              className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
            >
              <Icon name="UserPlus" size={16} className="mr-2" />
              Стать мастером
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Поиск по имени, специализации, городу..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">По рейтингу</SelectItem>
              <SelectItem value="experience">По опыту</SelectItem>
              <SelectItem value="reviews">По отзывам</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Icon name="Loader2" size={32} className="animate-spin mr-3" />
            Загружаем мастеров...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Icon name="UserX" size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">
              {masters.length === 0 ? "Мастера ещё не зарегистрированы" : "Мастера не найдены"}
            </p>
            {masters.length === 0 && (
              <p className="text-sm mt-1">Станьте первым мастером в каталоге!</p>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">Найдено: {filtered.length}</p>
            <div className="space-y-4">
              {filtered.map((master) => (
                <MasterCard key={master.id} master={master} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
