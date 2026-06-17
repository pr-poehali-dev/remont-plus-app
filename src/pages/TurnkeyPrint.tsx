import {
  APARTMENT_TYPES, RENOVATION_LEVELS,
} from "@/components/calculator/turnkey/TurnkeyTypes";
import type { TurnkeyConfig } from "@/components/calculator/turnkey/TurnkeyTypes";
import { calcTurnkeyPrice, calcTurnkeyMaterials, calcTurnkeyWorks, fmt } from "@/components/calculator/turnkey/turnkeyUtils";
import UniversalDocView from "@/components/print/UniversalDocView";
import type { UniversalDocData } from "@/components/print/UniversalDocView";
import { usePrintState } from "@/hooks/usePrintState";
import PrintEmptyState from "@/components/print/PrintEmptyState";

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
  const state = usePrintState<PrintState>({
    storageKey: "turnkey_print_state",
    buildTitle: (s) => {
      const ps = s as unknown as PrintState;
      return ps.docType === "kp"
        ? `КП-${ps.docNum} (Под ключ) от ${ps.date}`
        : `Смета под ключ № С-${ps.docNum} от ${ps.date}`;
    },
  });

  if (!state) {
    return <PrintEmptyState backHref="/turnkey" calculatorName="калькулятор" accentClass="text-emerald-600" />;
  }

  const {
    cfg, markupPct, regionId, docNum, date, docType,
    customer, contractor, address, phone, email, validDays, inn, kpp,
  } = state;
  const isKp = docType === "kp";

  const aptType = APARTMENT_TYPES.find(a => a.id === cfg.apartmentType);
  const level = RENOVATION_LEVELS.find(l => l.id === cfg.renovationLevel);

  const bd = calcTurnkeyPrice(cfg, regionId, markupPct);
  const totalSum = bd.total;

  // Детальные позиции. Наценка И услуги мастера (прораб/снабженец) «зашиваются»
  // в цены позиций через коэффициент k = total / (работы+материалы),
  // отдельными строками не показываются.
  const rawWorks = calcTurnkeyWorks(cfg, bd, regionId);
  const rawMaterials = calcTurnkeyMaterials(cfg, bd, regionId).filter((m) => !m.isWork);
  const baseSum =
    rawWorks.reduce((s, w) => s + w.total, 0) +
    rawMaterials.reduce((s, m) => s + m.total, 0);
  const k = baseSum > 0 ? totalSum / baseSum : 1;
  const scale = (arr: ReturnType<typeof calcTurnkeyWorks>) =>
    arr.map((i) => {
      const pricePerUnit = Math.round(i.pricePerUnit * k);
      return { ...i, pricePerUnit, total: Math.round(pricePerUnit * i.qty) };
    });
  const works = scale(rawWorks);
  const materials = scale(rawMaterials);
  const worksSum = works.reduce((s, w) => s + w.total, 0);
  const matSum = materials.reduce((s, m) => s + m.total, 0);

  if (docType === "ks2" || docType === "ks3" || docType === "act" || docType === "contract") {
    const universalItems = [...works, ...materials].map((row, idx) => ({
      num: idx + 1,
      name: row.name,
      unit: row.unit,
      qty: row.qty || 1,
      pricePerUnit: row.pricePerUnit,
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
      totalWorks: worksSum,
      totalMaterials: matSum,
      grandTotal,
      advancePct: parseFloat((state as Record<string, unknown>).advancePct as string || "30"),
      warrantyMonths: parseInt((state as Record<string, unknown>).warrantyMonths as string || "12"),
      projectTitle: "Ремонт под ключ",
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
        body { font-family: Arial, sans-serif; background: #f9fafb; }
      `}</style>

      <>
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
          </div>
        </div>

        {/* Таблица работ и материалов */}
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Состав работ и материалов</h2>
        <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden mb-6">
          <thead>
            <tr className="bg-gray-50 text-gray-500">
              <th className="text-left px-3 py-2 font-medium">Наименование</th>
              <th className="text-center px-3 py-2 font-medium">Кол-во</th>
              <th className="text-center px-3 py-2 font-medium">Ед.</th>
              <th className="text-right px-3 py-2 font-medium">Цена</th>
              <th className="text-right px-3 py-2 font-medium">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {works.length > 0 && (
              <tr className="bg-emerald-50/50">
                <td colSpan={5} className="px-3 py-1 font-semibold text-emerald-700 uppercase text-[10px] tracking-wide">Работы</td>
              </tr>
            )}
            {works.map((w, i) => (
              <tr key={`w${i}`} className="border-t border-gray-100">
                <td className="px-3 py-1.5">{w.name}{w.spec && <span className="text-gray-400"> · {w.spec}</span>}</td>
                <td className="px-3 py-1.5 text-center">{w.qty}</td>
                <td className="px-3 py-1.5 text-center text-gray-500">{w.unit}</td>
                <td className="px-3 py-1.5 text-right">{fmt(w.pricePerUnit)} ₽</td>
                <td className="px-3 py-1.5 text-right font-medium">{fmt(w.total)} ₽</td>
              </tr>
            ))}
            {works.length > 0 && (
              <tr className="border-t border-gray-200 bg-gray-50/60">
                <td className="px-3 py-1 font-medium" colSpan={4}>Итого работы</td>
                <td className="px-3 py-1 text-right font-semibold">{fmt(worksSum)} ₽</td>
              </tr>
            )}

            {materials.length > 0 && (
              <tr className="bg-amber-50/50">
                <td colSpan={5} className="px-3 py-1 font-semibold text-amber-700 uppercase text-[10px] tracking-wide">Материалы</td>
              </tr>
            )}
            {materials.map((m, i) => (
              <tr key={`m${i}`} className={`border-t border-gray-100 ${m.isConsumable ? "text-gray-400" : ""}`}>
                <td className="px-3 py-1.5">{m.name}{m.spec && <span className="text-gray-400"> · {m.spec}</span>}</td>
                <td className="px-3 py-1.5 text-center">{m.qty}</td>
                <td className="px-3 py-1.5 text-center text-gray-500">{m.unit}</td>
                <td className="px-3 py-1.5 text-right">{fmt(m.pricePerUnit)} ₽</td>
                <td className="px-3 py-1.5 text-right font-medium">{fmt(m.total)} ₽</td>
              </tr>
            ))}
            {materials.length > 0 && (
              <tr className="border-t border-gray-200 bg-gray-50/60">
                <td className="px-3 py-1 font-medium" colSpan={4}>Итого материалы</td>
                <td className="px-3 py-1 text-right font-semibold">{fmt(matSum)} ₽</td>
              </tr>
            )}

            {/* Итого */}
            <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
              <td className="px-3 py-2">ИТОГО ПО СМЕТЕ</td>
              <td colSpan={3} className="px-3 py-2 text-xs font-normal text-gray-500 text-center">
                {fmt(cfg.totalAreaM2 > 0 ? Math.round((worksSum + matSum) / cfg.totalAreaM2) : 0)} ₽/м²
              </td>
              <td className="px-3 py-2 text-right text-emerald-700 text-base">{fmt(worksSum + matSum)} ₽</td>
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
              <p className="text-sm text-gray-500">{level?.label}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-700">{fmt(worksSum + matSum)} ₽</p>
              <p className="text-xs text-gray-400">
                {fmt(cfg.totalAreaM2 > 0 ? Math.round((worksSum + matSum) / cfg.totalAreaM2) : 0)} ₽/м²
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

        <p className="text-xs text-gray-400 mt-6">* Серым выделены расходные материалы и комплектующие. Стоимость организации работ включена в цены позиций.</p>
      </div>
      </>
    </>
  );
}