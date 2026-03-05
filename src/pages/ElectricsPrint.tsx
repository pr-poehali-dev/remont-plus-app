import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { REGIONS, ROOM_TYPES, CABLING_TYPES } from "@/components/calculator/electrics/ElectricsTypes";
import type { ElectricsConfig } from "@/components/calculator/electrics/ElectricsTypes";
import { calcElectricsPrice, fmt } from "@/components/calculator/electrics/electricsUtils";
import PrintPaywall from "@/components/print/PrintPaywall";
import UniversalDocView from "@/components/print/UniversalDocView";
import type { UniversalDocData } from "@/components/print/UniversalDocView";

interface PrintState {
  zones: ElectricsConfig[];
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

export default function ElectricsPrint() {
  const location = useLocation();
  const state: PrintState | null = location.state ?? (() => {
    try { return JSON.parse(sessionStorage.getItem("electrics_print_state") || "null"); } catch { return null; }
  })();

  useEffect(() => {
    if (state) {
      const isKp = state.docType === "kp";
      document.title = isKp
        ? `КП-${state.docNum} (Электрика) от ${state.date}`
        : `Смета на электрику № С-${state.docNum} от ${state.date}`;
    }
  }, [state]);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        <p>Данные не переданы. Вернитесь в <a href="/electrics" className="text-blue-600 underline">калькулятор</a>.</p>
      </div>
    );
  }

  const { zones, markupPct, regionId, docNum, date, docType, customer, contractor, address, phone, email, validDays, inn, kpp } = state;
  const isKp = docType === "kp";
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[3];

  const rowsData = zones.map(z => {
    const roomType = ROOM_TYPES.find(r => r.value === z.roomType);
    const cablingType = CABLING_TYPES.find(c => c.id === z.cablingType);
    const bd = calcElectricsPrice(z, regionId, markupPct);
    return { z, roomType, cablingType, bd };
  });

  const totalSum = rowsData.reduce((s, r) => s + r.bd.total, 0);

  if (docType === "ks2" || docType === "ks3" || docType === "act" || docType === "contract") {
    const universalItems = rowsData.map(({ z, roomType, bd }, idx) => ({
      num: idx + 1,
      name: `Электромонтаж: ${z.roomName || `Помещение ${idx + 1}`}${roomType ? `, ${roomType.label}` : ""}, ${z.area} м²`,
      unit: "компл.",
      qty: 1,
      pricePerUnit: bd.total,
      total: bd.total,
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
      customer: { name: customer || "", inn: undefined, phone, email },
      contractor: { name: contractor || "", inn: inn || undefined, phone, email },
      objectAddress: address || "",
      items: universalItems,
      totalWorks: Math.round(grandTotal * 0.4),
      totalMaterials: Math.round(grandTotal * 0.6),
      grandTotal,
      advancePct: parseFloat((state as Record<string, unknown>).advancePct as string || "30"),
      warrantyMonths: parseInt((state as Record<string, unknown>).warrantyMonths as string || "12"),
      projectTitle: "Электромонтажные работы",
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
        body { font-family: 'Arial', sans-serif; background: #f9fafb; }
      `}</style>

      <PrintPaywall>
      <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
        {/* Шапка */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-800">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isKp ? "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ" : "СМЕТА"}
            </h1>
            <p className="text-gray-600 mt-1">Электромонтажные работы</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="font-bold text-gray-900">
              {isKp ? `КП-${docNum}` : `№ С-${docNum}`}
            </p>
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

        {/* Регион */}
        <p className="text-xs text-gray-400 mb-4">Регион: {region.label} (коэффициент {region.coeff})</p>

        {/* Таблица по помещениям */}
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Состав работ</h2>
        {rowsData.map(({ z, roomType, cablingType, bd }, idx) => (
          <div key={z.id} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{idx + 1}</div>
              <h3 className="text-sm font-bold text-gray-900">{z.roomName || `Помещение ${idx + 1}`}</h3>
              <span className="text-xs text-gray-400">{roomType?.label} · {z.area} м²</span>
            </div>
            <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden mb-1">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left px-2 py-1.5 font-medium">Позиция</th>
                  <th className="text-center px-2 py-1.5 font-medium">Кол-во</th>
                  <th className="text-center px-2 py-1.5 font-medium">Ед.</th>
                  <th className="text-right px-2 py-1.5 font-medium">Цена</th>
                  <th className="text-right px-2 py-1.5 font-medium">Итого</th>
                </tr>
              </thead>
              <tbody>
                {(z.outletsCount + z.doubleOutletsCount + z.groundedOutletsCount) > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Монтаж розеток (одинарные/двойные/заземление: {z.outletsCount}/{z.doubleOutletsCount}/{z.groundedOutletsCount})</td>
                    <td className="px-2 py-1.5 text-center">{z.outletsCount + z.doubleOutletsCount + z.groundedOutletsCount}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">шт.</td>
                    <td className="px-2 py-1.5 text-right">—</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.outletsCost)} ₽</td>
                  </tr>
                )}
                {(z.switchesCount + z.doubleSwitchesCount + z.dimmersCount) > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Монтаж выключателей/диммеров ({z.switchesCount}/{z.doubleSwitchesCount}/{z.dimmersCount})</td>
                    <td className="px-2 py-1.5 text-center">{z.switchesCount + z.doubleSwitchesCount + z.dimmersCount}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">шт.</td>
                    <td className="px-2 py-1.5 text-right">—</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.switchesCost)} ₽</td>
                  </tr>
                )}
                {bd.lightingCost > 0 && (
                  <tr className="border-t border-gray-100 bg-yellow-50/30">
                    <td className="px-2 py-1.5">Освещение: {z.lightGroupsCount} гр. + {z.spotLightsCount} споты</td>
                    <td className="px-2 py-1.5 text-center">{z.lightGroupsCount + z.spotLightsCount}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">шт.</td>
                    <td className="px-2 py-1.5 text-right">—</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.lightingCost)} ₽</td>
                  </tr>
                )}
                {bd.cablingCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Прокладка кабеля: {cablingType?.label}</td>
                    <td className="px-2 py-1.5 text-center">{z.cableRunM}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">м</td>
                    <td className="px-2 py-1.5 text-right">{fmt(cablingType?.pricePerM ?? 0)} ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.cablingCost)} ₽</td>
                  </tr>
                )}
                {bd.panelCost > 0 && (
                  <tr className="border-t border-gray-100 bg-blue-50/30">
                    <td className="px-2 py-1.5">Монтаж электрощитка ({z.breakersCount} авт.)</td>
                    <td className="px-2 py-1.5 text-center">1</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">компл.</td>
                    <td className="px-2 py-1.5 text-right">—</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.panelCost)} ₽</td>
                  </tr>
                )}
                {bd.groundingCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Контур заземления</td>
                    <td className="px-2 py-1.5 text-center">1</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">компл.</td>
                    <td className="px-2 py-1.5 text-right">—</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.groundingCost)} ₽</td>
                  </tr>
                )}
                {bd.testingCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Проверка и тестирование</td>
                    <td className="px-2 py-1.5 text-center">1</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">компл.</td>
                    <td className="px-2 py-1.5 text-right">—</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.testingCost)} ₽</td>
                  </tr>
                )}
                {markupPct > 0 && (
                  <tr className="border-t border-gray-100 text-orange-600">
                    <td className="px-2 py-1.5">Наценка {markupPct}%</td>
                    <td colSpan={3} />
                    <td className="px-2 py-1.5 text-right font-medium">+ {fmt(bd.markupAmount)} ₽</td>
                  </tr>
                )}
                <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                  <td className="px-2 py-2">Итого по помещению</td>
                  <td colSpan={3} />
                  <td className="px-2 py-2 text-right text-blue-700">{fmt(bd.total)} ₽</td>
                </tr>
              </tbody>
            </table>
            {z.note && <p className="text-xs text-gray-500 italic mt-1">Примечание: {z.note}</p>}
          </div>
        ))}

        {/* Итого */}
        <div className="border-t-2 border-gray-800 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-bold text-gray-900">ИТОГО ПО СМЕТЕ</p>
              <p className="text-sm text-gray-500">Регион: {region.label}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-700">{fmt(totalSum)} ₽</p>
              {markupPct > 0 && <p className="text-xs text-gray-400">Включая наценку {markupPct}%</p>}
            </div>
          </div>
        </div>

        {/* Подписи */}
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
      </div>
      </PrintPaywall>
    </>
  );
}