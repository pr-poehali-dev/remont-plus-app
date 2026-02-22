import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { WindowConfig } from "@/components/calculator/windows/WindowTypes";
import {
  CONSTRUCTION_TYPES, PROFILE_SYSTEMS, GLASS_UNITS, GLASS_COATINGS,
  LAMINATION_TYPES, HARDWARE_OPTIONS, WINDOW_SILLS, SLOPES, OPENING_TYPES,
} from "@/components/calculator/windows/WindowTypes";
import type { ExportConfirmData } from "@/components/calculator/ExportDialog";

interface WindowPrintState extends ExportConfirmData {
  configs: WindowConfig[];
  markupPct: number;
  totalSum: number;
  docNum: string;
  date: string;
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&family=PT+Sans:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'PT Sans', Arial, sans-serif; font-size: 10pt; color: #000; background: #fff; }
  .page { max-width: 210mm; margin: 0 auto; padding: 16mm 16mm 20mm; }
  .doc-title { font-family: 'PT Serif', serif; font-size: 13pt; font-weight: 700; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
  .doc-subtitle { text-align: center; font-size: 9pt; color: #444; margin-bottom: 14px; }
  .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9pt; }
  .meta-table td { padding: 3px 6px; vertical-align: top; }
  .meta-table td:first-child { width: 38%; font-weight: 700; }
  .meta-table td:last-child { border-bottom: 1px solid #999; }
  section { margin-bottom: 16px; }
  section h2 { font-size: 9.5pt; font-weight: 700; text-transform: uppercase; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
  thead th { border-top: 1.5px solid #000; border-bottom: 1px solid #000; padding: 4px 5px; text-align: left; font-weight: 700; }
  thead th.r { text-align: right; }
  thead th.c { text-align: center; }
  tbody td { padding: 3px 5px; border-bottom: 1px solid #ddd; vertical-align: top; }
  tbody td.r { text-align: right; }
  tbody td.c { text-align: center; }
  tbody tr:nth-child(even) td { background: #f7f7f7; }
  .totals { margin-top: 6px; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .totals .row { display: flex; gap: 16px; font-size: 9pt; }
  .totals .row.grand { font-weight: 700; font-size: 11pt; border-top: 1.5px solid #000; padding-top: 4px; margin-top: 4px; }
  .totals .val { min-width: 130px; text-align: right; }
  .window-block { break-inside: avoid; margin-bottom: 18px; border: 1px solid #ccc; border-radius: 4px; padding: 10px 12px; }
  .window-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .window-num { font-size: 9pt; font-weight: 700; color: #555; }
  .window-title { font-size: 10pt; font-weight: 700; }
  .window-body { display: grid; grid-template-columns: 160px 1fr; gap: 12px; align-items: start; }
  .scheme-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .window-specs { font-size: 8.5pt; }
  .window-specs table { font-size: 8.5pt; }
  .window-specs td { padding: 2px 4px; border: none; border-bottom: 1px solid #eee; }
  .window-specs td:first-child { color: #555; width: 120px; }
  .window-specs td:last-child { font-weight: 600; }
  .window-price { margin-top: 8px; display: flex; justify-content: flex-end; gap: 16px; font-size: 9pt; }
  .window-price .total { font-weight: 700; font-size: 10.5pt; }
  .sig-block { margin-top: 20px; }
  .sig-block h3 { font-size: 9pt; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
  .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .sig-line { margin-bottom: 8px; font-size: 8.5pt; }
  .sig-line .line { border-bottom: 1px solid #666; margin-top: 4px; height: 16px; }
  .footer { text-align: center; font-size: 7.5pt; color: #888; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 8px; }
  .no-print { display: block; }
  @media print {
    @page { size: A4 portrait; margin: 10mm 14mm 14mm; }
    .no-print { display: none !important; }
    body { font-size: 9.5pt; }
  }
`;

function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

// SVG-схема окна по типу и размерам
function WindowScheme({ cfg, width = 140, height = 110 }: { cfg: WindowConfig; width?: number; height?: number }) {
  const pad = 8;
  const frameW = width - pad * 2;
  const frameH = height - pad * 2;
  const ct = CONSTRUCTION_TYPES.find(c => c.value === cfg.constructionType);
  const sashes = ct?.sashes ?? 1;

  // Размерные подписи
  const wMm = cfg.width;
  const hMm = cfg.height;

  const openings = cfg.openingTypes;

  const sashW = frameW / sashes;

  // Стрелка открывания (треугольник)
  const openSymbol = (x: number, y: number, w: number, h: number, openType: string) => {
    if (openType === "fixed") return null;
    // Линия откидывания — диагональ снизу вверх
    const cx = x + w / 2;
    const cy = y + h / 2;
    if (openType === "tilt") {
      return <line x1={x + 2} y1={y + h - 2} x2={cx} y2={y + 4} stroke="#555" strokeWidth={0.8} strokeDasharray="3,2" />;
    }
    if (openType === "swing") {
      return <line x1={x + 2} y1={y + 2} x2={cx} y2={cy} stroke="#555" strokeWidth={0.8} strokeDasharray="3,2" />;
    }
    // tilt_swing: обе диагонали
    return (
      <>
        <line x1={x + 2} y1={y + h - 2} x2={cx} y2={y + 4} stroke="#555" strokeWidth={0.8} strokeDasharray="3,2" />
        <line x1={x + 2} y1={y + 2} x2={cx} y2={cy} stroke="#555" strokeWidth={0.8} strokeDasharray="3,2" />
      </>
    );
  };

  return (
    <svg width={width + 40} height={height + 30} xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Рамка */}
      <rect x={pad + 20} y={pad} width={frameW} height={frameH} fill="none" stroke="#000" strokeWidth={2.5} />

      {/* Подоконник */}
      <rect x={pad + 16} y={pad + frameH} width={frameW + 8} height={5} fill="#ccc" stroke="#999" strokeWidth={0.5} />

      {/* Створки */}
      {Array.from({ length: sashes }).map((_, i) => {
        const sx = pad + 20 + i * sashW + 4;
        const sy = pad + 4;
        const sw = sashW - 8;
        const sh = frameH - 8;
        const ot = openings[i] ?? "tilt_swing";
        return (
          <g key={i}>
            <rect x={sx} y={sy} width={sw} height={sh} fill={ot === "fixed" ? "#e8f0fe" : "#dbeafe"} stroke="#555" strokeWidth={1} />
            {openSymbol(sx, sy, sw, sh, ot)}
          </g>
        );
      })}

      {/* Размер — ширина (снизу) */}
      <line x1={pad + 20} y1={pad + frameH + 16} x2={pad + 20 + frameW} y2={pad + frameH + 16} stroke="#333" strokeWidth={0.8} markerEnd="url(#arrow)" markerStart="url(#arrowR)" />
      <text x={pad + 20 + frameW / 2} y={pad + frameH + 26} textAnchor="middle" fontSize={8} fill="#333">{wMm} мм</text>

      {/* Размер — высота (справа) */}
      <line x1={pad + 20 + frameW + 8} y1={pad} x2={pad + 20 + frameW + 8} y2={pad + frameH} stroke="#333" strokeWidth={0.8} />
      <text x={pad + 20 + frameW + 16} y={pad + frameH / 2} textAnchor="start" fontSize={8} fill="#333" dominantBaseline="middle">{hMm}</text>

      <defs>
        <marker id="arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <polygon points="0 0, 5 2.5, 0 5" fill="#333" />
        </marker>
        <marker id="arrowR" markerWidth="5" markerHeight="5" refX="1" refY="2.5" orient="auto-start-reverse">
          <polygon points="0 0, 5 2.5, 0 5" fill="#333" />
        </marker>
      </defs>
    </svg>
  );
}

function WindowCard({ cfg, idx, markupPct }: { cfg: WindowConfig; idx: number; markupPct: number }) {
  const ct = CONSTRUCTION_TYPES.find(c => c.value === cfg.constructionType);
  const pf = PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId);
  const gl = GLASS_UNITS.find(g => g.id === cfg.glassUnitId);
  const co = GLASS_COATINGS.find(c => c.id === cfg.glassCoatingId);
  const lm = LAMINATION_TYPES.find(l => l.id === cfg.laminationId);
  const hw = HARDWARE_OPTIONS.find(h => h.id === cfg.hardwareId);
  const sl = WINDOW_SILLS.find(s => s.id === cfg.windowSillId);
  const sp = SLOPES.find(s => s.id === cfg.slopeId);
  const openLabels = cfg.openingTypes.map(o => OPENING_TYPES.find(x => x.value === o)?.label ?? o);

  const baseUnit = markupPct > 0 ? Math.round(cfg.totalPrice / cfg.quantity / (1 + markupPct / 100)) : Math.round(cfg.totalPrice / cfg.quantity);
  const markupUnit = Math.round(cfg.totalPrice / cfg.quantity) - baseUnit;

  return (
    <div className="window-block">
      <div className="window-header">
        <span className="window-num">Позиция {idx + 1}</span>
        <span className="window-title">{ct?.label}</span>
      </div>
      <div className="window-body">
        <div className="scheme-wrap">
          <WindowScheme cfg={cfg} />
          <p style={{ fontSize: 7.5, color: "#666", textAlign: "center" }}>Схема (не в масштабе)</p>
        </div>
        <div className="window-specs">
          <table>
            <tbody>
              <tr><td>Ширина × Высота</td><td>{cfg.width} × {cfg.height} мм</td></tr>
              <tr><td>Площадь</td><td>{((cfg.width / 1000) * (cfg.height / 1000)).toFixed(2)} м²</td></tr>
              <tr><td>Профиль</td><td>{pf?.brand} {pf?.series} ({pf?.chambers}к., {pf?.depth}мм)</td></tr>
              <tr><td>Стеклопакет</td><td>{gl?.name} — {gl?.description}</td></tr>
              {co?.id !== "none" && <tr><td>Покрытие стекла</td><td>{co?.name}</td></tr>}
              {lm?.id !== "none" && <tr><td>Ламинация</td><td>{lm?.name}</td></tr>}
              <tr><td>Фурнитура</td><td>{hw?.brand} {hw?.series}</td></tr>
              <tr><td>Открывание</td><td>{openLabels.join(", ")}</td></tr>
              {sl?.id !== "none" && <tr><td>Подоконник</td><td>{sl?.brand} {sl?.material}</td></tr>}
              {sp?.id !== "none" && <tr><td>Откосы</td><td>{sp?.name}, {cfg.slopePerimeter} п.м.</td></tr>}
              <tr><td>Монтаж</td><td>{cfg.installationIncluded ? "включён" : "не включён"}</td></tr>
              <tr><td>Количество</td><td>{cfg.quantity} шт.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="window-price">
        {markupPct > 0 && (
          <span style={{ color: "#888" }}>
            себест. {fmt(baseUnit)} ₽/шт. · наценка +{markupPct}%
          </span>
        )}
        <span>Цена: <strong>{fmt(Math.round(cfg.totalPrice / cfg.quantity))} ₽/шт.</strong></span>
        {cfg.quantity > 1 && (
          <span className="total">Итого: {fmt(cfg.totalPrice)} ₽</span>
        )}
        {cfg.quantity === 1 && (
          <span className="total">Итого: {fmt(cfg.totalPrice)} ₽</span>
        )}
      </div>
    </div>
  );
}

export default function WindowPrint() {
  const location = useLocation();
  const state: WindowPrintState | null = location.state ?? null;

  useEffect(() => {
    if (state) {
      const isKp = state.docType === "kp";
      document.title = isKp
        ? `КП-${state.docNum} (Окна) от ${state.date}`
        : `Смета на окна № С-${state.docNum} от ${state.date}`;
      setTimeout(() => window.print(), 500);
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

  return (
    <>
      <style>{STYLES}</style>

      <div className="page">
        {/* Кнопки */}
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

        {/* Итоговая таблица */}
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
    </>
  );
}
