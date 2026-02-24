import { roundUpToPackaging } from "@/lib/lemanapro-data";
import { fmt } from "./PrintTypes";
import { PrintButtons, WorksTable, MaterialsTable } from "./PrintShared";
import type { PrintData } from "./PrintTypes";

export default function SmetaView({ data }: { data: PrintData }) {
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
      <PrintButtons
        docTitle={`Смета № С-${docNum} от ${date}`}
        totalSum={totalWithDelivery}
        docType="smeta"
      />

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