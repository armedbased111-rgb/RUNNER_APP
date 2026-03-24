import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { historyRepo, type RunStats, contractRepo, questRepo } from '../db/repositories';
import type { Run, Quest } from '../types';
import { getFactionColor } from '../types';

interface RunWithMeta extends Run {
  quest: Quest | null;
  completedItems: number;
  totalItems: number;
}

export function HistoryScreen() {
  const { activeFaction } = useAppStore();
  const [stats, setStats] = useState<RunStats | null>(null);
  const [runs, setRuns] = useState<RunWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, allRuns, allQuests] = await Promise.all([
        historyRepo.getStats(),
        historyRepo.getRecentRuns(100),
        questRepo.getAll(),
      ]);

      const questMap = new Map<string, Quest>();
      for (const q of allQuests) questMap.set(q.id, q);

      const runsWithMeta: RunWithMeta[] = await Promise.all(
        allRuns.map(async run => {
          const items = await contractRepo.getByRunId(run.id);
          return {
            ...run,
            quest: run.questId ? (questMap.get(run.questId) ?? null) : null,
            completedItems: items.filter(i => i.completed).length,
            totalItems: items.length,
          };
        })
      );

      setStats(statsData);
      setRuns(runsWithMeta);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRuns = activeFaction
    ? runs.filter(r => r.quest?.factionId === activeFaction)
    : runs;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'clamp(16px, 3vw, 24px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        minWidth: 0,
      }}
    >
      {/* Header */}
      <h1
        style={{
          fontSize: 'clamp(16px, 3vw, 20px)',
          color: '#aaff00',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        JOURNAL DE BORD
      </h1>

      {/* Global stats */}
      {stats && (
        <div>
          <div
            style={{
              fontSize: '11px',
              color: '#888888',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '12px',
            }}
          >
            STATISTIQUES GLOBALES
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '12px',
            }}
          >
            <StatCard label="TOTAL RUNS" value={stats.total} />
            <StatCard label="COMPLÉTÉES" value={stats.completed} accent />
            <StatCard label="ABANDONNÉES" value={stats.abandoned} danger />
            <StatCard
              label="TAUX"
              value={stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}
              suffix="%"
            />
            <StatCard label="STREAK" value={stats.streak} suffix=" JOURS" />
          </div>
        </div>
      )}

      {/* Runs list */}
      <div>
        <div
          style={{
            fontSize: '11px',
            color: '#888888',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            RUNS {activeFaction ? `— ${activeFaction}` : ''} ({filteredRuns.length})
          </span>
        </div>

        {loading ? (
          <div style={{ color: '#444444', fontSize: '12px', textTransform: 'uppercase', padding: '20px 0' }}>
            CHARGEMENT...
          </div>
        ) : filteredRuns.length === 0 ? (
          <div
            style={{
              padding: '32px',
              border: '1px solid #2e2e2e',
              color: '#444444',
              fontSize: '12px',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            AUCUNE RUN ENREGISTRÉE
          </div>
        ) : (
          /* Wrapper with horizontal scroll for the table on small windows */
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '420px' }}>
              {/* Table header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr 70px 70px 70px',
                  gap: '8px',
                  padding: '8px 14px',
                  backgroundColor: '#111111',
                  borderBottom: '1px solid #2e2e2e',
                  fontSize: '10px',
                  color: '#444444',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                <span>DATE</span>
                <span>CONTRAT</span>
                <span>DURÉE</span>
                <span>TÂCHES</span>
                <span>STATUT</span>
              </div>

              {filteredRuns.map(run => {
                const factionColor = run.quest ? getFactionColor(run.quest.factionId) : '#888888';
                const statusColor = run.status === 'completed'
                  ? '#aaff00'
                  : run.status === 'abandoned'
                  ? '#ff3b30'
                  : '#888888';

                return (
                  <div
                    key={run.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '90px 1fr 70px 70px 70px',
                      gap: '8px',
                      padding: '10px 14px',
                      border: '1px solid #2e2e2e',
                      backgroundColor: '#1a1a1a',
                      alignItems: 'center',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: '#888888', fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {formatDate(run.startedAt)}
                      </div>
                      <div style={{ color: '#444444', fontSize: '10px', whiteSpace: 'nowrap' }}>
                        {formatTime(run.startedAt)}
                      </div>
                    </div>

                    <div style={{ overflow: 'hidden', minWidth: 0 }}>
                      {run.quest ? (
                        <>
                          <div
                            style={{
                              color: '#e8e8e8',
                              fontSize: '12px',
                              textTransform: 'uppercase',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {run.quest.title}
                          </div>
                          <div style={{ color: factionColor, fontSize: '10px', marginTop: '1px', whiteSpace: 'nowrap' }}>
                            {run.quest.factionId}
                          </div>
                        </>
                      ) : (
                        <span style={{ color: '#444444', fontSize: '11px' }}>SANS CONTRAT</span>
                      )}
                    </div>

                    <span style={{ color: '#888888', fontSize: '11px', whiteSpace: 'nowrap' }}>25:00</span>

                    <span style={{ color: '#888888', fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {run.totalItems > 0
                        ? `${run.completedItems}/${run.totalItems}`
                        : '—'}
                    </span>

                    <span
                      style={{
                        color: statusColor,
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {run.status === 'completed' ? '✓ OK' : run.status === 'abandoned' ? '✕ ABD' : '● ACT'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  danger,
  suffix,
}: {
  label: string;
  value: number;
  accent?: boolean;
  danger?: boolean;
  suffix?: string;
}) {
  const color = accent ? '#aaff00' : danger ? '#ff3b30' : '#e8e8e8';
  return (
    <div
      style={{
        padding: '12px 16px',
        border: '1px solid #2e2e2e',
        backgroundColor: '#1a1a1a',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: '10px',
          color: '#888888',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 'clamp(18px, 3vw, 24px)',
          color,
          lineHeight: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}{suffix}
      </div>
    </div>
  );
}
