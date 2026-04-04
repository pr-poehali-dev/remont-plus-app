import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const CALC_EVENTS_URL = "https://functions.poehali.dev/85d1f13f-3446-417d-85a1-7cc975466f50";

interface FunnelRow {
  calc_type: string;
  opens: number;
  interacts: number;
  result_views: number;
  form_opens: number;
  export_clicks: number;
  leads: number;
}

interface Totals {
  opens: number;
  interacts: number;
  result_views: number;
  form_opens: number;
  export_clicks: number;
  leads: number;
}

interface DailyRow {
  day: string;
  opens: number;
  interacts: number;
  result_views: number;
  leads: number;
  form_opens: number;
  export_clicks: number;
}

const CALC_NAMES: Record<string, string> = {
  bathroom: "Ванная",
  windows: "Окна",
  flooring: "Полы",
  ceilings: "Потолки",
  electrics: "Электрика",
  newbuild: "Новостройка",
  turnkey: "Под ключ",
  bathhouse: "Баня",
  framehouse: "Каркасный дом",
  office: "Офис",
  furniture: "Мебель",
  calculator: "Общий",
};

function pct(a: number, b: number): string {
  if (!b) return "—";
  return (a / b * 100).toFixed(1) + "%";
}

function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

export default function AdminConversionTab() {
  const [funnel, setFunnel] = useState<FunnelRow[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(14);
  const [error, setError] = useState("");

  const adminToken = localStorage.getItem("admin_token") || "";
  const authHeaders = { "X-Auth-Token": adminToken };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [fRes, dRes] = await Promise.all([
        fetch(`${CALC_EVENTS_URL}?report=funnel&days=${days}`, { headers: authHeaders }),
        fetch(`${CALC_EVENTS_URL}?report=daily&days=${days}`, { headers: authHeaders }),
      ]);
      if (!fRes.ok || !dRes.ok) throw new Error("Ошибка загрузки");
      const fData = await fRes.json();
      const dData = await dRes.json();
      setFunnel(fData.funnel || []);
      setTotals(fData.totals || null);
      setDaily(dData.daily || []);
    } catch {
      setError("Не удалось загрузить данные конверсий");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [days]);

  const maxDailyOpens = Math.max(...daily.map(d => d.opens), 1);
  const maxDailyLeads = Math.max(...daily.map(d => d.leads), 1);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Icon name="TrendingUp" size={18} className="text-emerald-500" />
            Конверсии калькуляторов
          </h2>
          <p className="text-sm text-gray-500">Воронка: открытие → взаимодействие → результат → заявка</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 14, 30, 60].map(d => (
            <Button
              key={d}
              variant={days === d ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(d)}
            >
              {d}д
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="RefreshCw" size={14} />}
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <Icon name="AlertCircle" size={14} />
          {error}
        </p>
      )}

      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{fmt(totals.opens)}</p>
            <p className="text-xs text-gray-500 mt-1">Открытий</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{fmt(totals.interacts)}</p>
            <p className="text-xs text-gray-500 mt-1">Взаимодействий</p>
            <p className="text-[10px] text-gray-400">{pct(totals.interacts, totals.opens)} от открытий</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-violet-600">{fmt(totals.result_views)}</p>
            <p className="text-xs text-gray-500 mt-1">Просмотров сметы</p>
            <p className="text-[10px] text-gray-400">{pct(totals.result_views, totals.opens)} от открытий</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{fmt(totals.form_opens)}</p>
            <p className="text-xs text-gray-500 mt-1">Открытий формы</p>
            <p className="text-[10px] text-gray-400">{pct(totals.form_opens, totals.result_views)} от смет</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-teal-600">{fmt(totals.export_clicks)}</p>
            <p className="text-xs text-gray-500 mt-1">Экспортов</p>
            <p className="text-[10px] text-gray-400">{pct(totals.export_clicks, totals.result_views)} от смет</p>
          </Card>
          <Card className="p-4 text-center bg-green-50 border-green-200">
            <p className="text-2xl font-bold text-green-600">{fmt(totals.leads)}</p>
            <p className="text-xs text-gray-500 mt-1">Заявок</p>
            <p className="text-[10px] text-green-600 font-medium">{pct(totals.leads, totals.opens)} конверсия</p>
          </Card>
        </div>
      )}

      {daily.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold text-sm text-gray-700 mb-4 flex items-center gap-2">
            <Icon name="BarChart3" size={16} className="text-blue-500" />
            Динамика по дням
          </h3>
          <div className="space-y-1.5">
            {daily.map(d => (
              <div key={d.day} className="flex items-center gap-3 text-xs">
                <span className="w-16 text-gray-500 shrink-0 font-mono">
                  {new Date(d.day + "T00:00:00").toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}
                </span>
                <div className="flex-1 flex items-center gap-1">
                  <div
                    className="h-4 bg-blue-200 rounded-sm transition-all"
                    style={{ width: `${(d.opens / maxDailyOpens) * 100}%`, minWidth: d.opens > 0 ? "4px" : "0" }}
                    title={`Открытий: ${d.opens}`}
                  />
                  {d.leads > 0 && (
                    <div
                      className="h-4 bg-green-500 rounded-sm transition-all"
                      style={{ width: `${Math.max((d.leads / maxDailyLeads) * 20, 4)}%` }}
                      title={`Заявок: ${d.leads}`}
                    />
                  )}
                </div>
                <span className="w-12 text-right text-gray-600 font-medium">{d.opens}</span>
                {d.leads > 0 && (
                  <span className="w-8 text-right text-green-600 font-bold">+{d.leads}</span>
                )}
                {d.leads === 0 && (
                  <span className="w-8" />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-3 pt-3 border-t text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-200 rounded-sm" />
              Открытия
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-green-500 rounded-sm" />
              Заявки
            </span>
          </div>
        </Card>
      )}

      {funnel.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold text-sm text-gray-700 mb-4 flex items-center gap-2">
            <Icon name="Filter" size={16} className="text-violet-500" />
            Воронка по калькуляторам
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-4 text-gray-500 font-medium">Калькулятор</th>
                  <th className="pb-2 px-2 text-center text-gray-500 font-medium">Открытий</th>
                  <th className="pb-2 px-2 text-center text-gray-500 font-medium">Взаимод.</th>
                  <th className="pb-2 px-2 text-center text-gray-500 font-medium">Смета</th>
                  <th className="pb-2 px-2 text-center text-gray-500 font-medium">Форма</th>
                  <th className="pb-2 px-2 text-center text-gray-500 font-medium">Экспорт</th>
                  <th className="pb-2 px-2 text-center text-green-600 font-medium">Заявки</th>
                  <th className="pb-2 pl-2 text-center text-green-600 font-medium">CR</th>
                </tr>
              </thead>
              <tbody>
                {funnel.map(r => (
                  <tr key={r.calc_type} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium text-gray-900">
                      {CALC_NAMES[r.calc_type] || r.calc_type}
                    </td>
                    <td className="py-2 px-2 text-center text-gray-700">{fmt(r.opens)}</td>
                    <td className="py-2 px-2 text-center text-blue-600">{fmt(r.interacts)}</td>
                    <td className="py-2 px-2 text-center text-violet-600">{fmt(r.result_views)}</td>
                    <td className="py-2 px-2 text-center text-amber-600">{fmt(r.form_opens)}</td>
                    <td className="py-2 px-2 text-center text-teal-600">{fmt(r.export_clicks)}</td>
                    <td className="py-2 px-2 text-center font-bold text-green-600">{fmt(r.leads)}</td>
                    <td className="py-2 pl-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                        r.leads > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                      }`}>
                        {pct(r.leads, r.opens)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!loading && funnel.length === 0 && (
        <Card className="p-8 text-center">
          <Icon name="BarChart3" size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Данных пока нет. Результаты появятся после накопления трафика.</p>
        </Card>
      )}
    </div>
  );
}
