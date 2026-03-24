import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FactionId } from '../types';

interface ProfileStore {
  runnerName: string;
  factionId: FactionId;
  setRunnerName: (name: string) => void;
  setFactionId: (id: FactionId) => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      runnerName: 'RUNNER',
      factionId: 'CYAC',
      setRunnerName: (name) => set({ runnerName: name || 'RUNNER' }),
      setFactionId: (id) => set({ factionId: id }),
    }),
    { name: 'runner-profile' }
  )
);
