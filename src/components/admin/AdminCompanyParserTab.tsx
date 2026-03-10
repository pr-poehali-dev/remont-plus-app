import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import CompanyParserSummary from "./CompanyParserSummary";
import CompanyParserBulkPanel from "./CompanyParserBulkPanel";
import CompanyParserCityTable from "./CompanyParserCityTable";
import CompanyParserCompanyList from "./CompanyParserCompanyList";
import CompanyParserControlPanel from "./CompanyParserControlPanel";

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

  const [rebuildRunning, setRebuildRunning] = useState(false);
  const [rebuildPhase, setRebuildPhase] = useState<"" | "parse" | "enrich">("");
  const [rebuildMsg, setRebuildMsg] = useState("");
  const rebuildStopRef = useRef(false);

  const [enrichProgress, setEnrichProgress] = useState<EnrichProgress>({
    running: false, cycle: 0, totalEnriched: 0, lastResult: "", log: [],
  });
  const enrichStopRef = useRef(false);

  const [websiteProgress, setWebsiteProgress] = useState<EnrichProgress>({
    running: false, cycle: 0, totalEnriched: 0, lastResult: "", log: [],
  });
  const websiteStopRef = useRef(false);

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
      const raw = await r.json();
      const d = typeof raw.body === "string" ? JSON.parse(raw.body) : raw;
      setStatusMsg(`Найдено: ${d.found ?? 0}, добавлено новых: ${d.inserted ?? 0}`);
      loadStats();
      loadList(selectedCity, 0);
    } catch {
      setStatusMsg("Ошибка при сборе данных");
    } finally {
      setParsing(false);
    }
  };

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
        const raw = await r.json();
        const d = typeof raw.body === "string" ? JSON.parse(raw.body) : raw;
        totalEnriched += d.enriched || 0;
        const line = `Цикл ${cycle} (${cityLabel}): обогащено ${d.enriched ?? 0} из ${d.total ?? 0}`;

        setEnrichProgress(p => ({
          ...p,
          cycle,
          totalEnriched,
          lastResult: line,
          log: [line, ...p.log].slice(0, 50),
        }));

        if (d.total === 0) {
          setEnrichProgress(p => ({
            ...p,
            running: false,
            lastResult: `Готово. Все компании обработаны. Всего обогащено: ${totalEnriched}`,
          }));
          break;
        }

        loadStats();
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

  const handleFindWebsites = () => {
    handleWebsiteCycle();
  };

  const handleWebsiteCycle = async () => {
    websiteStopRef.current = false;
    setWebsiteProgress({ running: true, cycle: 0, totalEnriched: 0, lastResult: "", log: [] });
    setFindingWebsites(true);

    let cycle = 0;
    let totalFound = 0;

    while (!websiteStopRef.current) {
      cycle++;
      const cityLabel = selectedCity || "все города";
      setWebsiteProgress(p => ({ ...p, cycle, lastResult: `Цикл ${cycle}: ищу сайты (${cityLabel})...` }));

      try {
        const r = await fetch(API_URL, {
          method: "POST", headers: HEADERS,
          body: JSON.stringify({ action: "find_websites", city: selectedCity, limit: ENRICH_BATCH }),
        });
        const raw = await r.json();
        const d = typeof raw.body === "string" ? JSON.parse(raw.body) : raw;
        totalFound += d.found || 0;
        const line = `Цикл ${cycle} (${cityLabel}): найдено ${d.found ?? 0} из ${d.total ?? 0}`;

        setWebsiteProgress(p => ({
          ...p,
          cycle,
          totalEnriched: totalFound,
          lastResult: line,
          log: [line, ...p.log].slice(0, 50),
        }));

        if (d.total === 0) {
          setWebsiteProgress(p => ({
            ...p,
            running: false,
            lastResult: `Готово. Все компании обработаны. Всего найдено сайтов: ${totalFound}`,
          }));
          break;
        }

        loadStats();
        await new Promise(res => setTimeout(res, 1500));
      } catch {
        const line = `Цикл ${cycle}: ошибка запроса`;
        setWebsiteProgress(p => ({ ...p, log: [line, ...p.log].slice(0, 50), lastResult: line }));
        await new Promise(res => setTimeout(res, 3000));
      }
    }

    setWebsiteProgress(p => ({ ...p, running: false }));
    setFindingWebsites(false);
    loadStats();
    if (selectedCity) loadList(selectedCity, offset);
  };

  const handleWebsiteStop = () => {
    websiteStopRef.current = true;
    setWebsiteProgress(p => ({ ...p, running: false, lastResult: `Остановлено. Всего найдено сайтов: ${p.totalEnriched}` }));
    setFindingWebsites(false);
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

  const handleRebuildContacts = async () => {
    if (!selectedCity) return;
    rebuildStopRef.current = false;
    setRebuildRunning(true);

    setRebuildPhase("parse");
    setRebuildMsg(`Шаг 1/2: собираю компании из 2ГИС (${selectedCity})...`);
    try {
      const r = await fetch(API_URL, {
        method: "POST", headers: HEADERS,
        body: JSON.stringify({ action: "parse", city: selectedCity }),
      });
      const d = await r.json();
      setRebuildMsg(`Шаг 1/2 готов: найдено ${d.found}, добавлено ${d.inserted}. Запускаю обогащение...`);
      loadStats();
    } catch {
      setRebuildMsg("Ошибка при сборе из 2ГИС, продолжаю обогащение...");
    }

    if (rebuildStopRef.current) {
      setRebuildRunning(false);
      setRebuildPhase("");
      return;
    }

    setRebuildPhase("enrich");
    let cycle = 0;
    let totalEnriched = 0;

    while (!rebuildStopRef.current) {
      cycle++;
      setRebuildMsg(`Шаг 2/2: обогащение, цикл ${cycle} — обогащено всего: ${totalEnriched}...`);
      try {
        const r = await fetch(API_URL, {
          method: "POST", headers: HEADERS,
          body: JSON.stringify({ action: "enrich", city: selectedCity, limit: ENRICH_BATCH }),
        });
        const d = await r.json();
        totalEnriched += d.enriched || 0;
        if (d.total === 0) {
          setRebuildMsg(`Готово! Пересобрано из 2ГИС, обогащено контактов: ${totalEnriched}`);
          break;
        }
        loadStats();
        await new Promise(res => setTimeout(res, 1500));
      } catch {
        await new Promise(res => setTimeout(res, 3000));
      }
    }

    setRebuildRunning(false);
    setRebuildPhase("");
    loadStats();
    loadList(selectedCity, 0);
  };

  const handleRebuildStop = () => {
    rebuildStopRef.current = true;
    setRebuildRunning(false);
    setRebuildPhase("");
    setRebuildMsg(prev => prev + " (остановлено)");
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
          <p className="text-sm text-gray-500 mt-0.5">Ремонтные компании из ЕГРЮЛ — 34 города с населением от 500 000 чел.</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Icon name="Download" size={16} />
          Скачать CSV{selectedCity ? ` (${selectedCity})` : " (все)"}
        </Button>
      </div>

      <CompanyParserSummary stats={stats} />

      <CompanyParserControlPanel
        cities={cities}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        parsing={parsing}
        findingWebsites={findingWebsites}
        statusMsg={statusMsg}
        enrichProgress={enrichProgress}
        websiteProgress={websiteProgress}
        rebuildRunning={rebuildRunning}
        rebuildPhase={rebuildPhase}
        rebuildMsg={rebuildMsg}
        onParse={handleParse}
        onEnrichStart={handleEnrichCycle}
        onEnrichStop={handleEnrichStop}
        onFindWebsites={handleFindWebsites}
        onWebsiteStop={handleWebsiteStop}
        onRebuildContacts={handleRebuildContacts}
        onRebuildStop={handleRebuildStop}
      />

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