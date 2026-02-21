import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface ContractData {
  masterName: string;
  masterPhone: string;
  masterEmail: string;
  businessStatus: string;
  inn?: string;
  contractDate: string;
  contractNum: string;
}

const BUSINESS_LABELS: Record<string, string> = {
  self_employed: "Самозанятый",
  ip: "Индивидуальный предприниматель",
  ooo: "Общество с ограниченной ответственностью",
  individual: "Физическое лицо",
};

export default function AgencyContract() {
  const location = useLocation();
  const data: ContractData | null = location.state ?? null;

  const today = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  const docNum = data?.contractNum || `АГ-${Date.now().toString().slice(-6)}`;
  const docDate = data?.contractDate || today;
  const masterName = data?.masterName || "____________________________";
  const masterPhone = data?.masterPhone || "____________________________";
  const masterEmail = data?.masterEmail || "____________________________";
  const businessLabel = data?.businessStatus ? (BUSINESS_LABELS[data.businessStatus] || data.businessStatus) : "____________________________";
  const inn = data?.inn || "____________________________";

  useEffect(() => {
    document.title = `Агентский договор № ${docNum}`;
    setTimeout(() => window.print(), 400);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Roboto', Arial, sans-serif; font-size: 11pt; color: #1a1a1a; background: #fff; }
        .page { max-width: 210mm; margin: 0 auto; padding: 15mm 20mm 20mm; }
        h1 { font-size: 14pt; font-weight: 700; text-align: center; margin-bottom: 4px; text-transform: uppercase; }
        .center { text-align: center; }
        .doc-num { text-align: center; font-size: 10pt; color: #555; margin-bottom: 20px; }
        .parties { border: 1px solid #ddd; border-radius: 4px; padding: 12px 16px; background: #f9fafb; margin-bottom: 20px; font-size: 9.5pt; line-height: 1.8; }
        .parties strong { color: #111; }
        .section { margin-bottom: 16px; }
        .section h2 { font-size: 11pt; font-weight: 700; margin-bottom: 8px; }
        .section p { font-size: 9.5pt; line-height: 1.7; margin-bottom: 6px; }
        .section ol { padding-left: 20px; font-size: 9.5pt; line-height: 1.8; }
        .section ol li { margin-bottom: 4px; }
        .highlight { background: #fff7ed; border-left: 3px solid #f59e0b; padding: 8px 12px; margin: 10px 0; font-size: 9.5pt; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 24px; }
        .sig-block h3 { font-size: 10pt; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; }
        .sig-line { font-size: 9pt; color: #333; margin-bottom: 10px; }
        .sig-line .line { border-bottom: 1px solid #888; margin-top: 4px; height: 20px; }
        .footer { text-align: center; font-size: 7.5pt; color: #aaa; margin-top: 20px; border-top: 1px solid #eee; padding-top: 8px; }
        @media print {
          @page { size: A4 portrait; margin: 10mm 15mm 15mm; }
          body { font-size: 10pt; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="page">
        <div className="no-print" style={{ textAlign: "right", marginBottom: 16 }}>
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

        <h1>Агентский договор</h1>
        <p className="doc-num">№ {docNum} от {docDate} г.</p>

        <div className="parties">
          <p><strong>Принципал (Агрегатор):</strong> ООО «Авангард», ИНН 6312000000, юридический адрес: г. Самара, ул. Примерная, д. 1, в лице Генерального директора, действующего на основании Устава, — именуемое в дальнейшем «Агрегатор».</p>
          <p style={{ marginTop: 8 }}><strong>Агент (Исполнитель):</strong> {businessLabel} {masterName}, ИНН {inn}, телефон: {masterPhone}, e-mail: {masterEmail} — именуемый в дальнейшем «Мастер».</p>
          <p style={{ marginTop: 8 }}>Совместно именуемые «Стороны», заключили настоящий договор о нижеследующем:</p>
        </div>

        <div className="section">
          <h2>1. Предмет договора</h2>
          <ol>
            <li>По настоящему договору Агрегатор обязуется от своего имени и за счёт Мастера совершать юридические и фактические действия по привлечению Заказчиков ремонтных работ, организации расчётов между Заказчиком и Мастером, а Мастер обязуется уплачивать Агрегатору агентское вознаграждение.</li>
            <li>Агрегатор обеспечивает Мастеру доступ к программной платформе «Авангард», включая личный кабинет, инструменты составления смет, договоров и актов.</li>
            <li>Агрегатор осуществляет приём оплаты от Заказчика и перечисляет Мастеру причитающиеся суммы за вычетом агентского вознаграждения.</li>
          </ol>
        </div>

        <div className="section">
          <h2>2. Финансовые условия и расчёты</h2>
          <div className="highlight">
            Агентское вознаграждение Агрегатора составляет <strong>5% (пять процентов)</strong> от суммы договора подряда между Мастером и Заказчиком (включая НДС, если применимо).
          </div>
          <ol>
            <li>Оплата Заказчиком производится на расчётный счёт Агрегатора в соответствии с условиями договора подряда.</li>
            <li>Агрегатор перечисляет Мастеру сумму полученной оплаты за вычетом агентского вознаграждения (5%) в течение 3 (трёх) рабочих дней с момента поступления денежных средств на счёт Агрегатора.</li>
            <li>Агент (Мастер) самостоятельно несёт ответственность за уплату налогов и сборов со своего дохода в соответствии с применимым законодательством РФ (самозанятый — налог 4–6%, ИП — согласно выбранному режиму).</li>
            <li>Агрегатор ежемесячно до 5-го числа месяца, следующего за расчётным, предоставляет Мастеру отчёт о выплатах и удержанном вознаграждении.</li>
            <li>Минимальная сумма для перевода составляет 1 000 (одна тысяча) рублей. Суммы менее указанного порога переносятся на следующий расчётный период.</li>
          </ol>
        </div>

        <div className="section">
          <h2>3. Обязанности Агрегатора</h2>
          <ol>
            <li>Размещать профиль Мастера в каталоге платформы «Авангард».</li>
            <li>Принимать оплату от Заказчиков и своевременно перечислять средства Мастеру.</li>
            <li>Предоставлять Мастеру инструменты для оформления смет, договоров и актов выполненных работ.</li>
            <li>Обеспечивать конфиденциальность персональных данных Мастера в соответствии с ФЗ-152.</li>
            <li>Уведомлять Мастера о поступивших заявках и оплатах в разделе «Уведомления» личного кабинета.</li>
          </ol>
        </div>

        <div className="section">
          <h2>4. Обязанности Мастера</h2>
          <ol>
            <li>Выполнять работы для Заказчиков в соответствии с условиями договоров подряда, заключённых при посредничестве Агрегатора.</li>
            <li>Не заключать договоры с Заказчиками, привлечёнными через платформу, в обход Агрегатора в течение 6 месяцев с момента первого контакта.</li>
            <li>Поддерживать актуальность профиля, рейтинга и контактной информации в личном кабинете.</li>
            <li>Уведомлять Агрегатора об изменении реквизитов для перечисления денежных средств не позднее чем за 3 рабочих дня.</li>
            <li>Соблюдать Правила платформы «Авангард», размещённые по адресу сайта.</li>
          </ol>
        </div>

        <div className="section">
          <h2>5. Ответственность сторон</h2>
          <ol>
            <li>Агрегатор несёт ответственность за своевременное перечисление средств Мастеру в соответствии с п. 2.2 настоящего договора.</li>
            <li>Мастер несёт полную ответственность перед Заказчиком за качество и сроки выполнения работ.</li>
            <li>При просрочке перечисления средств по вине Агрегатора Мастер вправе потребовать выплату неустойки в размере 0,1% от суммы задержанных средств за каждый день просрочки.</li>
            <li>Агрегатор не несёт ответственности за споры между Мастером и Заказчиком по качеству работ, однако вправе участвовать в урегулировании конфликта в качестве посредника.</li>
          </ol>
        </div>

        <div className="section">
          <h2>6. Срок действия и расторжение</h2>
          <ol>
            <li>Договор действует с даты подписания по <strong>01 июня 2026 года</strong> включительно. По истечении указанного срока договор считается прекращённым, если Стороны не заключат новое соглашение.</li>
            <li>Каждая из Сторон вправе расторгнуть договор досрочно в одностороннем порядке, направив письменное уведомление за 30 (тридцать) календарных дней.</li>
            <li>При расторжении договора все расчёты по заключённым ранее договорам подряда завершаются на условиях настоящего договора.</li>
          </ol>
        </div>

        <div className="section">
          <h2>7. Конфиденциальность</h2>
          <ol>
            <li>Стороны обязуются не раскрывать третьим лицам условия настоящего договора, а также финансовую и коммерческую информацию, ставшую им известной в ходе исполнения договора.</li>
            <li>Настоящий пункт не распространяется на случаи раскрытия информации по требованию уполномоченных органов государственной власти.</li>
          </ol>
        </div>

        <div className="section">
          <h2>8. Заключительные положения</h2>
          <ol>
            <li>Настоящий договор составлен в двух экземплярах, имеющих одинаковую юридическую силу, по одному для каждой из Сторон.</li>
            <li>Все изменения и дополнения к настоящему договору действительны при условии их оформления в письменном виде и подписания уполномоченными представителями Сторон.</li>
            <li>Споры, вытекающие из настоящего договора, разрешаются путём переговоров, а при недостижении согласия — в Арбитражном суде Самарской области.</li>
            <li>Во всём остальном, не урегулированном настоящим договором, Стороны руководствуются действующим законодательством Российской Федерации (гл. 52 ГК РФ «Агентирование»).</li>
          </ol>
        </div>

        <div className="signatures">
          <div className="sig-block">
            <h3>Агрегатор</h3>
            <div className="sig-line">ООО «Авангард»</div>
            <div className="sig-line">ИНН: 6312000000</div>
            <div className="sig-line">г. Самара</div>
            <div className="sig-line" style={{ marginTop: 16 }}>Подпись: <div className="line" /></div>
            <div className="sig-line">М.П.</div>
          </div>
          <div className="sig-block">
            <h3>Мастер</h3>
            <div className="sig-line">{businessLabel}</div>
            <div className="sig-line">{masterName}</div>
            <div className="sig-line">ИНН: {inn}</div>
            <div className="sig-line" style={{ marginTop: 16 }}>Подпись: <div className="line" /></div>
            <div className="sig-line">М.П. (при наличии)</div>
          </div>
        </div>

        <div className="footer">
          Авангард · Агентский договор № {docNum} от {docDate} г. · Комиссия агрегатора: 5% от суммы договора
        </div>
      </div>
    </>
  );
}