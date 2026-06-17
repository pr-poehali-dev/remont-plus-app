import {
  HOUSE_STYLES, HOUSE_LAYOUTS, FRAME_WALL_TECHS, FRAME_INSULATIONS,
  FOUNDATION_TYPES, ROOF_TYPES, ROOFING_MATERIALS, FACADE_TYPES,
  WINDOW_TYPES, HEATING_TYPES, INTERIOR_FINISHES,
} from "@/components/calculator/framehouse/FrameHouseTypes";
import type { FrameHouseConfig } from "@/components/calculator/framehouse/FrameHouseTypes";
import type { FrameHouseBreakdown } from "@/components/calculator/framehouse/frameHouseUtils";
import { fmt, calcFrameHouseMaterials, calcFrameHouseWorks } from "@/components/calculator/framehouse/frameHouseUtils";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";
import UniversalDocView from "@/components/print/UniversalDocView";
import type { UniversalDocData } from "@/components/print/UniversalDocView";
import { usePrintState } from "@/hooks/usePrintState";
import PrintEmptyState from "@/components/print/PrintEmptyState";

interface PrintState {
  config: FrameHouseConfig;
  regionId: string;
  markupPct: number;
  bd: FrameHouseBreakdown;
  docNum: string;
  date: string;
  docType: "smeta" | "kp" | "ks2" | "ks3" | "act" | "contract";
  customer?: string;
  contractor?: string;
  address?: string;
  phone?: string;
  email?: string;
  inn?: string;
  validDays?: string;
  startDate?: string;
  endDate?: string;
  contractNum?: string;
  contractDate?: string;
  advancePct?: string;
  warrantyMonths?: string;
}

export default function FrameHousePrint() {
  const state = usePrintState<PrintState>({
    storageKey: "framehouse_print_state",
    buildTitle: (s) => {
      const ps = s as unknown as PrintState;
      return ps.docType === "kp"
        ? `КП-${ps.docNum} (Каркасный дом) от ${ps.date}`
        : `Смета на строительство каркасного дома № КД-${ps.docNum} от ${ps.date}`;
    },
  });

  if (!state) {
    return <PrintEmptyState backHref="/framehouse" calculatorName="калькулятор каркасного дома" accentClass="text-green-600" />;
  }

  const { config, regionId, bd, docNum, date, docType, customer, contractor, address, phone, email, inn, validDays,
    startDate, endDate, contractNum, contractDate, advancePct, warrantyMonths } = state;
  const isKp = docType === "kp";
  const style = HOUSE_STYLES[config.style];
  const layout = HOUSE_LAYOUTS[config.layout];

  // Детальные позиции. Наценка + прораб + снабженец «зашиваются» в цены позиций
  // через коэффициент k = total / (работы+материалы), отдельными строками не показываются.
  const rawWorks = calcFrameHouseWorks(config, bd, regionId);
  const rawMaterialsAll = calcFrameHouseMaterials(config, bd, regionId).filter((i: MaterialItem) => !i.isWork);
  const baseSum =
    rawWorks.reduce((s, w) => s + w.total, 0) +
    rawMaterialsAll.reduce((s, m) => s + m.total, 0);
  const k = baseSum > 0 ? bd.total / baseSum : 1;
  const scale = (arr: MaterialItem[]) =>
    arr.map((i) => {
      const pricePerUnit = Math.round(i.pricePerUnit * k);
      return { ...i, pricePerUnit, total: Math.round(pricePerUnit * i.qty) };
    });
  const works = scale(rawWorks);
  const materials = scale(rawMaterialsAll.filter((i) => !i.isConsumable));
  const consumables = scale(rawMaterialsAll.filter((i) => i.isConsumable));
  const worksSum = works.reduce((s, w) => s + w.total, 0);
  const matSum = materials.reduce((s, m) => s + m.total, 0);
  const consSum = consumables.reduce((s, m) => s + m.total, 0);

  function fmtN(n: number) {
    if (Number.isInteger(n)) return n.toLocaleString("ru-RU");
    return n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
  }

  // Для КС-2, КС-3, Акта и Договора — универсальный рендер
  if (docType === "ks2" || docType === "ks3" || docType === "act" || docType === "contract") {
    const universalItems = [...works, ...materials, ...consumables].map((item, idx) => ({
      num: idx + 1,
      name: item.name,
      unit: item.unit,
      qty: item.qty,
      pricePerUnit: item.pricePerUnit,
      total: item.total,
    }));
    const totalWorks = worksSum;
    const totalMaterials = matSum + consSum;
    const docData: UniversalDocData = {
      docType,
      docNum,
      date,
      startDate: startDate ? new Date(startDate).toLocaleDateString("ru-RU") : undefined,
      endDate: endDate ? new Date(endDate).toLocaleDateString("ru-RU") : undefined,
      contractNum,
      contractDate: contractDate ? new Date(contractDate).toLocaleDateString("ru-RU") : undefined,
      customer: { name: customer || "", inn: undefined, address: undefined, phone: undefined, email: undefined },
      contractor: { name: contractor || "", inn: inn || undefined, address: undefined, phone: phone || undefined, email: email || undefined },
      objectAddress: address || "",
      items: universalItems,
      totalWorks,
      totalMaterials,
      grandTotal: bd.total,
      advancePct: parseFloat(advancePct || "30"),
      warrantyMonths: parseInt(warrantyMonths || "12"),
      projectTitle: "Строительство каркасного дома под ключ",
    };
    return (
      <>
        <UniversalDocView data={docData} />
      </>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          @page { margin: 15mm 15mm; size: A4 portrait; }
        }
        body { font-family: 'Arial', sans-serif; background: #f9fafb; font-size: 13px; }
        table { border-collapse: collapse; }
        th, td { border: 1px solid #e5e7eb; }
      `}</style>

      <>
      <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
        {/* Шапка */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-800">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
              {isKp ? "Коммерческое предложение" : "Смета"}
            </h1>
            <p className="text-gray-600 mt-1 text-sm">Строительство каркасного дома под ключ</p>
            {style && (
              <p className="text-gray-500 text-xs mt-0.5">{style.emoji} {style.label} · {layout?.label} · {config.totalArea} м² · {config.floors} эт.</p>
            )}
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="font-bold text-gray-900 text-base">{isKp ? `КП-${docNum}` : `№ КД-${docNum}`}</p>
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
              ["Стиль дома", style?.label],
              ["Планировка", layout?.label],
              ["Общая площадь", `${config.totalArea} м²`],
              ["Этажей", String(config.floors)],
              ["Высота потолков", `${config.wallHeight} м`],
              ["Технология каркаса", FRAME_WALL_TECHS[config.wallTech]?.label],
              ["Утепление", FRAME_INSULATIONS[config.insulation]?.label],
              ["Фундамент", FOUNDATION_TYPES[config.foundation]?.label],
              ["Тип крыши", ROOF_TYPES[config.roofType]?.label],
              ["Кровля", ROOFING_MATERIALS[config.roofingMaterial]?.label],
              ["Фасад", FACADE_TYPES[config.facade]?.label],
              ["Окна", `${WINDOW_TYPES[config.windowType]?.label}, ${config.windowCount} шт.`],
              ["Отопление", HEATING_TYPES[config.heating]?.label],
              ["Внутренняя отделка", INTERIOR_FINISHES[config.interiorFinish]?.label],
            ].filter(([, v]) => v).map(([label, val], i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-400 text-xs">{label}</div>
                <div className="text-gray-800 font-medium text-xs mt-0.5">{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Детальный построчный состав работ и материалов */}
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Состав работ и материалов</h2>
        <table className="w-full text-xs mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-3 py-2">Наименование</th>
              <th className="text-left px-3 py-2 w-28">Характеристика</th>
              <th className="text-center px-3 py-2 w-16">Кол-во</th>
              <th className="text-center px-3 py-2 w-12">Ед.</th>
              <th className="text-right px-3 py-2 w-24">Цена, ₽</th>
              <th className="text-right px-3 py-2 w-28">Сумма, ₽</th>
            </tr>
          </thead>
          <tbody>
            {works.length > 0 && (
              <tr style={{ background: "#fafaf9" }}>
                <td colSpan={6} className="px-3 py-1 font-bold text-gray-700 uppercase text-[10px] tracking-wider">Работы</td>
              </tr>
            )}
            {works.map((w, i) => (
              <tr key={`w${i}`} style={{ background: i % 2 === 0 ? "white" : "#f9fafb" }}>
                <td className="px-3 py-1.5 text-gray-800">{w.name}</td>
                <td className="px-3 py-1.5 text-gray-400 text-[10px]">{w.spec ?? ""}</td>
                <td className="px-3 py-1.5 text-center text-gray-600 tabular-nums">{fmtN(w.qty)}</td>
                <td className="px-3 py-1.5 text-center text-gray-400">{w.unit}</td>
                <td className="px-3 py-1.5 text-right text-gray-500 tabular-nums">{fmt(w.pricePerUnit)}</td>
                <td className="px-3 py-1.5 text-right font-semibold text-gray-800 tabular-nums">{fmt(w.total)}</td>
              </tr>
            ))}
            {works.length > 0 && (
              <tr className="bg-gray-50 font-semibold">
                <td className="px-3 py-1.5" colSpan={5}>Итого работы</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{fmt(worksSum)}</td>
              </tr>
            )}

            {materials.length > 0 && (
              <tr style={{ background: "#f0fdf4" }}>
                <td colSpan={6} className="px-3 py-1 font-bold text-green-700 uppercase text-[10px] tracking-wider">Материалы</td>
              </tr>
            )}
            {materials.map((m, i) => (
              <tr key={`m${i}`} style={{ background: i % 2 === 0 ? "white" : "#f9fafb" }}>
                <td className="px-3 py-1.5 text-gray-800">{m.name}</td>
                <td className="px-3 py-1.5 text-gray-400 text-[10px]">{m.spec ?? ""}</td>
                <td className="px-3 py-1.5 text-center text-gray-600 tabular-nums">{fmtN(m.qty)}</td>
                <td className="px-3 py-1.5 text-center text-gray-400">{m.unit}</td>
                <td className="px-3 py-1.5 text-right text-gray-500 tabular-nums">{fmt(m.pricePerUnit)}</td>
                <td className="px-3 py-1.5 text-right font-semibold text-gray-800 tabular-nums">{fmt(m.total)}</td>
              </tr>
            ))}
            {consumables.map((m, i) => (
              <tr key={`c${i}`} className="text-gray-400" style={{ background: i % 2 === 0 ? "white" : "#f9fafb" }}>
                <td className="px-3 py-1.5">{m.name}</td>
                <td className="px-3 py-1.5 text-[10px]">{m.spec ?? "расходник"}</td>
                <td className="px-3 py-1.5 text-center tabular-nums">{fmtN(m.qty)}</td>
                <td className="px-3 py-1.5 text-center">{m.unit}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{fmt(m.pricePerUnit)}</td>
                <td className="px-3 py-1.5 text-right font-semibold tabular-nums">{fmt(m.total)}</td>
              </tr>
            ))}
            {(materials.length > 0 || consumables.length > 0) && (
              <tr className="bg-gray-50 font-semibold">
                <td className="px-3 py-1.5" colSpan={5}>Итого материалы</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{fmt(matSum + consSum)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Итог */}
        <div className="flex justify-end">
          <div className="w-80 space-y-1 text-sm">
            <div className="flex justify-between font-extrabold text-base text-green-700 pt-2 border-t-2 border-gray-300">
              <span>ИТОГО</span>
              <span>{fmt(worksSum + matSum + consSum)} ₽</span>
            </div>
            <div className="text-xs text-gray-400 text-right">
              {fmt((worksSum + matSum + consSum) / Math.max(config.totalArea, 1))} ₽/м²
            </div>
          </div>
        </div>

        {/* Примечание */}
        <div className="mt-8 pt-4 border-t text-xs text-gray-400">
          <p>* Расчёт является ориентировочным. Окончательная стоимость определяется после осмотра участка, согласования проекта и подписания договора.</p>
          <p className="mt-1">* Дата расчёта: {date}.</p>
          {isKp && validDays && <p className="mt-1">* Коммерческое предложение действительно {validDays} дней с даты составления.</p>}
        </div>
      </div>
      </>
    </>
  );
}