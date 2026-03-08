import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Summary, type DayCount, fmtDate, fmtPrice } from "./reportTypes";

interface Props {
  summary: Summary;
  registrations_by_day: DayCount[];
  projects_by_day: DayCount[];
  showCharts?: boolean;
}

export default function ReportSummaryTab({ summary, registrations_by_day, projects_by_day, showCharts = true }: Props) {
  return (
    <>
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
            <div className="text-xs text-gray-400 mt-1">средняя: {fmtPrice(summary.avg_estimate!)}</div>
          )}
        </Card>
      </div>

      {showCharts && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">Регистрации за 30 дней</h3>
            {registrations_by_day.length === 0 ? (
              <p className="text-sm text-gray-400">Нет данных</p>
            ) : (
              <div className="space-y-1">
                {registrations_by_day.map(d => (
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
            {projects_by_day.length === 0 ? (
              <p className="text-sm text-gray-400">Нет данных</p>
            ) : (
              <div className="space-y-1">
                {projects_by_day.map(d => (
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
    </>
  );
}