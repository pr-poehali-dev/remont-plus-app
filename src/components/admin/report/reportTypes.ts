export interface Summary {
  total_users: number;
  customers: number;
  contractors: number;
  total_projects: number;
  auth_projects: number;
  total_stages: number;
  total_partner_leads: number;
  new_partner_leads: number;
  total_chats: number;
  total_estimates?: number;
  avg_estimate?: number;
}

export interface UserRow {
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

export interface ProjectRow {
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

export interface EstimateRow {
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

export interface DayCount {
  date: string;
  count: number;
}

export interface SubscriberRow {
  id: number;
  name: string;
  phone: string;
  email: string;
  user_type: string;
  created_at: string;
}

export interface ReportData {
  summary: Summary;
  users: UserRow[];
  projects: ProjectRow[];
  estimates: EstimateRow[];
  registrations_by_day: DayCount[];
  projects_by_day: DayCount[];
}

export const STYLE_LABELS: Record<string, string> = {
  modern: "Современный",
  scandinavian: "Скандинавский",
  loft: "Лофт",
  classic: "Классика",
  minimalism: "Минимализм",
  art_deco: "Арт-деко",
};

export const USER_TYPE_LABELS: Record<string, string> = {
  customer: "Клиент",
  contractor: "Мастер",
};

export function fmt(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function fmtDate(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function fmtPrice(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

export function exportCSV(data: ReportData) {
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

export function exportSubscribersCSV(subscribers: SubscriberRow[]) {
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
