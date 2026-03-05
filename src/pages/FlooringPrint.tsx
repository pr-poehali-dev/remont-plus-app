import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FLOORING_PRODUCTS, FLOORING_CATEGORIES, SUBSTRATE_OPTIONS, INSTALL_PATTERNS, SKIRTING_OPTIONS, REGIONS } from "@/components/calculator/flooring/FlooringTypes";
import type { FlooringConfig } from "@/components/calculator/flooring/FlooringTypes";
import { calcFlooringPrice, fmt } from "@/components/calculator/flooring/flooringUtils";
import PrintPaywall from "@/components/print/PrintPaywall";
import UniversalDocView from "@/components/print/UniversalDocView";
import type { UniversalDocData } from "@/components/print/UniversalDocView";

interface PrintState {
  zones: FlooringConfig[];
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
  ogrn?: string;
  legalAddress?: string;
  bank?: string;
  bik?: string;
  checkingAccount?: string;
}

export default function FlooringPrint() {
  const location = useLocation();
  const state: PrintState | null = location.state ?? (() => {
    try { return JSON.parse(sessionStorage.getItem("flooring_print_state") || "null"); } catch { return null; }
  })();

  useEffect(() => {
    if (state) {
      const isKp = state.docType === "kp";
      document.title = isKp
        ? `КП-${state.docNum} (Полы) от ${state.date}`
        : `Смета на полы № С-${state.docNum} от ${state.date}`;
    }
  }, [state]);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        <p>Данные не переданы. Вернитесь в <a href="/flooring" className="text-amber-600 underline">калькулятор</a>.</p>
      </div>
    );
  }

  const { zones, markupPct, regionId, docNum, date, docType, customer, contractor, address, phone, email, validDays, inn, kpp, ogrn, legalAddress, bank, bik, checkingAccount } = state;
  const isKp = docType === "kp";
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[3];

  const rowsData = zones.map(z => {
    const product = FLOORING_PRODUCTS.find(p => p.id === z.productId);
    const cat = FLOORING_CATEGORIES.find(c => c.value === product?.category);
    const substrate = SUBSTRATE_OPTIONS.find(s => s.id === z.substrateId);
    const pattern = INSTALL_PATTERNS.find(p => p.id === z.patternId);
    const skirting = SKIRTING_OPTIONS.find(s => s.id === z.skirtingId);
    const bd = calcFlooringPrice(z, regionId, markupPct);
    return { z, product, cat, substrate, pattern, skirting, bd };
  });

  const totalSum = rowsData.reduce((s, r) => s + r.bd.total, 0);
  const totalArea = zones.reduce((s, z) => s + (z.area || 0), 0);

  if (docType === "ks2" || docType === "ks3" || docType === "act" || docType === "contract") {
    const universalItems = rowsData.map(({ z, product, cat, bd }, idx) => ({
      num: idx + 1,
      name: `${cat?.label || "Покрытие"}: ${product?.brand || ""} ${product?.name || ""}, ${z.roomName || `Помещение ${idx + 1}`}, ${z.area} м²`,
      unit: "м²",
      qty: z.area || 0,
      pricePerUnit: z.area ? Math.round(bd.total / z.area) : 0,
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
      projectTitle: "Укладка напольных покрытий",
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
            <p className="text-gray-600 mt-1">Напольные покрытия</p>
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
        {rowsData.map(({ z, product, cat, substrate, pattern, skirting, bd }, idx) => (
          <div key={z.id} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{idx + 1}</div>
              <h3 className="text-sm font-bold text-gray-900">{z.roomName || `Помещение ${idx + 1}`}</h3>
              <span className="text-xs text-gray-400">{z.length} × {z.width} м · {z.area} м²</span>
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
                <tr className="border-t border-gray-100">
                  <td className="px-2 py-1.5 font-medium">{cat?.label}: {product?.brand} {product?.name}</td>
                  <td className="px-2 py-1.5 text-center">{bd.materialQty}</td>
                  <td className="px-2 py-1.5 text-center text-gray-500">м²</td>
                  <td className="px-2 py-1.5 text-right">{fmt(product?.pricePerM2 ?? 0)} ₽</td>
                  <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.materialCost)} ₽</td>
                </tr>
                {substrate && substrate.id !== "none" && bd.substrateCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Подложка: {substrate.name}</td>
                    <td className="px-2 py-1.5 text-center">{z.area}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">м²</td>
                    <td className="px-2 py-1.5 text-right">{fmt(substrate.pricePerM2)} ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.substrateCost)} ₽</td>
                  </tr>
                )}
                {bd.installCost > 0 && (
                  <tr className="border-t border-gray-100 bg-blue-50/30">
                    <td className="px-2 py-1.5">Монтаж: {pattern?.name}</td>
                    <td className="px-2 py-1.5 text-center">{z.area}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">м²</td>
                    <td className="px-2 py-1.5 text-right">{fmt(product?.installPrice ?? 0)} ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.installCost)} ₽</td>
                  </tr>
                )}
                {skirting && skirting.id !== "none" && bd.skirtingCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">{skirting.name}</td>
                    <td className="px-2 py-1.5 text-center">{z.perimeter}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">п.м.</td>
                    <td className="px-2 py-1.5 text-right">{fmt(skirting.pricePerM)} ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.skirtingCost)} ₽</td>
                  </tr>
                )}
                {bd.demolitionCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Демонтаж старого покрытия</td>
                    <td className="px-2 py-1.5 text-center">{z.area}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">м²</td>
                    <td className="px-2 py-1.5 text-right">180 ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.demolitionCost)} ₽</td>
                  </tr>
                )}
                {bd.levelingCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Стяжка {z.levelingThicknessMm} мм</td>
                    <td className="px-2 py-1.5 text-center">{z.area}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">м²</td>
                    <td className="px-2 py-1.5 text-right">{fmt(z.levelingThicknessMm * 18)} ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.levelingCost)} ₽</td>
                  </tr>
                )}
                {bd.thresholdCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Переходные порожки</td>
                    <td className="px-2 py-1.5 text-center">{z.thresholdCount}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">шт.</td>
                    <td className="px-2 py-1.5 text-right">850 ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.thresholdCost)} ₽</td>
                  </tr>
                )}
                <tr className="border-t-2 border-amber-400 bg-amber-50">
                  <td className="px-2 py-2 font-bold text-gray-900" colSpan={4}>Итого по помещению</td>
                  <td className="px-2 py-2 text-right font-bold text-amber-700">{fmt(bd.total)} ₽</td>
                </tr>
              </tbody>
            </table>
            <p className="text-[10px] text-gray-400 pl-2">
              {cat?.label} · {product?.wear} · Толщина {product?.thickness} мм · Гарантия {product?.warranty} лет · Регион: {region.label}
              {pattern && ` · Схема: ${pattern.name} (+${pattern.wastePct}% отходов)`}
            </p>
          </div>
        ))}

        {/* Итоговая таблица */}
        {zones.length > 1 && (
          <table className="w-full text-sm border-2 border-gray-800 rounded-lg overflow-hidden mb-6">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left px-3 py-2 font-medium">Помещение</th>
                <th className="text-center px-3 py-2 font-medium">Площадь</th>
                <th className="text-right px-3 py-2 font-medium">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {rowsData.map(({ z, bd }, idx) => (
                <tr key={z.id} className="border-t border-gray-200">
                  <td className="px-3 py-2">{z.roomName || `Помещение ${idx + 1}`}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{z.area} м²</td>
                  <td className="px-3 py-2 text-right font-medium">{fmt(bd.total)} ₽</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-800 bg-gray-50">
                <td className="px-3 py-2 font-bold">ИТОГО</td>
                <td className="px-3 py-2 text-center font-medium">{fmt(Math.round(totalArea * 10) / 10)} м²</td>
                <td className="px-3 py-2 text-right font-bold text-lg">{fmt(totalSum)} ₽</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Одно помещение — итог */}
        {zones.length === 1 && (
          <div className="flex justify-between items-center border-t-2 border-gray-800 pt-3 mb-6">
            <span className="font-bold text-gray-900 text-lg">ИТОГО</span>
            <span className="font-bold text-2xl text-amber-700">{fmt(totalSum)} ₽</span>
          </div>
        )}

        {/* Реквизиты для КП */}
        {isKp && (inn || bank) && (
          <div className="border border-gray-200 rounded-lg p-4 mb-6 text-xs text-gray-600">
            <p className="font-semibold text-gray-800 mb-2">Банковские реквизиты исполнителя</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {ogrn && <p>ОГРН/ОГРНИП: {ogrn}</p>}
              {inn && <p>ИНН: {inn}</p>}
              {kpp && <p>КПП: {kpp}</p>}
              {bank && <p>Банк: {bank}</p>}
              {bik && <p>БИК: {bik}</p>}
              {checkingAccount && <p>Р/с: {checkingAccount}</p>}
              {legalAddress && <p className="col-span-2">Юр. адрес: {legalAddress}</p>}
            </div>
          </div>
        )}

        {/* Подписи */}
        <div className="grid grid-cols-2 gap-12 mt-8 pt-4 border-t border-gray-200 text-sm">
          <div>
            <p className="text-gray-500 mb-6">Заказчик</p>
            <div className="border-b border-gray-400 mb-1" />
            <p className="text-xs text-gray-400">{customer || "ФИО / подпись / дата"}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-6">Исполнитель</p>
            <div className="border-b border-gray-400 mb-1" />
            <p className="text-xs text-gray-400">{contractor || "ФИО / подпись / дата"}</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 mt-8">
          Документ сформирован {date} · АВАНГАРД · avangard-ai.ru
        </p>
      </div>
      </PrintPaywall>
    </>
  );
}