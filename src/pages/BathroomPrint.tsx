import { REGIONS, BATHROOM_TYPES, FLOOR_TILES, WALL_TILES, WATERPROOFING_TYPES } from "@/components/calculator/bathroom/BathroomTypes";
import type { BathroomConfig } from "@/components/calculator/bathroom/BathroomTypes";
import { calcBathroomPrice, calcBathroomMaterials, fmt } from "@/components/calculator/bathroom/bathroomUtils";
import { calcBathroomWorks } from "@/components/calculator/bathroom/bathroomWorks";
import UniversalDocView from "@/components/print/UniversalDocView";
import type { UniversalDocData } from "@/components/print/UniversalDocView";
import { usePrintState } from "@/hooks/usePrintState";
import PrintEmptyState from "@/components/print/PrintEmptyState";

interface PrintState {
  zones: BathroomConfig[];
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

export default function BathroomPrint() {
  const state = usePrintState<PrintState>({
    storageKey: "bathroom_print_state",
    buildTitle: (s) => {
      const ps = s as unknown as PrintState;
      return ps.docType === "kp"
        ? `КП-${ps.docNum} (Санузел) от ${ps.date}`
        : `Смета на санузел № С-${ps.docNum} от ${ps.date}`;
    },
  });

  if (!state) {
    return <PrintEmptyState backHref="/bathroom" calculatorName="калькулятор" />;
  }

  const { zones, markupPct, regionId, docNum, date, docType, customer, contractor, address, phone, email, validDays, inn, kpp } = state;
  const isKp = docType === "kp";
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[3];

  const rowsData = zones.map(z => {
    const bathroomType = BATHROOM_TYPES.find(b => b.id === z.bathroomType);
    const floorTile = FLOOR_TILES.find(t => t.id === z.floorTileId);
    const wallTile = WALL_TILES.find(t => t.id === z.wallTileId);
    const waterproofing = WATERPROOFING_TYPES.find(w => w.id === z.waterproofingType);
    const bd = calcBathroomPrice(z, regionId, markupPct);
    const works = calcBathroomWorks(z, bd, regionId);
    const materials = calcBathroomMaterials(z, bd, regionId);
    return { z, bathroomType, floorTile, wallTile, waterproofing, bd, works, materials };
  });

  const totalSum = rowsData.reduce(
    (s, r) =>
      s +
      r.works.reduce((a, w) => a + w.total, 0) +
      r.materials.reduce((a, m) => a + m.total, 0),
    0,
  );

  if (docType === "ks2" || docType === "ks3" || docType === "act" || docType === "contract") {
    const universalItems = rowsData.map(({ z, bathroomType, bd }, idx) => ({
      num: idx + 1,
      name: `${bathroomType?.label || "Санузел"}: ${z.roomName || `Санузел ${idx + 1}`}, ${z.area} м² пол / ${z.wallArea} м² стены`,
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
      customer: { name: customer || "", phone: phone || undefined, email: email || undefined },
      contractor: { name: contractor || "", inn: inn || undefined, phone: phone || undefined, email: email || undefined },
      objectAddress: address || "",
      items: universalItems,
      totalWorks: Math.round(grandTotal * 0.45),
      totalMaterials: Math.round(grandTotal * 0.55),
      grandTotal,
      advancePct: parseFloat((state as Record<string, unknown>).advancePct as string || "30"),
      warrantyMonths: parseInt((state as Record<string, unknown>).warrantyMonths as string || "12"),
      projectTitle: "Ремонт санузла",
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
          @page { margin: 15mm 15mm; size: A4; }
        }
        body { font-family: 'Arial', sans-serif; background: #f9fafb; }
      `}</style>

      <>
      <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
        {/* Шапка */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-800">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isKp ? "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ" : "СМЕТА"}
            </h1>
            <p className="text-gray-600 mt-1">Ремонт санузла / ванной комнаты</p>
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

        {/* Таблица по помещениям */}
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Состав работ и материалов</h2>
        {rowsData.map(({ z, bathroomType, bd, works, materials }, idx) => {
          const worksSum = works.reduce((s, w) => s + w.total, 0);
          const matSum = materials.reduce((s, m) => s + m.total, 0);
          return (
          <div key={z.id} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{idx + 1}</div>
              <h3 className="text-sm font-bold text-gray-900">{z.roomName || `Санузел ${idx + 1}`}</h3>
              <span className="text-xs text-gray-400">{bathroomType?.label} · {z.area} м² пол / {z.wallArea} м² стены</span>
            </div>
            <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden mb-1">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left px-2 py-1.5 font-medium">Наименование</th>
                  <th className="text-center px-2 py-1.5 font-medium">Кол-во</th>
                  <th className="text-center px-2 py-1.5 font-medium">Ед.</th>
                  <th className="text-right px-2 py-1.5 font-medium">Цена</th>
                  <th className="text-right px-2 py-1.5 font-medium">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {works.length > 0 && (
                  <tr className="bg-teal-50/50">
                    <td colSpan={5} className="px-2 py-1 font-semibold text-teal-700 uppercase text-[10px] tracking-wide">Работы</td>
                  </tr>
                )}
                {works.map((w, i) => (
                  <tr key={`w${i}`} className="border-t border-gray-100">
                    <td className="px-2 py-1.5">
                      {w.name}
                      {w.spec && <span className="text-gray-400"> · {w.spec}</span>}
                    </td>
                    <td className="px-2 py-1.5 text-center">{w.qty}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">{w.unit}</td>
                    <td className="px-2 py-1.5 text-right">{fmt(w.pricePerUnit)} ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(w.total)} ₽</td>
                  </tr>
                ))}
                {works.length > 0 && (
                  <tr className="border-t border-gray-200 bg-gray-50/60">
                    <td className="px-2 py-1 font-medium" colSpan={4}>Итого работы</td>
                    <td className="px-2 py-1 text-right font-semibold">{fmt(worksSum)} ₽</td>
                  </tr>
                )}

                {materials.length > 0 && (
                  <tr className="bg-amber-50/50">
                    <td colSpan={5} className="px-2 py-1 font-semibold text-amber-700 uppercase text-[10px] tracking-wide">Материалы</td>
                  </tr>
                )}
                {materials.map((m, i) => (
                  <tr key={`m${i}`} className="border-t border-gray-100">
                    <td className="px-2 py-1.5">
                      {m.name}
                      {m.spec && <span className="text-gray-400"> · {m.spec}</span>}
                    </td>
                    <td className="px-2 py-1.5 text-center">{m.qty}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">{m.unit}</td>
                    <td className="px-2 py-1.5 text-right">{fmt(m.pricePerUnit)} ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(m.total)} ₽</td>
                  </tr>
                ))}
                {materials.length > 0 && (
                  <tr className="border-t border-gray-200 bg-gray-50/60">
                    <td className="px-2 py-1 font-medium" colSpan={4}>Итого материалы</td>
                    <td className="px-2 py-1 text-right font-semibold">{fmt(matSum)} ₽</td>
                  </tr>
                )}

                <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                  <td className="px-2 py-2" colSpan={4}>Итого по помещению</td>
                  <td className="px-2 py-2 text-right text-teal-700">{fmt(worksSum + matSum)} ₽</td>
                </tr>
              </tbody>
            </table>
            {z.note && <p className="text-xs text-gray-500 italic mt-1">Примечание: {z.note}</p>}
          </div>
          );
        })}

        {/* Итого */}
        <div className="border-t-2 border-gray-800 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-bold text-gray-900">ИТОГО ПО СМЕТЕ</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-teal-700">{fmt(totalSum)} ₽</p>
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
      </>
    </>
  );
}