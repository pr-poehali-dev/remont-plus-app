import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { DEFAULT_TURNKEY_CONFIG } from "@/components/calculator/turnkey/TurnkeyTypes";
import { calcTurnkey } from "@/components/calculator/turnkey/turnkeyEngine";

const EXAMPLE_AREA = 54;
const EXAMPLE_REGION = "samara";

const ROWS: { key: string; label: string }[] = [
  { key: "demolition", label: "Демонтажные работы" },
  { key: "debris", label: "Вывоз строительного мусора" },
  { key: "electrics", label: "Электрика: разводка, щит, розетки" },
  { key: "plumbing", label: "Сантехника: разводка труб" },
  { key: "plaster", label: "Штукатурка стен, стяжка пола" },
  { key: "floors", label: "Полы: ламинат 33 класс" },
  { key: "ceilings", label: "Потолки: выравнивание и покраска" },
  { key: "bathrooms", label: "Санузел под ключ" },
  { key: "doors", label: "Межкомнатные двери с установкой" },
  { key: "windowSlopes", label: "Откосы на окна" },
  { key: "cleaning", label: "Финальная уборка" },
];

const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU");

export default function HomeEstimateExample() {
  const navigate = useNavigate();

  const { rows, worksTotal, materialsTotal, total } = useMemo(() => {
    const cfg = {
      ...DEFAULT_TURNKEY_CONFIG,
      apartmentType: "2room",
      totalAreaM2: EXAMPLE_AREA,
      kitchenAreaM2: 10,
      renovationLevel: "standard",
      bathroomCount: 1,
      doorsCount: 4,
    };
    const e = calcTurnkey(cfg, EXAMPLE_REGION, 0);
    const bt = e.blockTotals as Record<string, number>;
    return {
      rows: ROWS.map(r => ({ ...r, value: bt[r.key] ?? 0 })).filter(r => r.value > 0),
      worksTotal: e.worksTotal,
      materialsTotal: e.materialsTotal,
      total: e.total,
    };
  }, []);

  return (
    <section className="bg-[#fafaf8] py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Вот что вы получите
          </h2>
          <p className="mt-3 text-gray-500">
            Пример сметы на капитальный ремонт двухкомнатной квартиры {EXAMPLE_AREA} м² в Самаре
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50/70">
            <div className="flex items-center gap-2 min-w-0">
              <Icon name="FileText" size={16} className="text-amber-500 shrink-0" />
              <span className="text-sm font-semibold text-gray-700 truncate">
                Смета на ремонт · {EXAMPLE_AREA} м² · Самара
              </span>
            </div>
            <span className="text-xs text-gray-400 shrink-0 hidden sm:block">капитальный ремонт</span>
          </div>

          <div className="divide-y divide-gray-100">
            {rows.map(r => (
              <div key={r.key} className="flex items-center justify-between gap-4 px-5 py-2.5">
                <span className="text-sm text-gray-700">{r.label}</span>
                <span className="text-sm font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                  {fmt(r.value)} ₽
                </span>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 bg-gray-50/70 border-t border-gray-100 space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Работы</span>
              <span className="font-semibold text-gray-700 tabular-nums">{fmt(worksTotal)} ₽</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Материалы</span>
              <span className="font-semibold text-gray-700 tabular-nums">{fmt(materialsTotal)} ₽</span>
            </div>
            <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-gray-200">
              <span className="font-bold text-gray-900">Итого</span>
              <span className="text-2xl font-extrabold text-gray-900 tabular-nums">{fmt(total)} ₽</span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          {[
            { icon: "ListChecks", text: "Каждая позиция с ценой — видно, из чего складывается сумма" },
            { icon: "Columns2", text: "Отдельно работы, отдельно материалы" },
            { icon: "Download", text: "Можно скачать в PDF и показать подрядчику" },
          ].map(c => (
            <div key={c.text} className="flex items-start gap-2.5">
              <Icon name={c.icon} size={17} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">{c.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate(`/turnkey?area=${EXAMPLE_AREA}&level=standard&region=${EXAMPLE_REGION}`)}
            className="h-13 px-7 py-3.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold transition inline-flex items-center gap-2"
          >
            <Icon name="Calculator" size={18} />
            Рассчитать для своей квартиры
          </button>
        </div>
      </div>
    </section>
  );
}
