import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://functions.poehali.dev/f301a75f-bbd1-4c9d-91ee-b7346d13d460";

type Source = "rbc" | "orgpage";

interface Company {
  url: string;
  name: string;
  inn?: string;
  phone?: string;
  email?: string;
  site?: string;
  address?: string;
  rating?: string;
  reviews_count?: string;
  source?: Source;
  status?: "pending" | "loading" | "done" | "error";
  error?: string;
}

const RBC_CATEGORIES = [
  { label: "Строительство и отделка", slug: "924-stroitelnye_otdelochnye_raboty" },
  { label: "Электромонтаж", slug: "857-elektromontazhnye_raboty" },
  { label: "Сантехника", slug: "858-santekhnicheskie_raboty" },
  { label: "Дизайн интерьера", slug: "884-dizayn_interera" },
];

const ORGPAGE_CATEGORIES = [
  { label: "Ремонт квартир", slug: "rossiya/%D1%80%D0%B5%D0%BC%D0%BE%D0%BD%D1%82_%D0%BA%D0%B2%D0%B0%D1%80%D1%82%D0%B8%D1%80" },
  { label: "Строительство", slug: "rossiya/stroitelstvo" },
  { label: "Электрика", slug: "rossiya/elektrika" },
  { label: "Сантехника", slug: "rossiya/santehnika" },
];

function downloadCsv(companies: Company[], source: Source) {
  const bom = "\uFEFF";
  const header = ["Название", "ИНН", "Телефон", "Email", "Сайт", "Адрес", "Рейтинг", "Отзывы", "Ссылка", "Источник"];
  const rows = companies
    .filter(c => c.status === "done")
    .map(c => [
      c.name,
      c.inn || "",
      c.phone || "",
      c.email || "",
      c.site || "",
      c.address || "",
      c.rating || "",
      c.reviews_count || "",
      c.url,
      c.source || source,
    ]);

  const csv =
    bom +
    [header, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `companies-${source}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

export default function RbcParser() {
  const navigate = useNavigate();
  const [source, setSource] = useState<Source>("rbc");
  const [category, setCategory] = useState(RBC_CATEGORIES[0].slug);
  const [pageTo, setPageTo] = useState(3);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"idle" | "list" | "detail" | "done">("idle");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");

  const apiUrl = (path: string) => `${API_BASE}${path}`;

  const handleSourceChange = (s: Source) => {
    setSource(s);
    setCompanies([]);
    setPhase("idle");
    setError("");
    if (s === "rbc") setCategory(RBC_CATEGORIES[0].slug);
    else setCategory(ORGPAGE_CATEGORIES[0].slug);
  };

  const collectList = useCallback(async () => {
    setLoading(true);
    setError("");
    setPhase("list");
    setCompanies([]);
    const all: Company[] = [];

    for (let page = 1; page <= pageTo; page++) {
      try {
        const res = await fetch(
          apiUrl(`/?action=list&source=${source}&category=${encodeURIComponent(category)}&page=${page}`)
        );
        const data = await res.json();
        const items: Company[] = (data.companies || []).map((c: { url: string; name: string; source: Source }) => ({
          ...c,
          status: "pending" as const,
        }));
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
      batch.forEach((_, idx) => {
        updated[i + idx] = { ...updated[i + idx], status: "loading" };
      });
      setCompanies([...updated]);

      try {
        const res = await fetch(apiUrl("/?action=batch"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source,
            urls: batch.map(c => ({ url: c.url, source: c.source || source })),
          }),
        });
        const data = await res.json();
        (data.results || []).forEach((detail: Company, idx: number) => {
          updated[i + idx] = {
            ...updated[i + idx],
            ...detail,
            status: detail.error ? "error" : "done",
          };
        });
      } catch {
        batch.forEach((_, idx) => {
          updated[i + idx] = { ...updated[i + idx], status: "error" };
        });
      }

      setCompanies([...updated]);
      setProgress({ current: Math.min(i + BATCH, all.length), total: all.length });
    }

    setLoading(false);
    setPhase("done");
  }, [category, pageTo, source]);

  const [filterPhone, setFilterPhone] = useState(false);
  const [filterEmail, setFilterEmail] = useState(false);
  const [filterSite, setFilterSite] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const doneCount = companies.filter(c => c.status === "done").length;
  const hasData = doneCount > 0;
  const quickCategories = source === "rbc" ? RBC_CATEGORIES : ORGPAGE_CATEGORIES;

  const filteredCompanies = companies.filter(c => {
    if (c.status !== "done") return false;
    if (filterPhone && !c.phone) return false;
    if (filterEmail && !c.email) return false;
    if (filterSite && !c.site) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q)
      );
    }
    return true;
  });

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
              Лидогенерация — сбор контактов компаний
            </h1>
            <p className="text-xs text-gray-400">companies.rbc.ru и orgpage.ru</p>
          </div>
          {hasData && (
            <Button
              onClick={() => downloadCsv(filteredCompanies, source)}
              className="ml-auto bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Icon name="Download" size={15} className="mr-1.5" />
              Скачать CSV ({filteredCompanies.length})
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
        <Card className="p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="Settings" size={16} />
            Параметры сбора
          </h2>

          {/* Выбор источника */}
          <div className="mb-4">
            <Label className="text-sm mb-2 block">Источник данных</Label>
            <div className="flex gap-2">
              {(["rbc", "orgpage"] as Source[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSourceChange(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    source === s
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 bg-white"
                  }`}
                >
                  {s === "rbc" ? "РБК Компании" : "Orgpage.ru"}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {source === "rbc"
                ? "companies.rbc.ru — ИНН, телефон, email, сайт, адрес"
                : "orgpage.ru — телефон, email, сайт, адрес, рейтинг и отзывы"}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm mb-1.5 block">
                {source === "rbc" ? "Категория (slug из URL РБК)" : "Путь категории на orgpage.ru"}
              </Label>
              <Input
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Количество страниц</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={pageTo}
                onChange={e => setPageTo(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              />
              <p className="text-xs text-gray-400 mt-1">~10–20 компаний на странице</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-gray-400 self-center">Быстрый выбор:</span>
            {quickCategories.map(cat => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setCategory(cat.slug)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                  category === cat.slug
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
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

          <Button
            onClick={collectList}
            disabled={loading || !category}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                {phase === "list" && "Собираю список компаний..."}
                {phase === "detail" && `Загружаю детали... ${progress.current}/${progress.total}`}
              </>
            ) : (
              <>
                <Icon name="Play" size={16} className="mr-2" />
                Начать сбор
              </>
            )}
          </Button>
        </Card>

        {/* Прогресс */}
        {loading && phase === "detail" && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Собрано {progress.current} из {progress.total} компаний</span>
              <span>{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Итог */}
        {phase === "done" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-sm text-green-800">
            <Icon name="CheckCircle2" size={18} className="text-green-600 shrink-0" />
            <span>Готово! Собрано <strong>{doneCount}</strong> компаний. Нажмите «Скачать CSV» в шапке.</span>
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
              ].map(f => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => f.set(!f.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    f.value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 text-gray-600 hover:border-blue-400 bg-white"
                  }`}
                >
                  {f.value && <span className="mr-1">✓</span>}
                  {f.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Поиск по названию, телефону..."
                  className="h-8 text-sm w-56"
                />
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {filteredCompanies.length} из {doneCount}
                </span>
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
                    <th className="px-3 py-2 text-left">Телефон</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    {source === "orgpage" && <th className="px-3 py-2 text-left">Рейтинг</th>}
                    <th className="px-3 py-2 text-left">ИНН</th>
                    <th className="px-3 py-2 text-left">Сайт</th>
                    <th className="px-3 py-2 text-left w-8" />
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((c, i) => (
                    <tr key={c.url} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-3 py-2 max-w-[200px]">
                        <div className="font-medium text-gray-900 truncate">{c.name}</div>
                        {c.address && <div className="text-xs text-gray-400 truncate">{c.address}</div>}
                      </td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                        {c.status === "loading" ? (
                          <Icon name="Loader2" size={14} className="animate-spin text-gray-300" />
                        ) : c.phone || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2 text-gray-600 max-w-[180px] truncate">
                        {c.status !== "loading" && (c.email || <span className="text-gray-300">—</span>)}
                      </td>
                      {source === "orgpage" && (
                        <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                          {c.rating ? (
                            <span className="flex items-center gap-1">
                              <Icon name="Star" size={12} className="text-yellow-500 fill-yellow-500" />
                              {c.rating}
                              {c.reviews_count && <span className="text-xs text-gray-400">({c.reviews_count})</span>}
                            </span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                      )}
                      <td className="px-3 py-2 text-gray-500 text-xs">{c.inn || ""}</td>
                      <td className="px-3 py-2 text-xs">
                        {c.site ? (
                          <a href={c.site} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate block max-w-[120px]">
                            {c.site.replace(/^https?:\/\/(www\.)?/, "")}
                          </a>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2">
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500">
                          <Icon name="ExternalLink" size={13} />
                        </a>
                      </td>
                    </tr>
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