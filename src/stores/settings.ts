import { create } from 'zustand';

interface DialogState {
  isOpen: boolean;
  type: '' | 'setting' | 'feedback' | 'ad';
}
interface DrawerState {
  isOpen: boolean;
  type: '' | 'update';
}

export interface Toast  {
  isOpen: boolean;
  content: string;
  type: "default" | "error" | "warn";
  persistent?: boolean;
};


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
  toast: Toast[];
  setToast: (toast: Toast[]) => void;
  drawer: DrawerState;
  openDrawer: (type: DrawerState['type']) => void;
  closeDrawer: () => void;
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
  toast: [],
  setToast: (toast: Toast[]) => {
    set((state) => {
      const newToast = [...state.toast, ...toast];
      if (!toast[toast.length - 1].persistent) {
        setTimeout(() => {
          set((state) => ({
            toast: state.toast.filter((_, i) => i !== state.toast.length - 1),
          }));
        }, 5000);
      }
      return { toast: newToast };
    });
  },
  drawer:{isOpen:false, type:''},
  openDrawer: (type: DrawerState['type']) => set({ drawer: { isOpen: true, type } }),
  closeDrawer: () => set({ drawer: { isOpen: false, type: '' } }),
}));

