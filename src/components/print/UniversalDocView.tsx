// Универсальный рендер для КС-2, КС-3, Акта и Договора
// Принимает стандартизированные данные из любого калькулятора

export interface DocParty {
  name: string;
  address?: string;
  inn?: string;
  phone?: string;
  email?: string;
}

export interface DocItem {
  num: number;
  name: string;
  unit: string;
  qty: number;
  pricePerUnit: number;
  total: number;
}

export interface UniversalDocData {
  docType: "ks2" | "ks3" | "act" | "contract";
  docNum: string;
  date: string;
  startDate?: string;
  endDate?: string;
  contractNum?: string;
  contractDate?: string;
  customer: DocParty;
  contractor: DocParty;
  objectAddress: string;
  items: DocItem[];
  totalWorks: number;
  totalMaterials: number;
  grandTotal: number;
  advancePct?: number;
  warrantyMonths?: number;
  projectTitle: string;
}

const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU");
const fmtR = (n: number) => fmt(n) + " руб.";

const blank = (label?: string) =>
  `<span style="display:inline-block;min-width:140px;border-bottom:1px solid #999;color:#aaa;font-size:9pt">${label || "\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0"}</span>`;

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&family=PT+Sans:wght@400;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'PT Sans',Arial,sans-serif;font-size:10pt;color:#111;background:#fff}
.page{max-width:210mm;margin:0 auto;padding:15mm 16mm 20mm}
h1{font-family:'PT Serif',serif;font-size:13pt;font-weight:700;text-align:center;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
.subtitle{text-align:center;font-size:9pt;color:#555;margin-bottom:14px}
h2{font-size:10pt;font-weight:700;text-transform:uppercase;border-bottom:1.5px solid #111;padding-bottom:3px;margin:14px 0 7px}
.parties{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.party{border:1px solid #ccc;border-radius:4px;padding:9px 11px;font-size:9pt}
.party-title{font-weight:700;font-size:8pt;text-transform:uppercase;color:#666;letter-spacing:.4px;margin-bottom:5px}
.party-name{font-weight:700;font-size:10pt;margin-bottom:3px}
table{width:100%;border-collapse:collapse;font-size:8.5pt;margin-bottom:8px}
thead th{background:#111;color:#fff;padding:5px 6px;text-align:left;font-weight:600}
thead th.r{text-align:right}thead th.c{text-align:center}
tbody td{padding:4px 6px;border-bottom:1px solid #e5e7eb;vertical-align:top}
tbody td.r{text-align:right}tbody td.c{text-align:center}
tbody tr:nth-child(even) td{background:#f9fafb}
.totals{display:flex;flex-direction:column;align-items:flex-end;gap:3px;margin-bottom:14px}
.trow{display:flex;gap:16px;font-size:9.5pt;color:#444}
.trow.grand{font-weight:700;font-size:11pt;color:#111;border-top:2px solid #111;padding-top:4px;margin-top:3px}
.tval{min-width:160px;text-align:right}
.clause{margin-bottom:8px;font-size:10pt;line-height:1.65}
.clause-num{font-weight:700}
.sig{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px}
.sig-block{border:1px solid #ccc;border-radius:4px;padding:12px}
.sig-block h3{font-size:8.5pt;font-weight:700;text-transform:uppercase;margin-bottom:10px;color:#333}
.sig-line{margin-bottom:10px;font-size:9pt}
.sig-line .ln{border-bottom:1px solid #888;margin-top:5px;height:18px}
.footer{text-align:center;font-size:7.5pt;color:#aaa;margin-top:20px;border-top:1px solid #eee;padding-top:8px}
.no-print{margin-bottom:14px;text-align:right}
.btn{background:#111;color:#fff;border:none;border-radius:6px;padding:8px 20px;font-size:13px;cursor:pointer;font-weight:600;font-family:inherit;margin-left:8px}
.btn-back{background:#f3f4f6;color:#333;border:none;border-radius:6px;padding:8px 16px;font-size:13px;cursor:pointer;font-family:inherit}
@media print{@page{size:A4 portrait;margin:10mm 12mm 15mm}.no-print{display:none!important}}
`;

function PartyBlock({ title, party }: { title: string; party: DocParty }) {
  return (
    <div className="party">
      <div className="party-title">{title}</div>
      <div className="party-name">{party.name || "___________________________"}</div>
      {party.address && <div style={{ fontSize: "8.5pt", color: "#555", marginTop: 2 }}>{party.address}</div>}
      {party.inn && <div style={{ fontSize: "8.5pt", color: "#555" }}>ИНН: {party.inn}</div>}
      {party.phone && <div style={{ fontSize: "8.5pt", color: "#555" }}>{party.phone}</div>}
      {party.email && <div style={{ fontSize: "8.5pt", color: "#555" }}>{party.email}</div>}
    </div>
  );
}

function ItemsTable({ items, grandTotal, totalWorks, totalMaterials }: { items: DocItem[]; grandTotal: number; totalWorks: number; totalMaterials: number }) {
  return (
    <>
      <table>
        <thead>
          <tr>
            <th style={{ width: "4%" }}>№</th>
            <th style={{ width: "42%" }}>Наименование работ и материалов</th>
            <th className="c" style={{ width: "8%" }}>Ед.</th>
            <th className="r" style={{ width: "10%" }}>Кол-во</th>
            <th className="r" style={{ width: "18%" }}>Цена за ед., руб.</th>
            <th className="r" style={{ width: "18%" }}>Стоимость, руб.</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.num}>
              <td className="c" style={{ color: "#888" }}>{item.num}</td>
              <td>{item.name}</td>
              <td className="c" style={{ color: "#666" }}>{item.unit}</td>
              <td className="r">{item.qty % 1 === 0 ? item.qty : item.qty.toFixed(2)}</td>
              <td className="r">{fmt(item.pricePerUnit)}</td>
              <td className="r" style={{ fontWeight: 600 }}>{fmt(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="totals">
        {totalWorks > 0 && (
          <div className="trow">
            <span>Работы</span>
            <span className="tval">{fmtR(totalWorks)}</span>
          </div>
        )}
        {totalMaterials > 0 && (
          <div className="trow">
            <span>Материалы</span>
            <span className="tval">{fmtR(totalMaterials)}</span>
          </div>
        )}
        <div className="trow grand">
          <span>ИТОГО</span>
          <span className="tval">{fmtR(grandTotal)}</span>
        </div>
      </div>
    </>
  );
}

function Ks2View({ data }: { data: UniversalDocData }) {
  const contractRef = data.contractNum
    ? `№ ${data.contractNum} от ${data.contractDate || data.date}`
    : `от ${data.date}`;
  return (
    <div className="page">
      <div className="no-print">
        <button className="btn-back" onClick={() => window.history.back()}>← Назад</button>
        <button className="btn" onClick={() => window.print()}>🖨 Печать / PDF</button>
      </div>
      <h1>Акт о приёмке выполненных работ</h1>
      <p className="subtitle">Форма КС-2 · № {data.docNum} от {data.date} г.</p>
      <p style={{ fontSize: "9pt", marginBottom: 10, color: "#555" }}>
        По договору подряда {contractRef} · Объект: <strong>{data.objectAddress || "___________________________"}</strong>
        {data.startDate && data.endDate && ` · Период: ${data.startDate} — ${data.endDate}`}
      </p>
      <div className="parties">
        <PartyBlock title="Заказчик" party={data.customer} />
        <PartyBlock title="Подрядчик" party={data.contractor} />
      </div>
      <h2>Перечень выполненных работ</h2>
      <ItemsTable items={data.items} grandTotal={data.grandTotal} totalWorks={data.totalWorks} totalMaterials={data.totalMaterials} />
      <div className="sig">
        <div className="sig-block">
          <h3>Сдал (Подрядчик)</h3>
          <div className="sig-line">{data.contractor.name || <div className="ln" />}</div>
          <div className="sig-line">Подпись: <div className="ln" /></div>
          <div className="sig-line">Дата: <div className="ln" /></div>
        </div>
        <div className="sig-block">
          <h3>Принял (Заказчик)</h3>
          <div className="sig-line">{data.customer.name || <div className="ln" />}</div>
          <div className="sig-line">Подпись: <div className="ln" /></div>
          <div className="sig-line">Дата: <div className="ln" /></div>
        </div>
      </div>
      <div className="footer">Форма КС-2 · {data.projectTitle} · Сформировано: {data.date}</div>
    </div>
  );
}

function Ks3View({ data }: { data: UniversalDocData }) {
  const contractRef = data.contractNum
    ? `№ ${data.contractNum} от ${data.contractDate || data.date}`
    : `от ${data.date}`;
  return (
    <div className="page">
      <div className="no-print">
        <button className="btn-back" onClick={() => window.history.back()}>← Назад</button>
        <button className="btn" onClick={() => window.print()}>🖨 Печать / PDF</button>
      </div>
      <h1>Справка о стоимости выполненных работ</h1>
      <p className="subtitle">Форма КС-3 · № {data.docNum} от {data.date} г.</p>
      <p style={{ fontSize: "9pt", marginBottom: 10, color: "#555" }}>
        По договору подряда {contractRef} · Объект: <strong>{data.objectAddress || "___________________________"}</strong>
      </p>
      <div className="parties">
        <PartyBlock title="Заказчик" party={data.customer} />
        <PartyBlock title="Подрядчик" party={data.contractor} />
      </div>
      <h2>Сводная ведомость затрат</h2>
      <table>
        <thead>
          <tr>
            <th style={{ width: "5%" }}>№</th>
            <th style={{ width: "45%" }}>Наименование</th>
            <th className="r" style={{ width: "25%" }}>Стоимость по договору, руб.</th>
            <th className="r" style={{ width: "25%" }}>Выполнено в периоде, руб.</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="c">1</td>
            <td>Строительно-монтажные работы</td>
            <td className="r">{fmt(data.totalWorks)}</td>
            <td className="r">{fmt(data.totalWorks)}</td>
          </tr>
          <tr>
            <td className="c">2</td>
            <td>Материалы и оборудование</td>
            <td className="r">{fmt(data.totalMaterials)}</td>
            <td className="r">{fmt(data.totalMaterials)}</td>
          </tr>
          <tr style={{ fontWeight: 700 }}>
            <td className="c">—</td>
            <td>ИТОГО</td>
            <td className="r">{fmt(data.grandTotal)}</td>
            <td className="r">{fmt(data.grandTotal)}</td>
          </tr>
        </tbody>
      </table>
      <p style={{ fontSize: "9pt", color: "#555", marginBottom: 14 }}>
        В том числе НДС: не облагается (УСН / физическое лицо)
      </p>
      <div className="sig">
        <div className="sig-block">
          <h3>Подрядчик</h3>
          <div className="sig-line">{data.contractor.name || <div className="ln" />}</div>
          <div className="sig-line">Подпись: <div className="ln" /></div>
          <div className="sig-line">Дата: <div className="ln" /></div>
        </div>
        <div className="sig-block">
          <h3>Заказчик</h3>
          <div className="sig-line">{data.customer.name || <div className="ln" />}</div>
          <div className="sig-line">Подпись: <div className="ln" /></div>
          <div className="sig-line">Дата: <div className="ln" /></div>
        </div>
      </div>
      <div className="footer">Форма КС-3 · {data.projectTitle} · Сформировано: {data.date}</div>
    </div>
  );
}

function ActView({ data }: { data: UniversalDocData }) {
  const contractRef = data.contractNum
    ? `№ ${data.contractNum} от ${data.contractDate || data.date}`
    : `б/н от ${data.date}`;
  return (
    <div className="page">
      <div className="no-print">
        <button className="btn-back" onClick={() => window.history.back()}>← Назад</button>
        <button className="btn" onClick={() => window.print()}>🖨 Печать / PDF</button>
      </div>
      <h1>Акт выполненных работ</h1>
      <p className="subtitle">№ {data.docNum} от {data.date} г.</p>
      <div className="parties">
        <PartyBlock title="Заказчик" party={data.customer} />
        <PartyBlock title="Исполнитель" party={data.contractor} />
      </div>
      <p style={{ marginBottom: 12, fontSize: "10pt", lineHeight: 1.6 }}>
        Заказчик и Исполнитель составили настоящий акт о том, что в соответствии с договором подряда {contractRef}
        Исполнитель выполнил, а Заказчик принял следующие работы на объекте:{" "}
        <strong>{data.objectAddress || "___________________________"}</strong>
        {data.startDate && data.endDate && `, в период с ${data.startDate} по ${data.endDate}`}.
      </p>
      <h2>Перечень выполненных работ и материалов</h2>
      <ItemsTable items={data.items} grandTotal={data.grandTotal} totalWorks={data.totalWorks} totalMaterials={data.totalMaterials} />
      <p style={{ fontSize: "9.5pt", marginBottom: 14, lineHeight: 1.6 }}>
        Работы выполнены в полном объёме, в установленные сроки, в соответствии с техническим заданием.
        Претензий по объёму, качеству и срокам выполнения работ Заказчик не имеет.
        {(data.warrantyMonths || 12) > 0 && ` Гарантийный срок: ${data.warrantyMonths || 12} месяцев с даты подписания настоящего акта.`}
      </p>
      <div className="sig">
        <div className="sig-block">
          <h3>Исполнитель</h3>
          <div className="sig-line">{data.contractor.name || <div className="ln" />}</div>
          <div className="sig-line">Подпись: <div className="ln" /></div>
          <div className="sig-line">Дата: <div className="ln" /></div>
        </div>
        <div className="sig-block">
          <h3>Заказчик</h3>
          <div className="sig-line">{data.customer.name || <div className="ln" />}</div>
          <div className="sig-line">Подпись: <div className="ln" /></div>
          <div className="sig-line">Дата: <div className="ln" /></div>
        </div>
      </div>
      <div className="footer">Акт выполненных работ · {data.projectTitle} · {data.date}</div>
    </div>
  );
}

function ContractView({ data }: { data: UniversalDocData }) {
  const advance = Math.round(data.grandTotal * ((data.advancePct ?? 30) / 100));
  const rest = data.grandTotal - advance;
  return (
    <div className="page">
      <div className="no-print">
        <button className="btn-back" onClick={() => window.history.back()}>← Назад</button>
        <button className="btn" onClick={() => window.print()}>🖨 Печать / PDF</button>
      </div>
      <h1>Договор подряда № {data.contractNum || data.docNum}</h1>
      <p className="subtitle">на выполнение {data.projectTitle.toLowerCase()}</p>
      <div className="parties">
        <PartyBlock title="Заказчик" party={data.customer} />
        <PartyBlock title="Подрядчик" party={data.contractor} />
      </div>
      <p style={{ marginBottom: 14, fontSize: "10pt", lineHeight: 1.65 }}>
        Настоящий договор заключён между <strong>{data.customer.name || "___________________________"}</strong> (далее — Заказчик)
        и <strong>{data.contractor.name || "___________________________"}</strong>{data.contractor.inn ? ` (ИНН ${data.contractor.inn})` : ""} (далее — Подрядчик)
        о нижеследующем:
      </p>

      <h2>1. Предмет договора</h2>
      <p className="clause"><span className="clause-num">1.1.</span> Подрядчик обязуется выполнить <em>{data.projectTitle.toLowerCase()}</em> на объекте: <strong>{data.objectAddress || "___________________________"}</strong> в соответствии со сметой (Приложение № 1), а Заказчик — принять и оплатить результат.</p>
      <p className="clause"><span className="clause-num">1.2.</span> Состав работ определяется сметой. Дополнительные работы оформляются доп. соглашением.</p>

      <h2>2. Сроки</h2>
      <p className="clause"><span className="clause-num">2.1.</span> Начало работ: <strong>{data.startDate || "___________________________"}</strong></p>
      <p className="clause"><span className="clause-num">2.2.</span> Окончание работ: <strong>{data.endDate || "___________________________"}</strong></p>
      <p className="clause"><span className="clause-num">2.3.</span> Сроки могут быть изменены по соглашению сторон при обстоятельствах, не зависящих от Подрядчика.</p>

      <h2>3. Стоимость и оплата</h2>
      <p className="clause"><span className="clause-num">3.1.</span> Общая стоимость: <strong>{fmtR(data.grandTotal)}</strong> (НДС не облагается).</p>
      <p className="clause"><span className="clause-num">3.2.</span> Аванс: <strong>{fmtR(advance)}</strong> ({data.advancePct ?? 30}%) — в течение 3 рабочих дней с момента подписания договора.</p>
      <p className="clause"><span className="clause-num">3.3.</span> Остаток: <strong>{fmtR(rest)}</strong> — в течение 3 рабочих дней после подписания акта выполненных работ.</p>

      <h2>4. Обязательства сторон</h2>
      <p className="clause"><span className="clause-num">4.1.</span> Подрядчик обязан: выполнить работы в срок и надлежащего качества; уведомлять Заказчика о возникающих препятствиях.</p>
      <p className="clause"><span className="clause-num">4.2.</span> Заказчик обязан: обеспечить доступ к объекту; своевременно производить оплату; принять результат работ.</p>

      <h2>5. Гарантии</h2>
      <p className="clause"><span className="clause-num">5.1.</span> Гарантийный срок на выполненные работы — <strong>{data.warrantyMonths || 12} месяцев</strong> с даты подписания акта. Гарантия не распространяется на ущерб от ненадлежащей эксплуатации.</p>

      <h2>6. Ответственность</h2>
      <p className="clause"><span className="clause-num">6.1.</span> За просрочку оплаты — пени 0,1% от суммы задолженности за каждый день.</p>
      <p className="clause"><span className="clause-num">6.2.</span> За просрочку выполнения работ — пени 0,1% от стоимости невыполненных работ за каждый день.</p>

      <h2>7. Разрешение споров</h2>
      <p className="clause"><span className="clause-num">7.1.</span> Споры решаются переговорами, при недостижении соглашения — в судебном порядке по месту нахождения ответчика.</p>

      <h2>8. Подписи сторон</h2>
      <div className="sig">
        <div className="sig-block">
          <h3>Заказчик</h3>
          <div className="sig-line">{data.customer.name || <div className="ln" />}</div>
          {data.customer.address && <div className="sig-line" style={{ fontSize: "8.5pt", color: "#555" }}>{data.customer.address}</div>}
          <div className="sig-line">Подпись: <div className="ln" /></div>
          <div className="sig-line">Дата: <div className="ln" /></div>
        </div>
        <div className="sig-block">
          <h3>Подрядчик</h3>
          <div className="sig-line">{data.contractor.name || <div className="ln" />}</div>
          {data.contractor.inn && <div className="sig-line" style={{ fontSize: "8.5pt", color: "#555" }}>ИНН: {data.contractor.inn}</div>}
          <div className="sig-line">Подпись: <div className="ln" /></div>
          <div className="sig-line">Дата: <div className="ln" /></div>
        </div>
      </div>
      <div className="footer">Договор подряда № {data.contractNum || data.docNum} · {data.date} · {data.projectTitle}</div>
    </div>
  );
}

export default function UniversalDocView({ data }: { data: UniversalDocData }) {
  return (
    <>
      <style>{STYLES}</style>
      {data.docType === "ks2" && <Ks2View data={data} />}
      {data.docType === "ks3" && <Ks3View data={data} />}
      {data.docType === "act" && <ActView data={data} />}
      {data.docType === "contract" && <ContractView data={data} />}
    </>
  );
}
