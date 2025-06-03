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

export interface Fillament {
  series:string;
  name:string;
  hex:string;
  threeHEX:string;
  metalness:number;
  roughness:number;
  url:string;
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
  toast: Toast[];
  setToast: (toast: Toast[]) => void;
  drawer: DrawerState;
  openDrawer: (type: DrawerState['type']) => void;
  closeDrawer: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isSettingsOpen: boolean) => void;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  activeAxis: 'width' | 'depth' | 'height'|'';
  setActiveAxis: (activeAxis: 'width' | 'depth' | 'height'|'') => void;
  bom:number
  setBom: (bom: number) => void;
  isPreviewLoad: boolean;
  setIsPreviewLoad: (isPreviewLoad: boolean) => void;
  fillament:Fillament;
  setFillament: (fillament:Fillament) => void;
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
  isSettingsOpen: false,
  setIsSettingsOpen: (isSettingsOpen: boolean) => set({ isSettingsOpen }),
  isDragging: false,
  setIsDragging: (isDragging: boolean) => set({ isDragging }),
  activeAxis: '',
  setActiveAxis: (activeAxis: 'width' | 'depth' | 'height'|'') => set({ activeAxis }),
  bom: 0,
  setBom: (bom: number) => set({ bom }),
  isPreviewLoad: false,
  setIsPreviewLoad: (isPreviewLoad: boolean) => set({ isPreviewLoad }),
  fillament:{
    series:'Polymaker Panchroma',
    name:'ArmyBlue',
    hex:'#000000',
    threeHEX:'#333333',
    metalness:0,
    roughness:0.5,
    url:'https://www.matterhackers.com/store/l/polymaker-panchroma-matte-pla-filament-175mm-1kg/sk/MMTZMUFV'
  },
  setFillament: (fillament:Fillament) => set({ fillament }),
}));

