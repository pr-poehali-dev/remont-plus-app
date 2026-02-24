import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { REGIONS, BATHROOM_TYPES, FLOOR_TILES, WALL_TILES, WATERPROOFING_TYPES } from "@/components/calculator/bathroom/BathroomTypes";
import type { BathroomConfig } from "@/components/calculator/bathroom/BathroomTypes";
import { calcBathroomPrice, fmt } from "@/components/calculator/bathroom/bathroomUtils";
import SharePanel from "@/components/print/SharePanel";

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
  const location = useLocation();
  const state: PrintState | null = location.state ?? null;

  useEffect(() => {
    if (state) {
      const isKp = state.docType === "kp";
      document.title = isKp
        ? `КП-${state.docNum} (Санузел) от ${state.date}`
        : `Смета на санузел № С-${state.docNum} от ${state.date}`;
      setTimeout(() => window.print(), 500);
    }
  }, [state]);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        <p>Данные не переданы. Вернитесь в <a href="/bathroom" className="text-teal-600 underline">калькулятор</a>.</p>
      </div>
    );
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
    return { z, bathroomType, floorTile, wallTile, waterproofing, bd };
  });

  const totalSum = rowsData.reduce((s, r) => s + r.bd.total, 0);

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

      <div className="no-print bg-teal-50 border-b border-teal-200 px-6 py-3">
        <SharePanel
          docTitle={isKp ? `КП-${docNum} (Санузел) от ${date}` : `Смета на санузел № С-${docNum} от ${date}`}
          totalSum={totalSum}
          customerEmail={email}
          customerPhone={phone}
          docType={docType}
        />
        <div className="flex gap-2 mt-2">
          <button onClick={() => window.print()} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
            Печать / PDF
          </button>
          <button onClick={() => window.history.back()} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Назад
          </button>
        </div>
      </div>

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

        {/* Регион */}
        <p className="text-xs text-gray-400 mb-4">Регион: {region.label} (коэффициент {region.coeff})</p>

        {/* Таблица по помещениям */}
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Состав работ и материалов</h2>
        {rowsData.map(({ z, bathroomType, floorTile, wallTile, waterproofing, bd }, idx) => (
          <div key={z.id} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{idx + 1}</div>
              <h3 className="text-sm font-bold text-gray-900">{z.roomName || `Санузел ${idx + 1}`}</h3>
              <span className="text-xs text-gray-400">{bathroomType?.label} · {z.area} м² пол / {z.wallArea} м² стены</span>
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
                {bd.demolitionCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Демонтаж старой отделки</td>
                    <td className="px-2 py-1.5 text-center">{z.area + z.wallArea}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">м²</td>
                    <td className="px-2 py-1.5 text-right">—</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.demolitionCost)} ₽</td>
                  </tr>
                )}
                {bd.screedCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Цементная стяжка пола</td>
                    <td className="px-2 py-1.5 text-center">{z.area}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">м²</td>
                    <td className="px-2 py-1.5 text-right">1 600 ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.screedCost)} ₽</td>
                  </tr>
                )}
                {bd.waterproofingCost > 0 && waterproofing && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Гидроизоляция: {waterproofing.label}</td>
                    <td className="px-2 py-1.5 text-center">{z.area}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">м²</td>
                    <td className="px-2 py-1.5 text-right">{fmt(waterproofing.priceM2)} ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.waterproofingCost)} ₽</td>
                  </tr>
                )}
                {bd.floorTileCost > 0 && floorTile && (
                  <tr className="border-t border-gray-100 bg-teal-50/30">
                    <td className="px-2 py-1.5">Плитка пола: {floorTile.label} (материал + укладка)</td>
                    <td className="px-2 py-1.5 text-center">{z.area}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">м²</td>
                    <td className="px-2 py-1.5 text-right">{fmt(floorTile.materialPriceM2 + floorTile.installPriceM2)} ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.floorTileCost)} ₽</td>
                  </tr>
                )}
                {bd.wallTileCost > 0 && wallTile && (
                  <tr className="border-t border-gray-100 bg-teal-50/30">
                    <td className="px-2 py-1.5">Плитка стен: {wallTile.label} (материал + укладка)</td>
                    <td className="px-2 py-1.5 text-center">{z.wallArea}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">м²</td>
                    <td className="px-2 py-1.5 text-right">{fmt(wallTile.materialPriceM2 + wallTile.installPriceM2)} ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.wallTileCost)} ₽</td>
                  </tr>
                )}
                {bd.plumbingCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">
                      Сантехника: {[
                        z.toiletInstall && "унитаз",
                        z.sinkInstall && "раковина",
                        z.bathInstall && "ванна",
                        z.showerCabinInstall && "душевая",
                        z.mixersCount > 0 && `${z.mixersCount} смес.`,
                        z.installationSystemIncluded && "инсталляция",
                      ].filter(Boolean).join(", ")}
                    </td>
                    <td className="px-2 py-1.5 text-center">1</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">компл.</td>
                    <td className="px-2 py-1.5 text-right">—</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.plumbingCost)} ₽</td>
                  </tr>
                )}
                {bd.heatedFloorCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Тёплый пол {z.heatedFloorType === "electric" ? "(электрический)" : "(водяной)"}</td>
                    <td className="px-2 py-1.5 text-center">{z.area}</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">м²</td>
                    <td className="px-2 py-1.5 text-right">{z.heatedFloorType === "electric" ? "2 200" : "3 500"} ₽</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.heatedFloorCost)} ₽</td>
                  </tr>
                )}
                {bd.ventilationCost > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">Вентиляция</td>
                    <td className="px-2 py-1.5 text-center">1</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">компл.</td>
                    <td className="px-2 py-1.5 text-right">—</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.ventilationCost)} ₽</td>
                  </tr>
                )}
                {(bd.furnitureCost + bd.accessoriesCost) > 0 && (
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-1.5">
                      Мебель и аксессуары: {[
                        z.vanityInstall && "тумба",
                        z.mirrorInstall && "зеркало",
                        z.accessoriesIncluded && "аксессуары",
                      ].filter(Boolean).join(", ")}
                    </td>
                    <td className="px-2 py-1.5 text-center">1</td>
                    <td className="px-2 py-1.5 text-center text-gray-500">компл.</td>
                    <td className="px-2 py-1.5 text-right">—</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(bd.furnitureCost + bd.accessoriesCost)} ₽</td>
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
                  <td className="px-2 py-2 text-right text-teal-700">{fmt(bd.total)} ₽</td>
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
              <p className="text-2xl font-bold text-teal-700">{fmt(totalSum)} ₽</p>
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
    </>
  );
}
