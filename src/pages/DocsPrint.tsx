import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SharePanel from "@/components/print/SharePanel";
import { roundUpToPackaging } from "@/lib/lemanapro-data";
import type { EstimateItem } from "@/pages/Calculator";
import type { EstimateSavedItem } from "@/lib/lemanapro-data";

interface DocForm {
  customer: string;
  customerAddress: string;
  customerPassport: string;
  contractor: string;
  contractorInn: string;
  contractorAddress: string;
  objectAddress: string;
  contractNum: string;
  contractDate: string;
  startDate: string;
  endDate: string;
  advancePercent: string;
  paymentConditions: string;
  hiddenWorkDesc: string;
  actNum: string;
  actDate: string;
}

interface PrintState {
  docId: string;
  form: DocForm;
  items: EstimateItem[];
  lemanaItems: EstimateSavedItem[];
  grandTotal: number;
  materialSurcharge: number;
  totalMaterials: number;
  totalWorks: number;
  adjustedWorks: number;
}

const fmt = (n: number) => n.toLocaleString("ru-RU") + " руб.";
const fmtN = (n: number) => n.toLocaleString("ru-RU");
const blank = (label: string) => `<span style="border-bottom:1px solid #888;display:inline-block;min-width:160px;color:#aaa">${label || "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"}</span>`;

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Roboto',Arial,sans-serif;font-size:11pt;color:#111;background:#fff}
.page{max-width:210mm;margin:0 auto;padding:15mm 15mm 20mm}
h1{font-size:14pt;font-weight:700;text-align:center;margin-bottom:4px}
h2{font-size:11pt;font-weight:700;margin:14px 0 6px;border-bottom:2px solid #f59e0b;padding-bottom:3px}
h2.green{border-bottom-color:#22c55e}
.subtitle{text-align:center;font-size:9pt;color:#666;margin-bottom:14px}
.parties{display:grid;grid-template-columns:1fr 1fr;gap:8px;border:1px solid #ddd;border-radius:4px;padding:10px 12px;background:#f9fafb;margin-bottom:14px;font-size:9.5pt}
p{margin-bottom:6px;font-size:10pt;line-height:1.6}
.indent{text-indent:20px}
table{width:100%;border-collapse:collapse;font-size:9pt;margin-bottom:8px}
thead tr{background:#f59e0b;color:#fff}
thead th{padding:5px 6px;text-align:left;font-weight:600}
th.r,td.r{text-align:right}th.c,td.c{text-align:center}
tbody tr:nth-child(even){background:#fafafa}
tbody td{padding:4px 6px;border-bottom:1px solid #eee;vertical-align:top}
.totals{display:flex;flex-direction:column;align-items:flex-end;gap:3px;margin-bottom:12px}
.trow{display:flex;gap:16px;font-size:9.5pt;color:#444}
.trow.bold{font-weight:700;font-size:11pt;color:#111;border-top:1px solid #ccc;padding-top:4px;margin-top:2px}
.tval{min-width:130px;text-align:right}
.sig{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:20px}
.sig-block{border:1px solid #ccc;border-radius:4px;padding:12px}
.sig-block h3{font-size:9.5pt;font-weight:700;text-transform:uppercase;margin-bottom:10px}
.sig-line{margin-bottom:10px;font-size:9pt;color:#333}
.sig-line .ln{border-bottom:1px solid #888;margin-top:4px;height:18px}
.footer{text-align:center;font-size:7.5pt;color:#aaa;margin-top:20px;border-top:1px solid #eee;padding-top:8px}
.no-print{text-align:right;margin-bottom:12px}
.btn{background:#f59e0b;color:#fff;border:none;border-radius:6px;padding:8px 20px;font-family:inherit;font-size:13px;cursor:pointer;font-weight:600}
.btn-back{margin-left:10px;background:#f3f4f6;color:#333;border:none;border-radius:6px;padding:8px 16px;font-family:inherit;font-size:13px;cursor:pointer}
.section{margin-bottom:14px}
.clause{margin-bottom:8px;font-size:10pt;line-height:1.65}
.clause-num{font-weight:700}
@media print{@page{size:A4 portrait;margin:10mm 12mm 15mm}.no-print{display:none!important}body{font-size:10pt}}
`;

function Contract({ form, grandTotal, materialSurcharge, items }: { form: DocForm; grandTotal: number; materialSurcharge: number; items: EstimateItem[] }) {
  const advance = Math.round(grandTotal * (parseFloat(form.advancePercent || "30") / 100));
  const rest = grandTotal - advance;
  const startFmt = form.startDate ? new Date(form.startDate).toLocaleDateString("ru-RU") : "____.____.______";
  const endFmt = form.endDate ? new Date(form.endDate).toLocaleDateString("ru-RU") : "____.____.______";

  return (
    <>
      <h1>ДОГОВОР ПОДРЯДА № {form.contractNum || "___"}</h1>
      <p className="subtitle">на выполнение ремонтных работ</p>

      <div className="parties">
        <div><b>Заказчик:</b> {form.customer || "___________________________"}</div>
        <div><b>Адрес объекта:</b> {form.objectAddress || "___________________________"}</div>
        <div><b>Подрядчик:</b> {form.contractor || "___________________________"}{form.contractorInn ? `, ИНН ${form.contractorInn}` : ""}</div>
        <div><b>Дата:</b> {form.contractDate} г.</div>
      </div>

      <p className="indent">
        Настоящий договор заключён между <b>{form.customer || "___________________________"}</b> (далее — Заказчик){form.customerAddress ? `, проживающего по адресу: ${form.customerAddress}` : ""}{form.customerPassport ? `, паспорт: ${form.customerPassport}` : ""},
        с одной стороны, и <b>{form.contractor || "___________________________"}</b>{form.contractorInn ? ` (ИНН ${form.contractorInn})` : ""}{form.contractorAddress ? `, адрес: ${form.contractorAddress}` : ""} (далее — Подрядчик), с другой стороны, о нижеследующем:
      </p>

      <h2>1. Предмет договора</h2>
      <p className="clause"><span className="clause-num">1.1.</span> Подрядчик обязуется выполнить ремонтные работы на объекте по адресу: <b>{form.objectAddress || "___________________________"}</b>, в соответствии со сметой, являющейся Приложением № 1 к настоящему договору, а Заказчик обязуется принять результат работ и оплатить его.</p>
      <p className="clause"><span className="clause-num">1.2.</span> Состав работ определяется сметой (Приложение № 1). Стоимость дополнительных работ, не включённых в смету, согласовывается дополнительным соглашением.</p>

      <h2>2. Сроки выполнения работ</h2>
      <p className="clause"><span className="clause-num">2.1.</span> Начало работ: <b>{startFmt}</b> г.</p>
      <p className="clause"><span className="clause-num">2.2.</span> Окончание работ: <b>{endFmt}</b> г.</p>
      <p className="clause"><span className="clause-num">2.3.</span> Сроки могут быть изменены по соглашению сторон при наличии обстоятельств, не зависящих от Подрядчика (задержка поставки материалов Заказчиком, форс-мажор и т.п.).</p>

      <h2>3. Стоимость работ и порядок оплаты</h2>
      <p className="clause"><span className="clause-num">3.1.</span> Общая стоимость работ по настоящему договору составляет: <b>{fmt(grandTotal)}</b> (НДС не облагается).</p>
      <p className="clause"><span className="clause-num">3.2.</span> Аванс: <b>{fmt(advance)}</b> ({form.advancePercent || "30"}% от стоимости) — оплачивается в течение 3 рабочих дней с момента подписания договора.</p>
      <p className="clause"><span className="clause-num">3.3.</span> Окончательный расчёт: <b>{fmt(rest)}</b> — оплачивается в течение 3 рабочих дней после подписания акта выполненных работ.</p>
      {form.paymentConditions && <p className="clause"><span className="clause-num">3.4.</span> {form.paymentConditions}</p>}

      <h2>4. Права и обязанности сторон</h2>
      <p className="clause"><span className="clause-num">4.1.</span> Подрядчик обязан: выполнить работы в установленные сроки; обеспечить качество работ в соответствии с действующими строительными нормами и правилами; своевременно информировать Заказчика о возникающих проблемах.</p>
      <p className="clause"><span className="clause-num">4.2.</span> Заказчик обязан: обеспечить Подрядчику доступ к объекту; своевременно производить оплату; принять результат работ.</p>

      <h2>5. Гарантии</h2>
      <p className="clause"><span className="clause-num">5.1.</span> Подрядчик предоставляет гарантию на выполненные работы сроком <b>12 месяцев</b> с даты подписания акта выполненных работ.</p>
      <p className="clause"><span className="clause-num">5.2.</span> Гарантия не распространяется на дефекты, возникшие вследствие ненадлежащей эксплуатации или действий третьих лиц.</p>

      <h2>6. Ответственность сторон</h2>
      <p className="clause"><span className="clause-num">6.1.</span> За нарушение сроков оплаты Заказчик уплачивает пени в размере 0,1% от суммы задолженности за каждый день просрочки.</p>
      <p className="clause"><span className="clause-num">6.2.</span> За нарушение сроков выполнения работ Подрядчик уплачивает пени в размере 0,1% от стоимости не выполненных в срок работ за каждый день просрочки.</p>

      <h2>7. Порядок разрешения споров</h2>
      <p className="clause"><span className="clause-num">7.1.</span> Все споры разрешаются путём переговоров. При недостижении соглашения — в судебном порядке по месту нахождения ответчика.</p>

      <h2>8. Реквизиты и подписи сторон</h2>

      <div className="sig">
        <div className="sig-block">
          <h3>Заказчик</h3>
          <div className="sig-line">{form.customer || <div className="ln" />}</div>
          <div className="sig-line">{form.customerAddress || <div className="ln" />}</div>
          <div className="sig-line">Подпись: <div className="ln" /></div>
          <div className="sig-line">Дата: <div className="ln" /></div>
        </div>
        <div className="sig-block">
          <h3>Подрядчик</h3>
          <div className="sig-line">{form.contractor || <div className="ln" />}</div>
          {form.contractorInn && <div className="sig-line">ИНН: {form.contractorInn}</div>}
          <div className="sig-line">Подпись: <div className="ln" /></div>
          <div className="sig-line">Дата: <div className="ln" /></div>
        </div>
      </div>

      <p style={{ marginTop: 16, fontSize: "9pt", color: "#555" }}>
        <b>Приложение № 1</b> — Смета на выполнение работ (прилагается).
      </p>
    </>
  );
}

function HiddenAct({ form }: { form: DocForm }) {
  return (
    <>
      <h1>АКТ СКРЫТЫХ РАБОТ № {form.actNum || "___"}</h1>
      <p className="subtitle">приёмки скрытых работ</p>

      <div className="parties">
        <div><b>Заказчик:</b> {form.customer || "___________________________"}</div>
        <div><b>Объект:</b> {form.objectAddress || "___________________________"}</div>
        <div><b>Подрядчик:</b> {form.contractor || "___________________________"}</div>
        <div><b>Дата:</b> {form.actDate} г.</div>
      </div>

      <p className="indent">Заказчик в лице <b>{form.customer || "___________________________"}</b> и Подрядчик в лице <b>{form.contractor || "___________________________"}</b> составили настоящий акт о том, что на объекте по адресу: <b>{form.objectAddress || "___________________________"}</b> выполнены следующие скрытые работы, которые необходимо зафиксировать до их закрытия последующими конструкциями:</p>

      <h2>Перечень скрытых работ</h2>
      <p style={{ minHeight: 80, whiteSpace: "pre-wrap", border: "1px solid #eee", padding: 8, borderRadius: 4, fontSize: "10pt" }}>
        {form.hiddenWorkDesc || "Укажите перечень скрытых работ в разделе «Документы» калькулятора.\n\n\n\n"}
      </p>

      <h2>Заключение</h2>
      <p className="clause">Предъявленные к осмотру скрытые работы выполнены в соответствии с проектом и требованиями действующих нормативных документов. Разрешается производство последующих работ.</p>

      <h2>Представители сторон</h2>
      <div className="sig">
        <div className="sig-block">
          <h3>Заказчик</h3>
          <div className="sig-line">{form.customer || <div className="ln" />}</div>
          <div className="sig-line">Подпись: <div className="ln" /></div>
          <div className="sig-line">Дата: <div className="ln" /></div>
        </div>
        <div className="sig-block">
          <h3>Подрядчик</h3>
          <div className="sig-line">{form.contractor || <div className="ln" />}</div>
          <div className="sig-line">Подпись: <div className="ln" /></div>
          <div className="sig-line">Дата: <div className="ln" /></div>
        </div>
      </div>
    </>
  );
}

function KS2({ form, items, grandTotal, totalMaterials, adjustedWorks }: { form: DocForm; items: EstimateItem[]; grandTotal: number; totalMaterials: number; adjustedWorks: number }) {
  return (
    <>
      <h1>АКТ О ПРИЁМКЕ ВЫПОЛНЕННЫХ РАБОТ (КС-2)</h1>
      <p className="subtitle">Унифицированная форма № КС-2</p>

      <div className="parties">
        <div><b>Заказчик:</b> {form.customer || "___________________________"}</div>
        <div><b>Объект:</b> {form.objectAddress || "___________________________"}</div>
        <div><b>Подрядчик:</b> {form.contractor || "___________________________"}{form.contractorInn ? `, ИНН ${form.contractorInn}` : ""}</div>
        <div><b>Дата:</b> {form.actDate} г. &nbsp; <b>№:</b> {form.actNum || "___"}</div>
      </div>

      <h2>Перечень выполненных работ</h2>
      <table>
        <thead>
          <tr>
            <th style={{ width: 30 }} className="c">№</th>
            <th>Наименование работ</th>
            <th style={{ width: 50 }} className="c">Ед.</th>
            <th style={{ width: 55 }} className="c">Кол-во</th>
            <th style={{ width: 85 }} className="r">Цена, руб.</th>
            <th style={{ width: 90 }} className="r">Сумма, руб.</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? items.map((item, idx) => (
            <tr key={item.id}>
              <td className="c">{idx + 1}</td>
              <td>{item.name}</td>
              <td className="c">{item.unit}</td>
              <td className="c">{item.quantity}</td>
              <td className="r">{fmtN(item.price)}</td>
              <td className="r">{fmtN(item.total)}</td>
            </tr>
          )) : (
            <tr><td colSpan={6} style={{ textAlign: "center", color: "#aaa", padding: 16 }}>Добавьте позиции в смете</td></tr>
          )}
        </tbody>
      </table>

      <div className="totals">
        <div className="trow"><span>Итого материалы:</span><span className="tval">{fmt(totalMaterials)}</span></div>
        <div className="trow"><span>Итого работы:</span><span className="tval">{fmt(adjustedWorks)}</span></div>
        <div className="trow bold"><span>ИТОГО:</span><span className="tval">{fmt(grandTotal)}</span></div>
      </div>

      <p className="clause">Работы выполнены в соответствии с договором подряда № {form.contractNum || "___"} от {form.contractDate} г. и соответствуют требованиям нормативных документов.</p>

      <div className="sig">
        <div className="sig-block">
          <h3>Сдал (Подрядчик)</h3>
          <div className="sig-line">{form.contractor || <div className="ln" />}</div>
          <div className="sig-line">Подпись: <div className="ln" /></div>
          <div className="sig-line">Дата: <div className="ln" /></div>
        </div>
        <div className="sig-block">
          <h3>Принял (Заказчик)</h3>
          <div className="sig-line">{form.customer || <div className="ln" />}</div>
          <div className="sig-line">Подпись: <div className="ln" /></div>
          <div className="sig-line">Дата: <div className="ln" /></div>
        </div>
      </div>
    </>
  );
}

function KS3({ form, grandTotal, materialSurcharge, totalMaterials, adjustedWorks }: { form: DocForm; grandTotal: number; materialSurcharge: number; totalMaterials: number; adjustedWorks: number }) {
  const advance = Math.round(grandTotal * (parseFloat(form.advancePercent || "30") / 100));
  const rest = grandTotal - advance;

  return (
    <>
      <h1>СПРАВКА О СТОИМОСТИ ВЫПОЛНЕННЫХ РАБОТ И ЗАТРАТ (КС-3)</h1>
      <p className="subtitle">Унифицированная форма № КС-3</p>

      <div className="parties">
        <div><b>Заказчик:</b> {form.customer || "___________________________"}</div>
        <div><b>Объект:</b> {form.objectAddress || "___________________________"}</div>
        <div><b>Подрядчик:</b> {form.contractor || "___________________________"}{form.contractorInn ? `, ИНН ${form.contractorInn}` : ""}</div>
        <div><b>Договор № {form.contractNum || "___"} от {form.contractDate} г.</b></div>
      </div>

      <h2>Стоимость выполненных работ и затрат</h2>
      <table>
        <thead>
          <tr>
            <th style={{ width: 30 }} className="c">№</th>
            <th>Наименование</th>
            <th style={{ width: 120 }} className="r">Стоимость, руб.</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="c">1</td><td>Строительно-монтажные работы</td><td className="r">{fmtN(adjustedWorks)}</td></tr>
          <tr><td className="c">2</td><td>Материалы</td><td className="r">{fmtN(totalMaterials)}</td></tr>
          {materialSurcharge > 0 && <tr><td className="c"></td><td style={{ color: "#888", fontSize: "9pt" }}>&nbsp;&nbsp;в т.ч. надбавка за объём материалов</td><td className="r" style={{ color: "#888", fontSize: "9pt" }}>{fmtN(materialSurcharge)}</td></tr>}
          <tr style={{ fontWeight: 700 }}><td className="c"></td><td>ИТОГО</td><td className="r">{fmtN(grandTotal)}</td></tr>
        </tbody>
      </table>

      <h2>Взаиморасчёты</h2>
      <table>
        <thead>
          <tr>
            <th>Статья</th>
            <th style={{ width: 120 }} className="r">Сумма, руб.</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Общая стоимость работ по договору</td><td className="r">{fmtN(grandTotal)}</td></tr>
          <tr><td>Ранее оплачено (аванс {form.advancePercent || "30"}%)</td><td className="r">{fmtN(advance)}</td></tr>
          <tr style={{ fontWeight: 700 }}><td>К оплате (окончательный расчёт)</td><td className="r">{fmtN(rest)}</td></tr>
        </tbody>
      </table>

      <p className="clause" style={{ marginTop: 12 }}>НДС не облагается (в соответствии с применяемой системой налогообложения Подрядчика).</p>

      <div className="sig">
        <div className="sig-block">
          <h3>Подрядчик</h3>
          <div className="sig-line">{form.contractor || <div className="ln" />}</div>
          {form.contractorInn && <div className="sig-line">ИНН: {form.contractorInn}</div>}
          <div className="sig-line">Подпись: <div className="ln" /></div>
          <div className="sig-line">Дата: <div className="ln" /></div>
          <div className="sig-line">М.П.: <div className="ln" /></div>
        </div>
        <div className="sig-block">
          <h3>Заказчик</h3>
          <div className="sig-line">{form.customer || <div className="ln" />}</div>
          <div className="sig-line">Подпись: <div className="ln" /></div>
          <div className="sig-line">Дата: <div className="ln" /></div>
          <div className="sig-line">М.П.: <div className="ln" /></div>
        </div>
      </div>
    </>
  );
}

const DOC_TITLES: Record<string, string> = {
  contract: "Договор подряда",
  hidden: "Акт скрытых работ",
  ks2: "Акт КС-2",
  ks3: "Справка КС-3",
};

export default function DocsPrint() {
  const location = useLocation();
  const state: PrintState | null = location.state ?? null;

  useEffect(() => {
    if (state) {
      document.title = DOC_TITLES[state.docId] || "Документ";
      setTimeout(() => window.print(), 400);
    }
  }, [state]);

  if (!state) {
    return <div style={{ padding: 32, textAlign: "center", color: "#888" }}>Нет данных для печати. Вернитесь в калькулятор.</div>;
  }

  const { docId, form, items, lemanaItems, grandTotal, materialSurcharge, totalMaterials, totalWorks, adjustedWorks } = state;

  return (
    <>
      <style>{STYLES}</style>
      <div className="page">
        <div className="no-print">
          <SharePanel
            docTitle={DOC_TITLES[docId] || "Документ"}
            totalSum={grandTotal}
            docType="smeta"
          />
          <div style={{ textAlign: "right", marginBottom: 8 }}>
            <button className="btn" onClick={() => window.print()}>🖨 Распечатать / Сохранить PDF</button>
            <button className="btn-back" onClick={() => window.history.back()}>← Назад</button>
          </div>
        </div>

        {docId === "contract" && <Contract form={form} grandTotal={grandTotal} materialSurcharge={materialSurcharge} items={items} />}
        {docId === "hidden" && <HiddenAct form={form} />}
        {docId === "ks2" && <KS2 form={form} items={items} grandTotal={grandTotal} totalMaterials={totalMaterials} adjustedWorks={adjustedWorks} />}
        {docId === "ks3" && <KS3 form={form} grandTotal={grandTotal} materialSurcharge={materialSurcharge} totalMaterials={totalMaterials} adjustedWorks={adjustedWorks} />}

        <div className="footer">
          Ремонт+ · {DOC_TITLES[docId]} · Документ сформирован автоматически
        </div>
      </div>
    </>
  );
}