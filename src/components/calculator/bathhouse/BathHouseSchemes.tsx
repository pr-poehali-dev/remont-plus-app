import type { BathLayout, RoofType, WallMaterial } from "./BathHouseTypes";

// ─── AutoCAD-style helpers ───────────────────────────────────────────────────

const CAD_BG = "#f7f5f0";
const CAD_WALL = "#1a1a1a";
const CAD_GRID = "#d4cfc4";
const CAD_DIM = "#e05a00";
const CAD_HATCH_STEAM = "#ffe0c0";
const CAD_HATCH_WASH = "#c8e4ff";
const CAD_HATCH_REST = "#d8f0d8";
const CAD_HATCH_DRESS = "#f5f0d8";
const CAD_HATCH_ATTIC = "#e8d8ff";

const WALL_T = 14; // wall thickness px

/** Dimension line with arrows and label */
function DimLine({ x1, y1, x2, y2, label, offset = 18, axis = "h" }: {
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
function CadRoom({ x, y, w, h, label, area, hatch, doorSide }: {
  x: number; y: number; w: number; h: number;
  label: string; area: number; hatch: string;
  doorSide?: "right" | "bottom" | "left" | "top";
}) {
  const t = WALL_T;
  const ix = x + t, iy = y + t, iw = w - t * 2, ih = h - t * 2;
  // hatch lines diagonal
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

  // door arc
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
      {/* Wall fill */}
      <rect x={x} y={y} width={w} height={h} fill={CAD_WALL} />
      {/* Room interior */}
      <rect x={ix} y={iy} width={iw} height={ih} fill={CAD_BG} />
      {/* Hatch */}
      <clipPath id={`clip-${x}-${y}`}><rect x={ix} y={iy} width={iw} height={ih} /></clipPath>
      <g clipPath={`url(#clip-${x}-${y})`}>{hatchLines}</g>
      {/* Label */}
      <text x={x + w / 2} y={y + h / 2 - 7} textAnchor="middle" dominantBaseline="middle"
        fontSize="9" fontWeight="700" fill="#222" fontFamily="monospace">{label}</text>
      <text x={x + w / 2} y={y + h / 2 + 7} textAnchor="middle" dominantBaseline="middle"
        fontSize="8" fill="#555" fontFamily="monospace">{area} м²</text>
      {doorEl}
    </g>
  );
}

/** Stove – AutoCAD symbol */
function CadStove({ x, y, size = 20 }: { x: number; y: number; size?: number }) {
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
function CadShelf({ x, y, w, h, tiers = 2 }: { x: number; y: number; w: number; h: number; tiers?: number }) {
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
function CadGrid({ W, H }: { W: number; H: number }) {
  const step = 20;
  const lines = [];
  for (let x = 0; x <= W; x += step) lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke={CAD_GRID} strokeWidth="0.4" />);
  for (let y = 0; y <= H; y += step) lines.push(<line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} stroke={CAD_GRID} strokeWidth="0.4" />);
  return <g>{lines}</g>;
}

interface LayoutProps {
  layout: BathLayout;
  steamArea: number;
  washArea: number;
  restArea: number;
  dressingArea: number;
}

export function FloorplanSVG({ layout, steamArea, washArea, restArea, dressingArea }: LayoutProps) {
  const W = 440;
  const H = 280;
  const padL = 45, padT = 40, padR = 20, padB = 30;
  const planW = W - padL - padR;
  const planH = H - padT - padB;

  const defs = (
    <defs>
      <marker id="arr" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
        <polygon points="0,0 5,2.5 0,5" fill={CAD_DIM} />
      </marker>
    </defs>
  );

  const border = (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={CAD_BG} />
      <CadGrid W={W} H={H} />
      {/* Title block */}
      <rect x={1} y={1} width={W - 2} height={H - 2} fill="none" stroke="#aaa" strokeWidth="0.8" />
      <rect x={padL - 5} y={padT - 5} width={planW + 10} height={planH + 10} fill="none" stroke={CAD_WALL} strokeWidth="1" />
    </g>
  );

  const footer = (
    <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="7" fill="#888" fontFamily="monospace">
      ПЛАН ПОМЕЩЕНИЙ — СХЕМА ПРЕДВАРИТЕЛЬНАЯ
    </text>
  );

  if (layout === "2room") {
    const w1 = planW * 0.42;
    const w2 = planW * 0.58;
    const x1 = padL, x2 = padL + w1;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {defs}{border}
        <CadRoom x={x1} y={padT} w={w1} h={planH} label="ПАРНАЯ" area={steamArea} hatch={CAD_HATCH_STEAM} doorSide="right" />
        <CadShelf x={x1 + WALL_T + 4} y={padT + WALL_T + 4} w={w1 * 0.55} h={planH * 0.35} />
        <CadStove x={x1 + w1 - WALL_T - 16} y={padT + WALL_T + 16} />
        <CadRoom x={x2} y={padT} w={w2} h={planH} label="МОЙКА / ПРЕДБАННИК" area={washArea} hatch={CAD_HATCH_WASH} doorSide="bottom" />
        <DimLine x1={x1} y1={padT} x2={x1 + w1} y2={padT} label={`${Math.round(Math.sqrt(steamArea * 1.3) * 10) / 10}м`} offset={22} axis="h" />
        <DimLine x1={x2} y1={padT} x2={x2 + w2} y2={padT} label={`${Math.round(Math.sqrt(washArea * 0.9) * 10) / 10}м`} offset={22} axis="h" />
        <DimLine x1={x1} y1={padT} x2={x1} y2={padT + planH} label={`${Math.round(Math.sqrt(steamArea * 0.8) * 10) / 10}м`} offset={30} axis="v" />
        {footer}
      </svg>
    );
  }

  if (layout === "3room") {
    const w1 = planW * 0.33, w2 = planW * 0.28, w3 = planW * 0.39;
    const x1 = padL, x2 = x1 + w1, x3 = x2 + w2;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {defs}{border}
        <CadRoom x={x1} y={padT} w={w1} h={planH} label="ПАРНАЯ" area={steamArea} hatch={CAD_HATCH_STEAM} doorSide="right" />
        <CadShelf x={x1 + WALL_T + 3} y={padT + WALL_T + 3} w={w1 * 0.6} h={planH * 0.4} />
        <CadStove x={x1 + w1 - WALL_T - 14} y={padT + WALL_T + 14} />
        <CadRoom x={x2} y={padT} w={w2} h={planH} label="МОЙКА" area={washArea} hatch={CAD_HATCH_WASH} doorSide="right" />
        <CadRoom x={x3} y={padT} w={w3} h={planH} label="КОМН. ОТДЫХА" area={restArea} hatch={CAD_HATCH_REST} doorSide="bottom" />
        <DimLine x1={x1} y1={padT} x2={x1 + w1} y2={padT} label={`${(Math.sqrt(steamArea * 1.2)).toFixed(1)}м`} offset={22} axis="h" />
        <DimLine x1={x2} y1={padT} x2={x2 + w2} y2={padT} label={`${(Math.sqrt(washArea)).toFixed(1)}м`} offset={22} axis="h" />
        <DimLine x1={x3} y1={padT} x2={x3 + w3} y2={padT} label={`${(Math.sqrt(restArea * 1.1)).toFixed(1)}м`} offset={22} axis="h" />
        <DimLine x1={x1} y1={padT} x2={x1} y2={padT + planH} label={`${(Math.sqrt(steamArea * 0.85)).toFixed(1)}м`} offset={30} axis="v" />
        {footer}
      </svg>
    );
  }

  if (layout === "4room") {
    const w1 = planW * 0.27, w2 = planW * 0.22, w3 = planW * 0.20, w4 = planW * 0.31;
    const x1 = padL, x2 = x1 + w1, x3 = x2 + w2, x4 = x3 + w3;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {defs}{border}
        <CadRoom x={x1} y={padT} w={w1} h={planH} label="ПАРНАЯ" area={steamArea} hatch={CAD_HATCH_STEAM} doorSide="right" />
        <CadShelf x={x1 + WALL_T + 2} y={padT + WALL_T + 2} w={w1 * 0.65} h={planH * 0.38} />
        <CadStove x={x1 + w1 - WALL_T - 12} y={padT + WALL_T + 12} size={18} />
        <CadRoom x={x2} y={padT} w={w2} h={planH} label="МОЙКА" area={washArea} hatch={CAD_HATCH_WASH} doorSide="right" />
        <CadRoom x={x3} y={padT} w={w3} h={planH} label="ПРЕД-\nБАННИК" area={dressingArea} hatch={CAD_HATCH_DRESS} doorSide="right" />
        <CadRoom x={x4} y={padT} w={w4} h={planH} label="КО" area={restArea} hatch={CAD_HATCH_REST} doorSide="bottom" />
        <DimLine x1={x1} y1={padT} x2={x1 + w1} y2={padT} label={`${(Math.sqrt(steamArea * 1.2)).toFixed(1)}м`} offset={22} axis="h" />
        <DimLine x1={x2} y1={padT} x2={x3 + w3} y2={padT} label={`${(Math.sqrt((washArea + dressingArea) * 0.95)).toFixed(1)}м`} offset={22} axis="h" />
        <DimLine x1={x4} y1={padT} x2={x4 + w4} y2={padT} label={`${(Math.sqrt(restArea * 1.1)).toFixed(1)}м`} offset={22} axis="h" />
        <DimLine x1={x1} y1={padT} x2={x1} y2={padT + planH} label={`${(Math.sqrt(steamArea * 0.85)).toFixed(1)}м`} offset={30} axis="v" />
        {footer}
      </svg>
    );
  }

  // house_bath — 2 levels
  const floorH = planH * 0.55;
  const atticH = planH * 0.45;
  const y1 = padT, y2 = padT + atticH;
  const wL = planW * 0.35, wM = planW * 0.28, wR = planW * 0.37;
  const x1 = padL, x2 = x1 + wL, x3 = x2 + wM;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {defs}{border}
      {/* 1st floor */}
      <CadRoom x={x1} y={y2} w={wL} h={floorH} label="ПАРНАЯ" area={steamArea} hatch={CAD_HATCH_STEAM} doorSide="right" />
      <CadShelf x={x1 + WALL_T + 2} y={y2 + WALL_T + 2} w={wL * 0.6} h={floorH * 0.38} />
      <CadStove x={x1 + wL - WALL_T - 14} y={y2 + WALL_T + 14} />
      <CadRoom x={x2} y={y2} w={wM} h={floorH} label="МОЙКА" area={washArea} hatch={CAD_HATCH_WASH} doorSide="right" />
      <CadRoom x={x3} y={y2} w={wR} h={floorH} label="КО / ПРЕДБАННИК" area={restArea} hatch={CAD_HATCH_REST} doorSide="bottom" />
      {/* 2nd floor (attic) */}
      <CadRoom x={x1} y={y1} w={planW} h={atticH} label="МАНСАРДА / СПАЛЬНЯ" area={Math.round(steamArea + washArea + restArea) - 4} hatch={CAD_HATCH_ATTIC} />
      {/* Stair */}
      <g>
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x={x3 + wR - WALL_T - 22 + i * 4} y={y2 - 16} width={3} height={18} fill="#bbb" stroke={CAD_WALL} strokeWidth="0.5" />
        ))}
        <text x={x3 + wR - WALL_T - 10} y={y2 - 20} textAnchor="middle" fontSize="6" fill={CAD_WALL} fontFamily="monospace">ЛЕС.</text>
      </g>
      <DimLine x1={x1} y1={padT} x2={x1 + planW} y2={padT} label={`${(Math.sqrt((steamArea + washArea + restArea) * 1.1)).toFixed(1)}м`} offset={22} axis="h" />
      <DimLine x1={x1} y1={padT} x2={x1} y2={padT + planH} label={`${(Math.sqrt((steamArea + washArea + restArea) * 0.55)).toFixed(1)}м`} offset={30} axis="v" />
      <text x={padL + 4} y={y1 + 12} fontSize="7" fill={CAD_DIM} fontFamily="monospace">2 ЭТ.</text>
      <text x={padL + 4} y={y2 + 12} fontSize="7" fill={CAD_DIM} fontFamily="monospace">1 ЭТ.</text>
      {footer}
    </svg>
  );
}

// ─── Exterior SVG (upgraded) ──────────────────────────────────────────────────

interface ExteriorProps {
  roofType: RoofType;
  wallMaterial: WallMaterial;
  terrace?: boolean;
  style?: string;
}

export function ExteriorSVG({ roofType, wallMaterial, terrace, style }: ExteriorProps) {
  const W = 440;
  const H = 280;

  const wallColors: Record<string, string> = {
    timber_profiled: "#c8a47a",
    timber_glued:    "#d4b48a",
    log_rounded:     "#b8944a",
    log_hand:        "#a07840",
    brick:           "#c86050",
    block_gas:       "#c8c8b8",
    block_foam:      "#d0d0c0",
    frame_osb:       "#d4b87a",
    frame_sip:       "#ddd8c0",
    frame_metal:     "#b0b8c0",
  };
  const wallColor = wallColors[wallMaterial] || "#c8a47a";

  const roofColors: Record<string, string> = {
    flat_single: "#6a7280",
    gable:       "#4a5568",
    hip:         "#3d4a5a",
    mansard:     "#353a48",
  };
  const roofColor = roofColors[roofType] || "#4a5568";

  const groundY = H - 45;
  const houseW = terrace ? 220 : 270;
  const houseX = terrace ? 55 : 80;
  const houseH = 120;
  const houseY = groundY - houseH;

  const renderRoof = () => {
    const rx = houseX - 12, rw = houseW + 24;
    if (roofType === "flat_single") {
      return (
        <g>
          <rect x={rx} y={houseY - 18} width={rw} height={20} fill={roofColor} stroke="#222" strokeWidth="1.5" />
          <rect x={rx + 5} y={houseY - 22} width={rw - 10} height={6} fill="#888" stroke="#555" strokeWidth="1" />
        </g>
      );
    }
    if (roofType === "gable") {
      const peakX = houseX + houseW / 2, peakY = houseY - 70;
      return (
        <g>
          <polygon points={`${rx},${houseY} ${peakX},${peakY} ${rx + rw},${houseY}`} fill={roofColor} stroke="#222" strokeWidth="1.5" />
          {/* Шашечная черепица */}
          {Array.from({ length: 5 }, (_, row) =>
            Array.from({ length: 10 }, (_, col) => {
              const tileW = rw / 10, tileH = (houseY - peakY) / 5;
              const tx = rx + col * tileW + (row % 2 === 0 ? 0 : tileW / 2);
              const ty = peakY + row * tileH;
              return <rect key={`${row}-${col}`} x={tx} y={ty} width={tileW - 1} height={tileH - 1} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.7" />;
            })
          )}
          {/* Конёк */}
          <line x1={peakX - 15} y1={peakY} x2={peakX + 15} y2={peakY} stroke="#bbb" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    }
    if (roofType === "hip") {
      const peakX = houseX + houseW / 2, peakY = houseY - 62, inset = 25;
      return (
        <g>
          <polygon points={`${rx + inset},${houseY} ${rx},${houseY + 10} ${peakX},${peakY} ${rx + rw},${houseY + 10} ${rx + rw - inset},${houseY}`}
            fill={roofColor} stroke="#222" strokeWidth="1.5" />
          <line x1={peakX} y1={peakY} x2={rx + inset} y2={houseY} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <line x1={peakX} y1={peakY} x2={rx + rw - inset} y2={houseY} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        </g>
      );
    }
    if (roofType === "mansard") {
      const peakX = houseX + houseW / 2, midY = houseY - 35, peakY = houseY - 90;
      const midInset = 28;
      return (
        <g>
          <polygon points={`${rx},${houseY} ${rx + midInset},${midY} ${rx + rw - midInset},${midY} ${rx + rw},${houseY}`}
            fill={roofColor} stroke="#222" strokeWidth="1.5" />
          <polygon points={`${rx + midInset},${midY} ${peakX},${peakY} ${rx + rw - midInset},${midY}`}
            fill={roofColor} stroke="#222" strokeWidth="1.5" />
          {/* Мансардное окно */}
          <rect x={peakX - 22} y={midY - 20} width={44} height={25} fill="#a8d8f8" stroke="#444" strokeWidth="1.2" rx="1" />
          <line x1={peakX} y1={midY - 20} x2={peakX} y2={midY + 5} stroke="#444" strokeWidth="0.8" />
          <line x1={peakX - 22} y1={midY - 8} x2={peakX + 22} y2={midY - 8} stroke="#444" strokeWidth="0.8" />
        </g>
      );
    }
    return null;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="sky2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a2a4a" />
          <stop offset="60%" stopColor="#2d5a8a" />
          <stop offset="100%" stopColor="#5a8ab0" />
        </linearGradient>
        <linearGradient id="grass2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a7a30" />
          <stop offset="100%" stopColor="#2a4a18" />
        </linearGradient>
        <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={wallColor} />
          <stop offset="100%" stopColor={wallColor} stopOpacity="0.75" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="4" dy="6" stdDeviation="4" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Sky */}
      <rect width={W} height={H} fill="url(#sky2)" />

      {/* Stars */}
      {[[30,20],[80,15],[150,30],[290,12],[370,25],[410,18],[60,45],[200,8]].map(([sx,sy],i) => (
        <circle key={i} cx={sx} cy={sy} r="1" fill="white" opacity="0.6" />
      ))}

      {/* Moon */}
      <circle cx={380} cy={35} r={18} fill="#f0e8c0" />
      <circle cx={390} cy={28} r={14} fill="#2d5a8a" />

      {/* Trees back */}
      {[[22, groundY - 70], [W - 28, groundY - 60]].map(([tx, ty], i) => (
        <g key={i}>
          <polygon points={`${tx},${ty} ${tx - 18},${groundY - 5} ${tx + 18},${groundY - 5}`} fill="#1a4a20" opacity="0.8" />
          <polygon points={`${tx},${ty - 22} ${tx - 14},${ty + 5} ${tx + 14},${ty + 5}`} fill="#245a28" opacity="0.9" />
          <rect x={tx - 3} y={groundY - 5} width={6} height={10} fill="#5a3010" />
        </g>
      ))}

      {/* Ground */}
      <rect x={0} y={groundY} width={W} height={H - groundY} fill="url(#grass2)" />
      <line x1={0} y1={groundY} x2={W} y2={groundY} stroke="#3a6020" strokeWidth="1.5" />

      {/* Foundation */}
      <rect x={houseX - 8} y={groundY - 8} width={houseW + 16} height={12} fill="#888" stroke="#555" strokeWidth="1" />

      {/* Terrace */}
      {terrace && (
        <g>
          <rect x={houseX + houseW} y={houseY + 30} width={68} height={houseH - 30} fill={wallColor} opacity="0.6" stroke="#444" strokeWidth="1.5" />
          {[0, 1, 2, 3, 4].map(i => (
            <line key={i} x1={houseX + houseW + 6 + i * 13} y1={houseY + 30} x2={houseX + houseW + 6 + i * 13} y2={groundY}
              stroke="#7a5030" strokeWidth="5" strokeLinecap="round" />
          ))}
          <rect x={houseX + houseW} y={houseY + 28} width={68} height={5} fill="#8a6040" stroke="#444" strokeWidth="1" />
          <rect x={houseX + houseW} y={groundY - 4} width={70} height={6} fill="#8a6040" stroke="#444" strokeWidth="1" />
        </g>
      )}

      {/* House walls */}
      <rect x={houseX} y={houseY} width={houseW} height={houseH} fill="url(#wallGrad)" stroke="#333" strokeWidth="2" filter="url(#shadow)" />

      {/* Wall texture */}
      {(wallMaterial.includes("timber") || wallMaterial.includes("log")) && (
        Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={houseX} y1={houseY + (i + 1) * (houseH / 11)} x2={houseX + houseW} y2={houseY + (i + 1) * (houseH / 11)}
            stroke="rgba(0,0,0,0.12)" strokeWidth="1.2" />
        ))
      )}
      {wallMaterial === "brick" && (
        Array.from({ length: 9 }, (_, row) =>
          Array.from({ length: 14 }, (_, col) => (
            <rect key={`${row}-${col}`}
              x={houseX + col * 20 + (row % 2 === 0 ? 0 : 10)} y={houseY + row * 14}
              width={18} height={12} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.7" />
          ))
        )
      )}

      {/* Roof */}
      {renderRoof()}

      {/* Windows */}
      <rect x={houseX + 18} y={houseY + 22} width={42} height={35} fill="#a8d8f8" stroke="#444" strokeWidth="1.5" rx="1" />
      <line x1={houseX + 39} y1={houseY + 22} x2={houseX + 39} y2={houseY + 57} stroke="#444" strokeWidth="1" />
      <line x1={houseX + 18} y1={houseY + 39} x2={houseX + 60} y2={houseY + 39} stroke="#444" strokeWidth="1" />
      {/* Window reflection */}
      <line x1={houseX + 20} y1={houseY + 24} x2={houseX + 26} y2={houseY + 34} stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />

      <rect x={houseX + 80} y={houseY + 24} width={30} height={28} fill="#a8d8f8" stroke="#444" strokeWidth="1.5" rx="1" />
      <line x1={houseX + 80} y1={houseY + 38} x2={houseX + 110} y2={houseY + 38} stroke="#444" strokeWidth="0.8" />

      {/* Door */}
      <rect x={houseX + houseW - 62} y={houseY + 50} width={30} height={houseH - 50} fill="#6a3e18" stroke="#333" strokeWidth="1.5" rx="2" />
      <rect x={houseX + houseW - 60} y={houseY + 52} width={12} height={14} fill="none" stroke="#8a5828" strokeWidth="0.8" rx="1" />
      <rect x={houseX + houseW - 60} y={houseY + 68} width={12} height={14} fill="none" stroke="#8a5828" strokeWidth="0.8" rx="1" />
      <circle cx={houseX + houseW - 36} cy={houseY + 88} r={3} fill="#d4a820" />
      {/* Door step */}
      <rect x={houseX + houseW - 65} y={groundY - 8} width={36} height={8} fill="#999" stroke="#666" strokeWidth="1" />

      {/* Chimney */}
      <rect x={houseX + houseW * 0.62} y={houseY - 85} width={20} height={60} fill="#a07050" stroke="#555" strokeWidth="1.5" />
      {/* Brick texture on chimney */}
      {Array.from({ length: 5 }, (_, i) => (
        <line key={i} x1={houseX + houseW * 0.62} y1={houseY - 85 + i * 12} x2={houseX + houseW * 0.62 + 20} y2={houseY - 85 + i * 12}
          stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
      ))}
      <rect x={houseX + houseW * 0.62 - 4} y={houseY - 90} width={28} height={8} fill="#777" stroke="#444" strokeWidth="1" />
      {/* Smoke */}
      <path d={`M ${houseX + houseW * 0.62 + 10} ${houseY - 95} Q ${houseX + houseW * 0.62 + 20} ${houseY - 115} ${houseX + houseW * 0.62 + 5} ${houseY - 130}`}
        fill="none" stroke="rgba(200,200,200,0.5)" strokeWidth="6" strokeLinecap="round" />

      {/* Style label */}
      {style && (
        <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.7)" fontFamily="monospace">{style.toUpperCase()}</text>
      )}
    </svg>
  );
}

// ─── Bath type gallery templates ─────────────────────────────────────────────

export interface BathTemplate {
  id: string;
  name: string;
  subtitle: string;
  area: string;
  style: string;
  roofType: RoofType;
  wallMaterial: WallMaterial;
  layout: BathLayout;
  terrace: boolean;
  description: string;
  tags: string[];
}

export const BATH_TEMPLATES: BathTemplate[] = [
  {
    id: "classic_log",
    name: "Русская классика",
    subtitle: "Сруб из бревна",
    area: "24–30 м²",
    style: "russian_classic",
    roofType: "gable",
    wallMaterial: "log_rounded",
    layout: "3room",
    terrace: false,
    description: "Традиционная баня из круглого бревна с двускатной крышей. Максимальный жар, настоящий русский пар.",
    tags: ["Популярная", "Традиционная"],
  },
  {
    id: "modern_frame",
    name: "Современная каркасная",
    subtitle: "Каркас + имитация бруса",
    area: "20–28 м²",
    style: "modern_minimalist",
    roofType: "flat_single",
    wallMaterial: "frame_sip",
    layout: "3room",
    terrace: true,
    description: "Минималистичный дизайн, быстрый прогрев, панорамные окна. Строится за 2–3 месяца.",
    tags: ["Быстро", "Экономично"],
  },
  {
    id: "scandinavian",
    name: "Скандинавская",
    subtitle: "Профилированный брус",
    area: "22–32 м²",
    style: "scandinavian",
    roofType: "gable",
    wallMaterial: "timber_profiled",
    layout: "3room",
    terrace: true,
    description: "Сухой пар, электрическая печь, светлая отделка осиной. Терраса с видом на природу.",
    tags: ["Сухой пар", "Эстетика"],
  },
  {
    id: "house_bath",
    name: "Дом-баня",
    subtitle: "2 этажа: баня + жильё",
    area: "45–70 м²",
    style: "modern_minimalist",
    roofType: "mansard",
    wallMaterial: "timber_glued",
    layout: "house_bath",
    terrace: true,
    description: "Первый этаж — полноценная баня. Мансарда — спальня или комната отдыха для гостей.",
    tags: ["Два в одном", "Клееный брус"],
  },
  {
    id: "brick_classic",
    name: "Кирпичная",
    subtitle: "Долговечная классика",
    area: "28–40 м²",
    style: "russian_classic",
    roofType: "hip",
    wallMaterial: "brick",
    layout: "4room",
    terrace: false,
    description: "Кирпич держит тепло часами. Вальмовая крыша, 4 помещения, кирпичная печь-каменка.",
    tags: ["Долговечность", "Солидность"],
  },
  {
    id: "eco_log",
    name: "Эко-баня",
    subtitle: "Рубленый вручную сруб",
    area: "18–24 м²",
    style: "eco_natural",
    roofType: "gable",
    wallMaterial: "log_hand",
    layout: "2room",
    terrace: false,
    description: "Компактная баня из ручного сруба. Минимум химии, максимум природы. Идеальна для небольших участков.",
    tags: ["Компактная", "Природность"],
  },
  {
    id: "finnish_electric",
    name: "Финская сауна",
    subtitle: "Каркас + электропечь",
    area: "16–22 м²",
    style: "finnish_sauna",
    roofType: "flat_single",
    wallMaterial: "frame_osb",
    layout: "2room",
    terrace: false,
    description: "Сухой сауна-режим 80–100°C. Быстрый разогрев за 20 минут. Электропечь без дымохода.",
    tags: ["Без дымохода", "Быстрый разогрев"],
  },
  {
    id: "glued_mansard",
    name: "Баня с мансардой",
    subtitle: "Клееный брус + мансарда",
    area: "35–50 м²",
    style: "modern_minimalist",
    roofType: "mansard",
    wallMaterial: "timber_glued",
    layout: "3room",
    terrace: true,
    description: "Мансардная крыша даёт дополнительное пространство. Клееный брус — без усадки, отделка сразу.",
    tags: ["Без усадки", "Мансарда"],
  },
  {
    id: "gazebo_bath",
    name: "Баня-беседка",
    subtitle: "Компакт на свайном фундаменте",
    area: "12–18 м²",
    style: "eco_natural",
    roofType: "hip",
    wallMaterial: "frame_sip",
    layout: "2room",
    terrace: false,
    description: "Небольшая баня для 2–3 человек. Свайный фундамент, быстрый монтаж, минимальная площадь участка.",
    tags: ["Мини-баня", "Свайный фундамент"],
  },
  {
    id: "gas_block",
    name: "Баня из газоблока",
    subtitle: "Бюджетно и надёжно",
    area: "24–36 м²",
    style: "russian_classic",
    roofType: "gable",
    wallMaterial: "block_gas",
    layout: "3room",
    terrace: false,
    description: "Газобетонные блоки + тщательная гидро/пароизоляция. Дешевле кирпича, теплее каркаса.",
    tags: ["Бюджетно", "Надёжно"],
  },
];

interface TemplateCardProps {
  tpl: BathTemplate;
  selected: boolean;
  onSelect: () => void;
}

export function BathTemplateCard({ tpl, selected, onSelect }: TemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border-2 overflow-hidden transition-all hover:shadow-md ${
        selected ? "border-amber-500 shadow-amber-200 shadow-md" : "border-gray-200 hover:border-amber-300"
      }`}
    >
      {/* Mini exterior preview */}
      <div className="bg-slate-800 h-28 overflow-hidden relative">
        <ExteriorSVG roofType={tpl.roofType} wallMaterial={tpl.wallMaterial} terrace={tpl.terrace} />
        {selected && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            ✓ Выбрана
          </div>
        )}
      </div>
      <div className="p-2.5 bg-white">
        <div className="font-bold text-xs text-gray-900 truncate">{tpl.name}</div>
        <div className="text-[10px] text-gray-500 truncate">{tpl.subtitle}</div>
        <div className="text-[10px] text-amber-700 font-semibold mt-1">{tpl.area}</div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {tpl.tags.map(tag => (
            <span key={tag} className="text-[9px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded-full border border-amber-200">{tag}</span>
          ))}
        </div>
      </div>
    </button>
  );
}
