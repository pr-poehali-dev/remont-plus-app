import type { BathLayout } from "./BathHouseTypes";
import {
  CAD_BG, CAD_WALL, CAD_DIM,
  CAD_HATCH_STEAM, CAD_HATCH_WASH, CAD_HATCH_REST, CAD_HATCH_DRESS, CAD_HATCH_ATTIC,
  WALL_T,
  DimLine, CadRoom, CadStove, CadShelf, CadGrid,
} from "./BathHouseCadPrimitives";

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
      <CadRoom x={x1} y={y2} w={wL} h={floorH} label="ПАРНАЯ" area={steamArea} hatch={CAD_HATCH_STEAM} doorSide="right" />
      <CadShelf x={x1 + WALL_T + 2} y={y2 + WALL_T + 2} w={wL * 0.6} h={floorH * 0.38} />
      <CadStove x={x1 + wL - WALL_T - 14} y={y2 + WALL_T + 14} />
      <CadRoom x={x2} y={y2} w={wM} h={floorH} label="МОЙКА" area={washArea} hatch={CAD_HATCH_WASH} doorSide="right" />
      <CadRoom x={x3} y={y2} w={wR} h={floorH} label="КО / ПРЕДБАННИК" area={restArea} hatch={CAD_HATCH_REST} doorSide="bottom" />
      <CadRoom x={x1} y={y1} w={planW} h={atticH} label="МАНСАРДА / СПАЛЬНЯ" area={Math.round(steamArea + washArea + restArea) - 4} hatch={CAD_HATCH_ATTIC} />
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
