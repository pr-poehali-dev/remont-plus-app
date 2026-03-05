import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CEILING_TYPES, CEILING_LEVELS, CEILING_BRANDS, CEILING_COLORS, LIGHTING_OPTIONS, PROFILE_OPTIONS } from "@/components/calculator/ceilings/CeilingTypes";
import { fmt, CEILING_PRINT_STYLES } from "@/components/print/CeilingPrintTypes";
import type { CeilingPrintState } from "@/components/print/CeilingPrintTypes";
import PrintPaywall from "@/components/print/PrintPaywall";
import UniversalDocView from "@/components/print/UniversalDocView";
import type { UniversalDocData } from "@/components/print/UniversalDocView";

export default function CeilingPrint() {
  const location = useLocation();
  const state: CeilingPrintState | null = location.state ?? (() => {
    try { return JSON.parse(sessionStorage.getItem("ceilings_print_state") || "null"); } catch { return null; }
  })();

  useEffect(() => {
    if (state) {
      const isKp = state.docType === "kp";
      document.title = isKp
        ? `КП-${state.docNum} (Потолки) от ${state.date}`
        : `Смета на потолки № С-${state.docNum} от ${state.date}`;
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
        Нет данных для печати. Вернитесь в раздел «Натяжные потолки» и нажмите «Создать документ».
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
      const ct = CEILING_TYPES.find(t => t.value === cfg.ceilingType);
      const lv = CEILING_LEVELS.find(l => l.value === cfg.level);
      const br = CEILING_BRANDS.find(b => b.id === cfg.brandId);
      return {
        num: idx + 1,
        name: `${ct?.label || "Потолок"} (${lv?.label || ""})${br ? `, ${br.name}` : ""}, ${cfg.area} м²`,
        unit: "м²",
        qty: cfg.area,
        pricePerUnit: Math.round(cfg.totalPrice / cfg.area),
        total: cfg.totalPrice,
      };
    });
    const grandTotal = totalSum;
    const docData: UniversalDocData = {
      docType,
      docNum,
      date,
      startDate: (state as Record<string, unknown>).startDate ? new Date((state as Record<string, unknown>).startDate as string).toLocaleDateString("ru-RU") : undefined,
      endDate: (state as Record<string, unknown>).endDate ? new Date((state as Record<string, unknown>).endDate as string).toLocaleDateString("ru-RU") : undefined,
      contractNum: (state as Record<string, unknown>).contractNum as string | undefined,
      contractDate: (state as Record<string, unknown>).contractDate ? new Date((state as Record<string, unknown>).contractDate as string).toLocaleDateString("ru-RU") : undefined,
      customer: { name: customer || "", inn: undefined, phone, email },
      contractor: { name: contractor || "", inn: inn || undefined, phone, email },
      objectAddress: address || "",
      items: universalItems,
      totalWorks: Math.round(grandTotal * 0.4),
      totalMaterials: Math.round(grandTotal * 0.6),
      grandTotal,
      advancePct: parseFloat((state as Record<string, unknown>).advancePct as string || "30"),
      warrantyMonths: parseInt((state as Record<string, unknown>).warrantyMonths as string || "12"),
      projectTitle: "Монтаж натяжных потолков",
    };
    return (
      <PrintPaywall>
        <UniversalDocView data={docData} />
      </PrintPaywall>
    );
  }

  return (
    <>
      <style>{CEILING_PRINT_STYLES}</style>

      <PrintPaywall>
      <div className="page">

        {/* Шапка */}
        {isKp ? (
          <>
            <p className="doc-title">Коммерческое предложение</p>
            <p className="doc-subtitle">на поставку и монтаж натяжных потолков · № КП-{docNum} от {date} г.</p>
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
            <p className="doc-title">Смета на поставку и монтаж натяжных потолков</p>
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

        {/* Перечень позиций */}
        <section>
          <h2>Перечень потолков</h2>
          {configs.map((cfg, i) => {
            const ct = CEILING_TYPES.find(t => t.value === cfg.ceilingType);
            const lv = CEILING_LEVELS.find(l => l.value === cfg.level);
            const br = CEILING_BRANDS.find(b => b.id === cfg.brandId);
            const cl = CEILING_COLORS.find(c => c.id === cfg.colorId);
            const li = LIGHTING_OPTIONS.find(l => l.id === cfg.lightingId);
            const pr = PROFILE_OPTIONS.find(p => p.id === cfg.profileId);
            const basePerM2 = fmt(Math.round(cfg.totalPrice / cfg.area));

            return (
              <div key={cfg.id} className="ceil-block">
                <div className="ceil-header">
                  <div>
                    <span className="ceil-num">Позиция {i + 1}</span>
                    <p className="ceil-title">{ct?.label} потолок — {lv?.label}</p>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "8.5pt", color: "#555" }}>
                    {cfg.area} м²
                  </div>
                </div>
                <div className="ceil-specs">
                  <table>
                    <tbody>
                      <tr><td>Тип полотна</td><td>{ct?.label}</td></tr>
                      <tr><td>Уровней</td><td>{lv?.label}</td></tr>
                      <tr><td>Бренд плёнки</td><td>{br?.name} ({br?.country})</td></tr>
                      <tr><td>Цвет</td><td>{cl?.label}</td></tr>
                      <tr><td>Площадь</td><td>{cfg.area} м²</td></tr>
                      <tr><td>Периметр</td><td>{cfg.perimeter} пм</td></tr>
                      <tr><td>Система крепления</td><td>{pr?.label}</td></tr>
                      <tr><td>Освещение</td><td>{li?.id !== "none" ? `${li?.name} × ${cfg.lightingCount} ${li?.unit}` : "Без освещения"}</td></tr>
                      <tr><td>Монтаж</td><td>{cfg.installationIncluded ? "Включён" : "Не включён"}</td></tr>
                      {cfg.note && <tr><td>Примечание</td><td>{cfg.note}</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="ceil-price">
                  <span>{basePerM2} ₽/м²</span>
                  <span className="total">{fmt(cfg.totalPrice)} ₽</span>
                </div>
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
                <th>Наименование</th>
                <th style={{ width: 55 }} className="c">Площадь</th>
                <th style={{ width: 90 }} className="r">Цена, ₽/м²</th>
                <th style={{ width: 95 }} className="r">Сумма, руб.</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((cfg, i) => {
                const ct = CEILING_TYPES.find(t => t.value === cfg.ceilingType);
                const lv = CEILING_LEVELS.find(l => l.value === cfg.level);
                const br = CEILING_BRANDS.find(b => b.id === cfg.brandId);
                return (
                  <tr key={cfg.id}>
                    <td className="c">{i + 1}</td>
                    <td>{ct?.label} ({lv?.label}), {br?.name}</td>
                    <td className="c">{cfg.area} м²</td>
                    <td className="r">{fmt(Math.round(cfg.totalPrice / cfg.area))}</td>
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
            <li>Цены ориентировочные, точная стоимость определяется после замера помещения.</li>
            <li>Срок изготовления и монтажа — от 1 до 5 рабочих дней.</li>
            <li>Гарантия на полотно — 10 лет, на монтаж — 2 года.</li>
            {isKp && validDays && <li>Коммерческое предложение действительно {validDays} дней с даты выпуска.</li>}
            <li>Стоимость доставки и демонтажа старого потолка согласовывается отдельно.</li>
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
          Документ сформирован с помощью АВАНГАРД · avangard-ai.ru
        </div>
      </div>
      </PrintPaywall>
    </>
  );
}