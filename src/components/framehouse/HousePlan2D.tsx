import type { FrameHouseSpec } from "@/lib/frameHouseGenerator";

interface Props {
  spec: FrameHouseSpec;
}

export default function HousePlan2D({ spec }: Props) {
  const padding = 40;
  const maxDim = Math.max(spec.length, spec.width);
  const scale = 380 / maxDim;
  const w = spec.length * scale;
  const h = spec.width * scale;
  const totalW = w + padding * 2;
  const totalH = h + padding * 2 + 20;

  // Стойки по периметру
  const studPositions: { x: number; orient: "h" | "v" }[] = [];
  for (let x = 0; x <= spec.length; x += spec.studPitch) {
    studPositions.push({ x: x * scale + padding, orient: "v" });
  }

  // Стропила
  const rafterCount = Math.ceil(spec.length / 700) + 1;
  const rafterPositions = Array.from({ length: rafterCount }, (_, i) =>
    Math.min((i * 700 * scale) + padding, w + padding)
  );

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="w-full max-w-2xl mx-auto"
        style={{ minWidth: 360 }}
      >
        {/* Размерные линии */}
        <text x={totalW / 2} y={14} textAnchor="middle" fontSize="11" fill="#64748b">
          {spec.length} мм
        </text>
        <text
          x={12}
          y={padding + h / 2}
          textAnchor="middle"
          fontSize="11"
          fill="#64748b"
          transform={`rotate(-90 12 ${padding + h / 2})`}
        >
          {spec.width} мм
        </text>

        {/* Контур дома */}
        <rect
          x={padding}
          y={padding}
          width={w}
          height={h}
          fill="#fef3c7"
          stroke="#92400e"
          strokeWidth="2"
        />

        {/* Стойки (вертикальные линии каркаса) */}
        {studPositions.map((s, i) => (
          <line
            key={`stud-${i}`}
            x1={s.x}
            y1={padding}
            x2={s.x}
            y2={padding + h}
            stroke="#92400e"
            strokeWidth="0.5"
            opacity="0.6"
          />
        ))}

        {/* Лаги пола */}
        {Array.from({ length: Math.ceil(spec.length / 600) }, (_, i) => {
          const x = padding + (i * 600 * scale);
          if (x > padding + w - 4) return null;
          return (
            <line
              key={`joist-${i}`}
              x1={x}
              y1={padding}
              x2={x}
              y2={padding + h}
              stroke="#3b82f6"
              strokeWidth="0.4"
              strokeDasharray="2,2"
              opacity="0.4"
            />
          );
        })}

        {/* Окна (на южной/верхней стене распределяем) */}
        {Array.from({ length: spec.windowsCount }, (_, i) => {
          const totalWin = spec.windowsCount;
          const step = w / (totalWin + 1);
          const xStart = padding + step * (i + 1) - (spec.windowWidth * scale) / 2;
          const winW = spec.windowWidth * scale;
          return (
            <rect
              key={`win-${i}`}
              x={xStart}
              y={padding - 3}
              width={winW}
              height={6}
              fill="#0ea5e9"
              stroke="#0369a1"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Двери (на нижней стене) */}
        {Array.from({ length: spec.doorsCount }, (_, i) => {
          const step = w / (spec.doorsCount + 1);
          const xStart = padding + step * (i + 1) - (spec.doorWidth * scale) / 2;
          const doorW = spec.doorWidth * scale;
          return (
            <rect
              key={`door-${i}`}
              x={xStart}
              y={padding + h - 3}
              width={doorW}
              height={6}
              fill="#dc2626"
              stroke="#7f1d1d"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Легенда */}
        <g transform={`translate(${padding}, ${padding + h + 14})`}>
          <rect x={0} y={0} width={10} height={6} fill="#0ea5e9" />
          <text x={14} y={6} fontSize="10" fill="#475569">Окна ({spec.windowsCount})</text>

          <rect x={80} y={0} width={10} height={6} fill="#dc2626" />
          <text x={94} y={6} fontSize="10" fill="#475569">Двери ({spec.doorsCount})</text>

          <line x1={160} y1={3} x2={170} y2={3} stroke="#92400e" strokeWidth="1" />
          <text x={174} y={6} fontSize="10" fill="#475569">Стойки</text>

          <line x1={220} y1={3} x2={230} y2={3} stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" />
          <text x={234} y={6} fontSize="10" fill="#475569">Лаги</text>
        </g>
      </svg>

      {/* Информация */}
      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
        <div className="bg-slate-50 dark:bg-slate-800 rounded p-2">
          <div className="text-[11px] text-slate-500">Площадь</div>
          <div className="text-sm font-semibold">{Math.round((spec.length * spec.width * spec.floors) / 1_000_000)} м²</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded p-2">
          <div className="text-[11px] text-slate-500">Периметр</div>
          <div className="text-sm font-semibold">{Math.round((2 * (spec.length + spec.width)) / 1000)} м</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded p-2">
          <div className="text-[11px] text-slate-500">Этажей</div>
          <div className="text-sm font-semibold">{spec.floors}</div>
        </div>
      </div>
    </div>
  );
}
