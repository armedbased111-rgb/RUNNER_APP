interface DayData {
  date: string;
  xp: number;
  runs: number;
}

interface ActivityChartProps {
  data: DayData[];
  xpToNextRank?: number; // ligne de référence optionnelle
}

export function ActivityChart({ data, xpToNextRank }: ActivityChartProps) {
  // ViewBox fixe en pixels réels — scale automatiquement avec width:100%/height:auto
  const VW = 560;
  const VH = 130;
  const PAD = { top: 14, right: 16, bottom: 26, left: 42 };
  const cW = VW - PAD.left - PAD.right; // 502
  const cH = VH - PAD.top - PAD.bottom; // 90

  const n = data.length;
  const maxXp = Math.max(...data.map(d => d.xp), 10);
  const barSlot = cW / n;
  const barW = Math.max(barSlot * 0.55, 2);

  // Cumul XP pour la courbe bleue
  let cum = 0;
  const cumValues = data.map(d => { cum += d.xp; return cum; });
  const cumMax = cumValues[cumValues.length - 1] || 1;

  const toX = (i: number) => PAD.left + i * barSlot + barSlot / 2;
  const toBarY = (xp: number) => PAD.top + cH - (xp / maxXp) * cH;
  const toCumY = (c: number) => PAD.top + cH - (c / cumMax) * cH;

  // Polyline cumul
  const linePoints = data.map((_, i) => `${toX(i)},${toCumY(cumValues[i])}`).join(' ');

  // Y-axis ticks (3 niveaux)
  const yTicks = [0, Math.round(maxXp / 2), maxXp];

  // X-axis labels: tous les ~3 jours + dernier
  const xLabelIndices = new Set<number>();
  for (let i = 0; i < n; i += 3) xLabelIndices.add(i);
  xLabelIndices.add(n - 1);

  return (
    <div style={{ width: '100%' }}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      >
        {/* Fond chart */}
        <rect x={PAD.left} y={PAD.top} width={cW} height={cH} fill="#080808" />

        {/* Grid horizontale + Y labels */}
        {yTicks.map((tick, i) => {
          const y = toBarY(tick);
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={PAD.left + cW} y2={y}
                stroke="#1e1e1e" strokeWidth="1" />
              <text x={PAD.left - 6} y={y + 3.5}
                fontSize="9" fill="#3a3a3a"
                textAnchor="end" fontFamily="Share Tech Mono, monospace">
                {tick}
              </text>
            </g>
          );
        })}

        {/* Ligne de référence XP prochain rang (si fournie) */}
        {xpToNextRank !== undefined && xpToNextRank <= maxXp && (
          <g>
            <line
              x1={PAD.left} y1={toBarY(xpToNextRank)}
              x2={PAD.left + cW} y2={toBarY(xpToNextRank)}
              stroke="#f72585" strokeWidth="1"
              strokeDasharray="4,3" opacity="0.6"
            />
            <text x={PAD.left + cW + 4} y={toBarY(xpToNextRank) + 3.5}
              fontSize="8" fill="#f72585" fontFamily="Share Tech Mono, monospace">
              GOAL
            </text>
          </g>
        )}

        {/* Barres XP journalières */}
        {data.map((d, i) => {
          const x = PAD.left + i * barSlot + (barSlot - barW) / 2;
          const bh = d.xp > 0 ? Math.max((d.xp / maxXp) * cH, 2) : 1;
          const y = PAD.top + cH - bh;
          return (
            <rect key={i}
              x={x} y={y} width={barW} height={bh}
              fill={d.xp > 0 ? '#aaff00' : '#1c1c1c'}
              opacity={d.xp > 0 ? 0.9 : 1}
            />
          );
        })}

        {/* Courbe cumulative */}
        {cumMax > 0 && (
          <polyline
            points={linePoints}
            fill="none" stroke="#4a9eff" strokeWidth="1.5"
            strokeLinejoin="round" strokeLinecap="round"
          />
        )}

        {/* Dots sur la courbe — jours actifs seulement */}
        {data.map((d, i) => {
          if (d.xp === 0) return null;
          return (
            <circle key={i}
              cx={toX(i)} cy={toCumY(cumValues[i])}
              r="2.5" fill="#4a9eff"
            />
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => {
          if (!xLabelIndices.has(i)) return null;
          const parts = d.date.split('-');
          const label = `${parts[2]}/${parts[1]}`;
          return (
            <text key={i}
              x={toX(i)} y={VH - 4}
              fontSize="8.5" fill="#3a3a3a"
              textAnchor="middle" fontFamily="Share Tech Mono, monospace">
              {label}
            </text>
          );
        })}

        {/* Bordure chart */}
        <rect x={PAD.left} y={PAD.top} width={cW} height={cH}
          fill="none" stroke="#1e1e1e" strokeWidth="1" />
      </svg>

      {/* Légende */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '6px', paddingLeft: '42px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: '#aaff00', opacity: 0.9 }} />
          <span style={{ fontSize: '9px', color: '#3a3a3a', textTransform: 'uppercase', fontFamily: '"Share Tech Mono", monospace', letterSpacing: '0.08em' }}>XP / JOUR</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '2px', backgroundColor: '#4a9eff' }} />
          <span style={{ fontSize: '9px', color: '#3a3a3a', textTransform: 'uppercase', fontFamily: '"Share Tech Mono", monospace', letterSpacing: '0.08em' }}>CUMUL XP</span>
        </div>
      </div>
    </div>
  );
}
