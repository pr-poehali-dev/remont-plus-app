import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://functions.poehali.dev/f301a75f-bbd1-4c9d-91ee-b7346d13d460";

interface EgrulData {
  full_name?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  status?: string;
  type?: string;
  reg_date?: string;
  address_full?: string;
  manager_name?: string;
  manager_post?: string;
  okved?: string;
  okved_name?: string;
  error?: string;
}

interface Company {
  url: string;
  name: string;
  inn?: string;
  phone?: string;
  email?: string;
  site?: string;
  address?: string;
  source?: string;
  status?: "pending" | "loading" | "done" | "error";
  error?: string;
  egrul?: EgrulData;
  egrul_status?: "idle" | "loading" | "done" | "error";
}

const RBC_CATEGORIES = [
  { label: "Строительство и отделка", slug: "924-stroitelnye_otdelochnye_raboty" },
  { label: "Электромонтаж", slug: "857-elektromontazhnye_raboty" },
  { label: "Сантехника", slug: "858-santekhnicheskie_raboty" },
  { label: "Дизайн интерьера", slug: "884-dizayn_interera" },
];

function downloadCsv(companies: Company[]) {
  const bom = "\uFEFF";
  const header = [
    "Название", "ИНН", "КПП", "ОГРН", "Статус ЕГРЮЛ", "Тип", "Дата регистрации",
    "Руководитель", "Должность", "ОКВЭД",
    "Телефон", "Email", "Сайт",
    "Адрес (РБК)", "Адрес (ЕГРЮЛ)", "Ссылка РБК",
  ];
  const rows = companies
    .filter(c => c.status === "done")
    .map(c => [
      c.egrul?.full_name || c.name,
      c.inn || "",
      c.egrul?.kpp || "",
      c.egrul?.ogrn || "",
      c.egrul?.status || "",
      c.egrul?.type || "",
      c.egrul?.reg_date || "",
      c.egrul?.manager_name || "",
      c.egrul?.manager_post || "",
      c.egrul?.okved || "",
      c.phone || "",
      c.email || "",
      c.site || "",
      c.address || "",
      c.egrul?.address_full || "",
      c.url,
    ]);

  const csv =
    bom +
    [header, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `companies-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

function EgrulBadge({ data }: { data?: EgrulData }) {
  if (!data) return null;
  if (data.error) return <span className="text-xs text-red-400">{data.error}</span>;
  const color = data.status === "Действующая" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700";
  return <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${color}`}>{data.status}</span>;
}

export default function RbcParser() {
  const navigate = useNavigate();
  const [category, setCategory] = useState(RBC_CATEGORIES[0].slug);
  const [pageTo, setPageTo] = useState(3);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [phase, setPhase] = useState<"idle" | "list" | "detail" | "done">("idle");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");
  const [filterPhone, setFilterPhone] = useState(false);
  const [filterEmail, setFilterEmail] = useState(false);
  const [filterSite, setFilterSite] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const apiUrl = (path: string) => `${API_BASE}${path}`;

  const collectList = useCallback(async () => {
    setLoading(true);
    setError("");
    setPhase("list");
    setCompanies([]);
    setExpandedRow(null);
    const all: Company[] = [];

    for (let page = 1; page <= pageTo; page++) {
      try {
        const res = await fetch(apiUrl(`/?action=list&category=${encodeURIComponent(category)}&page=${page}`));
        const data = await res.json();
        const items: Company[] = (data.companies || []).map((c: Company) => ({ ...c, status: "pending" as const }));
        all.push(...items);
        setCompanies([...all]);
        if (data.total_pages && page >= data.total_pages) break;
      } catch {
        setError(`Ошибка при загрузке страницы ${page}`);
        break;
      }
    }

    if (all.length === 0) {
      setError("Не удалось найти компании. Попробуйте другую категорию.");
      setLoading(false);
      setPhase("idle");
      return;
    }

    setPhase("detail");
    setProgress({ current: 0, total: all.length });

    const BATCH = 10;
    for (let i = 0; i < all.length; i += BATCH) {
      const batch = all.slice(i, i + BATCH);
      const updated = [...all];
      batch.forEach((_, idx) => { updated[i + idx] = { ...updated[i + idx], status: "loading" }; });
      setCompanies([...updated]);

      try {
        const res = await fetch(apiUrl("/?action=batch"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: batch.map(c => c.url) }),
        });
        const data = await res.json();
        (data.results || []).forEach((detail: Company, idx: number) => {
          updated[i + idx] = { ...updated[i + idx], ...detail, status: detail.error ? "error" : "done" };
        });
      } catch {
        batch.forEach((_, idx) => { updated[i + idx] = { ...updated[i + idx], status: "error" }; });
      }

      setCompanies([...updated]);
      setProgress({ current: Math.min(i + BATCH, all.length), total: all.length });
    }

    setLoading(false);
    setPhase("done");
  }, [category, pageTo]);

  const enrichAll = useCallback(async () => {
    const withInn = companies.filter(c => c.status === "done" && c.inn && !c.egrul);
    if (withInn.length === 0) return;

    setEnriching(true);
    const BATCH = 20;

    for (let i = 0; i < withInn.length; i += BATCH) {
      const batch = withInn.slice(i, i + BATCH);
      const inns = batch.map(c => c.inn!);

      setCompanies(prev => prev.map(c =>
        batch.find(b => b.url === c.url) ? { ...c, egrul_status: "loading" } : c
      ));

      try {
        const res = await fetch(apiUrl("/?action=enrich"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inns }),
        });
        const data = await res.json();
        const enriched: Record<string, EgrulData> = {};
        (data.results || []).forEach((r: EgrulData) => { if (r.inn) enriched[r.inn] = r; });

        setCompanies(prev => prev.map(c => {
          if (c.inn && enriched[c.inn]) {
            return { ...c, egrul: enriched[c.inn], egrul_status: "done" };
          }
          if (batch.find(b => b.url === c.url)) {
            return { ...c, egrul_status: "done" };
          }
          return c;
        }));
      } catch {
        setCompanies(prev => prev.map(c =>
          batch.find(b => b.url === c.url) ? { ...c, egrul_status: "error" } : c
        ));
      }
    }

    setEnriching(false);
  }, [companies]);

  const doneCount = companies.filter(c => c.status === "done").length;
  const withInnCount = companies.filter(c => c.status === "done" && c.inn && !c.egrul).length;
  const hasData = doneCount > 0;

  const visibleCompanies = companies.filter(c => {
    if (c.status === "done") {
      if (filterPhone && !c.phone) return false;
      if (filterEmail && !c.email) return false;
      if (filterSite && !c.site) return false;
      if (filterActive && c.egrul?.status !== "Действующая") return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.name?.toLowerCase().includes(q) ||
          c.egrul?.full_name?.toLowerCase().includes(q) ||
          c.phone?.includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.address?.toLowerCase().includes(q) ||
          c.inn?.includes(q)
        );
      }
    }
    return true;
  });

  const filteredDone = visibleCompanies.filter(c => c.status === "done");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Icon name="DatabaseZap" size={18} className="text-blue-600" />
              Лидогенерация — сбор контактов
            </h1>
            <p className="text-xs text-gray-400">РБК Компании + ЕГРЮЛ (DaData)</p>
          </div>
          {hasData && (
            <Button
              onClick={() => downloadCsv(filteredDone)}
              className="ml-auto bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Icon name="Download" size={15} className="mr-1.5" />
              Скачать CSV ({filteredDone.length})
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
        {/* Параметры */}
        <Card className="p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="Settings" size={16} />
            Параметры сбора — РБК Компании
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm mb-1.5 block">Категория (slug из URL)</Label>
              <Input value={category} onChange={e => setCategory(e.target.value)} className="font-mono text-sm" />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Количество страниц</Label>
              <Input
                type="number" min={1} max={20} value={pageTo}
                onChange={e => setPageTo(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              />
              <p className="text-xs text-gray-400 mt-1">~10–20 компаний на странице</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-gray-400 self-center">Быстрый выбор:</span>
            {RBC_CATEGORIES.map(cat => (
              <button
                key={cat.slug} type="button" onClick={() => setCategory(cat.slug)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                  category === cat.slug
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 text-gray-600 hover:border-blue-400"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <Icon name="AlertCircle" size={15} />
              {error}
            </div>
          )}

          <Button onClick={collectList} disabled={loading || !category} className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
            {loading ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                {phase === "list" && "Собираю список..."}
                {phase === "detail" && `Загружаю детали... ${progress.current}/${progress.total}`}
              </>
            ) : (
              <><Icon name="Play" size={16} className="mr-2" />Начать сбор с РБК</>
            )}
          </Button>
        </Card>

        {/* DaData */}
        {hasData && (
          <Card className="p-5 border-indigo-200 bg-indigo-50/40">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h2 className="font-semibold flex items-center gap-2 text-indigo-900">
                  <Icon name="Building2" size={16} />
                  Обогатить данные через ЕГРЮЛ
                </h2>
                <p className="text-sm text-indigo-700 mt-1">
                  По найденным ИНН получим: официальное название, статус компании, руководителя, ОГРН, КПП, дату регистрации и юридический адрес.
                </p>
                {withInnCount > 0 && (
                  <p className="text-xs text-indigo-500 mt-1">
                    Найдено ИНН для обогащения: <strong>{withInnCount}</strong> компаний
                  </p>
                )}
              </div>
              <Button
                onClick={enrichAll}
                disabled={enriching || withInnCount === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                size="sm"
              >
                {enriching ? (
                  <><Icon name="Loader2" size={14} className="mr-1.5 animate-spin" />Загружаю...</>
                ) : (
                  <><Icon name="Sparkles" size={14} className="mr-1.5" />Запросить ЕГРЮЛ ({withInnCount})</>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Прогресс */}
        {loading && phase === "detail" && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Собрано {progress.current} из {progress.total}</span>
              <span>{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${(progress.current / progress.total) * 100}%` }} />
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-sm text-green-800">
            <Icon name="CheckCircle2" size={18} className="text-green-600 shrink-0" />
            <span>Готово! Собрано <strong>{doneCount}</strong> компаний. {withInnCount > 0 && "Нажми «Запросить ЕГРЮЛ» для обогащения данных."}</span>
          </div>
        )}

        {/* Фильтры */}
        {hasData && (
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                <Icon name="Filter" size={14} />
                Фильтры:
              </span>
              {[
                { label: "Есть телефон", value: filterPhone, set: setFilterPhone },
                { label: "Есть email", value: filterEmail, set: setFilterEmail },
                { label: "Есть сайт", value: filterSite, set: setFilterSite },
                { label: "Действующая (ЕГРЮЛ)", value: filterActive, set: setFilterActive },
              ].map(f => (
                <button
                  key={f.label} type="button" onClick={() => f.set(!f.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    f.value ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-400 bg-white"
                  }`}
                >
                  {f.value && "✓ "}{f.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <Input
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Поиск по названию, ИНН..."
                  className="h-8 text-sm w-52"
                />
                <span className="text-xs text-gray-400 whitespace-nowrap">{filteredDone.length} из {doneCount}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Таблица */}
        {companies.length > 0 && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left w-6">#</th>
                    <th className="px-3 py-2 text-left">Компания</th>
                    <th className="px-3 py-2 text-left">ЕГРЮЛ</th>
                    <th className="px-3 py-2 text-left">Руководитель</th>
                    <th className="px-3 py-2 text-left">Телефон</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">ИНН</th>
                    <th className="px-3 py-2 text-left">Сайт</th>
                    <th className="px-3 py-2 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {visibleCompanies.map((c, i) => (
                    <>
                      <tr
                        key={c.url}
                        className={`border-t hover:bg-gray-50 cursor-pointer ${expandedRow === c.url ? "bg-indigo-50/50" : ""}`}
                        onClick={() => setExpandedRow(expandedRow === c.url ? null : c.url)}
                      >
                        <td className="px-3 py-2 text-gray-400 text-xs">{i + 1}</td>
                        <td className="px-3 py-2 max-w-[180px]">
                          <div className="font-medium text-gray-900 truncate">
                            {c.egrul?.full_name || c.name}
                          </div>
                          {c.address && <div className="text-xs text-gray-400 truncate">{c.address}</div>}
                        </td>
                        <td className="px-3 py-2">
                          {c.egrul_status === "loading" ? (
                            <Icon name="Loader2" size={13} className="animate-spin text-indigo-400" />
                          ) : (
                            <EgrulBadge data={c.egrul} />
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-600 max-w-[160px]">
                          <div className="truncate text-xs">{c.egrul?.manager_name || ""}</div>
                          <div className="truncate text-xs text-gray-400">{c.egrul?.manager_post || ""}</div>
                        </td>
                        <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                          {c.status === "loading" ? (
                            <Icon name="Loader2" size={14} className="animate-spin text-gray-300" />
                          ) : c.phone || <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-3 py-2 text-gray-600 max-w-[160px] truncate text-xs">
                          {c.status !== "loading" && (c.email || <span className="text-gray-300">—</span>)}
                        </td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{c.inn || ""}</td>
                        <td className="px-3 py-2 text-xs">
                          {c.site ? (
                            <a href={c.site} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-blue-500 hover:underline truncate block max-w-[100px]">
                              {c.site.replace(/^https?:\/\/(www\.)?/, "")}
                            </a>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-3 py-2">
                          <a href={c.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-gray-400 hover:text-blue-500">
                            <Icon name="ExternalLink" size={13} />
                          </a>
                        </td>
                      </tr>
                      {expandedRow === c.url && c.egrul && !c.egrul.error && (
                        <tr key={`${c.url}-expand`} className="bg-indigo-50/60 border-t border-indigo-100">
                          <td colSpan={9} className="px-4 py-3">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-xs">
                              {c.egrul.full_name && <div><span className="text-gray-400">Полное название:</span> <span className="font-medium">{c.egrul.full_name}</span></div>}
                              {c.egrul.ogrn && <div><span className="text-gray-400">ОГРН:</span> <span className="font-medium">{c.egrul.ogrn}</span></div>}
                              {c.egrul.kpp && <div><span className="text-gray-400">КПП:</span> <span className="font-medium">{c.egrul.kpp}</span></div>}
                              {c.egrul.type && <div><span className="text-gray-400">Форма:</span> <span className="font-medium">{c.egrul.type}</span></div>}
                              {c.egrul.reg_date && <div><span className="text-gray-400">Зарегистрирована:</span> <span className="font-medium">{c.egrul.reg_date}</span></div>}
                              {c.egrul.okved && <div><span className="text-gray-400">ОКВЭД:</span> <span className="font-medium">{c.egrul.okved}</span></div>}
                              {c.egrul.address_full && <div className="col-span-2"><span className="text-gray-400">Юридический адрес:</span> <span className="font-medium">{c.egrul.address_full}</span></div>}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
