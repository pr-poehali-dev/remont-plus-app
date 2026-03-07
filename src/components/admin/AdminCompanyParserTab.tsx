import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import CompanyParserSummary from "./CompanyParserSummary";
import CompanyParserBulkPanel from "./CompanyParserBulkPanel";
import CompanyParserCityTable from "./CompanyParserCityTable";
import CompanyParserCompanyList from "./CompanyParserCompanyList";

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
  with_email: number;
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
  const [findingWebsites, setFindingWebsites] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "list">("overview");

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
    setEnriching(true);
    setStatusMsg(selectedCity ? `Ищу email и телефоны для ${selectedCity}...` : "Ищу email и телефоны по всей базе...");
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

  const handleFindWebsites = async () => {
    setFindingWebsites(true);
    setStatusMsg(selectedCity ? `Ищу сайты для ${selectedCity}...` : "Ищу сайты по всей базе...");
    try {
      const r = await fetch(API_URL, {
        method: "POST", headers: HEADERS,
        body: JSON.stringify({ action: "find_websites", city: selectedCity }),
      });
      const d = await r.json();
      setStatusMsg(`Найдено сайтов: ${d.found} из ${d.total} компаний`);
      loadStats();
      loadList(selectedCity, offset);
    } catch {
      setStatusMsg("Ошибка при поиске сайтов");
    } finally {
      setFindingWebsites(false);
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

      <CompanyParserSummary stats={stats} />

      <CompanyParserBulkPanel
        cities={cities}
        bulkRunning={bulkRunning}
        bulkProgress={bulkProgress}
        onStart={handleBulkParse}
        onStop={() => setBulkStop(true)}
      />

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
          disabled={parsing || enriching || findingWebsites}
          variant="outline"
          className="gap-2"
        >
          {enriching ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Mail" size={16} />}
          {enriching ? "Ищу контакты..." : "Найти email / телефон"}
        </Button>

        <Button
          onClick={handleFindWebsites}
          disabled={parsing || enriching || findingWebsites}
          variant="outline"
          className="gap-2"
        >
          {findingWebsites ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Globe" size={16} />}
          {findingWebsites ? "Ищу сайты..." : "Найти сайты"}
        </Button>

        {statusMsg && (
          <span className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">{statusMsg}</span>
        )}
      </div>

      {activeTab === "overview" && (
        <CompanyParserCityTable
          stats={stats}
          onCitySelect={handleCitySelect}
          onDelete={handleDelete}
        />
      )}

      {activeTab === "list" && (
        <CompanyParserCompanyList
          companies={companies}
          total={total}
          offset={offset}
          page={PAGE}
          selectedCity={selectedCity}
          loading={loadingList}
          onPageChange={(newOffset) => loadList(selectedCity, newOffset)}
        />
      )}
    </div>
  );
}
