import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  REGIONS, ROOM_TYPES, RENOVATION_LEVELS, SCREED_TYPES, PLASTER_TYPES,
  CEILING_FINISH_TYPES, FLOORING_TYPES, DOOR_TYPES,
} from "@/components/calculator/newbuild/NewbuildTypes";
import type { NewbuildConfig } from "@/components/calculator/newbuild/NewbuildTypes";
import { calcNewbuildPrice, calcNewbuildProjectTotals, calcNewbuildMaterials, fmt } from "@/components/calculator/newbuild/newbuildUtils";
import PrintPaywall from "@/components/print/PrintPaywall";
import UniversalDocView from "@/components/print/UniversalDocView";
import type { UniversalDocData } from "@/components/print/UniversalDocView";

interface PrintState {
  zones: NewbuildConfig[];
  markupPct: number;
  regionId: string;
  totalSum: number;
  foremanIncluded?: boolean;
  foremanPct?: number;
  supplierIncluded?: boolean;
  supplierPct?: number;
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

export default function NewbuildPrint() {
  const location = useLocation();
  const state: PrintState | null = location.state ?? (() => {
    try { return JSON.parse(sessionStorage.getItem("newbuild_print_state") || "null"); } catch { return null; }
  })();

  useEffect(() => {
    if (state) {
      const isKp = state.docType === "kp";
      document.title = isKp
        ? `КП-${state.docNum} (Новостройка) от ${state.date}`
        : `Смета на ремонт № С-${state.docNum} от ${state.date}`;
    }
  }, [state]);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        <p>Данные не переданы. Вернитесь в{" "}
          <a href="/newbuild" className="text-orange-600 underline">калькулятор</a>.
        </p>
      </div>
    );
  }

  const {
    zones, markupPct, regionId, docNum, date, docType,
    foremanIncluded = false, foremanPct = 10,
    supplierIncluded = false, supplierPct = 5,
    customer, contractor, address, phone, email, validDays, inn, kpp,
  } = state;
  const isKp = docType === "kp";
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[3];

  const rowsData = zones.map(z => {
    const roomType = ROOM_TYPES.find(r => r.id === z.roomType);
    const level = RENOVATION_LEVELS.find(l => l.id === z.renovationLevel);
    const screedType = SCREED_TYPES.find(s => s.id === z.screedType);
    const plasterType = PLASTER_TYPES.find(p => p.id === z.plasterType);
    const ceilingType = CEILING_FINISH_TYPES.find(c => c.id === z.ceilingType);
    const flooringType = FLOORING_TYPES.find(f => f.id === z.flooringType);
    const doorType = DOOR_TYPES.find(d => d.id === z.doorType);
    const bd = calcNewbuildPrice(z, regionId, 0);
    const mats = calcNewbuildMaterials(z, bd, regionId);
    return { z, roomType, level, screedType, plasterType, ceilingType, flooringType, doorType, bd, mats };
  });

  const allBreakdowns = rowsData.map(r => r.bd);
  const projectTotals = calcNewbuildProjectTotals(allBreakdowns, foremanIncluded, foremanPct, supplierIncluded, supplierPct, markupPct);
  const totalSum = projectTotals.total;

  if (docType === "ks2" || docType === "ks3" || docType === "act" || docType === "contract") {
    const universalItems = rowsData.map(({ z, roomType, level, bd }, idx) => ({
      num: idx + 1,
      name: `${roomType?.label || "Помещение"}: ${z.roomName || `Помещение ${idx + 1}`}${level ? `, ${level.label}` : ""}, ${z.area} м²`,
      unit: "компл.",
      qty: 1,
      pricePerUnit: bd.subtotal,
      total: bd.subtotal,
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
      projectTitle: "Ремонт в новостройке",
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
            <p className="text-gray-600 mt-1">Ремонт квартиры в новостройке</p>
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

        <p className="text-xs text-gray-400 mb-4">Регион: {region.label}</p>

        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Состав работ по помещениям</h2>

        {rowsData.map(({ z, roomType, level, screedType, plasterType, ceilingType, flooringType, doorType, bd }, idx) => (
          <div key={z.id} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{idx + 1}</div>
              <h3 className="text-sm font-bold text-gray-900">{z.roomName || `Помещение ${idx + 1}`}</h3>
              <span className="text-xs text-gray-400">{roomType?.label} · {z.area} м² · {level?.label}</span>
            </div>

            <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden mb-1">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left px-2 py-1.5 font-medium">Вид работ</th>
                  <th className="text-center px-2 py-1.5 font-medium">Кол-во</th>
                  <th className="text-center px-2 py-1.5 font-medium">Ед.</th>
                  <th className="text-right px-2 py-1.5 font-medium">Цена</th>
                  <th className="text-right px-2 py-1.5 font-medium">Итого</th>
                </tr>
              </thead>
              <tbody>
                {bd.screedCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Стяжка пола: {screedType?.label}</td>
                    <td className="px-2 py-1.5 text-center">{z.area}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">м²</td>
                    <td className="px-2 py-1.5 text-right">{fmt(screedType?.priceM2 ?? 0)} ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.screedCost)} ₽</td>
                  </tr>
                )}
                {bd.plasterCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Штукатурка стен: {plasterType?.label}</td>
                    <td className="px-2 py-1.5 text-center">{Math.round(z.area * 2.4)}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">м²</td>
                    <td className="px-2 py-1.5 text-right">{fmt(plasterType?.priceM2 ?? 0)} ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.plasterCost)} ₽</td>
                  </tr>
                )}
                {bd.ceilingCost > 0 && (
                  <tr className="border-t border-gray-100 bg-orange-50/30">
                    <td className="px-2 py-1.5">Потолок: {ceilingType?.label}</td>
                    <td className="px-2 py-1.5 text-center">{z.area}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">м²</td>
                    <td className="px-2 py-1.5 text-right">{fmt(ceilingType?.priceM2 ?? 0)} ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.ceilingCost)} ₽</td>
                  </tr>
                )}
                {bd.paintCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">
                      Малярные работы ({z.paintLayersCount} сл.):
                      {z.paintingWalls && " стены"}
                      {z.paintingWalls && z.paintingCeiling && ","}
                      {z.paintingCeiling && " потолок"}
                    </td>
                    <td className="px-2 py-1.5 text-center">—</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">—</td>
                    <td className="px-2 py-1.5 text-right">—</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.paintCost)} ₽</td>
                  </tr>
                )}
                {bd.flooringCost > 0 && (
                  <tr className="border-t border-gray-100 bg-orange-50/30">
                    <td className="px-2 py-1.5">Напольное покрытие: {flooringType?.label}</td>
                    <td className="px-2 py-1.5 text-center">{z.area}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">м²</td>
                    <td className="px-2 py-1.5 text-right">{fmt(flooringType?.priceM2 ?? 0)} ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.flooringCost)} ₽</td>
                  </tr>
                )}
                {bd.electricsCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Электрика: {z.outletsCount} розеток, {z.switchesCount} выкл.</td>
                    <td className="px-2 py-1.5 text-center">{z.outletsCount + z.switchesCount}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">шт.</td>
                    <td className="px-2 py-1.5 text-right">—</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.electricsCost)} ₽</td>
                  </tr>
                )}
                {bd.doorsCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Двери: {doorType?.label}</td>
                    <td className="px-2 py-1.5 text-center">{z.doorsCount}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">шт.</td>
                    <td className="px-2 py-1.5 text-right">{fmt(doorType?.pricePerDoor ?? 0)} ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.doorsCost)} ₽</td>
                  </tr>
                )}
                {bd.windowSlopesCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Откосы окон</td>
                    <td className="px-2 py-1.5 text-center">{z.windowSlopesCount}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">проём</td>
                    <td className="px-2 py-1.5 text-right">3 500 ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.windowSlopesCost)} ₽</td>
                  </tr>
                )}
                <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                  <td className="px-2 py-2">Итого по помещению</td>
                  <td colSpan={3} />
                  <td className="px-2 py-2 text-right text-orange-700">{fmt(bd.subtotal)} ₽</td>
                </tr>
              </tbody>
            </table>

            {z.note && <p className="text-xs text-gray-500 italic mt-1">Примечание: {z.note}</p>}
          </div>
        ))}

        {/* Итого */}
        <div className="border-t-2 border-gray-800 pt-4 mt-4">
          <div className="ml-auto max-w-sm">
            <table className="w-full text-sm mb-3">
              <tbody>
                <tr>
                  <td className="py-1.5 text-gray-600">Сумма по помещениям</td>
                  <td className="py-1.5 text-right font-medium tabular-nums">{fmt(projectTotals.worksTotal)} ₽</td>
                </tr>
                {projectTotals.foremanCost > 0 && (
                  <tr>
                    <td className="py-1.5 text-gray-600">Прораб {foremanPct}% (от работ+материалов)</td>
                    <td className="py-1.5 text-right font-medium tabular-nums">+ {fmt(projectTotals.foremanCost)} ₽</td>
                  </tr>
                )}
                {projectTotals.supplierCost > 0 && (
                  <tr>
                    <td className="py-1.5 text-gray-600">Снабженец {supplierPct}% (от материалов {fmt(projectTotals.materialsTotal)} ₽)</td>
                    <td className="py-1.5 text-right font-medium tabular-nums">+ {fmt(projectTotals.supplierCost)} ₽</td>
                  </tr>
                )}
                {markupPct > 0 && (
                  <tr>
                    <td className="py-1.5 text-orange-600">Наценка {markupPct}%</td>
                    <td className="py-1.5 text-right font-medium text-orange-600 tabular-nums">+ {fmt(projectTotals.markupAmount)} ₽</td>
                  </tr>
                )}
                <tr className="border-t-2 border-orange-400">
                  <td className="pt-3 font-bold text-base text-gray-900">ИТОГО ПО СМЕТЕ</td>
                  <td className="pt-3 text-right font-extrabold text-xl text-orange-700 tabular-nums">{fmt(totalSum)} ₽</td>
                </tr>
                <tr>
                  <td colSpan={2} className="pt-1 text-center text-xs text-gray-400">
                    Регион: {region.label} · {RENOVATION_LEVELS.find(l => l.id === zones[0]?.renovationLevel)?.label}
                  </td>
                </tr>
              </tbody>
            </table>
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

        {/* Перечень материалов по помещениям */}
        {rowsData.some(r => r.mats.length > 0) && (
          <div className="mt-10 pt-6 border-t border-gray-200" style={{ pageBreakBefore: "always" }}>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Перечень материалов</h2>
            {rowsData.map(({ z, mats }, idx) => mats.length > 0 && (
              <div key={z.id} className="mb-6">
                <p className="text-xs font-semibold text-gray-600 mb-2">{z.roomName || `Помещение ${idx + 1}`} · {z.area} м²</p>
                <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500">
                      <th className="text-left px-3 py-1.5 font-medium w-6">№</th>
                      <th className="text-left px-3 py-1.5 font-medium">Наименование</th>
                      <th className="text-left px-3 py-1.5 font-medium">Спецификация</th>
                      <th className="text-center px-3 py-1.5 font-medium">Кол-во</th>
                      <th className="text-center px-3 py-1.5 font-medium">Ед.</th>
                      <th className="text-right px-3 py-1.5 font-medium">Цена</th>
                      <th className="text-right px-3 py-1.5 font-medium">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mats.map((m, i) => (
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
                      <td colSpan={6} className="px-3 py-1.5">Итого по помещению</td>
                      <td className="px-3 py-1.5 text-right text-orange-700">
                        {fmt(mats.reduce((s, m) => s + m.total, 0))} ₽
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
            {rowsData.length > 1 && (
              <div className="border-t-2 border-orange-400 pt-2 text-right text-sm font-bold text-orange-700">
                Итого материалы по объекту: {fmt(rowsData.reduce((s, r) => s + r.mats.reduce((ss, m) => ss + m.total, 0), 0))} ₽
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">* Серым выделены расходные материалы и комплектующие</p>
          </div>
        )}
      </div>
      </PrintPaywall>
    </>
  );
}