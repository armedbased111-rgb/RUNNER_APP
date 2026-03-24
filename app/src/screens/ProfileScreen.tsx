import { useState, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { useProfileStore } from '../stores/profileStore';
import { historyRepo, type RunStats } from '../db/repositories';
import { FACTIONS, getFactionColor, type FactionId } from '../types';
import { FACTION_ICONS } from '../assets';

export function ProfileScreen() {
  const { navigate } = useAppStore();
  const { runnerName, factionId, setRunnerName, setFactionId } = useProfileStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(runnerName);
  const [stats, setStats] = useState<RunStats | null>(null);

  useEffect(() => {
    historyRepo.getStats().then(setStats).catch(console.error);
  }, []);

  const factionColor = getFactionColor(factionId);
  const totalXp = stats?.totalXp ?? 0;
  const rank = Math.floor(totalXp / 1000) + 1;
  const xpInRank = totalXp % 1000;
  const xpPercent = (xpInRank / 1000) * 100;

  const commitName = () => {
    setEditingName(false);
    setRunnerName(nameInput.trim().toUpperCase() || 'RUNNER');
    setNameInput(nameInput.trim().toUpperCase() || 'RUNNER');
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
        maxWidth: 'min(600px, 100%)',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('dashboard')}
          style={{ background: 'none', border: 'none', color: '#888888', fontSize: '13px', cursor: 'pointer', fontFamily: '"Share Tech Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}
        >
          ← RETOUR
        </button>
        <h1 style={{ fontSize: 'clamp(14px, 3vw, 18px)', color: '#aaff00', textTransform: 'uppercase', letterSpacing: '0.15em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          CARTE DE RUNNER
        </h1>
      </div>

      {/* Carte principale */}
      <div style={{ border: '1px solid #2e2e2e', backgroundColor: '#0a0a0a', overflow: 'hidden' }}>

        {/* Bandeau faction en haut */}
        <div style={{ height: '4px', backgroundColor: factionColor }} />

        {/* Corps de la carte */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Avatar + nom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0 }}>
            {/* Avatar */}
            <div
              style={{
                width: '72px',
                height: '72px',
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
                style={{ width: '52px', height: '52px', objectFit: 'contain' }}
              />
            </div>

            {/* Nom + faction */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '9px', color: factionColor, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>
                {factionId}
              </div>

              {editingName ? (
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value.toUpperCase())}
                  onBlur={commitName}
                  onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setEditingName(false); setNameInput(runnerName); } }}
                  autoFocus
                  maxLength={20}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: `1px solid ${factionColor}`,
                    color: '#e8e8e8',
                    fontSize: 'clamp(18px, 4vw, 26px)',
                    fontFamily: '"Share Tech Mono", monospace',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    outline: 'none',
                    width: '100%',
                    padding: '2px 0',
                  }}
                />
              ) : (
                <button
                  onClick={() => { setEditingName(true); setNameInput(runnerName); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#e8e8e8',
                    fontSize: 'clamp(18px, 4vw, 26px)',
                    fontFamily: '"Share Tech Mono", monospace',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    cursor: 'text',
                    padding: '0',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {runnerName}
                  <span style={{ fontSize: '10px', color: '#444444', fontWeight: 'normal', letterSpacing: '0.05em' }}>✎</span>
                </button>
              )}

              <div style={{ fontSize: '10px', color: '#444444', textTransform: 'uppercase', marginTop: '4px' }}>
                RANG {rank} — {totalXp} XP TOTAL
              </div>
            </div>
          </div>

          {/* Barre XP */}
          <div style={{ position: 'relative', height: '20px', backgroundColor: '#111111', border: '1px solid #2e2e2e', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${xpPercent}%`, backgroundColor: factionColor, transition: 'width 600ms ease' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: '8px', fontSize: '10px', fontFamily: '"Share Tech Mono", monospace', color: xpPercent > 30 ? '#0f0f0f' : factionColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {xpInRank} / 1000 XP
            </div>
            <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', fontFamily: '"Share Tech Mono", monospace', color: xpPercent > 85 ? '#0f0f0f' : '#444444' }}>
              {xpPercent.toFixed(1)}%
            </div>
          </div>

          {/* Stats mini */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', backgroundColor: '#2e2e2e' }}>
              {[
                { v: stats.total,     l: 'RUNS TOTAL' },
                { v: stats.completed, l: 'COMPLÉTÉES' },
                { v: stats.streak,    l: 'STREAK' },
              ].map(({ v, l }) => (
                <div key={l} style={{ backgroundColor: '#111111', padding: '10px 12px' }}>
                  <div style={{ fontSize: 'clamp(16px, 3vw, 22px)', color: '#e8e8e8', fontFamily: '"Share Tech Mono", monospace', lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: '9px', color: '#444444', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sélection de faction */}
      <section>
        <div style={{ fontSize: '11px', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #2e2e2e', paddingBottom: '8px', marginBottom: '12px' }}>
          CHOISIR SA FACTION
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
          {FACTIONS.map(faction => {
            const isSelected = faction.id === factionId;
            return (
              <button
                key={faction.id}
                onClick={() => setFactionId(faction.id as FactionId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  border: `1px solid ${isSelected ? faction.color : '#2e2e2e'}`,
                  backgroundColor: isSelected ? '#111111' : '#0a0a0a',
                  cursor: 'pointer',
                  fontFamily: '"Share Tech Mono", monospace',
                  textAlign: 'left',
                  transition: 'border-color 150ms ease',
                }}
              >
                {/* Icone faction */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: isSelected ? faction.color : '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background-color 150ms ease',
                  }}
                >
                  <img
                    src={FACTION_ICONS[faction.id]}
                    alt={faction.id}
                    style={{
                      width: '26px',
                      height: '26px',
                      objectFit: 'contain',
                      filter: isSelected ? 'brightness(0)' : 'none',
                      opacity: isSelected ? 1 : 0.35,
                    }}
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12px', color: isSelected ? faction.color : '#888888', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: isSelected ? 'bold' : 'normal' }}>
                    {faction.id}
                  </div>
                  {isSelected && (
                    <div style={{ fontSize: '9px', color: faction.color, marginTop: '2px', letterSpacing: '0.06em' }}>
                      ✓ ACTIF
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ID Runner déco */}
      <div style={{ fontSize: '9px', color: '#1e1e1e', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: '"Share Tech Mono", monospace', paddingBottom: '8px' }}>
        ·○||| RUNNER.ID — {runnerName}@{factionId}.SYS ── CLEARANCE: RANG {rank}
      </div>
    </div>
  );
}

