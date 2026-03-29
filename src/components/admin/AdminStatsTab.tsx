import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import type { Material } from "./AdminMaterialsTab";
import type { Product } from "./AdminProductsTab";

interface AdminStatsTabProps {
  materials: Material[];
  products: Product[];
}

interface ABRow {
  event_type: string;
  cnt: number;
}

interface ABResult {
  variant: string;
  impressions: number;
  leads: number;
  dismisses: number;
  conversionRate: string;
}

const CALC_EVENTS_URL = "https://functions.poehali.dev/85d1f13f-3446-417d-85a1-7cc975466f50";

export default function AdminStatsTab({ materials, products }: AdminStatsTabProps) {
  const inactiveCount = materials.filter(m => !m.is_active).length;
  const outOfStockCount = products.filter(p => !p.in_stock).length;
  const categoriesCount = new Set(products.map(p => p.category)).size;

  const [abData, setAbData] = useState<ABResult[]>([]);
  const [abLoading, setAbLoading] = useState(false);
  const [abError, setAbError] = useState("");

  const loadABResults = async () => {
    setAbLoading(true);
    setAbError("");
    try {
      const adminPassword = localStorage.getItem("admin_password") || "admin2025";
      const res = await fetch(CALC_EVENTS_URL, {
        headers: { "X-Admin-Token": adminPassword },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();

      const abRows: ABRow[] = (data.by_calc || [])
        .filter((r: { calc_type: string }) => r.calc_type.startsWith("ab:"))
        .flatMap((r: { calc_type: string; opens?: number; interacts?: number; result_views?: number; export_clicks?: number; form_opens?: number; calcs?: number; leads?: number }) => {
          return [];
        });

      void abRows;

      const allEvents: Record<string, number> = {};
      (data.by_calc || []).forEach((r: Record<string, unknown>) => {
        if (typeof r.calc_type === "string" && r.calc_type.startsWith("ab:")) {
          Object.entries(r).forEach(([key, val]) => {
            if (key !== "calc_type" && typeof val === "number") {
              allEvents[key] = (allEvents[key] || 0) + val;
            }
          });
        }
      });

      setAbData([]);
    } catch {
      setAbError("Не удалось загрузить данные. Проверьте токен администратора.");
    } finally {
      setAbLoading(false);
    }
  };

  const [abDirect, setAbDirect] = useState<ABResult[]>([]);

  const loadABDirect = async () => {
    setAbLoading(true);
    setAbError("");
    try {
      const res = await fetch(CALC_EVENTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calc_type: "ab:_query", event_type: "open" }),
      });
      void res;
    } catch {
      // ignore
    }

    try {
      const adminPassword = localStorage.getItem("admin_password") || "admin2025";
      const res = await fetch(CALC_EVENTS_URL + "?ab_report=1", {
        headers: { "X-Admin-Token": adminPassword },
      });
      if (!res.ok) throw new Error("err");
      const data = await res.json();

      if (data.ab_report) {
        setAbDirect(data.ab_report);
      }
    } catch {
      setAbError("Не удалось загрузить A/B отчёт");
    } finally {
      setAbLoading(false);
    }
  };

  useEffect(() => {
    loadABDirect();
  }, []);

  void loadABResults;
  void abData;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Статистика каталога</h2>
        <p className="text-sm text-gray-500">Общий срез по содержимому — материалам и товарам в системе.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Материалов</h3>
            <Icon name="Layers" className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold">{materials.length}</div>
          <p className="text-xs text-gray-500 mt-1">Активных: {materials.filter(m => m.is_active).length}</p>
          {inactiveCount > 0 && (
            <p className="text-xs text-amber-500 mt-1">Скрытых: {inactiveCount}</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Товаров</h3>
            <Icon name="Package" className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold">{products.length}</div>
          <p className="text-xs text-gray-500 mt-1">Всего позиций в каталоге</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">В наличии</h3>
            <Icon name="CheckCircle2" className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold">{products.filter(p => p.in_stock).length}</div>
          {outOfStockCount > 0 && (
            <p className="text-xs text-red-400 mt-1">Нет в наличии: {outOfStockCount}</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Категорий</h3>
            <Icon name="FolderOpen" className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold">{categoriesCount}</div>
          <p className="text-xs text-gray-500 mt-1">Уникальных групп товаров</p>
        </Card>
      </div>

      {/* A/B Test Results */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <Icon name="FlaskConical" size={18} className="text-violet-500" />
              A/B тест: Попап vs Inline-форма
            </h2>
            <p className="text-sm text-gray-500">
              Группа A — видит попап через 15 сек. Группа B — без попапа, только inline-форма в калькуляторе.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadABDirect} disabled={abLoading}>
            {abLoading ? <Icon name="Loader2" size={14} className="animate-spin mr-1" /> : <Icon name="RefreshCw" size={14} className="mr-1" />}
            Обновить
          </Button>
        </div>

        {abError && (
          <p className="text-sm text-red-500 mb-3 flex items-center gap-1">
            <Icon name="AlertCircle" size={14} />
            {abError}
          </p>
        )}

        {abDirect.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {abDirect.map((row) => {
              const isA = row.variant === "A";
              return (
                <Card key={row.variant} className={`p-5 border-2 ${isA ? "border-blue-200 bg-blue-50/50" : "border-emerald-200 bg-emerald-50/50"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${isA ? "bg-blue-500" : "bg-emerald-500"}`}>
                      {row.variant}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{isA ? "Попап (15 сек)" : "Без попапа (inline)"}</p>
                      <p className="text-xs text-gray-500">{isA ? "Показываем всплывающее окно" : "Только форма в калькуляторе"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{row.impressions}</p>
                      <p className="text-xs text-gray-500">Показов</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{row.leads}</p>
                      <p className="text-xs text-gray-500">Заявок</p>
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${parseFloat(row.conversionRate) > 0 ? "text-violet-600" : "text-gray-400"}`}>
                        {row.conversionRate}%
                      </p>
                      <p className="text-xs text-gray-500">Конверсия</p>
                    </div>
                  </div>
                  {row.dismisses > 0 && (
                    <p className="text-xs text-gray-400 mt-2 text-center">Закрыли попап: {row.dismisses}</p>
                  )}
                </Card>
              );
            })}
          </div>
        ) : !abLoading ? (
          <Card className="p-8 text-center">
            <Icon name="BarChart3" size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Данных пока нет. Результаты появятся после накопления трафика.</p>
            <p className="text-xs text-gray-400 mt-1">Обычно нужно 500–1000 посетителей для статистически значимых результатов.</p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}