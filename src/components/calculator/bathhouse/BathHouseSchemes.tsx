import type { BathLayout, RoofType, WallMaterial } from "./BathHouseTypes";

interface LayoutProps {
  layout: BathLayout;
  steamArea: number;
  washArea: number;
  restArea: number;
  dressingArea: number;
}

function RoomBox({ x, y, w, h, label, sublabel, color }: {
  x: number; y: number; w: number; h: number;
  label: string; sublabel?: string; color: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={color} stroke="#555" strokeWidth="1.5" rx="2" />
      <text x={x + w / 2} y={y + h / 2 - (sublabel ? 8 : 0)} textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fontWeight="600" fill="#333" fontFamily="Montserrat, sans-serif">
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fill="#666" fontFamily="Rubik, sans-serif">
          {sublabel}
        </text>
      )}
    </g>
  );
}

function Door({ x, y, w, h, side = "right" }: { x: number; y: number; w: number; h: number; side?: "left" | "right" | "top" | "bottom" }) {
  const r = Math.min(w, h) * 0.4;
  if (side === "right") return (
    <g>
      <line x1={x + w} y1={y} x2={x + w} y2={y + h} stroke="white" strokeWidth="3" />
      <path d={`M ${x + w} ${y} A ${r} ${r} 0 0 0 ${x + w - r} ${y + r}`} fill="none" stroke="#888" strokeWidth="1" strokeDasharray="3,2" />
    </g>
  );
  if (side === "bottom") return (
    <g>
      <line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke="white" strokeWidth="3" />
      <path d={`M ${x} ${y + h} A ${r} ${r} 0 0 1 ${x + r} ${y + h - r}`} fill="none" stroke="#888" strokeWidth="1" strokeDasharray="3,2" />
    </g>
  );
  return null;
}

function Stove({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 10} y={y - 10} width={20} height={20} fill="#e85d04" rx="3" stroke="#c44a00" strokeWidth="1" />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="white">🔥</text>
    </g>
  );
}

function Shelf({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#c8a96e" stroke="#a08050" strokeWidth="1" rx="2" />
      <rect x={x + 3} y={y + 3} width={w - 6} height={h / 2 - 3} fill="#d4b87a" rx="1" />
      <rect x={x + 3} y={y + h / 2 + 3} width={w - 6} height={h / 2 - 6} fill="#d4b87a" rx="1" />
      <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#6b4c2a">полок</text>
    </g>
  );
}

export function FloorplanSVG({ layout, steamArea, washArea, restArea, dressingArea }: LayoutProps) {
  const W = 320;
  const H = 220;
  const pad = 12;

  if (layout === "2room") {
    const w1 = (W - pad * 2) * 0.45;
    const w2 = (W - pad * 2) * 0.55;
    const h = H - pad * 2;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <rect width={W} height={H} fill="#f0f0e8" />
        <RoomBox x={pad} y={pad} w={w1} h={h} label="Парная" sublabel={`${steamArea} м²`} color="#ffe8d6" />
        <Stove x={pad + w1 - 20} y={pad + 20} />
        <Shelf x={pad + 8} y={pad + 8} w={w1 * 0.6} h={h * 0.35} />
        <RoomBox x={pad + w1} y={pad} w={w2} h={h} label="Мойка + Предбанник" sublabel={`${washArea} м²`} color="#d6eeff" />
        <Door x={pad + w1 - 5} y={pad + h * 0.4} w={10} h={h * 0.25} side="right" />
        <Door x={pad + w1 + w2 - 5} y={pad + h * 0.35} w={10} h={h * 0.25} side="right" />
        <text x={W / 2} y={H - 3} textAnchor="middle" fontSize="8" fill="#aaa">Планировка 2 помещения</text>
      </svg>
    );
  }

  if (layout === "3room") {
    const w1 = (W - pad * 2) * 0.35;
    const w2 = (W - pad * 2) * 0.3;
    const w3 = (W - pad * 2) * 0.35;
    const h = H - pad * 2;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <rect width={W} height={H} fill="#f0f0e8" />
        <RoomBox x={pad} y={pad} w={w1} h={h} label="Парная" sublabel={`${steamArea} м²`} color="#ffe8d6" />
        <Stove x={pad + w1 - 18} y={pad + 22} />
        <Shelf x={pad + 6} y={pad + 6} w={w1 * 0.7} h={h * 0.38} />
        <RoomBox x={pad + w1} y={pad} w={w2} h={h} label="Мойка" sublabel={`${washArea} м²`} color="#d6eeff" />
        <RoomBox x={pad + w1 + w2} y={pad} w={w3} h={h} label="КО" sublabel={`${restArea} м²`} color="#e8f4e8" />
        <Door x={pad + w1 - 4} y={pad + h * 0.35} w={8} h={h * 0.3} side="right" />
        <Door x={pad + w1 + w2 - 4} y={pad + h * 0.35} w={8} h={h * 0.3} side="right" />
        <Door x={pad + w1 + w2 + w3 - 4} y={pad + h * 0.35} w={8} h={h * 0.3} side="right" />
        <text x={W / 2} y={H - 3} textAnchor="middle" fontSize="8" fill="#aaa">Планировка 3 помещения</text>
      </svg>
    );
  }

  if (layout === "4room") {
    const w1 = (W - pad * 2) * 0.28;
    const w2 = (W - pad * 2) * 0.24;
    const w3 = (W - pad * 2) * 0.22;
    const w4 = (W - pad * 2) * 0.26;
    const h = H - pad * 2;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <rect width={W} height={H} fill="#f0f0e8" />
        <RoomBox x={pad} y={pad} w={w1} h={h} label="Парная" sublabel={`${steamArea} м²`} color="#ffe8d6" />
        <Stove x={pad + w1 - 15} y={pad + 20} />
        <Shelf x={pad + 5} y={pad + 5} w={w1 * 0.75} h={h * 0.35} />
        <RoomBox x={pad + w1} y={pad} w={w2} h={h} label="Мойка" sublabel={`${washArea} м²`} color="#d6eeff" />
        <RoomBox x={pad + w1 + w2} y={pad} w={w3} h={h} label="Пред-\nбанник" sublabel={`${dressingArea} м²`} color="#f5f5dc" />
        <RoomBox x={pad + w1 + w2 + w3} y={pad} w={w4} h={h} label="КО" sublabel={`${restArea} м²`} color="#e8f4e8" />
        <Door x={pad + w1 - 4} y={pad + h * 0.35} w={8} h={h * 0.3} side="right" />
        <Door x={pad + w1 + w2 - 4} y={pad + h * 0.35} w={8} h={h * 0.3} side="right" />
        <Door x={pad + w1 + w2 + w3 - 4} y={pad + h * 0.35} w={8} h={h * 0.3} side="right" />
        <Door x={pad + w1 + w2 + w3 + w4 - 4} y={pad + h * 0.35} w={8} h={h * 0.3} side="right" />
        <text x={W / 2} y={H - 3} textAnchor="middle" fontSize="8" fill="#aaa">Планировка 4 помещения</text>
      </svg>
    );
  }

  // house_bath
  const wL = (W - pad * 2) * 0.65;
  const wR = (W - pad * 2) * 0.35;
  const hBottom = (H - pad * 2) * 0.58;
  const hTop = (H - pad * 2) * 0.42;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <rect width={W} height={H} fill="#f0f0e8" />
      {/* Нижний этаж */}
      <RoomBox x={pad} y={pad + hTop} w={wL * 0.45} h={hBottom} label="Парная" sublabel={`${steamArea} м²`} color="#ffe8d6" />
      <Stove x={pad + wL * 0.45 - 15} y={pad + hTop + 20} />
      <Shelf x={pad + 5} y={pad + hTop + 5} w={wL * 0.33} h={hBottom * 0.38} />
      <RoomBox x={pad + wL * 0.45} y={pad + hTop} w={wL * 0.3} h={hBottom} label="Мойка" sublabel={`${washArea} м²`} color="#d6eeff" />
      <RoomBox x={pad + wL * 0.75} y={pad + hTop} w={wL * 0.25 + wR} h={hBottom} label="КО" sublabel={`${restArea} м²`} color="#e8f4e8" />
      {/* Верхний этаж — мансарда */}
      <RoomBox x={pad} y={pad} w={wL + wR} h={hTop} label="Мансарда / Спальня" sublabel="2 этаж" color="#f0e8ff" />
      {/* Лестница */}
      <rect x={pad + wL + wR - 30} y={pad + hTop - 12} width={25} height={14} fill="#ddd" stroke="#aaa" strokeWidth="1" rx="1" />
      <text x={pad + wL + wR - 17} y={pad + hTop - 4} textAnchor="middle" fontSize="7" fill="#777">лестн.</text>
      <text x={W / 2} y={H - 3} textAnchor="middle" fontSize="8" fill="#aaa">Дом-баня (2 уровня)</text>
    </svg>
  );
}

interface ExteriorProps {
  roofType: RoofType;
  wallMaterial: WallMaterial;
  terrace?: boolean;
  style?: string;
}

export function ExteriorSVG({ roofType, wallMaterial, terrace, style }: ExteriorProps) {
  const W = 320;
  const H = 220;

  // Цвет стен по материалу
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

  // Цвет крыши
  const roofColors: Record<string, string> = {
    flat_single: "#8890a0",
    gable:       "#606878",
    hip:         "#505868",
    mansard:     "#484858",
  };
  const roofColor = roofColors[roofType] || "#606878";

  const groundY = H - 30;
  const houseW = terrace ? 200 : 240;
  const houseX = terrace ? 40 : 40;
  const houseH = 100;
  const houseY = groundY - houseH;

  const renderRoof = () => {
    if (roofType === "flat_single") {
      const rx = houseX - 8;
      const ry = houseY - 20;
      return (
        <g>
          <polygon points={`${rx},${ry} ${rx + houseW + 16},${ry} ${rx + houseW + 16},${houseY} ${rx},${houseY}`}
            fill={roofColor} stroke="#333" strokeWidth="1.2" />
          <line x1={rx} y1={ry} x2={rx + houseW + 16} y2={ry - 12} stroke={roofColor} strokeWidth="16" />
        </g>
      );
    }
    if (roofType === "gable") {
      const peakX = houseX + houseW / 2;
      const peakY = houseY - 55;
      return (
        <g>
          <polygon
            points={`${houseX - 10},${houseY} ${peakX},${peakY} ${houseX + houseW + 10},${houseY}`}
            fill={roofColor} stroke="#333" strokeWidth="1.5"
          />
          <line x1={peakX} y1={peakY} x2={peakX} y2={houseY} stroke="#333" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3" />
        </g>
      );
    }
    if (roofType === "hip") {
      const peakX = houseX + houseW / 2;
      const peakY = houseY - 50;
      const inset = 20;
      return (
        <polygon
          points={`${houseX + inset},${houseY} ${houseX - 8},${houseY + 8} ${peakX},${peakY} ${houseX + houseW + 8},${houseY + 8} ${houseX + houseW - inset},${houseY}`}
          fill={roofColor} stroke="#333" strokeWidth="1.5"
        />
      );
    }
    if (roofType === "mansard") {
      const peakX = houseX + houseW / 2;
      const midY = houseY - 30;
      const peakY = houseY - 75;
      return (
        <g>
          <polygon
            points={`${houseX - 10},${houseY} ${houseX + 22},${midY} ${houseX + houseW - 22},${midY} ${houseX + houseW + 10},${houseY}`}
            fill={roofColor} stroke="#333" strokeWidth="1.5"
          />
          <polygon
            points={`${houseX + 22},${midY} ${peakX},${peakY} ${houseX + houseW - 22},${midY}`}
            fill={roofColor} stroke="#333" strokeWidth="1.5"
          />
          {/* Мансардные окна */}
          <rect x={houseX + houseW / 2 - 20} y={midY - 18} width={40} height={22} fill="#a8d0f0" stroke="#555" strokeWidth="1" rx="1" />
        </g>
      );
    }
    return null;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Небо */}
      <defs>
        <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c8e6f4" />
          <stop offset="100%" stopColor="#e8f4fc" />
        </linearGradient>
        <linearGradient id="grass" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7ab648" />
          <stop offset="100%" stopColor="#5a9030" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#sky)" />
      {/* Облака */}
      <ellipse cx={60} cy={35} rx={30} ry={12} fill="white" opacity="0.8" />
      <ellipse cx={80} cy={28} rx={22} ry={14} fill="white" opacity="0.9" />
      <ellipse cx={240} cy={45} rx={25} ry={10} fill="white" opacity="0.7" />
      {/* Земля */}
      <rect x={0} y={groundY} width={W} height={H - groundY} fill="url(#grass)" />
      {/* Терраса */}
      {terrace && (
        <g>
          <rect x={houseX + houseW} y={houseY + 20} width={60} height={houseH - 20} fill={wallColor} opacity="0.7" stroke="#555" strokeWidth="1.2" />
          {[0, 1, 2, 3].map(i => (
            <line key={i} x1={houseX + houseW + 8 + i * 14} y1={houseY + 20} x2={houseX + houseW + 8 + i * 14} y2={groundY} stroke="#888" strokeWidth="2" />
          ))}
          <line x1={houseX + houseW} y1={houseY + 20} x2={houseX + houseW + 60} y2={houseY + 20} stroke="#666" strokeWidth="2" />
        </g>
      )}
      {/* Стены дома */}
      <rect x={houseX} y={houseY} width={houseW} height={houseH} fill={wallColor} stroke="#444" strokeWidth="1.8" />
      {/* Горизонтальные линии для бревна/бруса */}
      {(wallMaterial.includes("timber") || wallMaterial.includes("log")) && (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={houseX} y1={houseY + (i + 1) * (houseH / 9)} x2={houseX + houseW} y2={houseY + (i + 1) * (houseH / 9)}
              stroke="#00000020" strokeWidth="1" />
          ))}
        </>
      )}
      {/* Кирпичная кладка */}
      {wallMaterial === "brick" && (
        <>
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 10 }, (_, col) => (
              <rect key={`${row}-${col}`}
                x={houseX + col * 24 + (row % 2 === 0 ? 0 : 12)} y={houseY + row * 13}
                width={20} height={10} fill="none" stroke="#00000025" strokeWidth="0.8" />
            ))
          )}
        </>
      )}
      {/* Крыша */}
      {renderRoof()}
      {/* Окна */}
      <rect x={houseX + 20} y={houseY + 25} width={38} height={32} fill="#a8d0f0" stroke="#555" strokeWidth="1.2" rx="1" />
      <line x1={houseX + 39} y1={houseY + 25} x2={houseX + 39} y2={houseY + 57} stroke="#555" strokeWidth="0.8" />
      <line x1={houseX + 20} y1={houseY + 41} x2={houseX + 58} y2={houseY + 41} stroke="#555" strokeWidth="0.8" />
      <rect x={houseX + 72} y={houseY + 25} width={30} height={28} fill="#a8d0f0" stroke="#555" strokeWidth="1.2" rx="1" />
      {/* Дверь */}
      <rect x={houseX + houseW - 58} y={houseY + 45} width={28} height={houseH - 45} fill="#8c6030" stroke="#444" strokeWidth="1.2" rx="2" />
      <circle cx={houseX + houseW - 34} cy={houseY + 72} r={2.5} fill="#d4a800" />
      {/* Дымоход */}
      <rect x={houseX + houseW * 0.65} y={houseY - 75} width={18} height={50} fill="#a07050" stroke="#555" strokeWidth="1.2" />
      <rect x={houseX + houseW * 0.65 - 3} y={houseY - 80} width={24} height={8} fill="#888" stroke="#555" strokeWidth="1" />
      {/* Деревья */}
      <ellipse cx={W - 40} cy={groundY - 45} rx={22} ry={30} fill="#4a9040" />
      <rect x={W - 43} y={groundY - 20} width={6} height={22} fill="#8b6030" />
      <ellipse cx={18} cy={groundY - 30} rx={16} ry={22} fill="#5aaa48" />
      <rect x={15} y={groundY - 12} width={5} height={14} fill="#8b6030" />
      {/* Подпись стиля */}
      {style && (
        <text x={W / 2} y={H - 5} textAnchor="middle" fontSize="9" fill="#666" fontFamily="Rubik, sans-serif">
          Внешний вид • {style}
        </text>
      )}
    </svg>
  );
}
