import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const ADMIN_API = "https://functions.poehali.dev/874af9cd-edd6-471e-b6d4-e68c828e6dca";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("avangard_token") || "";
  return token ? { "X-Auth-Token": token } : {};
}

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

interface EstimateRow {
  id: number;
  name: string;
  total_materials: number;
  total_works: number;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
  user_name: string | null;
  user_phone: string | null;
  items_count: number;
}

interface DayCount {
  date: string;
  count: number;
}

interface SubscriberRow {
  id: number;
  name: string;
  phone: string;
  email: string;
  user_type: string;
  created_at: string;
}

interface ReportData {
  summary: Summary;
  users: UserRow[];
  projects: ProjectRow[];
  estimates: EstimateRow[];
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

function fmtPrice(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

function exportCSV(data: ReportData) {
  const rows: string[] = [];

  rows.push("=== СВОДКА ===");
  rows.push("Всего пользователей;" + data.summary.total_users);
  rows.push("Клиентов;" + data.summary.customers);
  rows.push("Мастеров;" + data.summary.contractors);
  rows.push("Дизайн-проектов всего;" + data.summary.total_projects);
  rows.push("Смет составлено;" + data.summary.total_estimates);
  rows.push("Средняя сумма сметы;" + data.summary.avg_estimate);
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
  rows.push("");

  rows.push("=== СМЕТЫ ===");
  rows.push("ID;Название;Материалы;Работы;Итого;Позиций;Пользователь;Телефон;Дата");
  (data.estimates || []).forEach(e => {
    rows.push([e.id, e.name, e.total_materials, e.total_works, e.total, e.items_count, e.user_name || "Аноним", e.user_phone || "", fmtDate(e.created_at)].join(";"));
  });

  const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `avangard-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportSubscribersCSV(subscribers: SubscriberRow[]) {
  const rows: string[] = [];
  rows.push("Имя;Email;Телефон;Тип;Дата регистрации");
  subscribers.forEach(s => {
    rows.push([s.name, s.email, s.phone || "—", USER_TYPE_LABELS[s.user_type] || s.user_type, fmtDate(s.created_at)].join(";"));
  });
  const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"summary" | "users" | "projects" | "estimates" | "subscribers">("summary");
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

  const { summary } = data;

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
        <Card className="p-4">
          <div className="text-xs text-gray-500 mb-1">Сметы</div>
          <div className="text-3xl font-bold">{summary.total_estimates ?? 0}</div>
          {(summary.avg_estimate ?? 0) > 0 && (
            <div className="text-xs text-gray-400 mt-1">средняя: {fmtPrice(summary.avg_estimate)}</div>
          )}
        </Card>
      </div>

      {/* Переключатель таблиц */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {(["summary", "users", "projects", "estimates", "subscribers"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${tab === t ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"}`}
          >
            {t === "summary" ? "Активность"
              : t === "users" ? `Пользователи (${data.users.length})`
              : t === "projects" ? `Проекты (${data.projects.length})`
              : t === "estimates" ? `Сметы (${(data.estimates || []).length})`
              : <span className="flex items-center gap-1"><Icon name="Mail" size={13} />Рассылка{subscribers.length > 0 && <Badge className="ml-1 text-xs px-1.5 py-0">{subscribers.length}</Badge>}</span>}
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

      {/* Таблица смет */}
      {tab === "estimates" && (
        <div className="overflow-x-auto">
          {(data.estimates || []).length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Сметы ещё не сохранялись. Они появятся после того, как авторизованный пользователь добавит позиции в калькуляторе.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4">Название</th>
                  <th className="pb-2 pr-4">Материалы</th>
                  <th className="pb-2 pr-4">Работы</th>
                  <th className="pb-2 pr-4">Итого</th>
                  <th className="pb-2 pr-4">Позиций</th>
                  <th className="pb-2 pr-4">Пользователь</th>
                  <th className="pb-2">Дата</th>
                </tr>
              </thead>
              <tbody>
                {(data.estimates || []).map(e => (
                  <tr key={e.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium max-w-[180px] truncate">{e.name}</td>
                    <td className="py-2 pr-4 text-gray-600">{fmtPrice(e.total_materials)}</td>
                    <td className="py-2 pr-4 text-gray-600">{fmtPrice(e.total_works)}</td>
                    <td className="py-2 pr-4 font-semibold">{fmtPrice(e.total)}</td>
                    <td className="py-2 pr-4 text-center text-gray-500">{e.items_count}</td>
                    <td className="py-2 pr-4 text-gray-600">
                      {e.user_name ? (
                        <span>{e.user_name}<br /><span className="text-xs text-gray-400">{e.user_phone}</span></span>
                      ) : (
                        <span className="text-gray-400">Аноним</span>
                      )}
                    </td>
                    <td className="py-2 text-gray-500">{fmtDate(e.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Таблица подписчиков на рассылку */}
      {tab === "subscribers" && (
        <div className="overflow-x-auto">
          {subsLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Icon name="Loader2" className="animate-spin mr-2" /> Загружаем базу рассылки...
            </div>
          ) : subscribers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <Icon name="MailX" size={32} />
              <p className="text-sm">Пока никто не дал согласие на рассылку</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
                <Icon name="Mail" size={16} className="text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  {subscribers.length} {subscribers.length === 1 ? "человек дал" : subscribers.length < 5 ? "человека дали" : "человек дали"} согласие на рассылку
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">Имя</th>
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Телефон</th>
                    <th className="pb-2 pr-4">Тип</th>
                    <th className="pb-2">Зарегистрирован</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map(s => (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium">{s.name}</td>
                      <td className="py-2 pr-4 text-blue-600">{s.email}</td>
                      <td className="py-2 pr-4 text-gray-600">{s.phone || "—"}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={s.user_type === "customer" ? "secondary" : "outline"} className="text-xs">
                          {USER_TYPE_LABELS[s.user_type] || s.user_type}
                        </Badge>
                      </td>
                      <td className="py-2 text-gray-500">{fmtDate(s.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}