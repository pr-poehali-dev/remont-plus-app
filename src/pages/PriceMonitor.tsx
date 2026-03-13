import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  current_price: number;
  prev_price: number | null;
  change_pct: number | null;
  checked_at: string | null;
  source: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  "Утепление": "Layers",
  "Кровля": "Home",
  "Дерево": "TreePine",
  "Электрика": "Zap",
  "Сантехника": "Droplets",
  "Баня": "Flame",
  "Расходники": "Package",
};

export default function PriceMonitor() {
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [snapping, setSnapping] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Все");
  const [sortBy, setSortBy] = useState<"name" | "change">("change");

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await fetch(PRICE_MONITOR_URL);
      const data = await res.json();
      setPrices(data.prices || []);
      const dates = (data.prices || [])
        .map((p: PriceItem) => p.checked_at)
        .filter(Boolean);
      if (dates.length) setLastUpdated(dates[0]);
    } finally {
      setLoading(false);
    }
  };

  const makeSnapshot = async () => {
    setSnapping(true);
    try {
      await fetch(PRICE_MONITOR_URL, { method: "POST" });
      await fetchPrices();
    } finally {
      setSnapping(false);
    }
  };

  const categories = ["Все", ...Array.from(new Set(prices.map((p) => p.category)))];

  const filtered = prices
    .filter((p) => activeCategory === "Все" || p.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === "change") {
        const ac = Math.abs(a.change_pct ?? 0);
        const bc = Math.abs(b.change_pct ?? 0);
        return bc - ac;
      }
      return a.name.localeCompare(b.name, "ru");
    });

  const changed = prices.filter((p) => p.change_pct && Math.abs(p.change_pct) >= 5);
  const risen = prices.filter((p) => p.change_pct && p.change_pct > 0);
  const fallen = prices.filter((p) => p.change_pct && p.change_pct < 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Шапка */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Мониторинг цен</h1>
            <p className="text-sm text-gray-500 mt-1">
              {lastUpdated
                ? `Последний снимок: ${new Date(lastUpdated).toLocaleString("ru")}`
                : "Снимок ещё не делался — нажмите «Зафиксировать цены»"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchPrices} disabled={loading}>
              <Icon name="RefreshCw" size={16} className={loading ? "animate-spin" : ""} />
              Обновить
            </Button>
            <Button onClick={makeSnapshot} disabled={snapping}>
              <Icon name="Camera" size={16} />
              {snapping ? "Сохраняю..." : "Зафиксировать цены"}
            </Button>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-gray-900">{prices.length}</div>
              <div className="text-xs text-gray-500">позиций в базе</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-orange-600">{changed.length}</div>
              <div className="text-xs text-gray-500">изменились ≥5%</div>
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
                <Icon
                  name={CATEGORY_ICONS[cat] || "Box"}
                  size={12}
                  className="inline mr-1"
                />
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

        {/* Таблица цен */}
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
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Цена</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Было</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Δ %</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
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
                          <Icon
                            name={CATEGORY_ICONS[item.category] || "Box"}
                            size={11}
                            className="mr-1"
                          />
                          {item.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {item.current_price.toLocaleString("ru")} ₽
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">
                        {item.prev_price ? `${item.prev_price.toLocaleString("ru")} ₽` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.change_pct !== null ? (
                          <span
                            className={`inline-flex items-center gap-0.5 font-medium ${
                              up ? "text-red-600" : down ? "text-green-600" : "text-gray-400"
                            }`}
                          >
                            <Icon
                              name={up ? "TrendingUp" : down ? "TrendingDown" : "Minus"}
                              size={13}
                            />
                            {up ? "+" : ""}
                            {item.change_pct.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Подсказка */}
        <p className="text-xs text-gray-400 mt-4 text-center">
          Нажимайте «Зафиксировать цены» раз в месяц после обновления калькуляторов, чтобы накапливать историю изменений
        </p>
      </div>
    </div>
  );
}