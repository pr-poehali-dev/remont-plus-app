import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  REGIONS, APARTMENT_TYPES, RENOVATION_LEVELS,
  FLOOR_TYPES, CEILING_TYPES, BATHROOM_LEVELS,
} from "@/components/calculator/turnkey/TurnkeyTypes";
import type { TurnkeyConfig } from "@/components/calculator/turnkey/TurnkeyTypes";
import { calcTurnkeyPrice, calcTurnkeyMaterials, fmt } from "@/components/calculator/turnkey/turnkeyUtils";
import PrintPaywall from "@/components/print/PrintPaywall";
import UniversalDocView from "@/components/print/UniversalDocView";
import type { UniversalDocData } from "@/components/print/UniversalDocView";

interface PrintState {
  cfg: TurnkeyConfig;
  markupPct: number;
  regionId: string;
  totalSum: number;
  docNum: string;
  date: string;
  docType: "smeta" | "kp";
  customer?: string;
  contractor?: string;
  address?: string;
  phone?: string;
  email?: string;
  validDays?: string;
  inn?: string;
  kpp?: string;
}

export default function TurnkeyPrint() {
  const location = useLocation();
  const state: PrintState | null = location.state ?? (() => {
    try { return JSON.parse(sessionStorage.getItem("turnkey_print_state") || "null"); } catch { return null; }
  })();

  useEffect(() => {
    if (state) {
      const isKp = state.docType === "kp";
      document.title = isKp
        ? `КП-${state.docNum} (Под ключ) от ${state.date}`
        : `Смета под ключ № С-${state.docNum} от ${state.date}`;
    }
  }, [state]);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        <p>Данные не переданы. Вернитесь в{" "}
          <a href="/turnkey" className="text-emerald-600 underline">калькулятор</a>.
        </p>
      </div>
    );
  }

  const {
    cfg, markupPct, regionId, docNum, date, docType,
    customer, contractor, address, phone, email, validDays, inn, kpp,
  } = state;
  const isKp = docType === "kp";

  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[3];
  const aptType = APARTMENT_TYPES.find(a => a.id === cfg.apartmentType);
  const level = RENOVATION_LEVELS.find(l => l.id === cfg.renovationLevel);
  const floorType = FLOOR_TYPES.find(f => f.id === cfg.floorType);
  const ceilingType = CEILING_TYPES.find(c => c.id === cfg.ceilingType);
  const bathroomLevel = BATHROOM_LEVELS.find(b => b.id === cfg.bathroomLevel);

  const bd = calcTurnkeyPrice(cfg, regionId, markupPct);
  const totalSum = bd.total;
  const materials = calcTurnkeyMaterials(cfg, bd, regionId);

  const rows: { label: string; qty: number | string; unit: string; price: string; total: number }[] = [
    cfg.demolitionIncluded && bd.demolitionCost > 0 && {
      label: "Демонтаж старой отделки",
      qty: cfg.totalAreaM2, unit: "м²", price: "1 600 ₽/м²", total: bd.demolitionCost,
    },
    cfg.electricsIncluded && bd.electricsCost > 0 && {
      label: "Электромонтаж (разводка, розетки, выключатели)",
      qty: cfg.totalAreaM2, unit: "м²", price: "1 300 ₽/м²", total: bd.electricsCost,
    },
    cfg.plumbingIncluded && bd.plumbingCost > 0 && {
      label: "Сантехника (разводка труб ХВС/ГВС/канализация)",
      qty: cfg.totalAreaM2, unit: "м²", price: "—", total: bd.plumbingCost,
    },
    cfg.plastersIncluded && bd.plasterCost > 0 && {
      label: "Штукатурка стен + стяжка пола",
      qty: cfg.totalAreaM2, unit: "м²", price: "—", total: bd.plasterCost,
    },
    cfg.floorsIncluded && bd.floorsCost > 0 && {
      label: `Напольное покрытие: ${floorType?.label}`,
      qty: cfg.totalAreaM2, unit: "м²", price: `${fmt(floorType?.priceM2 ?? 0)} ₽/м²`, total: bd.floorsCost,
    },
    cfg.ceilingsIncluded && bd.ceilingsCost > 0 && {
      label: `Потолки: ${ceilingType?.label}`,
      qty: cfg.totalAreaM2, unit: "м²", price: `${fmt(ceilingType?.priceM2 ?? 0)} ₽/м²`, total: bd.ceilingsCost,
    },
    cfg.bathroomIncluded && bd.bathroomsCost > 0 && {
      label: `Санузлы под ключ: ${bathroomLevel?.label}`,
      qty: cfg.bathroomCount, unit: "шт.", price: `${fmt(bathroomLevel?.pricePerUnit ?? 0)} ₽/шт.`, total: bd.bathroomsCost,
    },
    cfg.kitchenIncluded && bd.kitchenCost > 0 && {
      label: "Монтаж кухонного гарнитура",
      qty: 1, unit: "компл.", price: "16 000 ₽", total: bd.kitchenCost,
    },
    cfg.doorsIncluded && bd.doorsCost > 0 && {
      label: "Установка межкомнатных дверей",
      qty: cfg.doorsCount, unit: "шт.", price: "12 000 ₽/шт.", total: bd.doorsCost,
    },
    cfg.windowslopeIncluded && bd.windowSlopesCost > 0 && {
      label: "Откосы на окна и балконные двери",
      qty: cfg.balconyCount + Math.ceil(cfg.totalAreaM2 / 18), unit: "проём", price: "3 200 ₽", total: bd.windowSlopesCost,
    },
    cfg.furnitureAssembly && bd.furnitureCost > 0 && {
      label: "Сборка и навеска мебели",
      qty: cfg.totalAreaM2, unit: "м²", price: "500 ₽/м²", total: bd.furnitureCost,
    },
    cfg.cleaningIncluded && bd.cleaningCost > 0 && {
      label: "Финальная уборка после ремонта",
      qty: cfg.totalAreaM2, unit: "м²", price: "180 ₽/м²", total: bd.cleaningCost,
    },
    cfg.foremanIncluded && bd.foremanCost > 0 && {
      label: `Прораб — технический надзор и координация`,
      qty: `${cfg.foremanPct}%`, unit: "от работ+материалов", price: `база ${fmt(bd.subtotal - bd.foremanCost - bd.supplierCost)} ₽`, total: bd.foremanCost,
    },
    cfg.supplierIncluded && bd.supplierCost > 0 && {
      label: `Снабженец — закупка и логистика материалов`,
      qty: `${cfg.supplierPct}%`, unit: "от материалов", price: `база ${fmt(bd.materialsCost)} ₽`, total: bd.supplierCost,
    },
  ].filter(Boolean) as { label: string; qty: number | string; unit: string; price: string; total: number }[];

  if (docType === "ks2" || docType === "ks3" || docType === "act" || docType === "contract") {
    const universalItems = rows.map((row, idx) => ({
      num: idx + 1,
      name: row.label,
      unit: row.unit,
      qty: typeof row.qty === "number" ? row.qty : 1,
      pricePerUnit: typeof row.qty === "number" && row.qty > 0 ? Math.round(row.total / row.qty) : row.total,
      total: row.total,
    }));
    const grandTotal = totalSum;
    const docData: UniversalDocData = {
      docType,
      docNum,
      date,
      startDate: (state as Record<string, unknown>).startDate ? new Date((state as Record<string, unknown>).startDate as string).toLocaleDateString("ru-RU") : undefined,
      endDate: (state as Record<string, unknown>).endDate ? new Date((state as Record<string, unknown>).endDate as string).toLocaleDateString("ru-RU") : undefined,
      contractNum: (state as Record<string, unknown>).contractNum as string | undefined,
      contractDate: (state as Record<string, unknown>).contractDate ? new Date((state as Record<string, unknown>).contractDate as string).toLocaleDateString("ru-RU") : undefined,
      customer: { name: customer || "", phone: phone || undefined, email: email || undefined },
      contractor: { name: contractor || "", inn: inn || undefined, phone: phone || undefined, email: email || undefined },
      objectAddress: address || "",
      items: universalItems,
      totalWorks: Math.round(grandTotal * 0.45),
      totalMaterials: Math.round(grandTotal * 0.55),
      grandTotal,
      advancePct: parseFloat((state as Record<string, unknown>).advancePct as string || "30"),
      warrantyMonths: parseInt((state as Record<string, unknown>).warrantyMonths as string || "12"),
      projectTitle: "Ремонт под ключ",
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
          @page { margin: 15mm 15mm; size: A4; }
        }
        body { font-family: Arial, sans-serif; background: #f9fafb; }
      `}</style>

      <PrintPaywall>
      <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
        {/* Шапка */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-800">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isKp ? "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ" : "СМЕТА"}
            </h1>
            <p className="text-gray-600 mt-1">Ремонт квартиры под ключ</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="font-bold text-gray-900">{isKp ? `КП-${docNum}` : `№ С-${docNum}`}</p>
            <p>от {date}</p>
            {isKp && validDays && <p className="text-xs text-gray-400">Действует {validDays} дней</p>}
          </div>
        </div>

        {/* Стороны */}
        {(customer || contractor) && (
          <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Заказчик</p>
              <p className="font-medium">{customer || "—"}</p>
              {address && <p className="text-gray-500 text-xs mt-0.5">{address}</p>}
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Подрядчик</p>
              <p className="font-medium">{contractor || "—"}</p>
              {phone && <p className="text-gray-500 text-xs">{phone}</p>}
              {email && <p className="text-gray-500 text-xs">{email}</p>}
              {inn && <p className="text-gray-500 text-xs">ИНН: {inn}{kpp ? ` · КПП: ${kpp}` : ""}</p>}
            </div>
          </div>
        )}

        {/* Параметры объекта */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Параметры объекта</p>
          <div className="grid grid-cols-3 gap-3">
            <div><span className="text-gray-500">Тип: </span><span className="font-medium">{aptType?.label}</span></div>
            <div><span className="text-gray-500">Площадь: </span><span className="font-medium">{cfg.totalAreaM2} м²</span></div>
            <div><span className="text-gray-500">Высота: </span><span className="font-medium">{cfg.ceilingHeightM} м</span></div>
            <div><span className="text-gray-500">Санузлов: </span><span className="font-medium">{cfg.bathroomCount}</span></div>
            <div><span className="text-gray-500">Балконов: </span><span className="font-medium">{cfg.balconyCount}</span></div>
            <div><span className="text-gray-500">Уровень: </span><span className="font-medium">{level?.label}</span></div>
            <div><span className="text-gray-500">Регион: </span><span className="font-medium">{region.label}</span></div>
          </div>
        </div>

        {/* Таблица работ */}
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Состав работ</h2>
        <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden mb-6">
          <thead>
            <tr className="bg-gray-50 text-gray-500">
              <th className="text-left px-3 py-2 font-medium w-6">№</th>
              <th className="text-left px-3 py-2 font-medium">Вид работ</th>
              <th className="text-center px-3 py-2 font-medium">Кол-во</th>
              <th className="text-center px-3 py-2 font-medium">Ед.</th>
              <th className="text-right px-3 py-2 font-medium">Цена</th>
              <th className="text-right px-3 py-2 font-medium">Итого</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                <td className="px-3 py-1.5">{row.label}</td>
                <td className="px-3 py-1.5 text-center">{row.qty}</td>
                <td className="px-3 py-1.5 text-center text-gray-500">{row.unit}</td>
                <td className="px-3 py-1.5 text-right">{row.price}</td>
                <td className="px-3 py-1.5 text-right font-medium">{fmt(row.total)} ₽</td>
              </tr>
            ))}

            {/* Наценка */}
            {markupPct > 0 && bd.markupAmount > 0 && (
              <tr className="border-t border-gray-100 text-orange-600">
                <td />
                <td className="px-3 py-1.5">Наценка {markupPct}%</td>
                <td colSpan={3} />
                <td className="px-3 py-1.5 text-right font-medium">+ {fmt(bd.markupAmount)} ₽</td>
              </tr>
            )}

            {/* Итого */}
            <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
              <td />
              <td className="px-3 py-2">ИТОГО ПО СМЕТЕ</td>
              <td colSpan={3} className="px-3 py-2 text-xs font-normal text-gray-500 text-center">
                {fmt(cfg.totalAreaM2 > 0 ? Math.round(totalSum / cfg.totalAreaM2) : 0)} ₽/м²
              </td>
              <td className="px-3 py-2 text-right text-emerald-700 text-base">{fmt(totalSum)} ₽</td>
            </tr>
          </tbody>
        </table>

        {cfg.note && (
          <div className="mb-6 p-3 bg-gray-50 rounded-lg text-sm">
            <p className="font-semibold text-gray-700 mb-1">Примечание:</p>
            <p className="text-gray-600">{cfg.note}</p>
          </div>
        )}

        {/* Итого крупно */}
        <div className="border-t-2 border-gray-800 pt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-bold text-gray-900">ИТОГО ПО СМЕТЕ</p>
              <p className="text-sm text-gray-500">{level?.label} · {region.label}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-700">{fmt(totalSum)} ₽</p>
              {markupPct > 0 && <p className="text-xs text-gray-400">Включая наценку {markupPct}%</p>}
              <p className="text-xs text-gray-400">
                {fmt(cfg.totalAreaM2 > 0 ? Math.round(totalSum / cfg.totalAreaM2) : 0)} ₽/м²
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-12 text-sm">
          <div>
            <p className="font-semibold text-gray-700 mb-6">Заказчик</p>
            <div className="border-b border-gray-400 mb-1" />
            <p className="text-xs text-gray-400">подпись / дата</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-6">Исполнитель</p>
            <div className="border-b border-gray-400 mb-1" />
            <p className="text-xs text-gray-400">подпись / дата</p>
          </div>
        </div>

        {/* Перечень материалов */}
        {materials.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-200" style={{ pageBreakBefore: "always" }}>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Перечень материалов</h2>
            <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left px-3 py-2 font-medium w-6">№</th>
                  <th className="text-left px-3 py-2 font-medium">Наименование</th>
                  <th className="text-left px-3 py-2 font-medium">Спецификация</th>
                  <th className="text-center px-3 py-2 font-medium">Кол-во</th>
                  <th className="text-center px-3 py-2 font-medium">Ед.</th>
                  <th className="text-right px-3 py-2 font-medium">Цена</th>
                  <th className="text-right px-3 py-2 font-medium">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m, i) => (
                  <tr key={i} className={`border-t border-gray-100 ${m.isConsumable ? "text-gray-400" : ""} ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                    <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-1.5">{m.name}</td>
                    <td className="px-3 py-1.5 text-gray-400">{m.spec ?? "—"}</td>
                    <td className="px-3 py-1.5 text-center">{m.qty}</td>
                    <td className="px-3 py-1.5 text-center text-gray-500">{m.unit}</td>
                    <td className="px-3 py-1.5 text-right">{fmt(m.pricePerUnit)} ₽</td>
                    <td className="px-3 py-1.5 text-right font-medium">{fmt(m.total)} ₽</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                  <td colSpan={6} className="px-3 py-2">Итого материалы</td>
                  <td className="px-3 py-2 text-right text-emerald-700">
                    {fmt(materials.reduce((s, m) => s + m.total, 0))} ₽
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-2">* Серым выделены расходные материалы и комплектующие</p>
          </div>
        )}
      </div>
      </PrintPaywall>
    </>
  );
}