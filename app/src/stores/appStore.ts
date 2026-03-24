import { create } from 'zustand';
import type { Screen, FactionId } from '../types';
import { runRepo, contractRepo } from '../db/repositories';

interface ContractItemState {
  id: string;
  text: string;
  completed: boolean;
  xp: number;
}

interface AppStore {
  // Navigation
  screen: Screen;
  navigate: (s: Screen) => void;

  // Faction filter (top bar)
  activeFaction: FactionId | null;
  setActiveFaction: (f: FactionId | null) => void;

  // Run active
  activeRunId: string | null;
  activeQuestId: string | null;
  activeQuestTitle: string;
  contractItems: ContractItemState[];
  intentNote: string;
  runXpTarget: number;
  timeLeft: number; // 1500 = 25min
  timerInterval: ReturnType<typeof setInterval> | null;

  // Actions run
  initRun: (
    questId: string,
    questTitle: string,
    items: { text: string; xp: number }[],
    intentNote: string,
  ) => Promise<void>;
  tick: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  toggleItem: (id: string) => void;
  abandonRun: () => Promise<void>;
  extractRun: () => void;
  completeRun: (debriefNote: string, xpEarned: number) => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Navigation
  screen: 'dashboard',
  navigate: (s) => set({ screen: s }),

  // Faction filter
  activeFaction: null,
  setActiveFaction: (f) => {
    const current = get().activeFaction;
    set({ activeFaction: current === f ? null : f });
  },

  // Run state
  activeRunId: null,
  activeQuestId: null,
  activeQuestTitle: '',
  contractItems: [],
  intentNote: '',
  runXpTarget: 50,
  timeLeft: 1500,
  timerInterval: null,

  // Init run
  initRun: async (questId, questTitle, items, intentNote) => {
    const runId = crypto.randomUUID();
    const startedAt = new Date().toISOString();
    const xpTarget = items.reduce((sum, i) => sum + i.xp, 0);

    // Create run in DB
    await runRepo.create({ id: runId, questId, startedAt, intentNote, xpTarget });

    // Create contract items in DB
    const createdItems = await contractRepo.bulkCreate(runId, items);

    set({
      activeRunId: runId,
      activeQuestId: questId,
      activeQuestTitle: questTitle,
      contractItems: createdItems.map(item => ({
        id: item.id,
        text: item.text,
        completed: false,
        xp: item.xp,
      })),
      intentNote,
      runXpTarget: xpTarget,
      timeLeft: 1500,
    });

    get().navigate('active');
    get().startTimer();
  },

  // Timer tick
  tick: () => {
    const { timeLeft } = get();
    if (timeLeft <= 1) {
      get().stopTimer();
      set({ timeLeft: 0 });
      get().navigate('debrief');
    } else {
      set({ timeLeft: timeLeft - 1 });
    }
  },

  // Start timer
  startTimer: () => {
    const existing = get().timerInterval;
    if (existing) clearInterval(existing);

    const interval = setInterval(() => {
      get().tick();
    }, 1000);

    set({ timerInterval: interval });
  },

  // Stop timer
  stopTimer: () => {
    const { timerInterval } = get();
    if (timerInterval) {
      clearInterval(timerInterval);
      set({ timerInterval: null });
    }
  },

  // Toggle contract item (in-memory only during active run)
  toggleItem: (id) => {
    set(state => ({
      contractItems: state.contractItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  },

  // Abandon run
  abandonRun: async () => {
    const { activeRunId } = get();
    get().stopTimer();

    if (activeRunId) {
      await runRepo.update(activeRunId, {
        status: 'abandoned',
        endedAt: new Date().toISOString(),
        xpEarned: 0,
      });
    }

    set({
      activeRunId: null,
      activeQuestId: null,
      activeQuestTitle: '',
      contractItems: [],
      intentNote: '',
      runXpTarget: 50,
      timeLeft: 1500,
    });

    get().navigate('dashboard');
  },

  // Extract run early (navigate to debrief without completing)
  extractRun: () => {
    get().stopTimer();
    get().navigate('debrief');
  },

  // Complete run
  completeRun: async (debriefNote, xpEarned) => {
    const { activeRunId, contractItems } = get();

    if (activeRunId) {
      // Save all contract items completion state to DB
      for (const item of contractItems) {
        await contractRepo.updateCompleted(item.id, item.completed);
      }

      // Update run status with XP earned
      await runRepo.update(activeRunId, {
        status: 'completed',
        endedAt: new Date().toISOString(),
        debriefNote,
        xpEarned,
      });
    }

    set({
      activeRunId: null,
      activeQuestId: null,
      activeQuestTitle: '',
      contractItems: [],
      intentNote: '',
      runXpTarget: 50,
      timeLeft: 1500,
    });

    get().navigate('dashboard');
  },
}));
