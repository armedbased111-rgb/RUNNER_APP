import { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useProfileStore } from '../../stores/profileStore';
import { getFactionColor } from '../../types';
import type { Screen } from '../../types';
import { historyRepo } from '../../db/repositories';
import { FACTION_ICONS } from '../../assets';

interface NavItem {
  label: string;
  icon: string;
  screen: Screen;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'QUARTIER GÉNÉRAL', icon: '⌂', screen: 'dashboard' },
  { label: 'CONTRATS', icon: '◈', screen: 'quests' },
  { label: 'HISTORIQUE', icon: '≡', screen: 'history' },
];

export function Sidebar() {
  const { screen, navigate } = useAppStore();
  const { runnerName, factionId } = useProfileStore();
  const [totalRuns, setTotalRuns] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    historyRepo.getStats().then(stats => {
      setTotalRuns(stats.total);
      setTotalXp(stats.totalXp);
    }).catch(() => {});
  }, []);

  const factionColor = getFactionColor(factionId);
  const rank = Math.floor(totalXp / 1000) + 1;
  const xpInRank = totalXp % 1000;
  const xpPercent = xpInRank / 1000;

  return (
    <div
      style={{
        width: 'clamp(140px, 180px, 180px)',
        minWidth: '140px',
        maxWidth: '180px',
        backgroundColor: '#111111',
        borderRight: '1px solid #2e2e2e',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        gap: '0',
        height: '100%',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Avatar — cliquable → profil */}
      <button
        onClick={() => navigate('profile')}
        style={{
          padding: '0 12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
        }}
      >
        {/* Avatar image */}
        <div
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#111111',
            border: `2px solid ${factionColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <img
            src={FACTION_ICONS[factionId]}
            alt={factionId}
            style={{ width: '34px', height: '34px', objectFit: 'contain' }}
          />
        </div>

        {/* Nom runner */}
        <div
          style={{
            fontSize: '11px',
            color: '#e8e8e8',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: '"Share Tech Mono", monospace',
            fontWeight: 'bold',
          }}
        >
          {runnerName}
        </div>

        {/* Rank + XP bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0, width: '100%' }}>
          <div style={{ fontSize: '10px', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.06em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            RANG {rank}
          </div>
          <div style={{ height: '3px', backgroundColor: '#2a2a2a', width: '100%', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${xpPercent * 100}%`,
                backgroundColor: factionColor,
                transition: 'width 300ms ease',
              }}
            />
          </div>
          <div style={{ fontSize: '10px', color: '#444444', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {totalXp} XP TOTAL
          </div>
        </div>
      </button>

      {/* Separator */}
      <div style={{ height: '1px', backgroundColor: '#2e2e2e', margin: '0 0 8px' }} />

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {NAV_ITEMS.map(item => {
          const isActive = screen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => navigate(item.screen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                backgroundColor: isActive ? '#1a1a1a' : 'transparent',
                color: isActive ? '#aaff00' : '#888888',
                border: 'none',
                borderLeft: isActive ? '2px solid #aaff00' : '2px solid transparent',
                fontSize: '11px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: '"Share Tech Mono", monospace',
                textAlign: 'left',
                width: '100%',
                transition: 'all 150ms ease',
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              <span style={{ fontSize: '14px', minWidth: '16px', flexShrink: 0 }}>{item.icon}</span>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom: stats */}
      <div
        style={{
          padding: '12px 12px',
          borderTop: '1px solid #2e2e2e',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: '10px',
            color: '#444444',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          TOTAL: {totalRuns} RUNS
        </div>
      </div>
    </div>
  );
}
