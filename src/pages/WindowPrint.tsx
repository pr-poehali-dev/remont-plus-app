import { useEffect } from "react";
import { CONSTRUCTION_TYPES, PROFILE_SYSTEMS, GLASS_UNITS } from "@/components/calculator/windows/WindowTypes";
import { calcWindowWorks, calcWindowMaterials } from "@/components/calculator/windows/windowUtils";
import { fmt, WINDOW_PRINT_STYLES } from "@/components/print/WindowPrintTypes";
import type { WindowPrintState } from "@/components/print/WindowPrintTypes";
import WindowCard from "@/components/print/WindowCard";
import UniversalDocView from "@/components/print/UniversalDocView";
import type { UniversalDocData } from "@/components/print/UniversalDocView";
import { usePrintState } from "@/hooks/usePrintState";
import PrintEmptyState from "@/components/print/PrintEmptyState";

export default function WindowPrint() {
  const state = usePrintState<WindowPrintState>({
    storageKey: "windows_print_state",
    buildTitle: (s) => {
      const ps = s as unknown as WindowPrintState;
      return ps.docType === "kp"
        ? `КП-${ps.docNum} (Окна) от ${ps.date}`
        : `Смета на окна № С-${ps.docNum} от ${ps.date}`;
    },
  });

  useEffect(() => {
    const blockKey = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || (e.ctrlKey && e.key === "p")) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", blockKey);
    return () => document.removeEventListener("keydown", blockKey);
  }, []);

  if (!state) {
    return <PrintEmptyState backHref="/windows" calculatorName="«Окна»" />;
  }

  const { configs, markupPct, totalSum, docNum, date, docType,
    customer, contractor, address, phone, email, validDays,
    inn, kpp, ogrn, legalAddress, bank, bik, checkingAccount } = state;

  const isKp = docType === "kp";
  const hasReq = inn || kpp || ogrn || legalAddress || bank;

  // Детальные позиции по каждой конструкции. Наценка мастера «зашивается»
  // в цены позиций (×k), отдельной строкой не показывается.
  const k = 1 + (markupPct || 0) / 100;
  const scale = (arr: ReturnType<typeof calcWindowWorks>) =>
    arr.map((i) => {
      const pricePerUnit = Math.round(i.pricePerUnit * k);
      return { ...i, pricePerUnit, total: Math.round(pricePerUnit * i.qty) };
    });
  const rowsData = configs.map((cfg) => {
    const works = scale(calcWindowWorks(cfg, undefined, cfg.regionId));
    const materials = scale(calcWindowMaterials(cfg, undefined, cfg.regionId).filter((m) => !m.isWork));
    return { cfg, works, materials };
  });
  const grandWorks = rowsData.reduce((s, r) => s + r.works.reduce((a, w) => a + w.total, 0), 0);
  const grandMaterials = rowsData.reduce((s, r) => s + r.materials.reduce((a, m) => a + m.total, 0), 0);

  if (docType === "ks2" || docType === "ks3" || docType === "act" || docType === "contract") {
    const universalItems = configs.map((cfg, idx) => {
      const ct = CONSTRUCTION_TYPES.find(c => c.value === cfg.constructionType);
      const pf = PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId);
      const gl = GLASS_UNITS.find(g => g.id === cfg.glassUnitId);
      return {
        num: idx + 1,
        name: `${ct?.label || "Конструкция"}, ${cfg.width}×${cfg.height} мм${cfg.hasTransom && cfg.constructionType !== "transom" ? ` + фрамуга ${cfg.transomHeight} мм` : ""}${pf ? `, ${pf.brand} ${pf.series}` : ""}${gl ? `, ${gl.name}` : ""}`,
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
      totalWorks: grandWorks,
      totalMaterials: grandMaterials,
      grandTotal: totalSum,
      advancePct: parseFloat((state as { advancePct?: string }).advancePct || "30"),
      warrantyMonths: parseInt((state as { warrantyMonths?: string }).warrantyMonths || "12"),
      projectTitle: "Поставка и монтаж окон",
    };
    return (
      <>
        <UniversalDocView data={docData} />
      </>
    );
  }

  return (
    <>
      <style>{WINDOW_PRINT_STYLES}</style>

      <>
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

        {/* Детальная ведомость работ и материалов */}
        <section>
          <h2>Состав работ и материалов</h2>
          {rowsData.map(({ cfg, works, materials }, idx) => {
            const ct = CONSTRUCTION_TYPES.find(c => c.value === cfg.constructionType);
            const worksSum = works.reduce((s, w) => s + w.total, 0);
            const matSum = materials.reduce((s, m) => s + m.total, 0);
            return (
              <div key={cfg.id} className="detail-block">
                <p className="detail-title">
                  Позиция {idx + 1}. {ct?.label}
                  <span className="dim">{cfg.width}×{cfg.height} мм · {cfg.quantity} шт.</span>
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>Наименование</th>
                      <th style={{ width: 50 }} className="c">Кол-во</th>
                      <th style={{ width: 40 }} className="c">Ед.</th>
                      <th style={{ width: 80 }} className="r">Цена, ₽</th>
                      <th style={{ width: 90 }} className="r">Сумма, ₽</th>
                    </tr>
                  </thead>
                  <tbody>
                    {works.length > 0 && (
                      <tr className="sec-row"><td colSpan={5}>Работы</td></tr>
                    )}
                    {works.map((w, i) => (
                      <tr key={`w${i}`}>
                        <td>{w.name}{w.spec ? <span style={{ color: "#666" }}> · {w.spec}</span> : null}</td>
                        <td className="c">{w.qty}</td>
                        <td className="c">{w.unit}</td>
                        <td className="r">{fmt(w.pricePerUnit)}</td>
                        <td className="r">{fmt(w.total)}</td>
                      </tr>
                    ))}
                    {works.length > 0 && (
                      <tr className="sub-row"><td colSpan={4}>Итого работы</td><td className="r">{fmt(worksSum)}</td></tr>
                    )}
                    {materials.length > 0 && (
                      <tr className="sec-row"><td colSpan={5}>Материалы</td></tr>
                    )}
                    {materials.map((m, i) => (
                      <tr key={`m${i}`}>
                        <td>{m.name}{m.spec ? <span style={{ color: "#666" }}> · {m.spec}</span> : null}</td>
                        <td className="c">{m.qty}</td>
                        <td className="c">{m.unit}</td>
                        <td className="r">{fmt(m.pricePerUnit)}</td>
                        <td className="r">{fmt(m.total)}</td>
                      </tr>
                    ))}
                    {materials.length > 0 && (
                      <tr className="sub-row"><td colSpan={4}>Итого материалы</td><td className="r">{fmt(matSum)}</td></tr>
                    )}
                    <tr className="room-total"><td colSpan={4}>Итого по позиции</td><td className="r">{fmt(worksSum + matSum)}</td></tr>
                  </tbody>
                </table>
              </div>
            );
          })}
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
      </>
    </>
  );
}