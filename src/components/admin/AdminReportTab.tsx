import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import {
  type ReportData,
  type SubscriberRow,
  exportCSV,
  exportSubscribersCSV,
} from "./report/reportTypes";
import ReportSummaryTab from "./report/ReportSummaryTab";
import { UsersTable, ProjectsTable, EstimatesTable, SubscribersTable } from "./report/ReportTablesTab";

const ADMIN_API = "https://functions.poehali.dev/874af9cd-edd6-471e-b6d4-e68c828e6dca";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("avangard_token") || "";
  return token ? { "X-Auth-Token": token } : {};
}

type TabKey = "summary" | "users" | "projects" | "estimates" | "subscribers";

export default function AdminReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("summary");
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}?action=report`, {
        headers: { ...getAuthHeaders(), "X-Admin-Token": "admin2025" },
      });
      const json = await res.json();
      const parsed = typeof json.body === "string" ? JSON.parse(json.body) : json;
      if (parsed?.summary) {
        setData(parsed);
      }
    } catch (e) {
      console.error("Report load error", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadSubscribers() {
    setSubsLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}?action=subscribers`, {
        headers: { ...getAuthHeaders(), "X-Admin-Token": "admin2025" },
      });
      const json = await res.json();
      const parsed = typeof json.body === "string" ? JSON.parse(json.body) : json;
      setSubscribers(parsed?.subscribers || []);
    } catch (e) {
      console.error("Subscribers load error", e);
    } finally {
      setSubsLoading(false);
    }
  }

  useEffect(() => { load(); loadSubscribers(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Icon name="Loader2" className="animate-spin mr-2" /> Загружаем отчёт...
      </div>
    );
  }

  if (!data) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
      <Icon name="AlertCircle" size={32} className="text-red-400" />
      <p className="text-sm">Не удалось загрузить отчёт. Проверьте права доступа.</p>
      <button onClick={load} className="text-sm text-violet-600 hover:underline">Попробовать снова</button>
    </div>
  );

  const tabs: { key: TabKey; label: React.ReactNode }[] = [
    { key: "summary", label: "Активность" },
    { key: "users", label: `Пользователи (${data.users.length})` },
    { key: "projects", label: `Проекты (${data.projects.length})` },
    { key: "estimates", label: `Сметы (${(data.estimates || []).length})` },
    {
      key: "subscribers",
      label: (
        <span className="flex items-center gap-1">
          <Icon name="Mail" size={13} />
          Рассылка
          {subscribers.length > 0 && <Badge className="ml-1 text-xs px-1.5 py-0">{subscribers.length}</Badge>}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Сводный отчёт</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { load(); loadSubscribers(); }}>
            <Icon name="RefreshCw" size={15} className="mr-1" /> Обновить
          </Button>
          {tab === "subscribers" ? (
            <Button size="sm" onClick={() => exportSubscribersCSV(subscribers)} disabled={subscribers.length === 0}>
              <Icon name="Download" size={15} className="mr-1" /> Скачать базу рассылки
            </Button>
          ) : (
            <Button size="sm" onClick={() => exportCSV(data)}>
              <Icon name="Download" size={15} className="mr-1" /> Скачать CSV
            </Button>
          )}
        </div>
      </div>

      {/* Карточки сводки — всегда видны */}
      <ReportSummaryTab
        summary={data.summary}
        registrations_by_day={data.registrations_by_day}
        projects_by_day={data.projects_by_day}
        showCharts={tab === "summary"}
      />

      {/* Переключатель таблиц */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${tab === t.key ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "users" && <UsersTable users={data.users} />}
      {tab === "projects" && <ProjectsTable projects={data.projects} />}
      {tab === "estimates" && <EstimatesTable estimates={data.estimates || []} />}
      {tab === "subscribers" && <SubscribersTable subscribers={subscribers} loading={subsLoading} />}
    </div>
  );
}
