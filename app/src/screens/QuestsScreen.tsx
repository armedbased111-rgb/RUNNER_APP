import { useState, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import { useQuestStore } from '../stores/questStore';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { FACTIONS, getFactionColor, type FactionId, type Quest } from '../types';

export function QuestsScreen() {
  const { activeFaction } = useAppStore();
  const { quests, createQuest, updateQuestStatus, updateQuestNotes, updateQuestTitle } = useQuestStore();

  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestFaction, setNewQuestFaction] = useState<FactionId>('CYAC');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const filteredQuests = activeFaction
    ? quests.filter(q => q.factionId === activeFaction)
    : quests;

  const selectedQuest = selectedQuestId
    ? quests.find(q => q.id === selectedQuestId) ?? null
    : null;

  const handleCreate = async () => {
    if (!newQuestTitle.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createQuest(newQuestTitle.trim(), newQuestFaction);
      setNewQuestTitle('');
      setCreateError(null);
      setShowCreateModal(false);
    } catch (err) {
      console.error('createQuest error:', err);
      setCreateError(String(err));
    } finally {
      setCreating(false);
    }
  };

  const handleNotesChange = async (notes: string) => {
    if (!selectedQuestId) return;
    await updateQuestNotes(selectedQuestId, notes);
  };

  const handleArchive = async (quest: Quest) => {
    await updateQuestStatus(quest.id, 'completed');
    if (selectedQuestId === quest.id) setSelectedQuestId(null);
  };

  // Group by faction
  const factionIds = (activeFaction ? [activeFaction] : FACTIONS.map(f => f.id)) as FactionId[];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      {/* Quest list pane */}
      <div
        style={{
          width: 'clamp(200px, 320px, 33%)',
          minWidth: '200px',
          maxWidth: '320px',
          borderRight: '1px solid #2e2e2e',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #2e2e2e',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            gap: '8px',
            minWidth: 0,
          }}
        >
          <h1
            style={{
              fontSize: '16px',
              color: '#aaff00',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            CONTRATS
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '6px 10px',
              backgroundColor: '#aaff00',
              color: '#0f0f0f',
              border: 'none',
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: '"Share Tech Mono", monospace',
              fontWeight: 'bold',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            + CRÉER
          </button>
        </div>

        {/* Quest list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {factionIds.map(factionId => {
            const factionQuests = filteredQuests.filter(
              q => q.factionId === factionId && q.status === 'active'
            );
            if (factionQuests.length === 0) return null;

            const color = getFactionColor(factionId);
            return (
              <div key={factionId}>
                <div
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#111111',
                    fontSize: '10px',
                    color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    borderBottom: '1px solid #2e2e2e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ width: '6px', height: '6px', backgroundColor: color, flexShrink: 0 }} />
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                    }}
                  >
                    {factionId}
                  </span>
                  <span style={{ color: '#444444', flexShrink: 0 }}>({factionQuests.length})</span>
                </div>
                {factionQuests.map(quest => {
                  const isSelected = quest.id === selectedQuestId;
                  return (
                    <button
                      key={quest.id}
                      onClick={() => setSelectedQuestId(isSelected ? null : quest.id)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: isSelected ? '#1a1a1a' : 'transparent',
                        borderLeft: `3px solid ${isSelected ? color : 'transparent'}`,
                        borderRight: 'none',
                        borderTop: 'none',
                        borderBottom: '1px solid #2e2e2e',
                        cursor: 'pointer',
                        fontFamily: '"Share Tech Mono", monospace',
                        textAlign: 'left',
                        minWidth: 0,
                        overflow: 'hidden',
                        boxSizing: 'border-box',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12px',
                          color: isSelected ? '#e8e8e8' : '#888888',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {quest.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}

          {filteredQuests.filter(q => q.status === 'active').length === 0 && (
            <div
              style={{
                padding: '32px 16px',
                color: '#444444',
                fontSize: '12px',
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              AUCUN CONTRAT ACTIF
            </div>
          )}

          {/* Archived section */}
          {filteredQuests.filter(q => q.status !== 'active').length > 0 && (
            <div>
              <div
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#111111',
                  fontSize: '10px',
                  color: '#444444',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  borderBottom: '1px solid #2e2e2e',
                  borderTop: '1px solid #2e2e2e',
                }}
              >
                ARCHIVÉS
              </div>
              {filteredQuests.filter(q => q.status !== 'active').map(quest => (
                <button
                  key={quest.id}
                  onClick={() => setSelectedQuestId(quest.id === selectedQuestId ? null : quest.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: 'transparent',
                    borderLeft: '3px solid transparent',
                    borderRight: 'none',
                    borderTop: 'none',
                    borderBottom: '1px solid #2e2e2e',
                    cursor: 'pointer',
                    fontFamily: '"Share Tech Mono", monospace',
                    textAlign: 'left',
                    minWidth: 0,
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#444444',
                      textTransform: 'uppercase',
                      textDecoration: 'line-through',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {quest.title}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail pane */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {selectedQuest ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Quest header */}
            <div
              style={{
                backgroundColor: getFactionColor(selectedQuest.factionId),
                padding: '12px 20px',
                flexShrink: 0,
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#0f0f0f',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '2px',
                }}
              >
                {selectedQuest.factionId}
              </div>
              {editingTitle ? (
                <input
                  ref={titleInputRef}
                  value={titleDraft}
                  onChange={e => setTitleDraft(e.target.value)}
                  onBlur={async () => {
                    await updateQuestTitle(selectedQuest.id, titleDraft);
                    setEditingTitle(false);
                  }}
                  onKeyDown={async e => {
                    if (e.key === 'Enter') {
                      await updateQuestTitle(selectedQuest.id, titleDraft);
                      setEditingTitle(false);
                    }
                    if (e.key === 'Escape') {
                      setEditingTitle(false);
                    }
                  }}
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: '"Share Tech Mono", monospace',
                    background: 'rgba(0,0,0,0.2)',
                    border: 'none',
                    borderBottom: '2px solid #0f0f0f',
                    color: '#0f0f0f',
                    outline: 'none',
                    width: '100%',
                    padding: '2px 0',
                    boxSizing: 'border-box',
                  }}
                />
              ) : (
                <div
                  onClick={() => {
                    setTitleDraft(selectedQuest.title);
                    setEditingTitle(true);
                    setTimeout(() => titleInputRef.current?.select(), 0);
                  }}
                  title="Cliquer pour renommer"
                  style={{
                    fontSize: '16px',
                    color: '#0f0f0f',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 'bold',
                    cursor: 'text',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {selectedQuest.title}
                </div>
              )}
            </div>

            {/* Actions bar */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '10px 20px',
                borderBottom: '1px solid #2e2e2e',
                flexShrink: 0,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  padding: '4px 10px',
                  border: '1px solid #2e2e2e',
                  fontSize: '10px',
                  color: selectedQuest.status === 'active' ? '#aaff00' : '#888888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedQuest.status}
              </span>
              {selectedQuest.status === 'active' && (
                <button
                  onClick={() => handleArchive(selectedQuest)}
                  style={{
                    padding: '4px 10px',
                    border: '1px solid #2e2e2e',
                    backgroundColor: 'transparent',
                    color: '#888888',
                    fontSize: '10px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontFamily: '"Share Tech Mono", monospace',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ARCHIVER
                </button>
              )}
              {selectedQuest.status !== 'active' && (
                <button
                  onClick={() => updateQuestStatus(selectedQuest.id, 'active')}
                  style={{
                    padding: '4px 10px',
                    border: '1px solid #aaff00',
                    backgroundColor: 'transparent',
                    color: '#aaff00',
                    fontSize: '10px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontFamily: '"Share Tech Mono", monospace',
                    whiteSpace: 'nowrap',
                  }}
                >
                  RÉACTIVER
                </button>
              )}
            </div>

            {/* Notes editor */}
            <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', minWidth: 0 }}>
              <div
                style={{
                  fontSize: '11px',
                  color: '#888888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '10px',
                }}
              >
                NOTES
              </div>
              <MarkdownEditor
                value={selectedQuest.notes}
                onChange={handleNotesChange}
                placeholder="NOTES, OBJECTIFS, CONTEXTE..."
                minHeight="200px"
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2e2e2e',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            SÉLECTIONNER UN CONTRAT
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
            boxSizing: 'border-box',
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #2e2e2e',
              padding: '24px',
              width: 'min(400px, 100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxSizing: 'border-box',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: '14px',
                color: '#aaff00',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}
            >
              CRÉER UN CONTRAT
            </h2>

            <div>
              <label
                style={{
                  fontSize: '11px',
                  color: '#888888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                TITRE
              </label>
              <input
                autoFocus
                value={newQuestTitle}
                onChange={e => setNewQuestTitle(e.target.value)}
                placeholder="NOM DU CONTRAT..."
                style={{
                  width: '100%',
                  backgroundColor: '#0f0f0f',
                  border: '1px solid #2e2e2e',
                  color: '#e8e8e8',
                  fontSize: '13px',
                  padding: '10px 12px',
                  outline: 'none',
                  fontFamily: '"Share Tech Mono", monospace',
                  textTransform: 'uppercase',
                  boxSizing: 'border-box',
                }}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: '11px',
                  color: '#888888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                FACTION
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {FACTIONS.map(faction => {
                  const isSelected = newQuestFaction === faction.id;
                  return (
                    <button
                      key={faction.id}
                      onClick={() => setNewQuestFaction(faction.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: isSelected ? faction.color : 'transparent',
                        color: isSelected ? '#0f0f0f' : faction.color,
                        border: `1px solid ${faction.color}`,
                        fontSize: '11px',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontFamily: '"Share Tech Mono", monospace',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {faction.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {createError && (
              <div
                style={{
                  fontSize: '11px',
                  color: '#ff3b30',
                  padding: '8px',
                  border: '1px solid #ff3b30',
                  backgroundColor: '#1a0a0a',
                  wordBreak: 'break-word',
                }}
              >
                ERREUR: {createError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  flex: 1,
                  minWidth: 'min(120px, 100%)',
                  padding: '10px',
                  backgroundColor: 'transparent',
                  color: '#888888',
                  border: '1px solid #2e2e2e',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontFamily: '"Share Tech Mono", monospace',
                }}
              >
                ANNULER
              </button>
              <button
                onClick={handleCreate}
                disabled={!newQuestTitle.trim() || creating}
                style={{
                  flex: 1,
                  minWidth: 'min(120px, 100%)',
                  padding: '10px',
                  backgroundColor: newQuestTitle.trim() && !creating ? '#aaff00' : '#1a1a1a',
                  color: newQuestTitle.trim() && !creating ? '#0f0f0f' : '#444444',
                  border: `1px solid ${newQuestTitle.trim() && !creating ? '#aaff00' : '#2e2e2e'}`,
                  fontSize: '12px',
                  cursor: newQuestTitle.trim() && !creating ? 'pointer' : 'not-allowed',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontFamily: '"Share Tech Mono", monospace',
                  fontWeight: 'bold',
                }}
              >
                {creating ? 'CRÉATION...' : 'CRÉER'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
