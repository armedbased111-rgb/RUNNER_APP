import { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { useQuestStore } from '../stores/questStore';
import { getFactionColor, type FactionId } from '../types';

export function DebriefScreen() {
  const {
    contractItems,
    toggleItem,
    completeRun,
    activeQuestId,
    activeQuestTitle,
  } = useAppStore();

  const { quests } = useQuestStore();
  const quest = quests.find(q => q.id === activeQuestId);

  const [debriefNote, setDebriefNote] = useState('');

  // XP calculation
  const xpBase = contractItems.filter(i => i.completed).reduce((sum, i) => sum + i.xp, 0);
  const xpTarget = contractItems.reduce((sum, i) => sum + i.xp, 0);
  const notesLines = quest?.notes
    ? quest.notes.split('\n').filter(l => l.trim().length > 0).length
    : 0;
  const notesBonus = notesLines * 5;
  const totalXpEarned = xpBase + notesBonus;
  const [logging, setLogging] = useState(false);

  const factionId = quest?.factionId as FactionId | undefined;
  const factionColor = factionId ? getFactionColor(factionId) : '#aaff00';

  const completedCount = contractItems.filter(i => i.completed).length;
  const totalCount = contractItems.length;

  const handleLog = async () => {
    setLogging(true);
    try {
      await completeRun(debriefNote, totalXpEarned);
    } catch (err) {
      console.error('Failed to complete run:', err);
      setLogging(false);
    }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

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
      <div>
        <h1
          style={{
            fontSize: 'clamp(16px, 3vw, 20px)',
            color: '#aaff00',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          DEBRIEF
        </h1>
        <div
          style={{
            fontSize: '11px',
            color: '#888888',
            textTransform: 'uppercase',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          RUN TERMINÉE — {dateStr} À {timeStr}
        </div>
      </div>

      {/* Run stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: quest ? 'repeat(auto-fit, minmax(100px, 1fr))' : '1fr 1fr',
          gap: '12px',
          minWidth: 0,
        }}
      >
        <div
          style={{
            padding: '12px 14px',
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
              marginBottom: '4px',
            }}
          >
            DURÉE
          </div>
          <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', color: '#e8e8e8' }}>25:00</div>
        </div>

        <div
          style={{
            padding: '12px 14px',
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
              marginBottom: '4px',
            }}
          >
            TÂCHES
          </div>
          <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', color: '#aaff00' }}>
            {completedCount}/{totalCount}
          </div>
        </div>

        {quest && (
          <div
            style={{
              padding: '12px 14px',
              border: `1px solid ${factionColor}`,
              backgroundColor: '#1a1a1a',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                color: factionColor,
                textTransform: 'uppercase',
                marginBottom: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              {quest.factionId}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#e8e8e8',
                textTransform: 'uppercase',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                wordBreak: 'break-word',
              }}
            >
              {activeQuestTitle}
            </div>
          </div>
        )}

        {/* XP card */}
        <div
          style={{
            padding: '12px 14px',
            border: '1px solid #aaff00',
            backgroundColor: '#1a1a1a',
            minWidth: 0,
          }}
        >
          <div style={{ fontSize: '10px', color: '#aaff00', textTransform: 'uppercase', marginBottom: '4px' }}>
            XP GAGNÉ
          </div>
          <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', color: '#aaff00', fontWeight: 'bold' }}>
            +{totalXpEarned}
          </div>
          <div style={{ fontSize: '10px', color: '#444444', marginTop: '4px', textTransform: 'uppercase' }}>
            {xpBase}/{xpTarget} TÂCHES{notesBonus > 0 ? ` +${notesBonus} NOTES` : ''}
          </div>
        </div>
      </div>

      {/* Contract checklist */}
      {contractItems.length > 0 && (
        <section>
          <div
            style={{
              fontSize: '11px',
              color: '#888888',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderBottom: '1px solid #2e2e2e',
              paddingBottom: '8px',
              marginBottom: '10px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            CONTRAT — COCHEZ CE QUI A ÉTÉ ACCOMPLI
          </div>

          <div
            style={{
              border: '1px solid #2e2e2e',
              backgroundColor: '#1a1a1a',
              padding: '8px 0',
            }}
          >
            {contractItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: '"Share Tech Mono", monospace',
                  textAlign: 'left',
                  minWidth: 0,
                  boxSizing: 'border-box',
                }}
              >
                <span style={{ color: '#444444', fontSize: '10px', minWidth: '20px', flexShrink: 0 }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    border: `1px solid ${item.completed ? '#aaff00' : '#2e2e2e'}`,
                    backgroundColor: item.completed ? '#aaff00' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    color: '#0f0f0f',
                    flexShrink: 0,
                  }}
                >
                  {item.completed ? '✓' : ''}
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    color: item.completed ? '#888888' : '#e8e8e8',
                    textTransform: 'uppercase',
                    textDecoration: item.completed ? 'line-through' : 'none',
                    letterSpacing: '0.05em',
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
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: '8px' }}>
            <div style={{ height: '3px', backgroundColor: '#2a2a2a' }}>
              <div
                style={{
                  height: '100%',
                  width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                  backgroundColor: '#aaff00',
                  transition: 'width 150ms ease',
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Debrief note */}
      <section>
        <div
          style={{
            fontSize: '11px',
            color: '#888888',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderBottom: '1px solid #2e2e2e',
            paddingBottom: '8px',
            marginBottom: '10px',
          }}
        >
          NOTE DE DEBRIEF
        </div>
        <textarea
          value={debriefNote}
          onChange={e => setDebriefNote(e.target.value)}
          placeholder="QU'EST-CE QUI S'EST PASSÉ ? BLOCAGES ? VICTOIRES ?"
          style={{
            width: '100%',
            minHeight: '100px',
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

      {/* Log button */}
      <div style={{ paddingBottom: '24px' }}>
        <button
          onClick={handleLog}
          disabled={logging}
          style={{
            width: '100%',
            padding: '14px 24px',
            backgroundColor: logging ? '#1a1a1a' : '#aaff00',
            color: logging ? '#444444' : '#0f0f0f',
            border: `1px solid ${logging ? '#2e2e2e' : '#aaff00'}`,
            fontSize: '14px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: logging ? 'not-allowed' : 'pointer',
            fontFamily: '"Share Tech Mono", monospace',
            fontWeight: 'bold',
            boxSizing: 'border-box',
          }}
        >
          {logging ? 'ENREGISTREMENT...' : 'LOG RUN ✓'}
        </button>
      </div>
    </div>
  );
}
