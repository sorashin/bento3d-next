import { create } from 'zustand';
import { calculateGridSize, normalizeBins } from '@/utils/gridfinityUtils';

export const BIN_U_MIN = 2;
export const BIN_U_MAX = 10;
export const VIRTUAL_GRID_MAX_ROWS = 15;
export const VIRTUAL_GRID_MAX_COLS = 15;

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
export const useGridfinityStore = create<GridfinityStore>((set) => {
  // 初期bin: 3x3 u3
  const initialBin: Bin = {
    u: 3,
    rows: 3,
    cols: 3,
    unitSize: 42,
    start: [0, 0],
    end: [2, 2],
    layer: 0,
  };
  const initialBins = normalizeBins([initialBin]);
  const { totalRows, totalCols } = calculateGridSize(initialBins);

  return {
    // 初期状態
    totalRows,
    totalCols,
    workAreaWidth: 0,
    workAreaHeight: 0,
    workAreaDimension: 0,
    bins: initialBins,
  // アクション
  setTotalRows: (rows) => set({ totalRows: rows }),
  setTotalCols: (cols) => set({ totalCols: cols }),
  setWorkAreaWidth: (width) => set({ workAreaWidth: width }),
  setWorkAreaHeight: (height) => set({ workAreaHeight: height }),
  setWorkAreaDimension: (dimension) => set({ workAreaDimension: dimension }),
  addBin: (bin) => set((state) => {
    const newBins = normalizeBins([...state.bins, bin]);
    const { totalRows, totalCols } = calculateGridSize(newBins);
    return { bins: newBins, totalRows, totalCols };
  }),
  removeBin: (index) => set((state) => {
    const newBins = normalizeBins(state.bins.filter((_, i) => i !== index));
    const { totalRows, totalCols } = calculateGridSize(newBins);
    return { bins: newBins, totalRows, totalCols };
  }),
  updateBin: (index, bin) => set((state) => {
    const newBins = normalizeBins(state.bins.map((b, i) => i === index ? bin : b));
    const { totalRows, totalCols } = calculateGridSize(newBins);
    return { bins: newBins, totalRows, totalCols };
  }),
  };
});

