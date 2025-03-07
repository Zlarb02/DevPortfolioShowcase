import { create } from 'zustand';

interface StoreState {
  currentSection: number;
  setCurrentSection: (section: number) => void;
}

export const useStore = create<StoreState>((set) => ({
  currentSection: 0,
  setCurrentSection: (section) => set({ currentSection: section }),
}));
