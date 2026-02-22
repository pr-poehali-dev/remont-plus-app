import type { WindowConfig } from "@/components/calculator/windows/WindowTypes";
import {
  CONSTRUCTION_TYPES, PROFILE_SYSTEMS, GLASS_UNITS, GLASS_COATINGS,
  LAMINATION_TYPES, HARDWARE_OPTIONS, WINDOW_SILLS, SLOPES, OPENING_TYPES,
} from "@/components/calculator/windows/WindowTypes";
import { fmt } from "./WindowPrintTypes";
import WindowScheme from "./WindowScheme";

interface Props {
  cfg: WindowConfig;
  idx: number;
  markupPct: number;
}

export default function WindowCard({ cfg, idx, markupPct }: Props) {
  const ct = CONSTRUCTION_TYPES.find(c => c.value === cfg.constructionType);
  const pf = PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId);
  const gl = GLASS_UNITS.find(g => g.id === cfg.glassUnitId);
  const co = GLASS_COATINGS.find(c => c.id === cfg.glassCoatingId);
  const lm = LAMINATION_TYPES.find(l => l.id === cfg.laminationId);
  const hw = HARDWARE_OPTIONS.find(h => h.id === cfg.hardwareId);
  const sl = WINDOW_SILLS.find(s => s.id === cfg.windowSillId);
  const sp = SLOPES.find(s => s.id === cfg.slopeId);
  const openLabels = cfg.openingTypes.map(o => OPENING_TYPES.find(x => x.value === o)?.label ?? o);

  const baseUnit = markupPct > 0
    ? Math.round(cfg.totalPrice / cfg.quantity / (1 + markupPct / 100))
    : Math.round(cfg.totalPrice / cfg.quantity);

  return (
    <div className="window-block">
      <div className="window-header">
        <span className="window-num">Позиция {idx + 1}</span>
        <span className="window-title">{ct?.label}</span>
      </div>
      <div className="window-body">
        <div className="scheme-wrap">
          <WindowScheme cfg={cfg} idx={idx} />
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
