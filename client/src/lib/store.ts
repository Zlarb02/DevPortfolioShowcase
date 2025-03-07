import { create } from 'zustand';

type State = {
  currentSection: number;
  exactScrollPosition: number;
  isScrollingDown: boolean;
  setCurrentSection: (section: number, exactPosition?: number, isScrollingDown?: boolean) => void;
};

export const useStore = create<State>((set) => ({
  currentSection: 0,
  exactScrollPosition: 0,
  isScrollingDown: true,
  setCurrentSection: (section, exactPosition = section, isScrollingDown = true) => 
    set({ 
      currentSection: section,
      exactScrollPosition: exactPosition,
      isScrollingDown
    }),
}));