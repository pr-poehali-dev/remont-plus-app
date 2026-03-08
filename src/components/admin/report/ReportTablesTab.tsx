import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import {
  type UserRow,
  type ProjectRow,
  type EstimateRow,
  type SubscriberRow,
  USER_TYPE_LABELS,
  STYLE_LABELS,
  fmtDate,
  fmtPrice,
} from "./reportTypes";

interface UsersTableProps {
  users: UserRow[];
}

export function UsersTable({ users }: UsersTableProps) {
  return (
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
          {users.map(u => (
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
  );
}

interface ProjectsTableProps {
  projects: ProjectRow[];
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  return (
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
          {projects.map(p => (
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
  );
}

interface EstimatesTableProps {
  estimates: EstimateRow[];
}

export function EstimatesTable({ estimates }: EstimatesTableProps) {
  if (estimates.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-8 text-center">
        Сметы ещё не сохранялись. Они появятся после того, как авторизованный пользователь добавит позиции в калькуляторе.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
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
          {estimates.map(e => (
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
    </div>
  );
}

interface SubscribersTableProps {
  subscribers: SubscriberRow[];
  loading: boolean;
}

export function SubscribersTable({ subscribers, loading }: SubscribersTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <Icon name="Loader2" className="animate-spin mr-2" /> Загружаем базу рассылки...
      </div>
    );
  }
  if (subscribers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
        <Icon name="MailX" size={32} />
        <p className="text-sm">Пока никто не дал согласие на рассылку</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
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
    </div>
  );
}
