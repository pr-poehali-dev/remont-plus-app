// ─── AutoCAD-style constants ─────────────────────────────────────────────────

export const CAD_BG = "#f7f5f0";
export const CAD_WALL = "#1a1a1a";
export const CAD_GRID = "#d4cfc4";
export const CAD_DIM = "#e05a00";
export const CAD_HATCH_STEAM = "#ffe0c0";
export const CAD_HATCH_WASH = "#c8e4ff";
export const CAD_HATCH_REST = "#d8f0d8";
export const CAD_HATCH_DRESS = "#f5f0d8";
export const CAD_HATCH_ATTIC = "#e8d8ff";

export const WALL_T = 14; // wall thickness px

// ─── Primitives ───────────────────────────────────────────────────────────────

/** Dimension line with arrows and label */
export function DimLine({ x1, y1, x2, y2, label, offset = 18, axis = "h" }: {
  x1: number; y1: number; x2: number; y2: number;
  label: string; offset?: number; axis?: "h" | "v";
}) {
  if (axis === "h") {
    const dy = y1 - offset;
    return (
      <g>
        <line x1={x1} y1={dy} x2={x2} y2={dy} stroke={CAD_DIM} strokeWidth="0.8" markerStart="url(#arr)" markerEnd="url(#arr)" />
        <line x1={x1} y1={y1} x2={x1} y2={dy - 2} stroke={CAD_DIM} strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1={x2} y1={y2} x2={x2} y2={dy - 2} stroke={CAD_DIM} strokeWidth="0.5" strokeDasharray="2,2" />
        <text x={(x1 + x2) / 2} y={dy - 3} textAnchor="middle" fontSize="7" fill={CAD_DIM} fontFamily="monospace" fontWeight="bold">{label}</text>
      </g>
    );
  } else {
    const dx = x1 - offset;
    return (
      <g>
        <line x1={dx} y1={y1} x2={dx} y2={y2} stroke={CAD_DIM} strokeWidth="0.8" markerStart="url(#arr)" markerEnd="url(#arr)" />
        <line x1={x1} y1={y1} x2={dx - 2} y2={y1} stroke={CAD_DIM} strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1={x2} y1={y2} x2={dx - 2} y2={y2} stroke={CAD_DIM} strokeWidth="0.5" strokeDasharray="2,2" />
        <text x={dx - 4} y={(y1 + y2) / 2} textAnchor="middle" fontSize="7" fill={CAD_DIM} fontFamily="monospace" fontWeight="bold"
          transform={`rotate(-90, ${dx - 4}, ${(y1 + y2) / 2})`}>{label}</text>
      </g>
    );
  }
}

/** Thick-wall room (AutoCAD style) */
export function CadRoom({ x, y, w, h, label, area, hatch, doorSide }: {
  x: number; y: number; w: number; h: number;
  label: string; area: number; hatch: string;
  doorSide?: "right" | "bottom" | "left" | "top";
}) {
  const t = WALL_T;
  const ix = x + t, iy = y + t, iw = w - t * 2, ih = h - t * 2;
  const hatchLines = [];
  for (let d = -ih; d < iw + ih; d += 10) {
    const x1c = Math.max(ix, ix + d);
    const y1c = d < 0 ? iy - d : iy;
    const x2c = Math.min(ix + iw, ix + d + ih);
    const y2c = d + ih > iw ? iy + iw - d + 0 : iy + ih;
    if (x1c < ix + iw && x2c > ix && y1c < iy + ih && y2c > iy) {
      hatchLines.push(<line key={d} x1={x1c} y1={y1c} x2={x2c} y2={Math.min(y2c, iy + ih)} stroke={hatch} strokeWidth="4" opacity="0.45" />);
    }
  }

  const doorEl = (() => {
    const dw = Math.min(iw, ih) * 0.4;
    if (doorSide === "right") {
      const dx = x + w - t, dy = y + h / 2 - dw / 2;
      return (
        <g>
          <line x1={dx} y1={dy} x2={dx} y2={dy + dw} stroke="white" strokeWidth={t - 2} />
          <path d={`M ${dx} ${dy} A ${dw} ${dw} 0 0 0 ${dx - dw} ${dy + dw}`} fill="none" stroke={CAD_WALL} strokeWidth="0.8" strokeDasharray="3,1.5" />
          <line x1={dx} y1={dy} x2={dx - dw} y2={dy + dw} stroke={CAD_WALL} strokeWidth="0.8" />
        </g>
      );
    }
    if (doorSide === "bottom") {
      const dx = x + w / 2 - dw / 2, dy = y + h - t;
      return (
        <g>
          <line x1={dx} y1={dy} x2={dx + dw} y2={dy} stroke="white" strokeWidth={t - 2} />
          <path d={`M ${dx} ${dy} A ${dw} ${dw} 0 0 1 ${dx + dw} ${dy - dw}`} fill="none" stroke={CAD_WALL} strokeWidth="0.8" strokeDasharray="3,1.5" />
          <line x1={dx} y1={dy} x2={dx + dw} y2={dy - dw} stroke={CAD_WALL} strokeWidth="0.8" />
        </g>
      );
    }
    return null;
  })();

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={CAD_WALL} />
      <rect x={ix} y={iy} width={iw} height={ih} fill={CAD_BG} />
      <clipPath id={`clip-${x}-${y}`}><rect x={ix} y={iy} width={iw} height={ih} /></clipPath>
      <g clipPath={`url(#clip-${x}-${y})`}>{hatchLines}</g>
      <text x={x + w / 2} y={y + h / 2 - 7} textAnchor="middle" dominantBaseline="middle"
        fontSize="9" fontWeight="700" fill="#222" fontFamily="monospace">{label}</text>
      <text x={x + w / 2} y={y + h / 2 + 7} textAnchor="middle" dominantBaseline="middle"
        fontSize="8" fill="#555" fontFamily="monospace">{area} м²</text>
      {doorEl}
    </g>
  );
}

/** Stove – AutoCAD symbol */
export function CadStove({ x, y, size = 20 }: { x: number; y: number; size?: number }) {
  const s = size;
  return (
    <g>
      <rect x={x - s / 2} y={y - s / 2} width={s} height={s} fill="#fff" stroke={CAD_WALL} strokeWidth="1.5" />
      <circle cx={x} cy={y} r={s * 0.28} fill="none" stroke={CAD_WALL} strokeWidth="1" />
      <circle cx={x} cy={y} r={s * 0.10} fill={CAD_WALL} />
      <line x1={x - s * 0.4} y1={y} x2={x + s * 0.4} y2={y} stroke={CAD_WALL} strokeWidth="0.6" />
      <line x1={x} y1={y - s * 0.4} x2={x} y2={y + s * 0.4} stroke={CAD_WALL} strokeWidth="0.6" />
      <text x={x} y={y + s / 2 + 8} textAnchor="middle" fontSize="6" fill={CAD_WALL} fontFamily="monospace">ПЕЧЬ</text>
    </g>
  );
}

/** Shelf – AutoCAD polok symbol */
export function CadShelf({ x, y, w, h, tiers = 2 }: { x: number; y: number; w: number; h: number; tiers?: number }) {
  const tierH = h / tiers;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#fff" stroke={CAD_WALL} strokeWidth="1.2" />
      {Array.from({ length: tiers }, (_, i) => (
        <rect key={i} x={x + 2} y={y + i * tierH + 2} width={w - 4} height={tierH - 4}
          fill="none" stroke={CAD_WALL} strokeWidth="0.7" strokeDasharray="4,2" />
      ))}
      <text x={x + w / 2} y={y + h + 9} textAnchor="middle" fontSize="6" fill={CAD_WALL} fontFamily="monospace">ПОЛОК</text>
    </g>
  );
}

/** Grid background (like AutoCAD paper space) */
export function CadGrid({ W, H }: { W: number; H: number }) {
  const step = 20;
  const lines = [];
  for (let x = 0; x <= W; x += step) lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke={CAD_GRID} strokeWidth="0.4" />);
  for (let y = 0; y <= H; y += step) lines.push(<line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} stroke={CAD_GRID} strokeWidth="0.4" />);
  return <g>{lines}</g>;
}
