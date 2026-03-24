import { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { getFactionColor, type FactionId } from '../types';
import { useQuestStore } from '../stores/questStore';
import { MarkdownEditor } from '../components/MarkdownEditor';

export function ActiveScreen() {
  const {
    timeLeft,
    contractItems,
    toggleItem,
    abandonRun,
    extractRun,
    activeQuestId,
    activeQuestTitle,
  } = useAppStore();

  const { quests, updateQuestNotes } = useQuestStore();
  const quest = quests.find(q => q.id === activeQuestId);

  const [abandonConfirm, setAbandonConfirm] = useState(false);
  const [abandoning, setAbandoning] = useState(false);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progress = (timeLeft / 1500) * 100;

  const factionId = quest?.factionId as FactionId | undefined;
  const factionColor = factionId ? getFactionColor(factionId) : '#aaff00';

  const handleAbandon = async () => {
    if (!abandonConfirm) {
      setAbandonConfirm(true);
      // Reset confirm after 3 seconds
      setTimeout(() => setAbandonConfirm(false), 3000);
      return;
    }
    setAbandoning(true);
    try {
      await abandonRun();
    } catch (err) {
      console.error('Failed to abandon run:', err);
      setAbandoning(false);
    }
  };

  // Color the timer based on time remaining
  const timerColor = timeLeft > 300
    ? '#aaff00'
    : timeLeft > 60
    ? '#ff8c00'
    : '#ff3b30';

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0f0f0f',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      {/* Progress bar at top */}
      <div
        style={{
          height: '3px',
          backgroundColor: '#2a2a2a',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: timerColor,
            transition: 'width 1s linear, background-color 1s ease',
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(16px, 3vw, 32px)',
          gap: 'clamp(16px, 3vw, 32px)',
          overflowY: 'auto',
          minWidth: 0,
        }}
      >
        {/* Quest info */}
        <div style={{ textAlign: 'center', minWidth: 0, width: '100%' }}>
          {quest && (
            <>
              <div
                style={{
                  fontSize: '10px',
                  color: factionColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  marginBottom: '6px',
                }}
              >
                {quest.factionId}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#888888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {activeQuestTitle}
              </div>
            </>
          )}
        </div>

        {/* Timer */}
        <div
          style={{
            fontSize: 'clamp(48px, 10vw, 88px)',
            color: timerColor,
            fontFamily: '"Share Tech Mono", monospace',
            letterSpacing: '0.05em',
            lineHeight: 1,
            textShadow: `0 0 40px ${timerColor}40`,
            transition: 'color 1s ease, text-shadow 1s ease',
            flexShrink: 0,
          }}
        >
          {timeDisplay}
        </div>

        {/* Run label */}
        <div
          style={{
            fontSize: '11px',
            color: '#444444',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
          }}
        >
          RUN ACTIVE — 25:00
        </div>

        {/* Contract + Notes — 2 colonnes adaptatives */}
        <div
          style={{
            width: '100%',
            maxWidth: 'min(860px, 100%)',
            display: 'grid',
            gridTemplateColumns: contractItems.length > 0
              ? 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))'
              : '1fr',
            gap: '16px',
            alignItems: 'start',
            minWidth: 0,
          }}
        >
          {/* Contract */}
          {contractItems.length > 0 && (
            <div style={{ border: '1px solid #2e2e2e', backgroundColor: '#1a1a1a', minWidth: 0 }}>
              <div
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid #2e2e2e',
                  fontSize: '11px',
                  color: '#888888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                CONTRAT DE RUN
              </div>
              <div style={{ padding: '8px 0' }}>
                {contractItems.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px' }}
                  >
                    <span style={{ color: '#444444', fontSize: '10px', minWidth: '18px', flexShrink: 0 }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        color: item.completed ? '#444444' : '#e8e8e8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textDecoration: item.completed ? 'line-through' : 'none',
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.text}
                    </span>
                    <button
                      onClick={() => toggleItem(item.id)}
                      style={{
                        width: '16px',
                        height: '16px',
                        border: `1px solid ${item.completed ? '#aaff00' : '#2e2e2e'}`,
                        backgroundColor: item.completed ? '#aaff00' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: '#0f0f0f',
                        flexShrink: 0,
                      }}
                    >
                      {item.completed ? '✓' : ''}
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ padding: '8px 14px 12px' }}>
                <div style={{ height: '3px', backgroundColor: '#2a2a2a' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(contractItems.filter(i => i.completed).length / contractItems.length) * 100}%`,
                      backgroundColor: '#aaff00',
                      transition: 'width 150ms ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: '10px', color: '#444444', marginTop: '4px', textTransform: 'uppercase' }}>
                  {contractItems.filter(i => i.completed).length} / {contractItems.length} COMPLÉTÉS
                </div>
              </div>
            </div>
          )}

          {/* Notes du contrat */}
          <div
            style={{
              border: '1px solid #2e2e2e',
              backgroundColor: '#1a1a1a',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid #2e2e2e',
                fontSize: '11px',
                color: '#888888',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              NOTES — {activeQuestTitle}
            </div>
            <MarkdownEditor
              value={quest?.notes ?? ''}
              onChange={notes => quest && updateQuestNotes(quest.id, notes)}
              placeholder="NOTES DU CONTRAT..."
              minHeight="160px"
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => extractRun()}
            style={{
              padding: '10px 24px',
              backgroundColor: '#aaff00',
              color: '#0f0f0f',
              border: '1px solid #aaff00',
              fontSize: '12px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: '"Share Tech Mono", monospace',
              fontWeight: 'bold',
            }}
          >
            EXTRACT ✓
          </button>

          <button
            onClick={handleAbandon}
            disabled={abandoning}
            style={{
              padding: '10px 24px',
              backgroundColor: abandonConfirm ? '#ff3b30' : 'transparent',
              color: abandonConfirm ? '#ffffff' : '#ff3b30',
              border: '1px solid #ff3b30',
              fontSize: '12px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: abandoning ? 'not-allowed' : 'pointer',
              fontFamily: '"Share Tech Mono", monospace',
            }}
          >
            {abandoning ? 'ABANDON...' : abandonConfirm ? '⚠ CONFIRMER ABANDON' : 'ABANDON'}
          </button>
        </div>
      </div>
    </div>
  );
}
