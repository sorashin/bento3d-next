import { create } from 'zustand';

interface SettingsState {
  unit: number;
  setUnit: (unit: number) => void;
  isInputFocused: boolean;
  setIsInputFocused: (isInputFocus: boolean) => void;
  isIgnoreKey: boolean;
  setIsIgnoreKey: (isIgnoreKey: boolean) => void;
  cameraMode: 'top'|'front'|'side'|'perspective';
  setCameraMode: (cameraMode: 'top'|'front'|'side'|'perspective') => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  unit: 1, // デフォルト値
  setUnit: (unit: number) => set({ unit }),
  isInputFocused: false,
  setIsInputFocused: (isInputFocused: boolean) => set({ isInputFocused }),
  isIgnoreKey: false,
  setIsIgnoreKey: (isIgnoreKey: boolean) => set({ isIgnoreKey }),
  cameraMode: 'perspective',
  setCameraMode: (cameraMode: 'top'|'front'|'side'|'perspective') => set({ cameraMode }),
}));
