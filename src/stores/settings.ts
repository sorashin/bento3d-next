import { create } from 'zustand';

interface SettingsState {
  unit: number;
  setUnit: (unit: number) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  unit: 1, // デフォルト値
  setUnit: (unit: number) => set({ unit }),
}));
