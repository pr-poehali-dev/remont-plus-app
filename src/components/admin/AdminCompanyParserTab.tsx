import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/40dd0e7a-86a9-4379-aae6-93556483a8bd";
const ADMIN_TOKEN = "admin2025";
const HEADERS = { "Content-Type": "application/json", "X-Admin-Token": ADMIN_TOKEN };

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
}

interface City {
  name: string;
  id: string;
}

export default function AdminCompanyParserTab() {
  const [cities, setCities] = useState<City[]>([]);
  const [stats, setStats] = useState<CityStats[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loadingList, setLoadingList] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "list">("overview");

  // Массовый сбор по всем городам
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkStop, setBulkStop] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number; city: string; log: string[] }>({ done: 0, total: 0, city: "", log: [] });

  const PAGE = 50;

  useEffect(() => {
    fetch(`${API_URL}?action=cities`).then(r => r.json()).then(d => setCities(d.cities || []));
    loadStats();
  }, []);

  const loadStats = () => {
    fetch(`${API_URL}?action=stats`).then(r => r.json()).then(d => setStats(d.stats || []));
  };

  const loadList = (city: string, off = 0) => {
    setLoadingList(true);
    const q = city ? `&city=${encodeURIComponent(city)}` : "";
    fetch(`${API_URL}?action=list&limit=${PAGE}&offset=${off}${q}`)
      .then(r => r.json())
      .then(d => {
        setCompanies(d.companies || []);
        setTotal(d.total || 0);
        setOffset(off);
      })
      .finally(() => setLoadingList(false));
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setActiveTab("list");
    loadList(city, 0);
  };

  const handleParse = async () => {
    if (!selectedCity) return;
    setParsing(true);
    setStatusMsg("Собираю компании из 2ГИС...");
    try {
      const r = await fetch(API_URL, {
        method: "POST", headers: HEADERS,
        body: JSON.stringify({ action: "parse", city: selectedCity }),
      });
      const d = await r.json();
      setStatusMsg(`Найдено: ${d.found}, добавлено новых: ${d.inserted}`);
      loadStats();
      loadList(selectedCity, 0);
    } catch {
      setStatusMsg("Ошибка при сборе данных");
    } finally {
      setParsing(false);
    }
  };

  const handleEnrich = async () => {
    if (!selectedCity) return;
    setEnriching(true);
    setStatusMsg("Обогащаю данные через DaData (ФИО директора)...");
    try {
      const r = await fetch(API_URL, {
        method: "POST", headers: HEADERS,
        body: JSON.stringify({ action: "enrich", city: selectedCity }),
      });
      const d = await r.json();
      setStatusMsg(`Обогащено: ${d.enriched} из ${d.total} компаний`);
      loadStats();
      loadList(selectedCity, offset);
    } catch {
      setStatusMsg("Ошибка при обогащении");
    } finally {
      setEnriching(false);
    }
  };

  const handleExport = () => {
    const q = selectedCity ? `&city=${encodeURIComponent(selectedCity)}` : "";
    const url = `${API_URL}?action=export${q}`;
    fetch(url, { headers: { "X-Admin-Token": ADMIN_TOKEN } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `companies_${selectedCity || "all"}.csv`;
        a.click();
      });
  };

  const handleBulkParse = async () => {
    if (!cities.length) return;
    setBulkRunning(true);
    setBulkStop(false);
    setBulkProgress({ done: 0, total: cities.length, city: "", log: [] });

    for (let i = 0; i < cities.length; i++) {
      if (bulkStop) break;
      const city = cities[i].name;
      setBulkProgress(p => ({ ...p, city, done: i }));
      try {
        const r = await fetch(API_URL, {
          method: "POST", headers: HEADERS,
          body: JSON.stringify({ action: "parse", city }),
        });
        const d = await r.json();
        const line = `${city}: найдено ${d.found}, добавлено ${d.inserted}`;
        setBulkProgress(p => ({ ...p, log: [...p.log, line] }));
      } catch {
        setBulkProgress(p => ({ ...p, log: [...p.log, `${city}: ошибка`] }));
      }
      setBulkProgress(p => ({ ...p, done: i + 1 }));
    }

    setBulkRunning(false);
    loadStats();
  };

  const handleDelete = async (city: string) => {
    if (!confirm(`Удалить все компании по городу "${city}"?`)) return;
    await fetch(API_URL, {
      method: "DELETE", headers: HEADERS,
      body: JSON.stringify({ city }),
    });
    loadStats();
    if (selectedCity === city) setCompanies([]);
  };

  const totalAll = stats.reduce((s, c) => s + c.count, 0);
  const enrichedAll = stats.reduce((s, c) => s + c.enriched, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">База компаний</h2>
          <p className="text-sm text-gray-500 mt-0.5">Ремонтные компании из 2ГИС по городам-миллионникам</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Icon name="Download" size={16} />
          Скачать CSV{selectedCity ? ` (${selectedCity})` : " (все)"}
        </Button>
      </div>

      {/* Сводка */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-extrabold text-gray-900">{totalAll.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Всего компаний</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-extrabold text-orange-500">{enrichedAll.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">С ФИО директора</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-extrabold text-blue-500">{stats.length}</p>
          <p className="text-sm text-gray-500 mt-1">Городов собрано</p>
        </div>
      </div>

      {/* Массовый сбор */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Собрать все города сразу</p>
            <p className="text-xs text-gray-400">Поочерёдно обойдёт все 14 городов-миллионников</p>
          </div>
          <div className="flex gap-2 ml-auto">
            {bulkRunning ? (
              <Button
                onClick={() => setBulkStop(true)}
                variant="outline"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
              >
                <Icon name="Square" size={14} />
                Остановить
              </Button>
            ) : (
              <Button
                onClick={handleBulkParse}
                disabled={parsing || enriching || !cities.length}
                className="bg-gray-900 hover:bg-gray-800 text-white gap-2"
              >
                <Icon name="Zap" size={16} />
                Собрать все {cities.length} городов
              </Button>
            )}
          </div>
        </div>

        {(bulkRunning || bulkProgress.log.length > 0) && (
          <div className="mt-4">
            {/* Прогресс-бар */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${bulkProgress.total > 0 ? Math.round(bulkProgress.done / bulkProgress.total * 100) : 0}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                {bulkProgress.done} / {bulkProgress.total}
              </span>
            </div>
            {bulkRunning && bulkProgress.city && (
              <p className="text-xs text-orange-600 flex items-center gap-1 mb-2">
                <Icon name="Loader2" size={12} className="animate-spin" />
                Обрабатываю: {bulkProgress.city}...
              </p>
            )}
            {/* Лог */}
            <div className="bg-gray-50 rounded-xl p-3 max-h-40 overflow-y-auto space-y-1">
              {bulkProgress.log.length === 0 ? (
                <p className="text-xs text-gray-400">Ожидаю результатов...</p>
              ) : (
                [...bulkProgress.log].reverse().map((line, i) => (
                  <p key={i} className="text-xs text-gray-600 font-mono">{line}</p>
                ))
              )}
            </div>
            {!bulkRunning && bulkProgress.done === bulkProgress.total && bulkProgress.total > 0 && (
              <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
                <Icon name="CheckCircle2" size={14} />
                Готово! Все города обработаны.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Вкладки */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === "overview" ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          По городам
        </button>
        <button
          onClick={() => { setActiveTab("list"); loadList(selectedCity, 0); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === "list" ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          Список компаний
        </button>
      </div>

      {/* Панель управления */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex flex-wrap items-center gap-3">
        <select
          value={selectedCity}
          onChange={e => setSelectedCity(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white min-w-[200px]"
        >
          <option value="">— Выбрать город —</option>
          {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <Button
          onClick={handleParse}
          disabled={!selectedCity || parsing || enriching}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
        >
          {parsing ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Search" size={16} />}
          {parsing ? "Собираю..." : "Собрать из 2ГИС"}
        </Button>

        <Button
          onClick={handleEnrich}
          disabled={!selectedCity || parsing || enriching}
          variant="outline"
          className="gap-2"
        >
          {enriching ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="UserCheck" size={16} />}
          {enriching ? "Обогащаю..." : "Найти директоров"}
        </Button>

        {statusMsg && (
          <span className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">{statusMsg}</span>
        )}
      </div>

      {/* Обзор по городам */}
      {activeTab === "overview" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {stats.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Icon name="DatabaseZap" size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">База пустая</p>
              <p className="text-sm mt-1">Выбери город и нажми «Собрать из 2ГИС»</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Город</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Компаний</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">С директором</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">% обогащено</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s, i) => (
                  <tr key={s.city} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleCitySelect(s.city)}
                        className="font-medium text-orange-600 hover:underline"
                      >
                        {s.city}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{s.count}</td>
                    <td className="px-4 py-3 text-right text-green-600">{s.enriched}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${s.count > 0 ? Math.round(s.enriched / s.count * 100) : 0}%` }}
                          />
                        </div>
                        <span className="text-gray-500 text-xs w-8 text-right">
                          {s.count > 0 ? Math.round(s.enriched / s.count * 100) : 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(s.city)}
                        className="text-gray-400 hover:text-red-500 transition"
                        title="Удалить данные по городу"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Список компаний */}
      {activeTab === "list" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {selectedCity ? `${selectedCity} — ` : ""}
              {total.toLocaleString()} компаний
            </span>
            <div className="flex gap-2">
              <Button
                size="sm" variant="outline"
                disabled={offset === 0}
                onClick={() => loadList(selectedCity, offset - PAGE)}
                className="h-8 text-xs"
              >
                <Icon name="ChevronLeft" size={14} />
              </Button>
              <span className="text-xs text-gray-500 self-center px-1">
                {offset + 1}–{Math.min(offset + PAGE, total)} из {total}
              </span>
              <Button
                size="sm" variant="outline"
                disabled={offset + PAGE >= total}
                onClick={() => loadList(selectedCity, offset + PAGE)}
                className="h-8 text-xs"
              >
                <Icon name="ChevronRight" size={14} />
              </Button>
            </div>
          </div>

          {loadingList ? (
            <div className="flex justify-center py-12">
              <Icon name="Loader2" size={24} className="animate-spin text-gray-400" />
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>Нет данных. Выберите город и запустите сбор.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 min-w-[200px]">Название</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Город</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Телефон</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Директор</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">ИНН</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Сайт</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c, i) => (
                    <tr key={c.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[250px] truncate">{c.name}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{c.city}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {c.phone ? (
                          <a href={`tel:${c.phone}`} className="hover:text-orange-500">{c.phone}</a>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {c.email ? (
                          <a href={`mailto:${c.email}`} className="hover:text-orange-500">{c.email}</a>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {c.director_name || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{c.inn || <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3">
                        {c.website ? (
                          <a href={c.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs truncate max-w-[120px] block">
                            {c.website.replace(/^https?:\/\//, "")}
                          </a>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}