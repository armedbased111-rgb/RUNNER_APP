import { create } from 'zustand';
import type { Quest, FactionId, QuestStatus } from '../types';
import { questRepo } from '../db/repositories';

interface QuestStore {
  quests: Quest[];
  loading: boolean;
  loadQuests: () => Promise<void>;
  createQuest: (title: string, factionId: FactionId) => Promise<void>;
  updateQuestStatus: (id: string, status: QuestStatus) => Promise<void>;
  updateQuestNotes: (id: string, notes: string) => Promise<void>;
  updateQuestTitle: (id: string, title: string) => Promise<void>;
}

export const useQuestStore = create<QuestStore>((set) => ({
  quests: [],
  loading: false,

  loadQuests: async () => {
    set({ loading: true });
    try {
      const quests = await questRepo.getAll();
      set({ quests });
    } finally {
      set({ loading: false });
    }
  },

  createQuest: async (title, factionId) => {
    const quest = await questRepo.create(title, factionId);
    set(state => ({ quests: [quest, ...state.quests] }));
  },

  updateQuestStatus: async (id, status) => {
    await questRepo.updateStatus(id, status);
    set(state => ({
      quests: state.quests.map(q => q.id === id ? { ...q, status } : q),
    }));
  },

  updateQuestNotes: async (id, notes) => {
    await questRepo.updateNotes(id, notes);
    set(state => ({
      quests: state.quests.map(q => q.id === id ? { ...q, notes } : q),
    }));
  },

  updateQuestTitle: async (id, title) => {
    if (!title.trim()) return;
    await questRepo.update(id, { title: title.trim() });
    set(state => ({
      quests: state.quests.map(q => q.id === id ? { ...q, title: title.trim() } : q),
    }));
  },
}));
