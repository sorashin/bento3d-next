import { atom } from "jotai";

export type ElementType = "wall"|"rect"|"point"|null
export type GeometrySelection = {
  id: string;
  type: ElementType;
  fit_view?: boolean;
};
export type SelectMode = "pick" | "none";

export const selectModeAtom = atom<SelectMode>("none");
export const selectableAtom = atom<boolean>(true);
export const selectedGeometryAtom = atom<GeometrySelection>({
  id: '',
  fit_view: false,
    type: null,
});


export const setGeometrySelectionAtom = atom(
  null,
  (get, set, selectedGeometry: GeometrySelection) => {
    if (get(selectableAtom)) {
      set(selectedGeometryAtom, selectedGeometry);
    }
  }
);


export const clearSelectedAtom = atom(null, (get, set) => {
  set(selectedGeometryAtom, { id: '', fit_view: false, type: null });
});
