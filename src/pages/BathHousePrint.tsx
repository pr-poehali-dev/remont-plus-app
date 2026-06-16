import {
  BATH_STYLES, BATH_LAYOUTS,
  WALL_MATERIALS, FOUNDATION_TYPES, ROOF_TYPES, ROOFING_MATERIALS,
  STOVE_TYPES, VENTILATION_TYPES, WALL_FINISHES, FLOOR_MATERIALS,
  INSULATION_MATERIALS, SHELF_MATERIALS,
} from "@/components/calculator/bathhouse/BathHouseTypes";
import type { BathHouseConfig } from "@/components/calculator/bathhouse/BathHouseTypes";
import type { BathHouseBreakdown } from "@/components/calculator/bathhouse/bathHouseUtils";
import { fmt, calcBathHouseMaterials, calcBathHouseWorks } from "@/components/calculator/bathhouse/bathHouseUtils";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";
import UniversalDocView from "@/components/print/UniversalDocView";
import type { UniversalDocData } from "@/components/print/UniversalDocView";
import { usePrintState } from "@/hooks/usePrintState";
import PrintEmptyState from "@/components/print/PrintEmptyState";

interface PrintState {
  config: BathHouseConfig;
  regionId: string;
  markupPct: number;
  bd: BathHouseBreakdown;
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

export default function BathHousePrint() {
  const state = usePrintState<PrintState>({
    storageKey: "bathhouse_print_state",
    buildTitle: (s) => {
      const ps = s as unknown as PrintState;
      return ps.docType === "kp"
        ? `КП-${ps.docNum} (Баня) от ${ps.date}`
        : `Смета на строительство бани № Б-${ps.docNum} от ${ps.date}`;
    },
  });

  if (!state) {
    return <PrintEmptyState backHref="/bathhouse" calculatorName="калькулятор бани" accentClass="text-amber-600" />;
  }

  const { config, regionId, bd, docNum, date, docType, customer, contractor, address, phone, email, inn, validDays,
    startDate, endDate, contractNum, contractDate, advancePct, warrantyMonths } = state;
  const isKp = docType === "kp";
  const style = BATH_STYLES[config.style];
  const layout = BATH_LAYOUTS[config.layout];

  // Детальные позиции. Наценка + прораб + снабженец «зашиваются» в цены позиций
  // через коэффициент k = total / (работы+материалы), отдельными строками не показываются.
  const rawWorks = calcBathHouseWorks(config, bd, regionId);
  const rawMaterialsAll = calcBathHouseMaterials(config, bd, regionId).filter((i: MaterialItem) => !i.isWork);
  const baseSum =
    rawWorks.reduce((s, w) => s + w.total, 0) +
    rawMaterialsAll.reduce((s, m) => s + m.total, 0);
  const k = baseSum > 0 ? bd.total / baseSum : 1;
  const scale = (arr: MaterialItem[]) =>
    arr.map((i) => ({ ...i, pricePerUnit: Math.round(i.pricePerUnit * k), total: Math.round(i.total * k) }));
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
      projectTitle: "Строительство бани под ключ",
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
          .page-break { page-break-before: always; }
        }
        body { font-family: 'Arial', sans-serif; background: #f9fafb; font-size: 13px; }
        table { border-collapse: collapse; }
        th, td { border: 1px solid #e5e7eb; }
      `}</style>

      <>
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

        {/* Смета: детальный построчный состав работ и материалов */}
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Состав работ и материалов</h2>
        <table className="w-full text-xs mb-6">
          <thead>
            <tr className="bg-amber-50">
              <th className="text-left px-3 py-2 font-semibold text-gray-600">Наименование</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-500">Характеристика</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-600">Кол-во</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-600">Ед.</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-600">Цена</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-700">Сумма, ₽</th>
            </tr>
          </thead>
          <tbody>
            {works.length > 0 && (
              <tr style={{ background: "#f0f9ff" }}>
                <td colSpan={6} className="px-3 py-1 font-bold text-sky-700 uppercase text-[10px] tracking-wider">Работы</td>
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
              <tr style={{ background: "#fffbeb" }}>
                <td colSpan={6} className="px-3 py-1 font-bold text-amber-700 uppercase text-[10px] tracking-wider">Материалы</td>
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
        <div className="ml-auto max-w-sm">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-t-2 border-amber-400">
                <td className="pt-3 font-bold text-base text-gray-900">ИТОГО</td>
                <td className="pt-3 text-right font-extrabold text-xl text-amber-700 tabular-nums">{fmt(worksSum + matSum + consSum)} ₽</td>
              </tr>
              <tr>
                <td colSpan={2} className="pt-1 text-center text-xs text-gray-400">
                  {fmt((worksSum + matSum + consSum) / Math.max(config.totalArea, 1))} ₽ за 1 м² · площадь {config.totalArea} м²
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
    </>
  );
}