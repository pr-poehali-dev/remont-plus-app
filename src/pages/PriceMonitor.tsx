import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";

const PRICE_MONITOR_URL = (func2url as Record<string, string>)["price-monitor"];

interface PriceItem {
  key: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  captured_at: string;
}

interface RefItem {
  key: string;
  name: string;
  category: string;
  price: number;
  unit: string;
}

interface AlertItem {
  id: number;
  material_name: string;
  old_price: number;
  new_price: number;
  change_pct: number;
  detected_at: string;
  is_read: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  "Штукатурка": "Layers",
  "Шпаклёвка": "PaintBucket",
  "Грунтовка": "Droplets",
  "Электрика": "Zap",
  "Стяжка": "Hammer",
  "Напольные": "Layers3",
  "Кровля": "Home",
  "Баня": "Flame",
};

export default function PriceMonitor() {
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [reference, setReference] = useState<RefItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snapping, setSnapping] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("Все");
  const [sortBy, setSortBy] = useState<"name" | "change">("change");
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(PRICE_MONITOR_URL + "?action=dashboard");
      const data = await res.json();
      setPrices(data.prices || []);
      setReference(data.reference || []);
      setUnreadAlerts(data.unread_alerts || 0);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    const res = await fetch(PRICE_MONITOR_URL + "?action=alerts");
    const data = await res.json();
    setAlerts(data.alerts || []);
    setShowAlerts(true);
    // пометить как прочитанные
    if (unreadAlerts > 0) {
      await fetch(PRICE_MONITOR_URL, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      setUnreadAlerts(0);
    }
  };

  const makeSnapshot = async () => {
    setSnapping(true);
    try {
      await fetch(PRICE_MONITOR_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      await fetchDashboard();
    } finally {
      setSnapping(false);
    }
  };

  // Объединяем данные: для каждой позиции из reference ищем актуальную цену в snapshots
  const merged = reference.map((ref) => {
    const snap = prices.find((p) => p.key === ref.key);
    const changePct = snap ? ((snap.price - ref.price) / ref.price) * 100 : null;
    return {
      ...ref,
      current_price: snap?.price ?? null,
      captured_at: snap?.captured_at ?? null,
      change_pct: snap ? Math.round(changePct! * 10) / 10 : null,
    };
  });

  const categories = ["Все", ...Array.from(new Set(reference.map((r) => r.category)))];

  const filtered = merged
    .filter((p) => activeCategory === "Все" || p.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === "change") {
        return Math.abs(b.change_pct ?? 0) - Math.abs(a.change_pct ?? 0);
      }
      return a.name.localeCompare(b.name, "ru");
    });

  const risen = merged.filter((p) => p.change_pct !== null && p.change_pct > 0);
  const fallen = merged.filter((p) => p.change_pct !== null && p.change_pct < 0);
  const bigChange = merged.filter((p) => p.change_pct !== null && Math.abs(p.change_pct) >= 10);
  const lastSnap = prices.length ? prices[0].captured_at : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Шапка */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Мониторинг цен</h1>
            <p className="text-sm text-gray-500 mt-1">
              {lastSnap
                ? `Последний снимок: ${new Date(lastSnap).toLocaleString("ru")}`
                : "Снимок ещё не сделан — нажмите «Зафиксировать»"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchAlerts} className="relative">
              <Icon name="Bell" size={16} />
              Уведомления
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadAlerts}
                </span>
              )}
            </Button>
            <Button variant="outline" onClick={fetchDashboard} disabled={loading}>
              <Icon name="RefreshCw" size={16} className={loading ? "animate-spin" : ""} />
              Обновить
            </Button>
            <Button onClick={makeSnapshot} disabled={snapping}>
              <Icon name="Camera" size={16} />
              {snapping ? "Сохраняю..." : "Зафиксировать"}
            </Button>
          </div>
        </div>

        {/* Уведомления об изменениях */}
        {showAlerts && (
          <div className="bg-white rounded-xl border mb-6 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <span className="font-semibold text-gray-800">История изменений цен</span>
              <button onClick={() => setShowAlerts(false)} className="text-gray-400 hover:text-gray-600">
                <Icon name="X" size={16} />
              </button>
            </div>
            {alerts.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">Изменений не обнаружено</div>
            ) : (
              <div className="divide-y max-h-72 overflow-y-auto">
                {alerts.map((a) => (
                  <div key={a.id} className={`flex items-center gap-3 px-4 py-3 ${a.is_read ? "opacity-60" : ""}`}>
                    <Icon
                      name={a.change_pct > 0 ? "TrendingUp" : "TrendingDown"}
                      size={16}
                      className={a.change_pct > 0 ? "text-red-500" : "text-green-500"}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{a.material_name}</div>
                      <div className="text-xs text-gray-400">{new Date(a.detected_at).toLocaleString("ru")}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${a.change_pct > 0 ? "text-red-600" : "text-green-600"}`}>
                        {a.change_pct > 0 ? "+" : ""}{a.change_pct}%
                      </div>
                      <div className="text-xs text-gray-400">{a.old_price.toLocaleString("ru")} → {a.new_price.toLocaleString("ru")} ₽</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-gray-900">{reference.length}</div>
              <div className="text-xs text-gray-500">позиций отслеживается</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-orange-600">{bigChange.length}</div>
              <div className="text-xs text-gray-500">изменились ≥10%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">{risen.length}</div>
              <div className="text-xs text-gray-500">выросли в цене</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{fallen.length}</div>
              <div className="text-xs text-gray-500">снизились в цене</div>
            </CardContent>
          </Card>
        </div>

        {/* Фильтры */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary"
              }`}
            >
              {cat !== "Все" && (
                <Icon name={CATEGORY_ICONS[cat] || "Box"} size={12} className="inline mr-1" />
              )}
              {cat}
            </button>
          ))}
          <div className="ml-auto flex gap-1">
            <button
              onClick={() => setSortBy("change")}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                sortBy === "change" ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 text-gray-500"
              }`}
            >
              По изменению
            </button>
            <button
              onClick={() => setSortBy("name")}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                sortBy === "name" ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 text-gray-500"
              }`}
            >
              По алфавиту
            </button>
          </div>
        </div>

        {/* Таблица */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Icon name="Loader2" size={24} className="animate-spin mr-2" />
            Загружаю цены...
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Материал</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Категория</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Эталон</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Снимок</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Δ %</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const up = item.change_pct !== null && item.change_pct > 0;
                  const down = item.change_pct !== null && item.change_pct < 0;
                  const big = item.change_pct !== null && Math.abs(item.change_pct) >= 10;

                  return (
                    <tr
                      key={item.key}
                      className={`border-b last:border-0 hover:bg-gray-50 transition-colors ${
                        big ? (up ? "bg-red-50" : "bg-green-50") : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-400">{item.unit}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge variant="outline" className="text-xs font-normal">
                          <Icon name={CATEGORY_ICONS[item.category] || "Box"} size={10} className="mr-1" />
                          {item.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {item.price.toLocaleString("ru")} ₽
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.current_price !== null ? (
                          <span className="font-medium text-gray-900">
                            {item.current_price.toLocaleString("ru")} ₽
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.change_pct !== null ? (
                          <span className={`font-semibold flex items-center justify-end gap-1 ${
                            up ? "text-red-600" : down ? "text-green-600" : "text-gray-400"
                          }`}>
                            <Icon
                              name={up ? "TrendingUp" : down ? "TrendingDown" : "Minus"}
                              size={14}
                            />
                            {up ? "+" : ""}{item.change_pct}%
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">нет данных</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                <Icon name="PackageSearch" size={32} className="mx-auto mb-2 opacity-30" />
                <p>Нет позиций в этой категории</p>
              </div>
            )}
          </div>
        )}

        {/* Подсказка по регулярности */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
          <Icon name="Info" size={18} className="text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <strong>Регулярный мониторинг:</strong> нажимайте «Зафиксировать» раз в неделю после проверки цен на Лемана Про.
            При изменении ≥10% система создаёт уведомление, и вы видите, какие позиции нужно пересчитать в калькуляторах.
          </div>
        </div>
      </div>
    </div>
  );
}
