import { create } from 'zustand';

type State = {
  currentSection: number;
  exactScrollPosition: number;
  setCurrentSection: (section: number, exactPosition?: number) => void;
};

export const useStore = create<State>((set) => ({
  currentSection: 0,
  exactScrollPosition: 0,
  setCurrentSection: (section, exactPosition = section) => 
    set({ 
      currentSection: section,
      exactScrollPosition: exactPosition
    }),
}));