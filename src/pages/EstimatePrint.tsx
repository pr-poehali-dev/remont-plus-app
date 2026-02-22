import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { roundUpToPackaging } from "@/lib/lemanapro-data";
import type { EstimateItem } from "@/pages/Calculator";
import type { EstimateSavedItem } from "@/lib/lemanapro-data";

interface PrintData {
  items: EstimateItem[];
  lemanaItems: EstimateSavedItem[];
  materialSurcharge: number;
  customer: string;
  contractor: string;
  address: string;
  phone?: string;
  email?: string;
  validDays?: string;
  docType?: "smeta" | "kp";
  inn?: string;
  kpp?: string;
  ogrn?: string;
  legalAddress?: string;
  bank?: string;
  bik?: string;
  checkingAccount?: string;
  totalMaterials: number;
  totalWorks: number;
  adjustedWorks: number;
  grandTotal: number;
  deliveryCost?: number;
  deliveryFloor?: number;
  deliveryHasElevator?: boolean;
  docNum: string;
  date: string;
}

function fmt(n: number) {
  return n.toLocaleString("ru-RU") + " руб.";
}

const COMMON_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&family=PT+Sans:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'PT Sans', Arial, sans-serif; font-size: 10pt; color: #000; background: #fff; }
  .page { max-width: 210mm; margin: 0 auto; padding: 18mm 18mm 22mm; }

  .doc-title { font-family: 'PT Serif', serif; font-size: 13pt; font-weight: 700; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
  .doc-subtitle { text-align: center; font-size: 9pt; color: #444; margin-bottom: 14px; }

  .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9pt; }
  .meta-table td { padding: 3px 6px; vertical-align: top; }
  .meta-table td:first-child { width: 38%; font-weight: 700; color: #000; white-space: nowrap; }
  .meta-table td:last-child { border-bottom: 1px solid #999; color: #000; }

  section { margin-bottom: 14px; }
  section h2 { font-size: 9.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 6px; }

  table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
  thead th { background: #fff; border-top: 1.5px solid #000; border-bottom: 1px solid #000; padding: 4px 5px; text-align: left; font-weight: 700; }
  thead th.r { text-align: right; }
  thead th.c { text-align: center; }
  tbody td { padding: 3px 5px; border-bottom: 1px solid #ddd; vertical-align: top; }
  tbody td.r { text-align: right; }
  tbody td.c { text-align: center; }
  tbody tr:nth-child(even) td { background: #f7f7f7; }

  .totals { margin-top: 6px; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .totals .row { display: flex; gap: 16px; font-size: 9pt; color: #333; }
  .totals .row.grand { font-weight: 700; font-size: 10.5pt; color: #000; border-top: 1.5px solid #000; padding-top: 3px; margin-top: 3px; }
  .totals .val { min-width: 130px; text-align: right; }
  .totals .note { font-size: 8pt; color: #555; font-style: italic; }

  .conditions { margin-bottom: 14px; }
  .conditions h2 { font-size: 9.5pt; font-weight: 700; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 6px; }
  .conditions ol { padding-left: 16px; font-size: 8.5pt; color: #222; line-height: 1.7; }

  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 20px; }
  .sig-block h3 { font-size: 9pt; font-weight: 700; text-transform: uppercase; margin-bottom: 10px; }
  .sig-line { margin-bottom: 10px; font-size: 8.5pt; color: #222; }
  .sig-line .line { border-bottom: 1px solid #666; margin-top: 4px; height: 16px; }

  .footer { text-align: center; font-size: 7.5pt; color: #888; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 8px; }

  @media print {
    @page { size: A4 portrait; margin: 10mm 14mm 14mm; }
    .no-print { display: none !important; }
    body { font-size: 9.5pt; }
  }
`;

function PrintButtons() {
  return (
    <div className="no-print" style={{ textAlign: "right", marginBottom: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
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
  );
}

function WorksTable({ items }: { items: EstimateItem[] }) {
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

function MaterialsTable({ lemanaItems }: { lemanaItems: EstimateSavedItem[] }) {
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

function SmetaView({ data }: { data: PrintData }) {
  const {
    items, lemanaItems, materialSurcharge, customer, contractor, address,
    totalMaterials, adjustedWorks, grandTotal, deliveryCost = 0,
    deliveryFloor, deliveryHasElevator, docNum, date,
  } = data;

  const totalWithDelivery = grandTotal + deliveryCost;
  const lemanaTotal = lemanaItems.reduce((s, i) => {
    const rounded = roundUpToPackaging(i.quantity, i.packaging || 1);
    return s + (i.price || 0) * rounded;
  }, 0);

  return (
    <div className="page">
      <PrintButtons />

      <p className="doc-title">Смета на выполнение ремонтных работ</p>
      <p className="doc-subtitle">№ С-{docNum} от {date} г.</p>

      <table className="meta-table">
        <tbody>
          <tr>
            <td>Заказчик:</td>
            <td>{customer || ""}</td>
          </tr>
          <tr>
            <td>Подрядчик:</td>
            <td>{contractor || ""}</td>
          </tr>
          <tr>
            <td>Адрес объекта:</td>
            <td>{address || ""}</td>
          </tr>
          <tr>
            <td>Дата составления:</td>
            <td>{date} г.</td>
          </tr>
        </tbody>
      </table>

      {items.length > 0 && (
        <section>
          <h2>1. Перечень работ и материалов</h2>
          <WorksTable items={items} />
          <div className="totals">
            <div className="row"><span>Итого материалы:</span><span className="val">{fmt(totalMaterials)}</span></div>
            <div className="row"><span>Итого работы:</span><span className="val">{fmt(adjustedWorks)}</span></div>
            {materialSurcharge > 0 && (
              <div className="row note">
                <span>в т.ч. надбавка за объём материалов (×1,3):</span>
                <span className="val">+{fmt(materialSurcharge)}</span>
              </div>
            )}
            {deliveryCost > 0 && (
              <div className="row">
                <span>Доставка и подъём на {deliveryFloor} эт. ({deliveryHasElevator ? "с лифтом" : "без лифта"}):</span>
                <span className="val">+{fmt(deliveryCost)}</span>
              </div>
            )}
            <div className="row grand"><span>ИТОГО ПО СМЕТЕ:</span><span className="val">{fmt(totalWithDelivery)}</span></div>
          </div>
        </section>
      )}

      {lemanaItems.length > 0 && (
        <section>
          <h2>{items.length > 0 ? "2." : "1."} Материалы</h2>
          <MaterialsTable lemanaItems={lemanaItems} />
          {lemanaTotal > 0 && (
            <div className="totals">
              <div className="row grand"><span>ИТОГО МАТЕРИАЛЫ:</span><span className="val">{fmt(lemanaTotal)}</span></div>
            </div>
          )}
        </section>
      )}

      <div className="conditions">
        <h2>Условия выполнения работ</h2>
        <ol>
          <li>Настоящая смета является предварительной и может быть скорректирована после осмотра объекта.</li>
          <li>Срок действия цен — 30 дней с даты составления документа.</li>
          <li>Оплата: аванс 30% при заключении договора, остаток — по завершении работ.</li>
          <li>Гарантия на выполненные работы устанавливается договором подряда.</li>
          <li>Стоимость дополнительных работ согласовывается отдельно.</li>
        </ol>
      </div>

      <div className="signatures">
        <div className="sig-block">
          <h3>Заказчик</h3>
          <div className="sig-line">ФИО: {customer || <div className="line" />}</div>
          <div className="sig-line">Подпись: <div className="line" /></div>
          <div className="sig-line">Дата: <div className="line" /></div>
          <div className="sig-line">М.П.: <div className="line" /></div>
        </div>
        <div className="sig-block">
          <h3>Подрядчик</h3>
          <div className="sig-line">ФИО: {contractor || <div className="line" />}</div>
          <div className="sig-line">Подпись: <div className="line" /></div>
          <div className="sig-line">Дата: <div className="line" /></div>
          <div className="sig-line">М.П.: <div className="line" /></div>
        </div>
      </div>

      <div className="footer">
        Смета № С-{docNum} от {date} г. · Документ сформирован автоматически
      </div>
    </div>
  );
}

function KpView({ data }: { data: PrintData }) {
  const {
    items, lemanaItems, materialSurcharge, customer, contractor, address,
    phone, email, validDays = "30",
    inn, kpp, ogrn, legalAddress, bank, bik, checkingAccount,
    totalMaterials, adjustedWorks, grandTotal, deliveryCost = 0,
    deliveryFloor, deliveryHasElevator, docNum, date,
  } = data;

  const hasRequisites = inn || kpp || ogrn || legalAddress || bank || bik || checkingAccount;

  const totalWithDelivery = grandTotal + deliveryCost;
  const lemanaTotal = lemanaItems.reduce((s, i) => {
    const rounded = roundUpToPackaging(i.quantity, i.packaging || 1);
    return s + (i.price || 0) * rounded;
  }, 0);

  const validUntilDate = (() => {
    const parts = date.split(".");
    if (parts.length === 3) {
      const d = new Date(+parts[2], +parts[1] - 1, +parts[0]);
      d.setDate(d.getDate() + parseInt(validDays, 10));
      return d.toLocaleDateString("ru-RU");
    }
    return "";
  })();

  const grandAll = items.length > 0 ? totalWithDelivery : lemanaTotal;

  return (
    <div className="page">
      <PrintButtons />

      <p className="doc-title">Коммерческое предложение</p>
      <p className="doc-subtitle">КП-{docNum} от {date} г.</p>

      {/* Шапка: две колонки — адресат слева, исполнитель справа */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 14, fontSize: "9pt" }}>
        <tbody>
          <tr>
            <td style={{ width: "50%", verticalAlign: "top", paddingRight: 16 }}>
              <div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "8pt", color: "#555", marginBottom: 4, letterSpacing: "0.4px" }}>Кому</div>
              <div style={{ fontWeight: 700, fontSize: "10pt" }}>{customer || <span style={{ color: "#aaa" }}>_________________________</span>}</div>
              {address && <div style={{ marginTop: 3, color: "#333" }}>Адрес объекта: {address}</div>}
            </td>
            <td style={{ width: "50%", verticalAlign: "top", borderLeft: "1.5px solid #000", paddingLeft: 16 }}>
              <div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "8pt", color: "#555", marginBottom: 4, letterSpacing: "0.4px" }}>Исполнитель</div>
              <div style={{ fontWeight: 700, fontSize: "10pt" }}>{contractor || <span style={{ color: "#aaa" }}>_________________________</span>}</div>
              {phone && <div style={{ marginTop: 3, color: "#333" }}>Тел.: {phone}</div>}
              {email && <div style={{ color: "#333" }}>Email: {email}</div>}
              {legalAddress && <div style={{ color: "#333" }}>Адрес: {legalAddress}</div>}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Реквизиты */}
      {hasRequisites && (
        <div style={{ border: "1px solid #ccc", borderRadius: 2, padding: "7px 10px", marginBottom: 14, fontSize: "8pt", color: "#333" }}>
          <div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "7.5pt", color: "#555", marginBottom: 5, letterSpacing: "0.4px" }}>Реквизиты исполнителя</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 24px" }}>
            {inn && <div><strong>ИНН:</strong> {inn}</div>}
            {kpp && <div><strong>КПП:</strong> {kpp}</div>}
            {ogrn && <div><strong>ОГРН:</strong> {ogrn}</div>}
            {bank && <div><strong>Банк:</strong> {bank}</div>}
            {bik && <div><strong>БИК:</strong> {bik}</div>}
            {checkingAccount && <div style={{ gridColumn: checkingAccount.length > 24 ? "span 2" : undefined }}><strong>Р/с:</strong> {checkingAccount}</div>}
          </div>
        </div>
      )}

      {/* Мета: дата и срок */}
      <table className="meta-table" style={{ marginBottom: 14 }}>
        <tbody>
          <tr>
            <td>Дата:</td>
            <td>{date} г.</td>
          </tr>
          {validUntilDate && (
            <tr>
              <td>Действительно до:</td>
              <td>{validUntilDate} г.</td>
            </tr>
          )}
        </tbody>
      </table>

      {items.length > 0 && (
        <section>
          <h2>1. Состав работ и материалов</h2>
          <WorksTable items={items} />
          <div className="totals">
            <div className="row"><span>Материалы:</span><span className="val">{fmt(totalMaterials)}</span></div>
            <div className="row"><span>Работы:</span><span className="val">{fmt(adjustedWorks)}</span></div>
            {materialSurcharge > 0 && (
              <div className="row note">
                <span>в т.ч. коэфф. за объём материалов (×1,3):</span>
                <span className="val">+{fmt(materialSurcharge)}</span>
              </div>
            )}
            {deliveryCost > 0 && (
              <div className="row">
                <span>Доставка и подъём на {deliveryFloor} эт. ({deliveryHasElevator ? "с лифтом" : "без лифта"}):</span>
                <span className="val">+{fmt(deliveryCost)}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {lemanaItems.length > 0 && (
        <section>
          <h2>{items.length > 0 ? "2." : "1."} Материалы (спецификация)</h2>
          <MaterialsTable lemanaItems={lemanaItems} />
          {lemanaTotal > 0 && (
            <div className="totals">
              <div className="row"><span>Итого материалы:</span><span className="val">{fmt(lemanaTotal)}</span></div>
            </div>
          )}
        </section>
      )}

      {/* Итог */}
      <div style={{ border: "1.5px solid #000", borderRadius: 2, padding: "10px 14px", margin: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: "10.5pt", textTransform: "uppercase", letterSpacing: "0.3px" }}>Итоговая стоимость</span>
        <span style={{ fontWeight: 700, fontSize: "13pt" }}>{fmt(grandAll)}</span>
      </div>

      <div className="conditions">
        <h2>Условия</h2>
        <ol>
          <li>Цены актуальны на дату составления КП. Срок действия — {validDays} дней.</li>
          <li>Оплата: аванс 30% при заключении договора, остаток — по завершении работ.</li>
          <li>Начало работ — после подписания договора и внесения аванса.</li>
          <li>Гарантийные обязательства фиксируются в договоре подряда.</li>
          <li>Стоимость работ, не включённых в КП, рассчитывается дополнительно.</li>
        </ol>
      </div>

      <div style={{ marginTop: 20, maxWidth: "50%" }}>
        <div className="sig-block">
          <h3>Исполнитель</h3>
          <div className="sig-line">ФИО: {contractor || <div className="line" />}</div>
          <div className="sig-line">Подпись: <div className="line" /></div>
          <div className="sig-line">Дата: <div className="line" /></div>
        </div>
      </div>

      <div className="footer">
        КП-{docNum} от {date} г. · Документ сформирован автоматически
      </div>
    </div>
  );
}

export default function EstimatePrint() {
  const location = useLocation();
  const data: PrintData | null = location.state ?? null;

  useEffect(() => {
    if (data) {
      const isKp = data.docType === "kp";
      document.title = isKp
        ? `КП-${data.docNum} от ${data.date}`
        : `Смета № С-${data.docNum} от ${data.date}`;
      setTimeout(() => window.print(), 400);
    }
  }, [data]);

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Нет данных для печати. Вернитесь в калькулятор и нажмите «Скачать PDF».</p>
      </div>
    );
  }

  return (
    <>
      <style>{COMMON_STYLES}</style>
      {data.docType === "kp" ? <KpView data={data} /> : <SmetaView data={data} />}
    </>
  );
}