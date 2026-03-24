import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { useQuestStore } from '../stores/questStore';
import { historyRepo, type RunStats } from '../db/repositories';
import type { Quest } from '../types';
import { getFactionColor } from '../types';
import { ActivityChart } from '../components/ActivityChart';

export function DashboardScreen() {
  const { navigate, activeFaction } = useAppStore();
  const { quests } = useQuestStore();
  const [stats, setStats] = useState<RunStats | null>(null);
  const [activity, setActivity] = useState<{ date: string; xp: number; runs: number }[]>([]);

  useEffect(() => {
    historyRepo.getStats().then(setStats).catch(console.error);
    historyRepo.getDailyActivity(14).then(setActivity).catch(console.error);
  }, []);

  const activeQuests = quests.filter(q => {
    if (q.status !== 'active') return false;
    if (activeFaction && q.factionId !== activeFaction) return false;
    return true;
  });

  const totalXp = stats?.totalXp ?? 0;
  const rank = Math.floor(totalXp / 1000) + 1;
  const xpInRank = totalXp % 1000;
  const xpPercent = (xpInRank / 1000) * 100;

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'clamp(16px, 3vw, 24px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minWidth: 0,
      }}
    >
      {/* Déco technique */}
      <div style={{ fontSize: '10px', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: '"Share Tech Mono", monospace' }}>
        ·○||| SYSTÈME EN LIGNE ── RUNNER.SYS v2.0
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', minWidth: 0 }}>
        <h1 style={{ fontSize: 'clamp(16px, 3vw, 20px)', color: '#aaff00', textTransform: 'uppercase', letterSpacing: '0.15em', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          QUARTIER GÉNÉRAL
        </h1>
        <button
          onClick={() => navigate('prep')}
          style={{ padding: '10px 20px', backgroundColor: '#aaff00', color: '#0f0f0f', border: 'none', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: '"Share Tech Mono", monospace', fontWeight: 'bold', flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          ▶ NOUVELLE RUN
        </button>
      </div>

      {/* Stats Marathon-style: 3 colonnes colorées */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', backgroundColor: '#2e2e2e', border: '1px solid #2e2e2e' }}>
          <StatBlock value={stats.todayTotal} label="RUNS AUJOURD'HUI" color="#4a9eff" />
          <StatBlock value={totalXp} label="XP TOTAL" color="#aaff00" />
          <StatBlock value={stats.streak} label="STREAK JOURS" color="#f72585" suffix={stats.streak > 0 ? ' 🔥' : ''} />
        </div>
      )}

      {/* XP / Rang — barre proéminente Marathon-style */}
      <div>
        <div
          style={{
            position: 'relative',
            height: '28px',
            backgroundColor: '#0a0f02',
            border: '1px solid #2e2e2e',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${xpPercent}%`,
              backgroundColor: '#aaff00',
              transition: 'width 600ms ease',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '12px',
              fontSize: '12px',
              fontFamily: '"Share Tech Mono", monospace',
              fontWeight: 'bold',
              color: xpPercent > 25 ? '#0f0f0f' : '#aaff00',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            RANG {rank} — {xpInRank} / 1000 XP
          </div>
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '12px',
              fontFamily: '"Share Tech Mono", monospace',
              color: xpPercent > 85 ? '#0f0f0f' : '#444444',
            }}
          >
            {xpPercent.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Graphe activité */}
      {activity.length > 0 && (
        <div>
          <SectionHeader>ACTIVITÉ — 14 DERNIERS JOURS</SectionHeader>
          <div style={{ padding: '12px 14px', border: '1px solid #2e2e2e', backgroundColor: '#0a0a0a' }}>
            <ActivityChart data={activity} xpToNextRank={1000 - xpInRank} />
          </div>
        </div>
      )}

      {/* Contrats actifs */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', minWidth: 0, marginBottom: '10px' }}>
          <SectionHeader>CONTRATS ACTIFS {activeFaction ? `— ${activeFaction}` : ''}</SectionHeader>
          <button
            onClick={() => navigate('quests')}
            style={{ background: 'none', border: 'none', color: '#aaff00', fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: '"Share Tech Mono", monospace', flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            VOIR TOUT →
          </button>
        </div>

        {activeQuests.length === 0 ? (
          <div style={{ padding: '20px', border: '1px solid #2e2e2e', color: '#444444', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>
            AUCUN CONTRAT ACTIF
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {activeQuests.slice(0, 5).map(quest => <QuestRow key={quest.id} quest={quest} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '11px', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
      {children}
    </div>
  );
}

function StatBlock({ value, label, color, suffix }: { value: number; label: string; color: string; suffix?: string }) {
  return (
    <div style={{ padding: '16px 14px', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
      <div style={{ fontSize: 'clamp(22px, 5vw, 34px)', color, lineHeight: 1, fontFamily: '"Share Tech Mono", monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}{suffix}
      </div>
      <div style={{ fontSize: '9px', color: '#444444', textTransform: 'uppercase', letterSpacing: '0.1em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </div>
    </div>
  );
}

function QuestRow({ quest }: { quest: Quest }) {
  const color = getFactionColor(quest.factionId);
  return (
    <div style={{ padding: '10px 14px', border: '1px solid #2e2e2e', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
      <div style={{ width: '3px', height: '32px', backgroundColor: color, flexShrink: 0 }} />
      <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <div style={{ fontSize: '12px', color: '#e8e8e8', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {quest.title}
        </div>
        <div style={{ fontSize: '10px', color, marginTop: '2px' }}>{quest.factionId}</div>
      </div>
    </div>
  );
}
