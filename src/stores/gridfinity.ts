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
  workAreaWidth: number;
  workAreaHeight: number;
  workAreaDimension: number;
  bins: Bin[];
  // アクション
  setTotalRows: (rows: number) => void;
  setTotalCols: (cols: number) => void;
  setWorkAreaWidth: (width: number) => void;
  setWorkAreaHeight: (height: number) => void;
  setWorkAreaDimension: (dimension: number) => void;
  addBin: (bin: Bin) => void;
  removeBin: (index: number) => void;
  updateBin: (index: number, bin: Bin) => void;
}

// Zustand ストアを作成
export const useGridfinityStore = create<GridfinityStore>((set) => ({
  // 初期状態
  totalRows: 10,
  totalCols: 8,
  workAreaWidth: 0,
  workAreaHeight: 0,
  workAreaDimension: 0,
  bins: [],
  // アクション
  setTotalRows: (rows) => set({ totalRows: rows }),
  setTotalCols: (cols) => set({ totalCols: cols }),
  setWorkAreaWidth: (width) => set({ workAreaWidth: width }),
  setWorkAreaHeight: (height) => set({ workAreaHeight: height }),
  setWorkAreaDimension: (dimension) => set({ workAreaDimension: dimension }),
  addBin: (bin) => set((state) => ({ bins: [...state.bins, bin] })),
  removeBin: (index) => set((state) => ({ bins: state.bins.filter((_, i) => i !== index) })),
  updateBin: (index, bin) => set((state) => ({
    bins: state.bins.map((b, i) => i === index ? bin : b)
  })),
}));

