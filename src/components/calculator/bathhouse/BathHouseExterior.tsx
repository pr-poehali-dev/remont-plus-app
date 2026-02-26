import type { RoofType, WallMaterial } from "./BathHouseTypes";

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
          {Array.from({ length: 5 }, (_, row) =>
            Array.from({ length: 10 }, (_, col) => {
              const tileW = rw / 10, tileH = (houseY - peakY) / 5;
              const tx = rx + col * tileW + (row % 2 === 0 ? 0 : tileW / 2);
              const ty = peakY + row * tileH;
              return <rect key={`${row}-${col}`} x={tx} y={ty} width={tileW - 1} height={tileH - 1} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.7" />;
            })
          )}
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
      <line x1={houseX + 20} y1={houseY + 24} x2={houseX + 26} y2={houseY + 34} stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
      <rect x={houseX + 80} y={houseY + 24} width={30} height={28} fill="#a8d8f8" stroke="#444" strokeWidth="1.5" rx="1" />
      <line x1={houseX + 80} y1={houseY + 38} x2={houseX + 110} y2={houseY + 38} stroke="#444" strokeWidth="0.8" />

      {/* Door */}
      <rect x={houseX + houseW - 62} y={houseY + 50} width={30} height={houseH - 50} fill="#6a3e18" stroke="#333" strokeWidth="1.5" rx="2" />
      <rect x={houseX + houseW - 60} y={houseY + 52} width={12} height={14} fill="none" stroke="#8a5828" strokeWidth="0.8" rx="1" />
      <rect x={houseX + houseW - 60} y={houseY + 68} width={12} height={14} fill="none" stroke="#8a5828" strokeWidth="0.8" rx="1" />
      <circle cx={houseX + houseW - 36} cy={houseY + 88} r={3} fill="#d4a820" />
      <rect x={houseX + houseW - 65} y={groundY - 8} width={36} height={8} fill="#999" stroke="#666" strokeWidth="1" />

      {/* Chimney */}
      <rect x={houseX + houseW * 0.62} y={houseY - 85} width={20} height={60} fill="#a07050" stroke="#555" strokeWidth="1.5" />
      {Array.from({ length: 5 }, (_, i) => (
        <line key={i} x1={houseX + houseW * 0.62} y1={houseY - 85 + i * 12} x2={houseX + houseW * 0.62 + 20} y2={houseY - 85 + i * 12}
          stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
      ))}
      <rect x={houseX + houseW * 0.62 - 4} y={houseY - 90} width={28} height={8} fill="#777" stroke="#444" strokeWidth="1" />
      <path d={`M ${houseX + houseW * 0.62 + 10} ${houseY - 95} Q ${houseX + houseW * 0.62 + 20} ${houseY - 115} ${houseX + houseW * 0.62 + 5} ${houseY - 130}`}
        fill="none" stroke="rgba(200,200,200,0.5)" strokeWidth="6" strokeLinecap="round" />

      {/* Style label */}
      {style && (
        <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.7)" fontFamily="monospace">{style.toUpperCase()}</text>
      )}
    </svg>
  );
}
