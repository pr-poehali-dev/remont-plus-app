import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://functions.poehali.dev/f301a75f-bbd1-4c9d-91ee-b7346d13d460";

interface Company {
  url: string;
  name: string;
  inn?: string;
  phone?: string;
  email?: string;
  site?: string;
  address?: string;
  status?: "pending" | "loading" | "done" | "error";
}

const DEFAULT_CATEGORY = "924-stroitelnye_otdelochnye_raboty";

function downloadExcel(companies: Company[]) {
  // Генерируем CSV в кодировке UTF-8 BOM (Excel откроет правильно)
  const bom = "\uFEFF";
  const header = ["Название", "ИНН", "Телефон", "Email", "Сайт", "Адрес", "Ссылка на РБК"];
  const rows = companies
    .filter(c => c.status === "done")
    .map(c => [
      c.name,
      c.inn || "",
      c.phone || "",
      c.email || "",
      c.site || "",
      c.address || "",
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
  link.download = `rbc-companies-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

export default function RbcParser() {
  const navigate = useNavigate();
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [pageTo, setPageTo] = useState(3);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"idle" | "list" | "detail" | "done">("idle");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");

  const apiUrl = (path: string) =>
    API_BASE.includes("PLACEHOLDER")
      ? `/api/rbc-parser${path}`
      : `${API_BASE}${path}`;

  const collectList = useCallback(async () => {
    setLoading(true);
    setError("");
    setPhase("list");
    setCompanies([]);
    const all: Company[] = [];

    for (let page = 1; page <= pageTo; page++) {
      try {
        const res = await fetch(
          apiUrl(`/?action=list&category=${encodeURIComponent(category)}&page=${page}`)
        );
        const data = await res.json();
        const items: Company[] = (data.companies || []).map((c: { url: string; name: string }) => ({
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
      setError("Не удалось найти компании на этих страницах. Попробуйте другую категорию.");
      setLoading(false);
      setPhase("idle");
      return;
    }

    // Собираем детали по 10 за раз
    setPhase("detail");
    setProgress({ current: 0, total: all.length });

    const BATCH = 10;
    for (let i = 0; i < all.length; i += BATCH) {
      const batch = all.slice(i, i + BATCH);
      // Помечаем как loading
      const updated = [...all];
      batch.forEach((_, idx) => {
        updated[i + idx] = { ...updated[i + idx], status: "loading" };
      });
      setCompanies([...updated]);

      try {
        const res = await fetch(apiUrl("/?action=batch"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: batch.map(c => c.url) }),
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
  }, [category, pageTo]);

  const doneCount = companies.filter(c => c.status === "done").length;
  const hasData = doneCount > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Icon name="Search" size={18} className="text-blue-600" />
              Парсер компаний РБК
            </h1>
            <p className="text-xs text-gray-400">Автоматический сбор контактов с companies.rbc.ru</p>
          </div>
          {hasData && (
            <Button
              onClick={() => downloadExcel(companies)}
              className="ml-auto bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Icon name="Download" size={15} className="mr-1.5" />
              Скачать Excel ({doneCount} компаний)
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
        {/* Настройки */}
        <Card className="p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="Settings" size={16} />
            Параметры сбора
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm mb-1.5 block">Категория (slug из URL)</Label>
              <Input
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="924-stroitelnye_otdelochnye_raboty"
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Часть URL после /category/ на сайте РБК
              </p>
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
              <p className="text-xs text-gray-400 mt-1">
                ~10–20 компаний на странице · макс. 20 страниц
              </p>
            </div>
          </div>

          {/* Быстрые категории */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-gray-400 self-center">Быстрый выбор:</span>
            {[
              { label: "Строительство и отделка", slug: "924-stroitelnye_otdelochnye_raboty" },
              { label: "Электромонтаж", slug: "857-elektromontazhnye_raboty" },
              { label: "Сантехника", slug: "858-santekhnicheskie_raboty" },
              { label: "Дизайн интерьера", slug: "884-dizayn_interera" },
            ].map(cat => (
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
            disabled={loading || !category.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={15} className="mr-1.5 animate-spin" />
                Собираю данные...
              </>
            ) : (
              <>
                <Icon name="Play" size={15} className="mr-1.5" />
                Начать сбор
              </>
            )}
          </Button>
        </Card>

        {/* Прогресс */}
        {(phase === "list" || phase === "detail") && (
          <Card className="p-4 border-blue-200 bg-blue-50">
            <div className="flex items-center gap-3">
              <Icon name="Loader2" size={18} className="animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">
                  {phase === "list"
                    ? `Получаю список компаний... (найдено: ${companies.length})`
                    : `Собираю контакты: ${progress.current} из ${progress.total}`}
                </p>
                {phase === "detail" && progress.total > 0 && (
                  <div className="mt-2 bg-blue-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Результаты */}
        {companies.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">
                Результаты
                <span className="ml-2 text-sm font-normal text-gray-400">
                  {doneCount} из {companies.length} обработано
                </span>
              </h2>
              {hasData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadExcel(companies)}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Icon name="Download" size={13} className="mr-1" />
                  Скачать CSV
                </Button>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-3 py-2.5 w-8">#</th>
                    <th className="px-3 py-2.5">Компания</th>
                    <th className="px-3 py-2.5">ИНН</th>
                    <th className="px-3 py-2.5">Телефон</th>
                    <th className="px-3 py-2.5">Email</th>
                    <th className="px-3 py-2.5">Сайт</th>
                    <th className="px-3 py-2.5 w-16">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c, i) => (
                    <tr key={c.url} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-3 py-2.5">
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                        >
                          {c.name || "—"}
                        </a>
                        {c.address && (
                          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{c.address}</p>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-600">{c.inn || "—"}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{c.phone || "—"}</td>
                      <td className="px-3 py-2.5 text-xs text-blue-600">
                        {c.email ? (
                          <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a>
                        ) : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-xs">
                        {c.site ? (
                          <a
                            href={c.site.startsWith("http") ? c.site : `https://${c.site}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate block max-w-[120px]"
                          >
                            {c.site.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                          </a>
                        ) : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {c.status === "pending" && <Icon name="Clock" size={14} className="text-gray-300 mx-auto" />}
                        {c.status === "loading" && <Icon name="Loader2" size={14} className="text-blue-500 animate-spin mx-auto" />}
                        {c.status === "done" && <Icon name="CheckCircle" size={14} className="text-green-500 mx-auto" />}
                        {c.status === "error" && <Icon name="XCircle" size={14} className="text-red-400 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Подсказка */}
        {phase === "idle" && companies.length === 0 && (
          <Card className="p-6 border-dashed text-center">
            <Icon name="Building2" size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">
              Выберите категорию, укажите количество страниц и нажмите «Начать сбор».<br />
              Результат можно скачать в Excel / CSV.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}