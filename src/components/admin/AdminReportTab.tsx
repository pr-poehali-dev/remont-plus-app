import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const ADMIN_API = "https://functions.poehali.dev/874af9cd-edd6-471e-b6d4-e68c828e6dca";
const ADMIN_TOKEN = "admin2025";

interface Summary {
  total_users: number;
  customers: number;
  contractors: number;
  total_projects: number;
  auth_projects: number;
  total_stages: number;
  total_partner_leads: number;
  new_partner_leads: number;
  total_chats: number;
}

interface UserRow {
  id: number;
  name: string;
  phone: string;
  email: string;
  user_type: string;
  role: string;
  created_at: string;
  last_login_at: string | null;
  projects_count: number;
}

interface ProjectRow {
  id: number;
  name: string;
  style: string;
  total_area: number | null;
  room_count: number;
  status: string;
  created_at: string;
  user_name: string | null;
  user_phone: string | null;
  stages_done: number;
}

interface DayCount {
  date: string;
  count: number;
}

interface ReportData {
  summary: Summary;
  users: UserRow[];
  projects: ProjectRow[];
  registrations_by_day: DayCount[];
  projects_by_day: DayCount[];
}

const STYLE_LABELS: Record<string, string> = {
  modern: "Современный",
  scandinavian: "Скандинавский",
  loft: "Лофт",
  classic: "Классика",
  minimalism: "Минимализм",
  art_deco: "Арт-деко",
};

const USER_TYPE_LABELS: Record<string, string> = {
  customer: "Клиент",
  contractor: "Мастер",
};

function fmt(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtDate(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function exportCSV(data: ReportData) {
  const rows: string[] = [];

  rows.push("=== СВОДКА ===");
  rows.push("Всего пользователей;" + data.summary.total_users);
  rows.push("Клиентов;" + data.summary.customers);
  rows.push("Мастеров;" + data.summary.contractors);
  rows.push("Дизайн-проектов всего;" + data.summary.total_projects);
  rows.push("Заявок партнёров;" + data.summary.total_partner_leads);
  rows.push("Новых заявок партнёров;" + data.summary.new_partner_leads);
  rows.push("AI-чатов;" + data.summary.total_chats);
  rows.push("");

  rows.push("=== ПОЛЬЗОВАТЕЛИ ===");
  rows.push("ID;Имя;Телефон;Email;Тип;Дата регистрации;Последний вход;Проектов");
  data.users.forEach(u => {
    rows.push([u.id, u.name, u.phone, u.email, USER_TYPE_LABELS[u.user_type] || u.user_type, fmtDate(u.created_at), fmtDate(u.last_login_at), u.projects_count].join(";"));
  });
  rows.push("");

  rows.push("=== ДИЗАЙН-ПРОЕКТЫ ===");
  rows.push("ID;Название;Стиль;Площадь;Комнат;Этапов выполнено;Пользователь;Телефон;Дата создания");
  data.projects.forEach(p => {
    rows.push([p.id, p.name, STYLE_LABELS[p.style] || p.style, p.total_area || "", p.room_count, p.stages_done, p.user_name || "Аноним", p.user_phone || "", fmtDate(p.created_at)].join(";"));
  });

  const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `avangard-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"summary" | "users" | "projects">("summary");

  async function load() {
    setLoading(true);
    const res = await fetch(`${ADMIN_API}?action=report`, {
      headers: { "X-Admin-Token": ADMIN_TOKEN },
    });
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Icon name="Loader2" className="animate-spin mr-2" /> Загружаем отчёт...
      </div>
    );
  }

  if (!data) return null;

  const { summary } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Сводный отчёт</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <Icon name="RefreshCw" size={15} className="mr-1" /> Обновить
          </Button>
          <Button size="sm" onClick={() => exportCSV(data)}>
            <Icon name="Download" size={15} className="mr-1" /> Скачать CSV
          </Button>
        </div>
      </div>

      {/* Карточки сводки */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-gray-500 mb-1">Пользователи</div>
          <div className="text-3xl font-bold">{summary.total_users}</div>
          <div className="text-xs text-gray-400 mt-1">клиентов: {summary.customers} · мастеров: {summary.contractors}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500 mb-1">Дизайн-проекты</div>
          <div className="text-3xl font-bold">{summary.total_projects}</div>
          <div className="text-xs text-gray-400 mt-1">авторизованных: {summary.auth_projects}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500 mb-1">Заявки партнёров</div>
          <div className="text-3xl font-bold">{summary.total_partner_leads}</div>
          {summary.new_partner_leads > 0 && (
            <Badge variant="destructive" className="text-xs mt-1">{summary.new_partner_leads} новых</Badge>
          )}
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500 mb-1">AI-чатов</div>
          <div className="text-3xl font-bold">{summary.total_chats}</div>
          <div className="text-xs text-gray-400 mt-1">этапов в проектах: {summary.total_stages}</div>
        </Card>
      </div>

      {/* Переключатель таблиц */}
      <div className="flex gap-2 border-b pb-2">
        {(["summary", "users", "projects"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${tab === t ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"}`}
          >
            {t === "summary" ? "Активность" : t === "users" ? `Пользователи (${data.users.length})` : `Проекты (${data.projects.length})`}
          </button>
        ))}
      </div>

      {/* Активность по дням */}
      {tab === "summary" && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">Регистрации за 30 дней</h3>
            {data.registrations_by_day.length === 0 ? (
              <p className="text-sm text-gray-400">Нет данных</p>
            ) : (
              <div className="space-y-1">
                {data.registrations_by_day.map(d => (
                  <div key={d.date} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-24 shrink-0">{fmtDate(d.date)}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(100, d.count * 20)}%` }} />
                    </div>
                    <span className="font-medium w-6 text-right">{d.count}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">Дизайн-проекты за 30 дней</h3>
            {data.projects_by_day.length === 0 ? (
              <p className="text-sm text-gray-400">Нет данных</p>
            ) : (
              <div className="space-y-1">
                {data.projects_by_day.map(d => (
                  <div key={d.date} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-24 shrink-0">{fmtDate(d.date)}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, d.count * 20)}%` }} />
                    </div>
                    <span className="font-medium w-6 text-right">{d.count}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Таблица пользователей */}
      {tab === "users" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4">Имя</th>
                <th className="pb-2 pr-4">Телефон</th>
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Тип</th>
                <th className="pb-2 pr-4">Проектов</th>
                <th className="pb-2 pr-4">Зарегистрирован</th>
                <th className="pb-2">Последний вход</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-4 font-medium">{u.name}</td>
                  <td className="py-2 pr-4 text-gray-600">{u.phone || "—"}</td>
                  <td className="py-2 pr-4 text-gray-600">{u.email || "—"}</td>
                  <td className="py-2 pr-4">
                    <Badge variant={u.user_type === "customer" ? "secondary" : "outline"} className="text-xs">
                      {USER_TYPE_LABELS[u.user_type] || u.user_type}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4 text-center">{u.projects_count}</td>
                  <td className="py-2 pr-4 text-gray-500">{fmtDate(u.created_at)}</td>
                  <td className="py-2 text-gray-500">{fmtDate(u.last_login_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Таблица проектов */}
      {tab === "projects" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4">Название</th>
                <th className="pb-2 pr-4">Стиль</th>
                <th className="pb-2 pr-4">Площадь</th>
                <th className="pb-2 pr-4">Комнат</th>
                <th className="pb-2 pr-4">Этапов</th>
                <th className="pb-2 pr-4">Пользователь</th>
                <th className="pb-2">Дата</th>
              </tr>
            </thead>
            <tbody>
              {data.projects.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-4 font-medium max-w-[180px] truncate">{p.name}</td>
                  <td className="py-2 pr-4 text-gray-600">{STYLE_LABELS[p.style] || p.style}</td>
                  <td className="py-2 pr-4 text-gray-600">{p.total_area ? `${p.total_area} м²` : "—"}</td>
                  <td className="py-2 pr-4 text-center">{p.room_count}</td>
                  <td className="py-2 pr-4 text-center">
                    <span className={`font-medium ${p.stages_done >= 7 ? "text-green-600" : p.stages_done > 0 ? "text-blue-600" : "text-gray-400"}`}>
                      {p.stages_done}/7
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-gray-600">
                    {p.user_name ? (
                      <span>{p.user_name}<br /><span className="text-xs text-gray-400">{p.user_phone}</span></span>
                    ) : (
                      <span className="text-gray-400">Аноним</span>
                    )}
                  </td>
                  <td className="py-2 text-gray-500">{fmtDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
