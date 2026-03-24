export type FactionId = 'CYAC' | 'NUCAL' | 'TRAXUS' | 'MIDA' | 'ARACHNE' | 'SEKGEN';
export type Screen = 'dashboard' | 'prep' | 'active' | 'debrief' | 'quests' | 'history' | 'profile';
export type RunStatus = 'active' | 'completed' | 'abandoned';
export type QuestStatus = 'active' | 'completed' | 'abandoned';

export interface Faction {
  id: FactionId;
  name: string;
  color: string;
}

export interface Quest {
  id: string;
  title: string;
  factionId: FactionId;
  status: QuestStatus;
  notes: string;
  createdAt: string;
}

export interface Run {
  id: string;
  questId: string | null;
  startedAt: string;
  endedAt: string | null;
  status: RunStatus;
  intentNote: string;
  debriefNote: string;
  rating: number | null;
  xpTarget: number;
  xpEarned: number;
}

export interface ContractItem {
  id: string;
  runId: string;
  text: string;
  completed: boolean;
  position: number;
  xp: number;
}

export interface Note {
  id: string;
  questId: string | null;
  runId: string | null;
  title: string;
  body: string;
  updatedAt: string;
}

export const FACTIONS: Faction[] = [
  { id: 'CYAC',    name: 'CYAC',    color: '#aaff00' },
  { id: 'NUCAL',   name: 'NUCAL',   color: '#f72585' },
  { id: 'TRAXUS',  name: 'TRAXUS',  color: '#ff8c00' },
  { id: 'MIDA',    name: 'MIDA',    color: '#9b59b6' },
  { id: 'ARACHNE', name: 'ARACHNE', color: '#ff3b30' },
  { id: 'SEKGEN',  name: 'SEKGEN',  color: '#00c8b4' },
];

export function getFactionColor(id: FactionId): string {
  const faction = FACTIONS.find(f => f.id === id);
  return faction?.color ?? '#888888';
}
