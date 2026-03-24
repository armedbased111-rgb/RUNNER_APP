import { useState, type ReactNode } from 'react';
import { useAppStore } from '../stores/appStore';
import { useQuestStore } from '../stores/questStore';
import { getFactionColor } from '../types';

export function PrepScreen() {
  const { navigate, initRun } = useAppStore();
  const { quests } = useQuestStore();

  const [selectedQuestId, setSelectedQuestId] = useState<string>('');
  const [contractLines, setContractLines] = useState<{ text: string; xp: number }[]>([{ text: '', xp: 50 }]);
  const [intentNote, setIntentNote] = useState('');
  const [launching, setLaunching] = useState(false);

  const activeQuests = quests.filter(q => q.status === 'active');
  const selectedQuest = activeQuests.find(q => q.id === selectedQuestId) ?? null;

  const addLine = () => {
    setContractLines(prev => [...prev, { text: '', xp: 50 }]);
  };

  const updateLine = (idx: number, value: string) => {
    setContractLines(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], text: value };
      return next;
    });
  };

  const updateLineXp = (idx: number, xp: number) => {
    setContractLines(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], xp };
      return next;
    });
  };

  const removeLine = (idx: number) => {
    setContractLines(prev => {
      if (prev.length <= 1) return [{ text: '', xp: 50 }];
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleLaunch = async () => {
    if (!selectedQuestId || !selectedQuest) return;
    setLaunching(true);

    const validItems = contractLines.filter(l => l.text.trim().length > 0);
    try {
      await initRun(selectedQuestId, selectedQuest.title, validItems, intentNote);
    } catch (err) {
      console.error('Failed to init run:', err);
      setLaunching(false);
    }
  };

  const totalXpPotential = contractLines
    .filter(l => l.text.trim().length > 0)
    .reduce((s, l) => s + l.xp, 0);

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'clamp(16px, 3vw, 24px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        maxWidth: 'min(760px, 100%)',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', minWidth: 0 }}>
        <button
          onClick={() => navigate('dashboard')}
          style={{
            background: 'none',
            border: 'none',
            color: '#888888',
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: '"Share Tech Mono", monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          ← RETOUR
        </button>
        <h1
          style={{
            fontSize: 'clamp(14px, 3vw, 18px)',
            color: '#aaff00',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          PRÉPARER LA RUN
        </h1>
      </div>

      {/* Section 1: Quest selection */}
      <section>
        <SectionLabel>01 — SÉLECTION CONTRAT</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
          {activeQuests.length === 0 ? (
            <div style={{ color: '#444444', fontSize: '12px', textTransform: 'uppercase', padding: '16px' }}>
              AUCUN CONTRAT ACTIF — CRÉEZ-EN UN D'ABORD
            </div>
          ) : (
            activeQuests.map(quest => {
              const color = getFactionColor(quest.factionId);
              const isSelected = quest.id === selectedQuestId;
              return (
                <button
                  key={quest.id}
                  onClick={() => setSelectedQuestId(quest.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    border: `1px solid ${isSelected ? color : '#2e2e2e'}`,
                    backgroundColor: isSelected ? '#1a1a1a' : 'transparent',
                    cursor: 'pointer',
                    fontFamily: '"Share Tech Mono", monospace',
                    textAlign: 'left',
                    width: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      border: `2px solid ${color}`,
                      backgroundColor: isSelected ? color : 'transparent',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        color: isSelected ? '#e8e8e8' : '#888888',
                        textTransform: 'uppercase',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {quest.title}
                    </div>
                    <div style={{ fontSize: '10px', color, marginTop: '2px' }}>{quest.factionId}</div>
                  </div>
                  {isSelected && (
                    <span style={{ color, fontSize: '12px', flexShrink: 0 }}>✓</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* Section 2: Contract */}
      <section>
        <SectionLabel>02 — CONTRAT DE RUN</SectionLabel>
        <div
          style={{
            marginTop: '10px',
            border: '1px solid #2e2e2e',
            backgroundColor: '#1a1a1a',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {contractLines.map((line, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: '#444444', fontSize: '11px', minWidth: '16px', flexShrink: 0 }}>
                {String(idx + 1).padStart(2, '0')}
              </span>
              <input
                value={line.text}
                onChange={e => updateLine(idx, e.target.value)}
                placeholder={`TÂCHE ${idx + 1}...`}
                style={{
                  flex: 1,
                  minWidth: 0,
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #2e2e2e',
                  color: '#e8e8e8',
                  fontSize: '12px',
                  padding: '6px 0',
                  outline: 'none',
                  fontFamily: '"Share Tech Mono", monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: '100%',
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') { addLine(); }
                  if (e.key === 'Backspace' && line.text === '' && contractLines.length > 1) {
                    removeLine(idx);
                  }
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                <input
                  type="number"
                  value={line.xp}
                  onChange={e => updateLineXp(idx, Math.max(5, Number(e.target.value) || 5))}
                  min={5}
                  step={5}
                  style={{
                    width: '44px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #2e2e2e',
                    color: '#aaff00',
                    fontSize: '11px',
                    padding: '6px 2px',
                    outline: 'none',
                    fontFamily: '"Share Tech Mono", monospace',
                    textAlign: 'right',
                  }}
                />
                <span style={{ color: '#444444', fontSize: '10px', letterSpacing: '0.04em' }}>XP</span>
              </div>
              {contractLines.length > 1 && (
                <button
                  onClick={() => removeLine(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#444444',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '4px',
                    fontFamily: '"Share Tech Mono", monospace',
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addLine}
            style={{
              background: 'none',
              border: '1px dashed #2e2e2e',
              color: '#444444',
              fontSize: '11px',
              cursor: 'pointer',
              padding: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: '"Share Tech Mono", monospace',
              marginTop: '4px',
              width: '100%',
            }}
          >
            + AJOUTER TÂCHE
          </button>
          <div style={{ fontSize: '10px', color: '#444444', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>
            +5 XP PAR LIGNE DE NOTES ÉCRITE
          </div>
        </div>
        {totalXpPotential > 0 && (
          <div style={{ marginTop: '6px', fontSize: '11px', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>
            TOTAL: <span style={{ color: '#aaff00' }}>{totalXpPotential} XP</span>
          </div>
        )}
      </section>

      {/* Section 3: Intent note */}
      <section>
        <SectionLabel>03 — NOTE D'INTENTION (OPTIONNEL)</SectionLabel>
        <textarea
          value={intentNote}
          onChange={e => setIntentNote(e.target.value)}
          placeholder="POURQUOI CETTE RUN ? QUEL EST L'OBJECTIF ?"
          style={{
            marginTop: '10px',
            width: '100%',
            minHeight: '80px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #2e2e2e',
            color: '#e8e8e8',
            fontSize: '12px',
            padding: '12px',
            resize: 'vertical',
            outline: 'none',
            fontFamily: '"Share Tech Mono", monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxSizing: 'border-box',
          }}
        />
      </section>

      {/* Launch button */}
      <div style={{ display: 'flex', gap: '12px', paddingBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('dashboard')}
          style={{
            padding: '12px 20px',
            backgroundColor: 'transparent',
            color: '#888888',
            border: '1px solid #2e2e2e',
            fontSize: '13px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: '"Share Tech Mono", monospace',
            whiteSpace: 'nowrap',
          }}
        >
          ← ANNULER
        </button>

        <button
          onClick={handleLaunch}
          disabled={!selectedQuestId || launching}
          style={{
            flex: 1,
            minWidth: 'min(200px, 100%)',
            padding: '12px 24px',
            backgroundColor: selectedQuestId && !launching ? '#aaff00' : '#1a1a1a',
            color: selectedQuestId && !launching ? '#0f0f0f' : '#444444',
            border: `1px solid ${selectedQuestId && !launching ? '#aaff00' : '#2e2e2e'}`,
            fontSize: '14px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: selectedQuestId && !launching ? 'pointer' : 'not-allowed',
            fontFamily: '"Share Tech Mono", monospace',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          {launching ? 'LANCEMENT...' : 'LAUNCH RUN ▶'}
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: '11px',
        color: '#888888',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        borderBottom: '1px solid #2e2e2e',
        paddingBottom: '8px',
      }}
    >
      {children}
    </div>
  );
}
