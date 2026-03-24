import { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { FACTIONS } from '../../types';
import { historyRepo } from '../../db/repositories';
import { marathonWordmarkGreen } from '../../assets/index';

export function TopBar() {
  const { activeFaction, setActiveFaction } = useAppStore();
  const [todayRuns, setTodayRuns] = useState(0);

  useEffect(() => {
    historyRepo.getStats().then(stats => {
      setTodayRuns(stats.todayTotal);
    }).catch(() => {});
  }, []);

  return (
    <div
      style={{
        minHeight: '40px',
        height: '48px',
        backgroundColor: '#0f0f0f',
        borderBottom: '1px solid #2e2e2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        flexShrink: 0,
        gap: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Left: Logo Marathon + stats */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 1,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <img
          src={marathonWordmarkGreen}
          alt="RUNNER"
          style={{ height: '18px', objectFit: 'contain', flexShrink: 0 }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#888888',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          <span style={{ color: '#aaff00', flexShrink: 0 }}>▶</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {todayRuns} RUNS TODAY
          </span>
        </div>
      </div>

      {/* Center: Faction tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          flexShrink: 1,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {FACTIONS.map(faction => {
          const isActive = activeFaction === faction.id;
          return (
            <button
              key={faction.id}
              onClick={() => setActiveFaction(faction.id)}
              style={{
                padding: '3px 8px',
                backgroundColor: isActive ? faction.color : 'transparent',
                color: isActive ? '#0f0f0f' : faction.color,
                border: `1px solid ${isActive ? faction.color : faction.color + '55'}`,
                fontSize: '11px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: '"Share Tech Mono", monospace',
                transition: 'all 150ms ease',
                opacity: isActive ? 1 : 0.6,
                flexShrink: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {faction.name}
            </button>
          );
        })}
      </div>

      {/* Right: Online */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#aaff00',
          fontSize: '11px',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: '8px' }}>●</span>
        <span>ONLINE</span>
      </div>
    </div>
  );
}
