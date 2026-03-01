import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { API_BASE, Company, EgrulData, downloadCsv } from "./rbc-parser/types";
import ParserSettingsCard from "./rbc-parser/ParserSettingsCard";
import EgrulEnrichCard from "./rbc-parser/EgrulEnrichCard";
import CompaniesTable from "./rbc-parser/CompaniesTable";

export default function RbcParser() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("924-stroitelnye_otdelochnye_raboty");
  const [pageTo, setPageTo] = useState(3);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [phase, setPhase] = useState<"idle" | "list" | "detail" | "done">("idle");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");

  const apiUrl = (path: string) => `${API_BASE}${path}`;

  const collectList = useCallback(async () => {
    setLoading(true);
    setError("");
    setPhase("list");
    setCompanies([]);
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
          if (c.inn && enriched[c.inn]) return { ...c, egrul: enriched[c.inn], egrul_status: "done" };
          if (batch.find(b => b.url === c.url)) return { ...c, egrul_status: "done" };
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
  const doneFull = companies.filter(c => c.status === "done");

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
              onClick={() => downloadCsv(doneFull)}
              className="ml-auto bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Icon name="Download" size={15} className="mr-1.5" />
              Скачать CSV ({doneFull.length})
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
        <ParserSettingsCard
          category={category}
          setCategory={setCategory}
          pageTo={pageTo}
          setPageTo={setPageTo}
          loading={loading}
          phase={phase}
          progress={progress}
          error={error}
          onCollect={collectList}
        />

        {hasData && (
          <EgrulEnrichCard
            withInnCount={withInnCount}
            enriching={enriching}
            onEnrich={enrichAll}
          />
        )}

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

        {companies.length > 0 && (
          <CompaniesTable companies={companies} doneCount={doneCount} />
        )}
      </div>
    </div>
  );
}
