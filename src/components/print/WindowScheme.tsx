import type { WindowConfig } from "@/components/calculator/windows/WindowTypes";
import { CONSTRUCTION_TYPES } from "@/components/calculator/windows/WindowTypes";

export default function WindowScheme({ cfg, idx }: { cfg: WindowConfig; idx: number }) {
  const ct = CONSTRUCTION_TYPES.find(c => c.value === cfg.constructionType);
  const sashes = ct?.sashes ?? 1;
  const openings = cfg.openingTypes;

  const LEFT_OFF = 32;
  const BOT_OFF  = 28;
  const TOP_OFF  = 8;
  const RIGHT_OFF = 8;

  const FRAME_W = 160;
  const FRAME_H = 130;
  const svgW = LEFT_OFF + FRAME_W + RIGHT_OFF;
  const svgH = TOP_OFF + FRAME_H + BOT_OFF;

  const fx = LEFT_OFF;
  const fy = TOP_OFF;
  const FRAME_T = 6;

  const openSymbol = (sx: number, sy: number, sw: number, sh: number, ot: string) => {
    const cx = sx + sw / 2;
    const cy = sy + sh / 2;
    const hingeX = sx + 4;

    if (ot === "fixed") {
      return (
        <g stroke="#aaa" strokeWidth={0.7} strokeDasharray="4,3">
          <line x1={sx + 2} y1={sy + 2} x2={sx + sw - 2} y2={sy + sh - 2} />
          <line x1={sx + sw - 2} y1={sy + 2} x2={sx + 2} y2={sy + sh - 2} />
        </g>
      );
    }
    if (ot === "tilt") {
      return (
        <g stroke="#333" strokeWidth={0.9}>
          <line x1={sx + 2} y1={sy + sh - 2} x2={cx} y2={sy + 2} />
          <line x1={sx + sw - 2} y1={sy + sh - 2} x2={cx} y2={sy + 2} />
          <line x1={sx + 4} y1={sy + sh - 3} x2={sx + sw - 4} y2={sy + sh - 3} strokeWidth={1.5} />
        </g>
      );
    }
    if (ot === "swing") {
      return (
        <g stroke="#333" strokeWidth={0.9}>
          <line x1={sx + sw - 2} y1={sy + 2} x2={hingeX} y2={cy} />
          <line x1={sx + sw - 2} y1={sy + sh - 2} x2={hingeX} y2={cy} />
          <line x1={sx + 3} y1={sy + sh * 0.25} x2={sx + 3} y2={sy + sh * 0.35} strokeWidth={2} stroke="#555" />
          <line x1={sx + 3} y1={sy + sh * 0.65} x2={sx + 3} y2={sy + sh * 0.75} strokeWidth={2} stroke="#555" />
        </g>
      );
    }
    return (
      <g stroke="#333" strokeWidth={0.9}>
        <line x1={sx + sw - 2} y1={sy + 2} x2={hingeX} y2={cy} />
        <line x1={sx + sw - 2} y1={sy + sh - 2} x2={hingeX} y2={cy} />
        <line x1={sx + 4} y1={sy + sh - 2} x2={cx} y2={sy + 2} strokeDasharray="4,2" />
        <line x1={sx + sw - 4} y1={sy + sh - 2} x2={cx} y2={sy + 2} strokeDasharray="4,2" />
        <line x1={sx + 3} y1={sy + sh * 0.25} x2={sx + 3} y2={sy + sh * 0.35} strokeWidth={2} stroke="#555" />
        <line x1={sx + 3} y1={sy + sh * 0.65} x2={sx + 3} y2={sy + sh * 0.75} strokeWidth={2} stroke="#555" />
      </g>
    );
  };

  return (
    <svg width={svgW} height={svgH} xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: "Arial, sans-serif", overflow: "visible" }}>
      <defs>
        <marker id={`arr-${idx}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill="#444" />
        </marker>
        <marker id={`arrL-${idx}`} markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto-start-reverse">
          <polygon points="0 0, 6 3, 0 6" fill="#444" />
        </marker>
      </defs>

      <rect x={fx} y={fy} width={FRAME_W} height={FRAME_H} fill="#f0f4f8" stroke="#1a1a1a" strokeWidth={3} />
      <rect x={fx + FRAME_T} y={fy + FRAME_T} width={FRAME_W - FRAME_T * 2} height={FRAME_H - FRAME_T * 2} fill="none" stroke="#555" strokeWidth={0.8} />
      <rect x={fx - 4} y={fy + FRAME_H} width={FRAME_W + 8} height={6} fill="#ccc" stroke="#888" strokeWidth={0.7} rx={1} />

      {Array.from({ length: sashes }).map((_, i) => {
        const innerW = FRAME_W - FRAME_T * 2;
        const innerH = FRAME_H - FRAME_T * 2;
        const sw_inner = innerW / sashes;
        const isx = fx + FRAME_T + i * sw_inner;
        const isy = fy + FRAME_T;
        const sashPad = 4;
        const glassx = isx + sashPad;
        const glassy = isy + sashPad;
        const glassW = sw_inner - sashPad * 2;
        const glassH = innerH - sashPad * 2;
        const ot = openings[i] ?? "tilt_swing";

        return (
          <g key={i}>
            <rect x={isx} y={isy} width={sw_inner} height={innerH} fill="none" stroke="#666" strokeWidth={1.2} />
            <rect x={glassx} y={glassy} width={glassW} height={glassH}
              fill={ot === "fixed" ? "#dce8f5" : "#c8dff5"}
              stroke="#99b8d0" strokeWidth={0.5} opacity={0.8}
            />
            {openSymbol(glassx, glassy, glassW, glassH, ot)}
          </g>
        );
      })}

      <line
        x1={fx} y1={fy + FRAME_H + 16}
        x2={fx + FRAME_W} y2={fy + FRAME_H + 16}
        stroke="#444" strokeWidth={0.8}
        markerEnd={`url(#arr-${idx})`} markerStart={`url(#arrL-${idx})`}
      />
      <line x1={fx} y1={fy + FRAME_H + 12} x2={fx} y2={fy + FRAME_H + 20} stroke="#444" strokeWidth={0.8} />
      <line x1={fx + FRAME_W} y1={fy + FRAME_H + 12} x2={fx + FRAME_W} y2={fy + FRAME_H + 20} stroke="#444" strokeWidth={0.8} />
      <text x={fx + FRAME_W / 2} y={fy + FRAME_H + 26} textAnchor="middle" fontSize={9} fill="#222" fontWeight="bold">
        {cfg.width} мм
      </text>

      <line
        x1={fx - 18} y1={fy}
        x2={fx - 18} y2={fy + FRAME_H}
        stroke="#444" strokeWidth={0.8}
        markerEnd={`url(#arr-${idx})`} markerStart={`url(#arrL-${idx})`}
      />
      <line x1={fx - 22} y1={fy} x2={fx - 14} y2={fy} stroke="#444" strokeWidth={0.8} />
      <line x1={fx - 22} y1={fy + FRAME_H} x2={fx - 14} y2={fy + FRAME_H} stroke="#444" strokeWidth={0.8} />
      <text
        x={fx - 26} y={fy + FRAME_H / 2}
        textAnchor="middle" fontSize={9} fill="#222" fontWeight="bold"
        transform={`rotate(-90, ${fx - 26}, ${fy + FRAME_H / 2})`}
      >
        {cfg.height} мм
      </text>
    </svg>
  );
}
