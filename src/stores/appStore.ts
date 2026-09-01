import { create } from 'zustand';

interface AppState {
  isExpanded: boolean;
  activeTab: 'main' | 'settings';
  toggleExpanded: () => void;
  expandIsland: () => void;
  collapseIsland: () => void;
  setActiveTab: (tab: 'main' | 'settings') => void;
}

export const useAppStore = create<AppState>((set) => ({
  isExpanded: false,
  activeTab: 'main',
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
  expandIsland: () => set({ isExpanded: true }),
  collapseIsland: () => set({ isExpanded: false, activeTab: 'main' }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
