import { atom } from "jotai";

// inputにフォーカスあたった状態のときにtrueになるアトム
export const isInputFocusedAtom = atom<boolean>(false);

// キーボードのキーを無視するかどうかのアトム
export const isIgnoreKeyAtom = atom<boolean>(false);
export const unitAtom = atom<number>(100);
