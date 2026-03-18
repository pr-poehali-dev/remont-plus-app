import { roundUpToPackaging } from "@/lib/lemanapro-data";
import type { EstimateItem } from "@/pages/Calculator";
import type { EstimateSavedItem } from "@/lib/lemanapro-data";
import SharePanel from "./SharePanel";

interface PrintButtonsProps {
  docTitle?: string;
  totalSum?: number;
  customerEmail?: string;
  customerPhone?: string;
  docType?: "smeta" | "kp";
}

export function PrintButtons({ docTitle, totalSum, customerEmail, customerPhone, docType }: PrintButtonsProps) {
  return (
    <div className="no-print" style={{ marginBottom: 16 }}>
      {docTitle && totalSum !== undefined && (
        <SharePanel
          docTitle={docTitle}
          totalSum={totalSum}
          customerEmail={customerEmail}
          customerPhone={customerPhone}
          docType={docType}
        />
      )}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          onClick={() => window.history.back()}
          style={{ background: "#fff", color: "#333", border: "1px solid #ccc", borderRadius: 4, padding: "7px 16px", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}
        >
          ← Назад
        </button>
        <button
          onClick={() => window.print()}
          style={{ background: "#111", color: "#fff", border: "none", borderRadius: 4, padding: "7px 18px", fontFamily: "inherit", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
        >
          🖨 Распечатать / PDF
        </button>
      </div>
    </div>
  );
}

export function WorksTable({ items }: { items: EstimateItem[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th style={{ width: 28 }} className="c">№</th>
          <th style={{ width: 75 }}>Раздел</th>
          <th>Наименование</th>
          <th style={{ width: 44 }} className="c">Ед.</th>
          <th style={{ width: 48 }} className="c">Кол-во</th>
          <th style={{ width: 84 }} className="r">Цена, руб.</th>
          <th style={{ width: 88 }} className="r">Сумма, руб.</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, idx) => (
          <tr key={item.id}>
            <td className="c">{idx + 1}</td>
            <td>{item.category}</td>
            <td>{item.name}</td>
            <td className="c">{item.unit}</td>
            <td className="c">{item.quantity}</td>
            <td className="r">{item.price.toLocaleString("ru-RU")}</td>
            <td className="r">{item.total.toLocaleString("ru-RU")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function MaterialsTable({ lemanaItems }: { lemanaItems: EstimateSavedItem[] }) {
  const grouped = lemanaItems.reduce<Record<string, EstimateSavedItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <table>
      <thead>
        <tr>
          <th style={{ width: 28 }} className="c">№</th>
          <th style={{ width: 88 }}>Категория</th>
          <th>Наименование товара</th>
          <th style={{ width: 68 }} className="c">Кол-во</th>
          <th style={{ width: 84 }} className="r">Цена, руб.</th>
          <th style={{ width: 88 }} className="r">Сумма, руб.</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(grouped).flatMap(([cat, catItems], gi) =>
          catItems.map((item, ii) => {
            const rounded = roundUpToPackaging(item.quantity, item.packaging || 1);
            const lineTotal = (item.price || 0) * rounded;
            const qtyLabel = rounded !== item.quantity
              ? `${item.quantity} → ${rounded} ${item.unit}`
              : `${rounded} ${item.unit}`;
            const globalIdx = Object.values(grouped).slice(0, gi).reduce((s, a) => s + a.length, 0) + ii + 1;
            return (
              <tr key={item.id}>
                <td className="c">{globalIdx}</td>
                <td>{cat}</td>
                <td>{item.name}{item.note ? ` (${item.note})` : ""}</td>
                <td className="c">{qtyLabel}</td>
                <td className="r">{item.price ? item.price.toLocaleString("ru-RU") : "—"}</td>
                <td className="r">{lineTotal ? lineTotal.toLocaleString("ru-RU") : "—"}</td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}