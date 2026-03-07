import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import CompanyParserSummary from "./CompanyParserSummary";
import CompanyParserBulkPanel from "./CompanyParserBulkPanel";
import CompanyParserCityTable from "./CompanyParserCityTable";
import CompanyParserCompanyList from "./CompanyParserCompanyList";

const API_URL = "https://functions.poehali.dev/40dd0e7a-86a9-4379-aae6-93556483a8bd";
const ADMIN_TOKEN = "admin2025";
const HEADERS = { "Content-Type": "application/json", "X-Admin-Token": ADMIN_TOKEN };
const ENRICH_BATCH = 30;

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

interface City {
  name: string;
  id: string;
}

interface EnrichProgress {
  running: boolean;
  cycle: number;
  totalEnriched: number;
  lastResult: string;
  log: string[];
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
  const [findingWebsites, setFindingWebsites] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "list">("overview");

  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkStop, setBulkStop] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number; city: string; log: string[] }>({ done: 0, total: 0, city: "", log: [] });

  const [enrichProgress, setEnrichProgress] = useState<EnrichProgress>({
    running: false, cycle: 0, totalEnriched: 0, lastResult: "", log: [],
  });
  const enrichStopRef = useRef(false);

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

  // Цикличное обогащение: запускает батчи по ENRICH_BATCH компаний подряд
  const handleEnrichCycle = async () => {
    enrichStopRef.current = false;
    setEnrichProgress({ running: true, cycle: 0, totalEnriched: 0, lastResult: "", log: [] });

    let cycle = 0;
    let totalEnriched = 0;

    while (!enrichStopRef.current) {
      cycle++;
      const cityLabel = selectedCity || "все города";
      setEnrichProgress(p => ({ ...p, cycle, lastResult: `Цикл ${cycle}: ищу контакты (${cityLabel})...` }));

      try {
        const r = await fetch(API_URL, {
          method: "POST", headers: HEADERS,
          body: JSON.stringify({ action: "enrich", city: selectedCity, limit: ENRICH_BATCH }),
        });
        const d = await r.json();
        totalEnriched += d.enriched || 0;
        const line = `Цикл ${cycle} (${cityLabel}): обогащено ${d.enriched} из ${d.total}`;

        setEnrichProgress(p => ({
          ...p,
          cycle,
          totalEnriched,
          lastResult: line,
          log: [line, ...p.log].slice(0, 50),
        }));

        // Если батч вернул 0 обработанных — нет смысла продолжать
        if (d.total === 0) {
          setEnrichProgress(p => ({
            ...p,
            running: false,
            lastResult: `Готово. Все компании обработаны. Всего обогащено: ${totalEnriched}`,
          }));
          break;
        }

        loadStats();
        // пауза между циклами
        await new Promise(res => setTimeout(res, 1500));
      } catch {
        const line = `Цикл ${cycle}: ошибка запроса`;
        setEnrichProgress(p => ({ ...p, log: [line, ...p.log].slice(0, 50), lastResult: line }));
        await new Promise(res => setTimeout(res, 3000));
      }
    }

    setEnrichProgress(p => ({ ...p, running: false }));
    loadStats();
    if (selectedCity) loadList(selectedCity, offset);
  };

  const handleEnrichStop = () => {
    enrichStopRef.current = true;
    setEnrichProgress(p => ({ ...p, running: false, lastResult: `Остановлено. Всего обогащено: ${p.totalEnriched}` }));
  };

  const handleFindWebsites = async () => {
    setFindingWebsites(true);
    setStatusMsg(selectedCity ? `Ищу сайты для ${selectedCity}...` : "Ищу сайты по всей базе...");
    try {
      const r = await fetch(API_URL, {
        method: "POST", headers: HEADERS,
        body: JSON.stringify({ action: "find_websites", city: selectedCity, limit: ENRICH_BATCH }),
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
          <p className="text-sm text-gray-500 mt-0.5">Ремонтные компании из ЕГРЮЛ по городам-миллионникам</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Icon name="Download" size={16} />
          Скачать CSV{selectedCity ? ` (${selectedCity})` : " (все)"}
        </Button>
      </div>

      <CompanyParserSummary stats={stats} />

      {/* Панель обогащения */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white min-w-[180px]"
          >
            <option value="">— Все города —</option>
            {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>

          <Button
            onClick={handleParse}
            disabled={!selectedCity || parsing || enrichProgress.running}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
          >
            {parsing ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Search" size={16} />}
            {parsing ? "Собираю..." : "Собрать из ЕГРЮЛ"}
          </Button>

          {!enrichProgress.running ? (
            <Button
              onClick={handleEnrichCycle}
              disabled={parsing || findingWebsites}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <Icon name="Zap" size={16} />
              Запустить обогащение{selectedCity ? ` (${selectedCity})` : ""}
            </Button>
          ) : (
            <Button
              onClick={handleEnrichStop}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 gap-2"
            >
              <Icon name="Square" size={16} />
              Остановить
            </Button>
          )}

          <Button
            onClick={handleFindWebsites}
            disabled={parsing || enrichProgress.running || findingWebsites}
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

        {/* Прогресс обогащения */}
        {(enrichProgress.running || enrichProgress.lastResult) && (
          <div className="border-t border-gray-100 pt-3 mt-1">
            <div className="flex items-center gap-3 mb-2">
              {enrichProgress.running && (
                <Icon name="Loader2" size={14} className="animate-spin text-green-600" />
              )}
              <span className="text-sm font-medium text-gray-700">{enrichProgress.lastResult}</span>
              {enrichProgress.totalEnriched > 0 && (
                <span className="ml-auto text-sm text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-lg">
                  +{enrichProgress.totalEnriched} обогащено
                </span>
              )}
            </div>
            {enrichProgress.log.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 max-h-32 overflow-y-auto space-y-1">
                {enrichProgress.log.map((line, i) => (
                  <p key={i} className="text-xs text-gray-500 font-mono">{line}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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
