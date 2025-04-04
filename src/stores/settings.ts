import { atom } from "jotai";

// inputにフォーカスあたった状態のときにtrueになるアトム
export const isInputFocusedAtom = atom<boolean>(false);

// キーボードのキーを無視するかどうかのアトム
export const isIgnoreKeyAtom = atom<boolean>(false);
export const unitAtom = atom<number>(100);
export const snapAtom = atom<boolean>(true);
export const snapLengthAtom = atom<number>(0.1);
//snapLengthをセットする関数
export const setSnapLength = atom(null, (get, set, mmSize: number) => {
    set(snapLengthAtom, mmSize/get(unitAtom));
});
export type shelfSize = 50 | 60 | 70 | 80 | 90 | 100 | 110 | 120;
export const defaultShelfSizeAtom = atom<shelfSize>(100); // 100cm
export const shelfDepthAtom = atom<number>(0.5);//50cm
export const isDrawAtom = atom<boolean>(false);