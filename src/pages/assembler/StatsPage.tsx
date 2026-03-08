import { useState, useMemo } from "react";
import { Order, Product } from "@/types";
import Icon from "@/components/ui/icon";

interface Props {
  orders: Order[];
  products: Product[];
}

type Period = "7d" | "30d" | "90d" | "all";

const PERIODS: { value: Period; label: string }[] = [
  { value: "7d", label: "7 дней" },
  { value: "30d", label: "30 дней" },
  { value: "90d", label: "90 дней" },
  { value: "all", label: "Всё время" },
];

function filterByPeriod(orders: Order[], period: Period): Order[] {
  if (period === "all") return orders;
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return orders.filter((o) => new Date(o.createdAt) >= cutoff);
}

export default function StatsPage({ orders, products }: Props) {
  const [period, setPeriod] = useState<Period>("30d");

  const filtered = useMemo(() => filterByPeriod(orders, period), [orders, period]);

  const completed = filtered.filter((o) => o.status === "completed").length;
  const inProgress = filtered.filter((o) => o.status === "in_progress").length;
  const newOrders = filtered.filter((o) => o.status === "new").length;

  const totalLitres = filtered.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

  const productStats: Record<string, number> = {};
  filtered.forEach((o) => {
    o.items.forEach((item) => {
      productStats[item.productName] = (productStats[item.productName] || 0) + item.quantity;
    });
  });
  const topProducts = Object.entries(productStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxCount = topProducts[0]?.[1] || 1;

  const fmtLitres = (v: number) =>
    v % 1 === 0 ? `${v} л` : `${v.toFixed(2).replace(/\.?0+$/, "")} л`;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Статистика</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Сводная аналитика по заявкам</p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                period === p.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Всего заявок", value: filtered.length, icon: "FileText", color: "text-foreground" },
          { label: "Новых", value: newOrders, icon: "Inbox", color: "text-orange-600" },
          { label: "В работе", value: inProgress, icon: "Zap", color: "text-blue-600" },
          { label: "Выполнено", value: completed, icon: "CheckCircle", color: "text-green-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-4">
            <Icon name={kpi.icon} size={16} className={`mb-2 ${kpi.color}`} />
            <div className="text-2xl font-semibold">{kpi.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4 text-sm">Топ товаров по спросу</h3>
          {topProducts.length === 0 ? (
            <p className="text-muted-foreground text-sm">Нет данных за выбранный период</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map(([name, litres]) => (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate mr-2">{name}</span>
                    <span className="text-muted-foreground shrink-0">{fmtLitres(litres)}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${(litres / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4 text-sm">Общие показатели</h3>
          <div className="space-y-4">
            {[
              { label: "Товаров в каталоге", value: products.length },
              { label: "Литров заказано", value: fmtLitres(totalLitres) },
              {
                label: "Выполнение заявок",
                value: `${filtered.length ? Math.round((completed / filtered.length) * 100) : 0}%`,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
              >
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className="font-semibold text-sm">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
