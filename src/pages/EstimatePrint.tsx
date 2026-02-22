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

function SmetaView({ data }: { data: PrintData }) {
  const {
    items, lemanaItems, materialSurcharge, customer, contractor, address,
    totalMaterials, adjustedWorks, grandTotal, deliveryCost = 0,
    deliveryFloor, deliveryHasElivator: _dhe, deliveryHasElevator, docNum, date
  } = data as PrintData & { deliveryHasElivator?: boolean };

  const totalWithDelivery = grandTotal + deliveryCost;

  const lemanaTotal = lemanaItems.reduce((s, i) => {
    const rounded = roundUpToPackaging(i.quantity, i.packaging || 1);
    return s + (i.price || 0) * rounded;
  }, 0);

  const grouped = lemanaItems.reduce<Record<string, EstimateSavedItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="no-print" style={{ textAlign: "right", marginBottom: 12 }}>
        <button
          onClick={() => window.print()}
          style={{ background: "#f59e0b", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", fontFamily: "inherit", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
        >
          🖨 Распечатать / Сохранить PDF
        </button>
        <button
          onClick={() => window.history.back()}
          style={{ marginLeft: 10, background: "#f3f4f6", color: "#333", border: "none", borderRadius: 6, padding: "8px 16px", fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}
        >
          ← Назад
        </button>
      </div>

      <h1>СМЕТА НА ВЫПОЛНЕНИЕ РЕМОНТНЫХ РАБОТ</h1>
      <p className="subtitle">№ С-{docNum} от {date} г.</p>

      <div className="header-grid">
        <div className="header-row"><strong>Заказчик:</strong> {customer || <span style={{ color: "#aaa" }}>_________________________________</span>}</div>
        <div className="header-row"><strong>Адрес объекта:</strong> {address || <span style={{ color: "#aaa" }}>_________________________________</span>}</div>
        <div className="header-row"><strong>Подрядчик:</strong> {contractor || <span style={{ color: "#aaa" }}>_________________________________</span>}</div>
        <div className="header-row"><strong>Дата составления:</strong> {date} г.</div>
      </div>

      {items.length > 0 && (
        <section>
          <h2>1. Перечень работ и материалов</h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: 30 }} className="c">№</th>
                <th style={{ width: 80 }}>Раздел</th>
                <th>Наименование</th>
                <th style={{ width: 45 }} className="c">Ед. изм.</th>
                <th style={{ width: 50 }} className="c">Кол-во</th>
                <th style={{ width: 85 }} className="r">Цена, руб.</th>
                <th style={{ width: 90 }} className="r">Сумма, руб.</th>
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
            <div className="row bold"><span>ИТОГО ПО СМЕТЕ:</span><span className="val">{fmt(totalWithDelivery)}</span></div>
          </div>
        </section>
      )}

      {lemanaItems.length > 0 && (
        <section>
          <h2 style={{ borderBottomColor: "#22c55e" }}>
            {items.length > 0 ? "2." : "1."} Материалы (ЛеманаПро)
          </h2>
          <table>
            <thead>
              <tr className="lemana-head">
                <th style={{ width: 30 }} className="c">№</th>
                <th style={{ width: 90 }}>Категория</th>
                <th>Наименование товара</th>
                <th style={{ width: 70 }} className="c">Кол-во</th>
                <th style={{ width: 85 }} className="r">Цена, руб.</th>
                <th style={{ width: 90 }} className="r">Сумма, руб.</th>
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

          {lemanaTotal > 0 && (
            <div className="totals">
              <div className="row bold"><span>ИТОГО МАТЕРИАЛЫ:</span><span className="val">{fmt(lemanaTotal)}</span></div>
            </div>
          )}
        </section>
      )}

      <div className="conditions">
        <h2>Условия выполнения работ</h2>
        <ol>
          <li>Настоящая смета является предварительной и может быть скорректирована после осмотра объекта.</li>
          <li>Срок действия цен: 30 дней с даты составления документа.</li>
          <li>Оплата производится в соответствии с договором подряда: аванс — 30%, остаток — по завершении работ.</li>
          <li>Гарантия на выполненные работы устанавливается договором подряда.</li>
          <li>Стоимость дополнительных работ, не предусмотренных сметой, согласовывается дополнительно.</li>
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
        Ремонт+ · Смета № С-{docNum} от {date} г. · Документ сформирован автоматически
      </div>
    </div>
  );
}

function KpView({ data }: { data: PrintData }) {
  const {
    items, lemanaItems, materialSurcharge, customer, contractor, address,
    phone, email, validDays = "30",
    totalMaterials, adjustedWorks, grandTotal, deliveryCost = 0,
    deliveryFloor, deliveryHasElevator, docNum, date
  } = data;

  const totalWithDelivery = grandTotal + deliveryCost;

  const lemanaTotal = lemanaItems.reduce((s, i) => {
    const rounded = roundUpToPackaging(i.quantity, i.packaging || 1);
    return s + (i.price || 0) * rounded;
  }, 0);

  const grouped = lemanaItems.reduce<Record<string, EstimateSavedItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const validUntilDate = (() => {
    const parts = date.split(".");
    if (parts.length === 3) {
      const d = new Date(+parts[2], +parts[1] - 1, +parts[0]);
      d.setDate(d.getDate() + parseInt(validDays, 10));
      return d.toLocaleDateString("ru-RU");
    }
    return "";
  })();

  return (
    <div className="page">
      <div className="no-print" style={{ textAlign: "right", marginBottom: 12 }}>
        <button
          onClick={() => window.print()}
          style={{ background: "#f59e0b", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", fontFamily: "inherit", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
        >
          🖨 Распечатать / Сохранить PDF
        </button>
        <button
          onClick={() => window.history.back()}
          style={{ marginLeft: 10, background: "#f3f4f6", color: "#333", border: "none", borderRadius: 6, padding: "8px 16px", fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}
        >
          ← Назад
        </button>
      </div>

      {/* Шапка КП */}
      <div className="kp-header">
        <div className="kp-badge">КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</div>
        <p className="kp-num">КП-{docNum} от {date} г.</p>
      </div>

      {/* Адресат и отправитель */}
      <div className="kp-parties">
        <div className="kp-party">
          <div className="kp-party-label">Кому:</div>
          <div className="kp-party-name">{customer || <span style={{ color: "#aaa" }}>_________________________________</span>}</div>
          {address && <div className="kp-party-sub">{address}</div>}
        </div>
        <div className="kp-party kp-party-right">
          <div className="kp-party-label">От кого:</div>
          <div className="kp-party-name">{contractor || <span style={{ color: "#aaa" }}>_________________________________</span>}</div>
          {phone && <div className="kp-party-sub">Тел.: {phone}</div>}
          {email && <div className="kp-party-sub">Email: {email}</div>}
        </div>
      </div>

      {/* Вступительный текст */}
      <div className="kp-intro">
        <p>
          Уважаемый{customer ? ` ${customer.split(" ")[0]}` : ""}! Мы рады предложить Вам наши услуги по выполнению ремонтных работ. 
          Ниже представлен подробный расчёт стоимости с разбивкой по видам работ и материалам.
        </p>
      </div>

      {/* Таблица работ */}
      {items.length > 0 && (
        <section>
          <h2>Состав работ и материалов</h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: 30 }} className="c">№</th>
                <th style={{ width: 80 }}>Раздел</th>
                <th>Наименование</th>
                <th style={{ width: 45 }} className="c">Ед.</th>
                <th style={{ width: 50 }} className="c">Кол-во</th>
                <th style={{ width: 85 }} className="r">Цена, руб.</th>
                <th style={{ width: 90 }} className="r">Сумма, руб.</th>
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

      {/* Материалы ЛеманаПро */}
      {lemanaItems.length > 0 && (
        <section>
          <h2 style={{ borderBottomColor: "#22c55e" }}>Материалы (спецификация)</h2>
          <table>
            <thead>
              <tr className="lemana-head">
                <th style={{ width: 30 }} className="c">№</th>
                <th style={{ width: 90 }}>Категория</th>
                <th>Наименование</th>
                <th style={{ width: 70 }} className="c">Кол-во</th>
                <th style={{ width: 85 }} className="r">Цена, руб.</th>
                <th style={{ width: 90 }} className="r">Сумма, руб.</th>
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
          {lemanaTotal > 0 && (
            <div className="totals">
              <div className="row"><span>Итого материалы:</span><span className="val">{fmt(lemanaTotal)}</span></div>
            </div>
          )}
        </section>
      )}

      {/* Итоговый блок КП */}
      <div className="kp-total-box">
        <div className="kp-total-label">ИТОГОВАЯ СТОИМОСТЬ</div>
        <div className="kp-total-amount">{fmt(totalWithDelivery + (lemanaItems.length > 0 && items.length === 0 ? lemanaTotal : 0))}</div>
        {validUntilDate && (
          <div className="kp-total-note">Предложение действительно до {validUntilDate} г.</div>
        )}
      </div>

      {/* Почему мы */}
      <div className="kp-benefits">
        <h2>Наши преимущества</h2>
        <div className="kp-benefits-grid">
          <div className="kp-benefit">
            <div className="kp-benefit-icon">✅</div>
            <div>
              <strong>Фиксированная цена</strong>
              <p>Стоимость закреплена в договоре и не меняется в процессе работ</p>
            </div>
          </div>
          <div className="kp-benefit">
            <div className="kp-benefit-icon">🏆</div>
            <div>
              <strong>Опытная бригада</strong>
              <p>Все специалисты проверены и имеют подтверждённый опыт</p>
            </div>
          </div>
          <div className="kp-benefit">
            <div className="kp-benefit-icon">📋</div>
            <div>
              <strong>Договор и гарантия</strong>
              <p>Работаем официально, предоставляем гарантию на все виды работ</p>
            </div>
          </div>
          <div className="kp-benefit">
            <div className="kp-benefit-icon">📸</div>
            <div>
              <strong>Фотоотчёт</strong>
              <p>Ежедневный отчёт о ходе работ с фотографиями</p>
            </div>
          </div>
        </div>
      </div>

      {/* Условия */}
      <div className="conditions">
        <h2>Условия сотрудничества</h2>
        <ol>
          <li>Цены актуальны на дату составления предложения. Срок действия КП: {validDays} дней.</li>
          <li>Оплата: аванс 30% при заключении договора, остаток — по факту завершения работ.</li>
          <li>Начало работ — в согласованные сроки после подписания договора и внесения аванса.</li>
          <li>Гарантийные обязательства фиксируются в договоре подряда.</li>
          <li>Стоимость работ, не включённых в КП, рассчитывается дополнительно.</li>
        </ol>
      </div>

      {/* Контакты для связи */}
      {(contractor || phone || email) && (
        <div className="kp-contacts">
          <h2>Контакты</h2>
          <div className="kp-contacts-grid">
            {contractor && <div><strong>Представитель:</strong> {contractor}</div>}
            {phone && <div><strong>Телефон:</strong> {phone}</div>}
            {email && <div><strong>Email:</strong> {email}</div>}
          </div>
          <p style={{ marginTop: 8, fontSize: "9pt", color: "#666" }}>
            Мы готовы ответить на все Ваши вопросы и выехать на бесплатный замер объекта.
          </p>
        </div>
      )}

      <div className="footer">
        Ремонт+ · КП-{docNum} от {date} г. · Документ сформирован автоматически
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

  const isKp = data.docType === "kp";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Roboto', Arial, sans-serif; font-size: 11pt; color: #1a1a1a; background: #fff; }
        .page { max-width: 210mm; margin: 0 auto; padding: 15mm 15mm 20mm; }
        h1 { font-size: 15pt; font-weight: 700; text-align: center; margin-bottom: 4px; }
        .subtitle { text-align: center; font-size: 9pt; color: #666; margin-bottom: 12px; }
        .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 14px; border: 1px solid #ddd; border-radius: 4px; padding: 10px 12px; background: #f9fafb; }
        .header-row { font-size: 9.5pt; color: #333; }
        .header-row strong { color: #111; }
        section { margin-bottom: 16px; }
        section h2 { font-size: 11pt; font-weight: 700; margin-bottom: 6px; border-bottom: 2px solid #f59e0b; padding-bottom: 3px; }
        table { width: 100%; border-collapse: collapse; font-size: 9pt; }
        thead tr { background: #f59e0b; color: #fff; }
        thead th { padding: 5px 6px; text-align: left; font-weight: 600; }
        thead th.r { text-align: right; }
        thead th.c { text-align: center; }
        tbody tr:nth-child(even) { background: #fafafa; }
        tbody td { padding: 4px 6px; border-bottom: 1px solid #eee; vertical-align: top; }
        tbody td.r { text-align: right; }
        tbody td.c { text-align: center; }
        .totals { margin-top: 8px; display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
        .totals .row { display: flex; gap: 20px; font-size: 9.5pt; color: #444; }
        .totals .row.bold { font-weight: 700; font-size: 11pt; color: #111; border-top: 1px solid #ccc; padding-top: 4px; margin-top: 2px; }
        .totals .val { min-width: 120px; text-align: right; }
        .note { font-size: 8pt; color: #e08000; margin-top: 2px; }
        .conditions { margin-bottom: 16px; }
        .conditions h2 { font-size: 10pt; font-weight: 700; margin-bottom: 6px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
        .conditions ol { padding-left: 18px; font-size: 9pt; color: #333; line-height: 1.7; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 16px; }
        .sig-block { border: 1px solid #ccc; border-radius: 4px; padding: 12px; }
        .sig-block h3 { font-size: 10pt; font-weight: 700; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .sig-line { margin-bottom: 12px; font-size: 9pt; color: #333; }
        .sig-line .line { border-bottom: 1px solid #888; margin-top: 4px; height: 18px; }
        .footer { text-align: center; font-size: 7.5pt; color: #aaa; margin-top: 20px; border-top: 1px solid #eee; padding-top: 8px; }
        .lemana-head { background: #22c55e !important; }

        /* КП стили */
        .kp-header { text-align: center; margin-bottom: 16px; padding: 16px; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); border-radius: 8px; color: #fff; }
        .kp-badge { font-size: 17pt; font-weight: 700; letter-spacing: 1px; }
        .kp-num { font-size: 9pt; opacity: 0.85; margin-top: 4px; }
        .kp-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        .kp-party { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 12px; }
        .kp-party-right { border-left: 3px solid #f59e0b; }
        .kp-party-label { font-size: 8pt; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
        .kp-party-name { font-size: 10.5pt; font-weight: 700; color: #111; }
        .kp-party-sub { font-size: 8.5pt; color: #555; margin-top: 2px; }
        .kp-intro { margin-bottom: 14px; font-size: 9.5pt; color: #444; line-height: 1.6; border-left: 3px solid #f59e0b; padding-left: 10px; }
        .kp-total-box { background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%); border: 2px solid #f59e0b; border-radius: 8px; padding: 16px 20px; text-align: center; margin: 16px 0; }
        .kp-total-label { font-size: 10pt; color: #92400e; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .kp-total-amount { font-size: 22pt; font-weight: 700; color: #ea580c; }
        .kp-total-note { font-size: 8.5pt; color: #b45309; margin-top: 6px; }
        .kp-benefits { margin-bottom: 16px; }
        .kp-benefits h2 { font-size: 10pt; font-weight: 700; margin-bottom: 8px; border-bottom: 2px solid #f59e0b; padding-bottom: 3px; }
        .kp-benefits-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .kp-benefit { display: flex; gap: 8px; align-items: flex-start; background: #f9fafb; border-radius: 6px; padding: 8px 10px; font-size: 8.5pt; }
        .kp-benefit-icon { font-size: 14pt; line-height: 1; }
        .kp-benefit strong { display: block; margin-bottom: 2px; color: #111; font-size: 9pt; }
        .kp-benefit p { color: #666; margin: 0; line-height: 1.4; }
        .kp-contacts { margin-bottom: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px 14px; }
        .kp-contacts h2 { font-size: 10pt; font-weight: 700; margin-bottom: 8px; border-bottom: 1px solid #86efac; padding-bottom: 3px; color: #166534; }
        .kp-contacts-grid { display: flex; gap: 24px; font-size: 9pt; flex-wrap: wrap; }

        @media print {
          @page { size: A4 portrait; margin: 10mm 12mm 15mm; }
          body { font-size: 10pt; }
          .no-print { display: none !important; }
        }
      `}</style>

      {isKp ? <KpView data={data} /> : <SmetaView data={data} />}
    </>
  );
}
