import { create } from 'zustand';

interface DialogState {
  isOpen: boolean;
  type: '' | 'setting' | 'feedback' | 'ad'|'update';
}



interface SettingsState {
  unit: number;
  setUnit: (unit: number) => void;
  isInputFocused: boolean;
  setIsInputFocused: (isInputFocus: boolean) => void;
  isIgnoreKey: boolean;
  setIsIgnoreKey: (isIgnoreKey: boolean) => void;
  cameraMode: 'top'|'front'|'side'|'perspective';
  setCameraMode: (cameraMode: 'top'|'front'|'side'|'perspective') => void;
  gridSize: number;
  setGridSize: (gridSize: number) => void;
  dialog: DialogState;
  openDialog: (type: DialogState['type']) => void;
  closeDialog: () => void;
  isGAInitialized: boolean;
  setIsGAInitialized: (isGAInitialized: boolean) => void;
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
  gridSize: 10,
  setGridSize: (gridSize: number) => set({ gridSize }),
  dialog: { isOpen: false, type: '' },
  openDialog: (type: DialogState['type']) => set({ dialog: { isOpen: true, type } }),
  closeDialog: () => set({ dialog: { isOpen: false, type: '' } }),
  isGAInitialized: false,
  setIsGAInitialized: (isGAInitialized: boolean) => set({ isGAInitialized }),
}));

