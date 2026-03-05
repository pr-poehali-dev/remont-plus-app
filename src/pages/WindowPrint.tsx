import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CONSTRUCTION_TYPES, PROFILE_SYSTEMS, GLASS_UNITS } from "@/components/calculator/windows/WindowTypes";
import { fmt, WINDOW_PRINT_STYLES } from "@/components/print/WindowPrintTypes";
import type { WindowPrintState } from "@/components/print/WindowPrintTypes";
import WindowCard from "@/components/print/WindowCard";
import PrintPaywall from "@/components/print/PrintPaywall";
import UniversalDocView from "@/components/print/UniversalDocView";
import type { UniversalDocData } from "@/components/print/UniversalDocView";

export default function WindowPrint() {
  const location = useLocation();
  const state: WindowPrintState | null = location.state ?? (() => {
    try { return JSON.parse(sessionStorage.getItem("windows_print_state") || "null"); } catch { return null; }
  })();

  useEffect(() => {
    if (state) {
      const isKp = state.docType === "kp";
      document.title = isKp
        ? `КП-${state.docNum} (Окна) от ${state.date}`
        : `Смета на окна № С-${state.docNum} от ${state.date}`;
    }
    const blockKey = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || (e.ctrlKey && e.key === "p")) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", blockKey);
    return () => document.removeEventListener("keydown", blockKey);
  }, [state]);

  if (!state) {
    return (
      <div className="p-8 text-center text-gray-500">
        Нет данных для печати. Вернитесь в раздел «Окна» и нажмите «Создать документ».
      </div>
    );
  }

  const { configs, markupPct, totalSum, docNum, date, docType,
    customer, contractor, address, phone, email, validDays,
    inn, kpp, ogrn, legalAddress, bank, bik, checkingAccount } = state;

  const isKp = docType === "kp";
  const hasReq = inn || kpp || ogrn || legalAddress || bank;

  if (docType === "ks2" || docType === "ks3" || docType === "act" || docType === "contract") {
    const universalItems = configs.map((cfg, idx) => {
      const ct = CONSTRUCTION_TYPES.find(c => c.value === cfg.constructionType);
      const pf = PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId);
      const gl = GLASS_UNITS.find(g => g.id === cfg.glassUnitId);
      return {
        num: idx + 1,
        name: `${ct?.label || "Конструкция"}, ${cfg.width}×${cfg.height} мм${pf ? `, ${pf.brand} ${pf.series}` : ""}${gl ? `, ${gl.name}` : ""}`,
        unit: "шт.",
        qty: cfg.quantity,
        pricePerUnit: Math.round(cfg.totalPrice / cfg.quantity),
        total: cfg.totalPrice,
      };
    });
    const docData: UniversalDocData = {
      docType,
      docNum,
      date,
      startDate: (state as { startDate?: string }).startDate ? new Date((state as { startDate?: string }).startDate!).toLocaleDateString("ru-RU") : undefined,
      endDate: (state as { endDate?: string }).endDate ? new Date((state as { endDate?: string }).endDate!).toLocaleDateString("ru-RU") : undefined,
      contractNum: (state as { contractNum?: string }).contractNum,
      contractDate: (state as { contractDate?: string }).contractDate ? new Date((state as { contractDate?: string }).contractDate!).toLocaleDateString("ru-RU") : undefined,
      customer: { name: customer || "", inn: undefined, phone, email },
      contractor: { name: contractor || "", inn: inn || undefined, phone, email },
      objectAddress: address || "",
      items: universalItems,
      totalWorks: Math.round(totalSum * 0.3),
      totalMaterials: Math.round(totalSum * 0.7),
      grandTotal: totalSum,
      advancePct: parseFloat((state as { advancePct?: string }).advancePct || "30"),
      warrantyMonths: parseInt((state as { warrantyMonths?: string }).warrantyMonths || "12"),
      projectTitle: "Поставка и монтаж окон",
    };
    return (
      <PrintPaywall>
        <UniversalDocView data={docData} />
      </PrintPaywall>
    );
  }

  return (
    <>
      <style>{WINDOW_PRINT_STYLES}</style>

      <PrintPaywall>
      <div className="page">

        {/* Шапка */}
        {isKp ? (
          <>
            <p className="doc-title">Коммерческое предложение</p>
            <p className="doc-subtitle">на поставку и монтаж светопрозрачных конструкций · № КП-{docNum} от {date} г.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14, fontSize: "9pt" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: "8.5pt", color: "#555", textTransform: "uppercase", marginBottom: 4 }}>Кому</p>
                <p style={{ fontWeight: 700 }}>{customer || "_______________"}</p>
                {address && <p style={{ color: "#444", marginTop: 2 }}>{address}</p>}
                {validDays && <p style={{ color: "#666", marginTop: 4, fontSize: "8pt" }}>Предложение действительно {validDays} дней</p>}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: "8.5pt", color: "#555", textTransform: "uppercase", marginBottom: 4 }}>Исполнитель</p>
                <p style={{ fontWeight: 700 }}>{contractor || "_______________"}</p>
                {phone && <p>{phone}</p>}
                {email && <p>{email}</p>}
                {hasReq && (
                  <div style={{ marginTop: 6, fontSize: "7.5pt", color: "#444", lineHeight: 1.6 }}>
                    {inn && <p>ИНН: {inn}{kpp ? ` / КПП: ${kpp}` : ""}</p>}
                    {ogrn && <p>ОГРН: {ogrn}</p>}
                    {legalAddress && <p>{legalAddress}</p>}
                    {bank && <p>Банк: {bank}{bik ? `, БИК ${bik}` : ""}</p>}
                    {checkingAccount && <p>Р/с: {checkingAccount}</p>}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="doc-title">Смета на поставку и монтаж окон</p>
            <p className="doc-subtitle">№ С-{docNum} от {date} г.</p>
            <table className="meta-table">
              <tbody>
                <tr><td>Заказчик:</td><td>{customer || ""}</td></tr>
                <tr><td>Подрядчик:</td><td>{contractor || ""}</td></tr>
                <tr><td>Адрес объекта:</td><td>{address || ""}</td></tr>
                <tr><td>Дата:</td><td>{date} г.</td></tr>
              </tbody>
            </table>
          </>
        )}

        {/* Позиции с чертежами */}
        <section>
          <h2>Перечень конструкций</h2>
          {configs.map((cfg, i) => (
            <WindowCard key={cfg.id} cfg={cfg} idx={i} markupPct={markupPct} />
          ))}
        </section>

        {/* Сводная ведомость */}
        <section>
          <h2>Сводная ведомость</h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: 28 }} className="c">№</th>
                <th>Наименование конструкции</th>
                <th style={{ width: 44 }} className="c">Кол-во</th>
                <th style={{ width: 90 }} className="r">Цена, руб.</th>
                <th style={{ width: 95 }} className="r">Сумма, руб.</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((cfg, i) => {
                const ct = CONSTRUCTION_TYPES.find(c => c.value === cfg.constructionType);
                const pf = PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId);
                const gl = GLASS_UNITS.find(g => g.id === cfg.glassUnitId);
                return (
                  <tr key={cfg.id}>
                    <td className="c">{i + 1}</td>
                    <td>{ct?.label}, {cfg.width}×{cfg.height} мм, {pf?.brand} {pf?.series}, {gl?.name}</td>
                    <td className="c">{cfg.quantity} шт.</td>
                    <td className="r">{fmt(Math.round(cfg.totalPrice / cfg.quantity))}</td>
                    <td className="r">{fmt(cfg.totalPrice)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="totals">
            {markupPct > 0 && (
              <div className="row">
                <span>в т.ч. торговая наценка ({markupPct}%)</span>
                <span className="val">+{fmt(Math.round(totalSum - totalSum / (1 + markupPct / 100)))} руб.</span>
              </div>
            )}
            <div className="row grand">
              <span>ИТОГО:</span>
              <span className="val">{fmt(totalSum)} руб.</span>
            </div>
          </div>
        </section>

        {/* Условия */}
        <section>
          <h2>Условия</h2>
          <ol style={{ paddingLeft: 16, fontSize: "8.5pt", lineHeight: 1.7, color: "#222" }}>
            <li>Цены ориентировочные, точная стоимость определяется после выезда замерщика.</li>
            <li>Срок изготовления — от 5 до 14 рабочих дней с момента подписания договора.</li>
            <li>Гарантия на конструкции — 5 лет, на монтаж — 2 года.</li>
            {isKp && validDays && <li>Коммерческое предложение действительно {validDays} дней с даты выпуска.</li>}
            <li>Стоимость доставки и дополнительных работ согласовывается отдельно.</li>
          </ol>
        </section>

        {/* Подписи */}
        {isKp ? (
          <div className="sig-block">
            <p style={{ fontSize: "9pt", fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Исполнитель</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div className="sig-line">Должность / ФИО: <div className="line" /></div>
                <div className="sig-line">Подпись: <div className="line" /></div>
              </div>
              <div>
                <div className="sig-line">Дата: <div className="line" /></div>
                <div className="sig-line">М.П.: <div className="line" /></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="sig-block">
            <div className="sig-grid">
              <div>
                <h3>Заказчик</h3>
                <div className="sig-line">ФИО: {customer || <div className="line" />}</div>
                <div className="sig-line">Подпись: <div className="line" /></div>
                <div className="sig-line">Дата: <div className="line" /></div>
              </div>
              <div>
                <h3>Подрядчик</h3>
                <div className="sig-line">ФИО: {contractor || <div className="line" />}</div>
                <div className="sig-line">Подпись: <div className="line" /></div>
                <div className="sig-line">Дата: <div className="line" /></div>
              </div>
            </div>
          </div>
        )}

        <div className="footer">
          {isKp ? `КП-${docNum}` : `Смета № С-${docNum}`} от {date} г. · Документ сформирован автоматически
        </div>
      </div>
      </PrintPaywall>
    </>
  );
}