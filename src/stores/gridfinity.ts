import { create } from 'zustand';

export type Bin = {
  u: number;
  rows: number;
  cols: number;
  unitSize: number;
  start: [number, number];
  end: [number, number];
  layer: number;
};

interface GridfinityStore {
  // 状態
  totalRows: number;
  totalCols: number;
  bins: Bin[];
}

// Zustand ストアを作成
export const useGridfinityStore = create<GridfinityStore>((set) => ({
  // 初期状態
  totalRows: 10,
  totalCols: 8,
  bins: [
    {
        "u": 3,
        "rows": 3,
        "cols": 4,
        "unitSize": 42,
        "start": [0, 0],
        "end": [2, 3],
        "layer": 0
      },
      {
        "u": 3,
        "rows": 1,
        "cols": 1,
        "unitSize": 42,
        "start": [4, 6],
        "end": [2, 3],
        "layer": 0
      }
  ],
}));

