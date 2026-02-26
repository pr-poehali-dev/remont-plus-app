import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  REGIONS, BATH_STYLES, BATH_LAYOUTS,
  WALL_MATERIALS, FOUNDATION_TYPES, ROOF_TYPES, ROOFING_MATERIALS,
  STOVE_TYPES, VENTILATION_TYPES, WALL_FINISHES, FLOOR_MATERIALS,
  INSULATION_MATERIALS, SHELF_MATERIALS,
} from "@/components/calculator/bathhouse/BathHouseTypes";
import type { BathHouseConfig } from "@/components/calculator/bathhouse/BathHouseTypes";
import type { BathHouseBreakdown } from "@/components/calculator/bathhouse/bathHouseUtils";
import { fmt } from "@/components/calculator/bathhouse/bathHouseUtils";

interface PrintState {
  config: BathHouseConfig;
  regionId: string;
  markupPct: number;
  bd: BathHouseBreakdown;
  docNum: string;
  date: string;
  docType: "smeta" | "kp";
  customer?: string;
  contractor?: string;
  address?: string;
  phone?: string;
  email?: string;
  validDays?: string;
}

const BREAKDOWN_ROWS: { key: keyof BathHouseBreakdown; label: string; unit: string; getQty: (c: BathHouseConfig) => string }[] = [
  { key: "foundation",      label: "Фундамент",                       unit: "компл.",  getQty: () => "1" },
  { key: "walls",           label: "Стены (коробка)",                  unit: "м²",      getQty: c => String((Math.sqrt(c.totalArea) * 4 * c.wallHeight).toFixed(1)) },
  { key: "roofStructure",   label: "Кровельная конструкция (стропила, обрешётка)", unit: "м²", getQty: c => String((c.totalArea * 1.25).toFixed(1)) },
  { key: "roofing",         label: "Кровельный материал",              unit: "м²",      getQty: c => String((c.totalArea * 1.25).toFixed(1)) },
  { key: "insulation",      label: "Утепление",                        unit: "м³",      getQty: c => String(((Math.sqrt(c.totalArea) * 4 * c.wallHeight + c.totalArea) * (c.insulationThickness / 1000)).toFixed(2)) },
  { key: "wallFinishSteam", label: "Отделка стен — парная",            unit: "м²",      getQty: c => String((c.steamRoomArea * 4 * 0.8).toFixed(1)) },
  { key: "wallFinishWash",  label: "Отделка стен — мойка",             unit: "м²",      getQty: c => String((c.washRoomArea * 4 * 0.8).toFixed(1)) },
  { key: "wallFinishRest",  label: "Отделка стен — комната отдыха",    unit: "м²",      getQty: c => String(((c.restRoomArea + c.dressingRoomArea) * 4 * 0.8).toFixed(1)) },
  { key: "floor",           label: "Полы",                             unit: "м²",      getQty: c => String(c.totalArea) },
  { key: "stove",           label: "Печь",                             unit: "шт.",     getQty: () => "1" },
  { key: "ventilation",     label: "Вентиляция",                       unit: "компл.",  getQty: () => "1" },
  { key: "shelves",         label: "Полок",                            unit: "компл.",  getQty: () => "1" },
  { key: "windows",         label: "Окна",                             unit: "шт.",     getQty: c => String(c.windowCount) },
  { key: "chimney",         label: "Дымоход (сэндвич-труба)",          unit: "компл.",  getQty: () => "1" },
  { key: "tank",            label: "Бак для воды",                     unit: "шт.",     getQty: () => "1" },
  { key: "terrace",         label: "Терраса",                          unit: "м²",      getQty: c => String(c.terraceArea) },
  { key: "electrical",      label: "Электрика",                        unit: "компл.",  getQty: () => "1" },
  { key: "assembly",        label: "Монтаж и строительные работы",     unit: "компл.",  getQty: () => "1" },
  { key: "foreman",         label: "Прораб — технический надзор и координация", unit: "от работ", getQty: c => `${c.foremanPct}%` },
  { key: "supplier",        label: "Снабженец — закупка материалов и логистика", unit: "от работ", getQty: c => `${c.supplierPct}%` },
];

export default function BathHousePrint() {
  const location = useLocation();
  const state: PrintState | null = location.state ?? null;

  useEffect(() => {
    if (state) {
      const isKp = state.docType === "kp";
      document.title = isKp
        ? `КП-${state.docNum} (Баня) от ${state.date}`
        : `Смета на строительство бани № Б-${state.docNum} от ${state.date}`;
      setTimeout(() => window.print(), 600);
    }
  }, [state]);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        <p>Данные не переданы. Вернитесь в <a href="/bathhouse" className="text-amber-600 underline">калькулятор бани</a>.</p>
      </div>
    );
  }

  const { config, regionId, markupPct, bd, docNum, date, docType, customer, contractor, address, phone, email, validDays } = state;
  const isKp = docType === "kp";
  const region = REGIONS[regionId] ?? REGIONS["moscow"];
  const style = BATH_STYLES[config.style];
  const layout = BATH_LAYOUTS[config.layout];

  const rows = BREAKDOWN_ROWS
    .map(row => {
      const value = (bd as Record<string, number>)[row.key as string] ?? 0;
      if (!value) return null;
      const qty = row.getQty(config);
      const unitPrice = qty && parseFloat(qty) > 0 ? value / parseFloat(qty) : value;
      return { ...row, value, qty, unitPrice };
    })
    .filter(Boolean) as NonNullable<(typeof BREAKDOWN_ROWS[0] & { value: number; qty: string; unitPrice: number })>[];

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          @page { margin: 15mm 15mm; size: A4 portrait; }
          .page-break { page-break-before: always; }
        }
        body { font-family: 'Arial', sans-serif; background: #f9fafb; font-size: 13px; }
        table { border-collapse: collapse; }
        th, td { border: 1px solid #e5e7eb; }
      `}</style>

      {/* Панель управления — только на экране */}
      <div className="no-print bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold text-amber-900">
          {isKp ? `КП-${docNum} (Баня)` : `Смета Б-${docNum}`} от {date}
        </span>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            🖨 Печать / PDF
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            ← Назад
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">

        {/* Шапка документа */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-800">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
              {isKp ? "Коммерческое предложение" : "Смета"}
            </h1>
            <p className="text-gray-600 mt-1 text-sm">Строительство бани под ключ</p>
            {style && (
              <p className="text-gray-500 text-xs mt-0.5">{style.emoji} {style.label} · {layout?.label}</p>
            )}
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="font-bold text-gray-900 text-base">{isKp ? `КП-${docNum}` : `№ Б-${docNum}`}</p>
            <p>от {date}</p>
            {isKp && validDays && <p className="text-xs text-gray-400 mt-1">Действует {validDays} дней</p>}
          </div>
        </div>

        {/* Стороны */}
        {(customer || contractor || address || phone || email) && (
          <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Заказчик</p>
              {customer && <p className="font-semibold">{customer}</p>}
              {address && <p className="text-gray-500 text-xs mt-1">{address}</p>}
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Подрядчик</p>
              {contractor && <p className="font-semibold">{contractor}</p>}
              {phone && <p className="text-gray-500 text-xs mt-1">{phone}</p>}
              {email && <p className="text-gray-500 text-xs">{email}</p>}
            </div>
          </div>
        )}

        {/* Параметры объекта */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Параметры объекта</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {[
              ["Стиль бани", style?.label],
              ["Планировка", layout?.label],
              ["Общая площадь", `${config.totalArea} м²`],
              ["Высота стен", `${config.wallHeight} м`],
              ["Парная", `${config.steamRoomArea} м² (объём ${(config.steamRoomArea * config.wallHeight).toFixed(1)} м³)`],
              ["Мойка", `${config.washRoomArea} м²`],
              ["Комната отдыха", `${config.restRoomArea} м²`],
              config.dressingRoomArea > 0 ? ["Предбанник", `${config.dressingRoomArea} м²`] : null,
              ["Материал стен", WALL_MATERIALS[config.wallMaterial]?.label],
              ["Фундамент", FOUNDATION_TYPES[config.foundation]?.label],
              ["Тип крыши", ROOF_TYPES[config.roofType]?.label],
              ["Кровля", ROOFING_MATERIALS[config.roofingMaterial]?.label],
              ["Утепление", `${INSULATION_MATERIALS[config.insulation]?.label} · ${config.insulationThickness} мм`],
              ["Печь", STOVE_TYPES[config.stoveType]?.label],
              ["Камни", `${config.stoneMass} кг`],
              ["Вентиляция", VENTILATION_TYPES[config.ventilation]?.label],
              ["Отделка парной", WALL_FINISHES[config.wallFinishSteam]?.label],
              ["Отделка мойки", WALL_FINISHES[config.wallFinishWash]?.label],
              ["Отделка КО", WALL_FINISHES[config.wallFinishRest]?.label],
              ["Полы", FLOOR_MATERIALS[config.floorMaterial]?.label],
              ["Полок", `${config.shelfTiers} яруса · ${config.shelfWidth} м · ${SHELF_MATERIALS[config.shelfMaterial]?.label}`],
              ["Окна", `${config.windowCount} шт. · ${config.window_pvc ? "ПВХ" : "деревянные"}`],
              config.terrace ? ["Терраса", `${config.terraceArea} м²`] : null,
              config.tankVolume > 0 ? ["Бак для воды", `${config.tankVolume} л`] : null,
              config.underfloorHeating ? ["Тёплый пол", "Да"] : null,
              ["Дымоход", config.chimney ? "Да (сэндвич-труба)" : "Нет"],
              ["Электрика", config.electricalFull ? "Полная" : config.electricalBasic ? "Базовая" : "Нет"],
              ["Регион", region.label],
            ]
              .filter(Boolean)
              .map((row, i) => (
                <div key={i} className="bg-amber-50 rounded-lg p-2">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wide">{row![0]}</div>
                  <div className="font-semibold text-gray-800 mt-0.5">{row![1]}</div>
                </div>
              ))}
          </div>
        </div>

        {/* Смета */}
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Состав работ и материалов</h2>
        <table className="w-full text-xs mb-6">
          <thead>
            <tr className="bg-amber-50">
              <th className="text-left px-3 py-2 font-semibold text-gray-600">№</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-600">Позиция</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-600">Кол-во</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-600">Ед.</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-600">Цена за ед.</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-600">Итого</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.key} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                <td className="px-3 py-2 text-gray-700">{row.label}</td>
                <td className="px-3 py-2 text-center text-gray-600">{row.qty}</td>
                <td className="px-3 py-2 text-center text-gray-500">{row.unit}</td>
                <td className="px-3 py-2 text-right text-gray-600 tabular-nums">{fmt(row.unitPrice)} ₽</td>
                <td className="px-3 py-2 text-right font-semibold text-gray-800 tabular-nums">{fmt(row.value)} ₽</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Итоги */}
        <div className="ml-auto max-w-sm">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1.5 text-gray-600">Материалы + монтаж</td>
                <td className="py-1.5 text-right font-medium tabular-nums">{fmt((bd.subtotal - bd.foreman - bd.supplier) / bd.regionCoeff)} ₽</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-400 text-xs">Региональный коэффициент ×{bd.regionCoeff}</td>
                <td className="py-1 text-right text-xs text-gray-400">{region.label}</td>
              </tr>
              <tr>
                <td className="py-1.5 text-gray-600">С учётом региона</td>
                <td className="py-1.5 text-right font-medium tabular-nums">{fmt(bd.subtotal - bd.foreman - bd.supplier)} ₽</td>
              </tr>
              {bd.foreman > 0 && (
                <tr>
                  <td className="py-1.5 text-gray-600">Прораб {config.foremanPct}%</td>
                  <td className="py-1.5 text-right font-medium tabular-nums">+ {fmt(bd.foreman)} ₽</td>
                </tr>
              )}
              {bd.supplier > 0 && (
                <tr>
                  <td className="py-1.5 text-gray-600">Снабженец {config.supplierPct}%</td>
                  <td className="py-1.5 text-right font-medium tabular-nums">+ {fmt(bd.supplier)} ₽</td>
                </tr>
              )}
              {markupPct > 0 && (
                <tr>
                  <td className="py-1.5 text-orange-600">Наценка {markupPct}%</td>
                  <td className="py-1.5 text-right font-medium text-orange-600 tabular-nums">+ {fmt(bd.markupAmount)} ₽</td>
                </tr>
              )}
              <tr className="border-t-2 border-amber-400">
                <td className="pt-3 font-bold text-base text-gray-900">ИТОГО</td>
                <td className="pt-3 text-right font-extrabold text-xl text-amber-700 tabular-nums">{fmt(bd.total)} ₽</td>
              </tr>
              <tr>
                <td colSpan={2} className="pt-1 text-center text-xs text-gray-400">
                  {fmt(bd.total / Math.max(config.totalArea, 1))} ₽ за 1 м² · площадь {config.totalArea} м²
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Рекомендации */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Рекомендации</h2>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex gap-2 p-2 bg-orange-50 rounded-lg">
              <span className="text-base">🔥</span>
              <div><span className="font-semibold">Печь:</span> {bd.stoveRecommendation}</div>
            </div>
            <div className="flex gap-2 p-2 bg-blue-50 rounded-lg">
              <span className="text-base">💨</span>
              <div><span className="font-semibold">Вентиляция:</span> {bd.ventRecommendation}</div>
            </div>
            <div className="flex gap-2 p-2 bg-amber-50 rounded-lg">
              <span className="text-base">🛖</span>
              <div><span className="font-semibold">Полок:</span> {bd.shelfRecommendation}</div>
            </div>
          </div>
        </div>

        {/* Примечание */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            * Расчёт выполнен с помощью онлайн-калькулятора АВАНГАРД (avangard-ai.ru) и является ориентировочным.
            Точная стоимость определяется по результатам осмотра объекта, геологии грунта, особенностей проекта и рыночных условий региона.
            Данный документ не является договором. Для заключения договора обратитесь к уполномоченному партнёру.
          </p>
          {isKp && validDays && (
            <p className="text-[11px] text-gray-400 mt-1">
              Коммерческое предложение действительно в течение {validDays} дней с даты составления.
            </p>
          )}
        </div>

        {/* Подписи (только для КП) */}
        {isKp && (customer || contractor) && (
          <div className="mt-10 grid grid-cols-2 gap-10 text-xs text-gray-600">
            <div>
              <p className="font-semibold mb-6">Заказчик:</p>
              <div className="border-b border-gray-400 mb-1" />
              <p>{customer || "___________________"}</p>
            </div>
            <div>
              <p className="font-semibold mb-6">Подрядчик:</p>
              <div className="border-b border-gray-400 mb-1" />
              <p>{contractor || "___________________"}</p>
            </div>
          </div>
        )}

        {/* Нижний колонтитул */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-400">
          <span>АВАНГАРД · avangard-ai.ru</span>
          <span>{date}</span>
        </div>
      </div>
    </>
  );
}