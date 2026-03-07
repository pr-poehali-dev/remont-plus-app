import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const PARSER_API = "https://functions.poehali.dev/40dd0e7a-86a9-4379-aae6-93556483a8bd";
const HEADERS = { "Content-Type": "application/json", "X-Admin-Token": "admin2025" };
const PAGE_SIZE = 50;

interface Company {
  id: number;
  city: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  director_name: string;
  inn: string;
}

interface CityStats {
  city: string;
  count: number;
  enriched: number;
  with_email: number;
  with_phone: number;
  with_website: number;
}

interface StatsData {
  total: number;
  enriched: number;
  with_email: number;
  with_phone: number;
  with_website: number;
  by_city: CityStats[];
}

export default function YukassaCabinet() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  const [stats, setStats] = useState<StatsData | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [selectedCity, setSelectedCity] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("avangard_user");
    if (!raw) { navigate("/login"); return; }
    try {
      const u = JSON.parse(raw);
      if (u.role !== "yukassa_staff" && u.role !== "admin") {
        navigate("/");
        return;
      }
      setReady(true);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!ready) return;
    loadStats();
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    loadCompanies(selectedCity, 0, search);
    setOffset(0);
  }, [selectedCity, ready]);

  const loadStats = async () => {
    const r = await fetch(PARSER_API, {
      method: "POST", headers: HEADERS,
      body: JSON.stringify({ action: "get_stats" }),
    });
    const d = await r.json();
    setStats(d);
  };

  const loadCompanies = async (city: string, off: number, q: string) => {
    setLoading(true);
    const r = await fetch(PARSER_API, {
      method: "POST", headers: HEADERS,
      body: JSON.stringify({ action: "get_companies", city, limit: PAGE_SIZE, offset: off, search: q }),
    });
    const d = await r.json();
    setCompanies(d.companies || []);
    setTotal(d.total || 0);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCompanies(selectedCity, 0, search);
    setOffset(0);
  };

  const handlePage = (dir: 1 | -1) => {
    const newOff = offset + dir * PAGE_SIZE;
    setOffset(newOff);
    loadCompanies(selectedCity, newOff, search);
  };

  const handleLogout = () => {
    localStorage.removeItem("avangard_user");
    localStorage.removeItem("avangard_token");
    navigate("/login");
  };

  if (!ready) return null;

  const cities = stats?.by_city?.map(c => c.city) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Icon name="Shield" size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Кабинет ЮКасса</h1>
              <p className="text-xs text-gray-500">Проверка надёжности — только просмотр</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 gap-2">
            <Icon name="LogOut" size={14} />
            Выйти
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Статистика */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Всего компаний", value: stats.total, icon: "Building2", color: "text-gray-700" },
              { label: "Обогащено", value: stats.enriched, icon: "CheckCircle", color: "text-green-600" },
              { label: "С email", value: stats.with_email, icon: "Mail", color: "text-blue-600" },
              { label: "С телефоном", value: stats.with_phone, icon: "Phone", color: "text-orange-600" },
              { label: "С сайтом", value: stats.with_website, icon: "Globe", color: "text-violet-600" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className={`flex items-center gap-2 mb-1 ${s.color}`}>
                  <Icon name={s.icon} size={14} />
                  <span className="text-xs text-gray-500">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value.toLocaleString("ru")}</p>
              </div>
            ))}
          </div>
        )}

        {/* Фильтры */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
          <div className="flex gap-2 flex-wrap flex-1">
            <Button
              variant={selectedCity === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCity("")}
              className="rounded-full"
            >
              Все города
            </Button>
            {cities.map(city => (
              <Button
                key={city}
                variant={selectedCity === city ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCity(city)}
                className="rounded-full"
              >
                {city}
              </Button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 min-w-[240px]">
            <Input
              placeholder="Поиск по названию, ИНН..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 text-sm"
            />
            <Button type="submit" size="sm" variant="outline">
              <Icon name="Search" size={14} />
            </Button>
          </form>
        </div>

        {/* Таблица */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {loading ? "Загрузка..." : `${total.toLocaleString("ru")} компаний`}
              {selectedCity && <span className="ml-2 text-gray-400">· {selectedCity}</span>}
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Button variant="ghost" size="sm" disabled={offset === 0} onClick={() => handlePage(-1)}>
                <Icon name="ChevronLeft" size={16} />
              </Button>
              <span>{Math.floor(offset / PAGE_SIZE) + 1} / {Math.max(1, Math.ceil(total / PAGE_SIZE))}</span>
              <Button variant="ghost" size="sm" disabled={offset + PAGE_SIZE >= total} onClick={() => handlePage(1)}>
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Компания</th>
                  <th className="text-left px-4 py-2 font-medium">ИНН</th>
                  <th className="text-left px-4 py-2 font-medium">Город</th>
                  <th className="text-left px-4 py-2 font-medium">Телефон</th>
                  <th className="text-left px-4 py-2 font-medium">Email</th>
                  <th className="text-left px-4 py-2 font-medium">Сайт</th>
                  <th className="text-left px-4 py-2 font-medium">Данные</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Загрузка...</td></tr>
                ) : companies.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Нет данных</td></tr>
                ) : companies.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="font-medium text-gray-900 truncate">{c.name}</p>
                      {c.director_name && <p className="text-xs text-gray-400 truncate">{c.director_name}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{c.inn || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{c.city || "—"}</td>
                    <td className="px-4 py-3">
                      {c.phone ? (
                        <a href={`tel:${c.phone}`} className="text-blue-600 hover:underline">{c.phone}</a>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      {c.email ? (
                        <span className="text-gray-700 truncate block">{c.email}</span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {c.website ? (
                        <a href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                           target="_blank" rel="noopener noreferrer"
                           className="text-violet-600 hover:underline truncate block max-w-[120px]">
                          {c.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {c.phone && <Badge variant="outline" className="text-[10px] px-1 py-0 border-orange-200 text-orange-600">тел</Badge>}
                        {c.email && <Badge variant="outline" className="text-[10px] px-1 py-0 border-blue-200 text-blue-600">mail</Badge>}
                        {c.website && <Badge variant="outline" className="text-[10px] px-1 py-0 border-violet-200 text-violet-600">сайт</Badge>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* По городам */}
        {stats?.by_city && stats.by_city.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">По городам</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {stats.by_city.map(c => (
                <button
                  key={c.city}
                  onClick={() => setSelectedCity(c.city === selectedCity ? "" : c.city)}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    selectedCity === c.city
                      ? "border-violet-300 bg-violet-50"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium text-sm text-gray-800">{c.city}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.count.toLocaleString("ru")} компаний</p>
                  <div className="flex gap-2 mt-1 text-[10px] text-gray-400">
                    {c.with_email > 0 && <span>{c.with_email} email</span>}
                    {c.with_website > 0 && <span>{c.with_website} сайт</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}