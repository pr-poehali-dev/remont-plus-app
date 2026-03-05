import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  REGIONS, HOUSE_STYLES, HOUSE_LAYOUTS, FRAME_WALL_TECHS, FRAME_INSULATIONS,
  FOUNDATION_TYPES, ROOF_TYPES, ROOFING_MATERIALS, FACADE_TYPES,
  WINDOW_TYPES, HEATING_TYPES, INTERIOR_FINISHES,
} from "@/components/calculator/framehouse/FrameHouseTypes";
import type { FrameHouseConfig } from "@/components/calculator/framehouse/FrameHouseTypes";
import type { FrameHouseBreakdown } from "@/components/calculator/framehouse/frameHouseUtils";
import { fmt, calcFrameHouseMaterials } from "@/components/calculator/framehouse/frameHouseUtils";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";
import PrintPaywall from "@/components/print/PrintPaywall";
import UniversalDocView from "@/components/print/UniversalDocView";
import type { UniversalDocData } from "@/components/print/UniversalDocView";

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

const BREAKDOWN_ROWS: { key: keyof FrameHouseBreakdown; label: string; unit: string; getQty: (c: FrameHouseConfig) => string }[] = [
  { key: "foundation",     label: "Фундамент",                      unit: "компл.", getQty: () => "1" },
  { key: "frame",          label: "Каркас стен",                    unit: "м²",     getQty: c => String((Math.sqrt(c.totalArea / c.floors) * 4 * c.wallHeight * c.floors).toFixed(1)) },
  { key: "insulation",     label: "Утепление (стены + перекрытия)", unit: "м²",     getQty: c => String((Math.sqrt(c.totalArea / c.floors) * 4 * c.wallHeight * c.floors + c.totalArea * 1.5).toFixed(1)) },
  { key: "roofStructure",  label: "Кровельная конструкция",         unit: "м²",     getQty: c => String((c.totalArea * 1.25).toFixed(1)) },
  { key: "roofing",        label: "Кровельный материал",            unit: "м²",     getQty: c => String((c.totalArea * 1.25).toFixed(1)) },
  { key: "facade",         label: "Фасад",                          unit: "м²",     getQty: c => String((Math.sqrt(c.totalArea / c.floors) * 4 * c.wallHeight * c.floors).toFixed(1)) },
  { key: "windows",        label: "Окна",                           unit: "шт.",    getQty: c => String(c.windowCount) },
  { key: "floor",          label: "Напольное покрытие",             unit: "м²",     getQty: c => String(c.totalArea) },
  { key: "underfloorHeating", label: "Тёплый пол",                 unit: "м²",     getQty: c => String(c.totalArea) },
  { key: "heating",        label: "Система отопления",              unit: "компл.", getQty: () => "1" },
  { key: "electrical",     label: "Электрика",                      unit: "компл.", getQty: () => "1" },
  { key: "plumbing",       label: "Водоснабжение",                  unit: "компл.", getQty: () => "1" },
  { key: "sewage",         label: "Канализация / Септик",           unit: "компл.", getQty: () => "1" },
  { key: "interiorFinish", label: "Внутренняя отделка",             unit: "м²",     getQty: c => String(c.totalArea) },
  { key: "terrace",        label: "Терраса",                        unit: "м²",     getQty: c => String(c.terraceArea) },
  { key: "garage",         label: "Гараж",                          unit: "м²",     getQty: c => String(c.garageArea) },
  { key: "assembly",       label: "Монтажные и строительные работы",unit: "компл.", getQty: () => "1" },
  { key: "foreman",        label: "Прораб — технический надзор",    unit: "от проекта", getQty: c => `${c.foremanPct}%` },
  { key: "supplier",       label: "Снабженец — закупка материалов", unit: "от матер.", getQty: c => `${c.supplierPct}%` },
];

export default function FrameHousePrint() {
  const location = useLocation();
  const state: PrintState | null = location.state ?? (() => {
    try { return JSON.parse(sessionStorage.getItem("framehouse_print_state") || "null"); } catch { return null; }
  })();

  useEffect(() => {
    if (state) {
      const isKp = state.docType === "kp";
      document.title = isKp
        ? `КП-${state.docNum} (Каркасный дом) от ${state.date}`
        : `Смета на строительство каркасного дома № КД-${state.docNum} от ${state.date}`;
    }
  }, [state]);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        <p>Данные не переданы. Вернитесь в <a href="/framehouse" className="text-green-600 underline">калькулятор каркасного дома</a>.</p>
      </div>
    );
  }

  const { config, regionId, markupPct, bd, docNum, date, docType, customer, contractor, address, phone, email, inn, validDays,
    startDate, endDate, contractNum, contractDate, advancePct, warrantyMonths } = state;
  const isKp = docType === "kp";
  const region = REGIONS[regionId] ?? REGIONS["samara"];
  const style = HOUSE_STYLES[config.style];
  const layout = HOUSE_LAYOUTS[config.layout];

  const rows = BREAKDOWN_ROWS
    .map(row => {
      const value = (bd as Record<string, number>)[row.key as string] ?? 0;
      if (!value) return null;
      const qty = row.getQty(config);
      const unitPrice = qty && parseFloat(qty) > 0 ? value / parseFloat(qty) : value;
      return { ...row, value, qty, unitPrice };
    })
    .filter(Boolean) as NonNullable<(typeof BREAKDOWN_ROWS[0] & { value: number; qty: string; unitPrice: number })>[];

  const matItems = calcFrameHouseMaterials(config, bd, regionId);
  const matMaterials = matItems.filter((i: MaterialItem) => !i.isWork && !i.isConsumable);
  const matConsumables = matItems.filter((i: MaterialItem) => i.isConsumable);
  const matWorks = matItems.filter((i: MaterialItem) => i.isWork);

  function fmtN(n: number) {
    if (Number.isInteger(n)) return n.toLocaleString("ru-RU");
    return n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
  }

  // Для КС-2, КС-3, Акта и Договора — универсальный рендер
  if (docType === "ks2" || docType === "ks3" || docType === "act" || docType === "contract") {
    const allItems = calcFrameHouseMaterials(config, bd, regionId);
    const universalItems = allItems.map((item: MaterialItem, idx: number) => ({
      num: idx + 1,
      name: item.name,
      unit: item.unit,
      qty: item.qty,
      pricePerUnit: item.pricePerUnit,
      total: item.total,
    }));
    const totalWorks = allItems.filter((i: MaterialItem) => i.isWork).reduce((s: number, i: MaterialItem) => s + i.total, 0);
    const totalMaterials = allItems.filter((i: MaterialItem) => !i.isWork).reduce((s: number, i: MaterialItem) => s + i.total, 0);
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
      <PrintPaywall>
        <UniversalDocView data={docData} />
      </PrintPaywall>
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

      <PrintPaywall>
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
              ["Регион", `${region.label} (×${bd.regionCoeff})`],
            ].filter(([, v]) => v).map(([label, val], i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-400 text-xs">{label}</div>
                <div className="text-gray-800 font-medium text-xs mt-0.5">{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Таблица сметы */}
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
          {isKp ? "Состав работ и стоимость" : "Смета работ и материалов"}
        </h2>
        <table className="w-full text-xs mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-3 py-2 w-8">№</th>
              <th className="text-left px-3 py-2">Наименование</th>
              <th className="text-center px-3 py-2 w-16">Ед.</th>
              <th className="text-right px-3 py-2 w-20">Кол-во</th>
              <th className="text-right px-3 py-2 w-28">Цена/ед., ₽</th>
              <th className="text-right px-3 py-2 w-28">Сумма, ₽</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                <td className="px-3 py-1.5 text-gray-700">{row.label}</td>
                <td className="px-3 py-1.5 text-center text-gray-500">{row.unit}</td>
                <td className="px-3 py-1.5 text-right text-gray-500">{row.qty}</td>
                <td className="px-3 py-1.5 text-right text-gray-500">{fmt(row.unitPrice)}</td>
                <td className="px-3 py-1.5 text-right font-medium">{fmt(row.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Итоги */}
        <div className="flex justify-end">
          <div className="w-80 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600 py-1">
              <span>Работы</span>
              <span className="font-medium">{fmt(bd.worksCost)} ₽</span>
            </div>
            <div className="flex justify-between text-gray-600 py-1">
              <span>Материалы</span>
              <span className="font-medium">{fmt(bd.materialsCost)} ₽</span>
            </div>
            {markupPct > 0 && (
              <div className="flex justify-between text-orange-600 py-1">
                <span>Наценка {markupPct}%</span>
                <span>+ {fmt(bd.markupAmount)} ₽</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-base text-green-700 pt-2 border-t-2 border-gray-300">
              <span>ИТОГО</span>
              <span>{fmt(bd.total)} ₽</span>
            </div>
            <div className="text-xs text-gray-400 text-right">
              {fmt(bd.total / Math.max(config.totalArea, 1))} ₽/м²
            </div>
          </div>
        </div>

        {/* Ведомость материалов */}
        <div className="mt-8 pt-6 border-t border-gray-200 page-break">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Ведомость материалов и работ</h2>

          {[
            { label: "МАТЕРИАЛЫ", rows: matMaterials, bg: "#f0fdf4" },
            { label: "РАСХОДНИКИ", rows: matConsumables, bg: "#f0f9ff" },
            { label: "РАБОТЫ", rows: matWorks, bg: "#fafaf9" },
          ].map(section => section.rows.length > 0 && (
            <div key={section.label} className="mb-5">
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6b7280", marginBottom: 4 }}>{section.label}</p>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: section.bg }}>
                    <th className="text-left px-2 py-1.5 font-semibold text-gray-600" style={{ width: "40%" }}>Наименование</th>
                    <th className="text-left px-2 py-1.5 font-semibold text-gray-500" style={{ width: "15%" }}>Характеристика</th>
                    <th className="text-center px-2 py-1.5 font-semibold text-gray-600" style={{ width: "10%" }}>Кол-во</th>
                    <th className="text-center px-2 py-1.5 font-semibold text-gray-600" style={{ width: "8%" }}>Ед.</th>
                    <th className="text-right px-2 py-1.5 font-semibold text-gray-600" style={{ width: "12%" }}>Цена/ед.</th>
                    <th className="text-right px-2 py-1.5 font-semibold text-gray-700" style={{ width: "15%" }}>Сумма, ₽</th>
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((item: MaterialItem, i: number) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f9fafb" }}>
                      <td className="px-2 py-1.5 text-gray-800">{item.name}</td>
                      <td className="px-2 py-1.5 text-gray-400 text-[10px]">{item.spec ?? ""}</td>
                      <td className="px-2 py-1.5 text-center text-gray-600 tabular-nums">{fmtN(item.qty)}</td>
                      <td className="px-2 py-1.5 text-center text-gray-400">{item.unit}</td>
                      <td className="px-2 py-1.5 text-right text-gray-500 tabular-nums">{fmt(item.pricePerUnit)}</td>
                      <td className="px-2 py-1.5 text-right font-semibold text-gray-800 tabular-nums">{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <div className="flex justify-end mt-2">
            <div className="text-xs text-gray-400">
              Итого по ведомости: <span className="font-bold text-green-700 text-sm">{fmt(bd.total)} ₽</span>
            </div>
          </div>
        </div>

        {/* Примечание */}
        <div className="mt-8 pt-4 border-t text-xs text-gray-400">
          <p>* Расчёт является ориентировочным. Окончательная стоимость определяется после осмотра участка, согласования проекта и подписания договора.</p>
          <p className="mt-1">* Цены указаны для региона {region.label}. Дата расчёта: {date}.</p>
          {isKp && validDays && <p className="mt-1">* Коммерческое предложение действительно {validDays} дней с даты составления.</p>}
        </div>
      </div>
      </PrintPaywall>
    </>
  );
}