import { roundUpToPackaging } from "@/lib/lemanapro-data";
import { fmt } from "./PrintTypes";
import { PrintButtons, WorksTable, MaterialsTable } from "./PrintShared";
import type { PrintData } from "./PrintTypes";

export default function KpView({ data }: { data: PrintData }) {
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
      <PrintButtons
        docTitle={`КП-${docNum} от ${date}`}
        totalSum={grandAll}
        customerEmail={email}
        customerPhone={phone}
        docType="kp"
      />

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