import { create } from 'zustand';

type Navigation = {
    index: number;
    label: string;
    icon: string;
}
export const nevigations: Record<string, Navigation[]> = {
    "gridfinity":[{
        index:0,
        label:"Plan",
        icon:"grid",
    },{
        index:1,
        label:"Download",
        icon:"download",
    }],
    "tray":[{
        index:0,
        label:"Size",
        icon:"size",
    },{
        index:1,
        label:"Grid",
        icon:"grid",
    },{
        index:2,
        label:"Download",
        icon:"download",
    }],
    "bento3d":[{
        index:0,
        label:"Size",
        icon:"size",
    },{
        index:1,
        label:"Grid",
        icon:"grid",
    },{
        index:2,
        label:"Download",
        icon:"download",
    }]
}
interface NavigationState {
    currentNavArray: Navigation[];
    setCurrentNavArray: (current: Navigation[]) => void;
  currentNav: number;
setCurrentNav: (index: number) => void;
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  currentNavArray: nevigations["tray"],
  setCurrentNavArray: (current) => set({ currentNavArray: current }),
  currentNav: 0,
  setCurrentNav: (index) => set({ currentNav: index }),
}));
