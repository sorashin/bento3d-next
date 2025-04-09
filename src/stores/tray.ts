import { create } from 'zustand';
type FlexSize = 'fill'|'1/2'|'1/3'|'fixed';

export type Row = {
  id: string;
  width: number;
  depth: number;
  type: FlexSize;
  division: number;
//   column: Column[];
};
export type Column ={
    id: string;
    depth: number;
    type: FlexSize;
}

// TrayStateとTrayActionsを一つのインターフェイスにまとめる
interface TrayStore {
  // 状態
  grid: Row[];
  totalWidth: number;
  totalDepth: number;
  totalHeight: number;
  isStack: boolean;
  fillet: number;
  edgeFillet: number;
  thickness: number;
  mm2pixel: number; // ミリメートルからピクセルへの変換係数
  selectedColumnId: string | null;
  
  // アクション
  addRow: (newRow: Omit<Row, 'width'>) => void;
  addColumn: (rowId: string) => void;
  removeColumn: (rowId: string) => void; // 新しく追加するアクション
  updateRow: (id: string, updates: Partial<Row>) => void;
  updateSize: (width: number, depth: number) => void;
  setSelectedColumnId: (id: string | null) => void;
}



// 幅を再計算する共通ヘルパー関数
const recalculateWidths = (rows: Row[], totalWidth: number, thickness:number): Row[] => {
  // 固定幅の合計を計算
  const fixedWidthSum = rows
    .filter(row => row.type === 'fixed')
    .reduce((sum, row) => sum + row.width, 0);
  
  // フレキシブル行に使える幅を計算
  const availableWidth = totalWidth - fixedWidthSum - (rows.length+1)*thickness;
  
  // フレキシブル行の種類をカウント
  const fillCount = rows.filter(row => row.type === 'fill').length;
  const halfCount = rows.filter(row => row.type === '1/2').length;
  const thirdCount = rows.filter(row => row.type === '1/3').length;
  
  // 幅の単位を計算
  const totalUnits = fillCount + (halfCount / 2) + (thirdCount / 3);
  const unitWidth = totalUnits > 0 ? availableWidth / totalUnits : 0;
  
  // 行の幅を更新
  return rows.map(row => {
    if (row.type === 'fixed') {
      return row; // 固定幅行は変更しない
    }
    
    let newWidth = 0;
    switch (row.type) {
      case 'fill':
        newWidth = unitWidth;
        break;
      case '1/2':
        newWidth = unitWidth / 2;
        break;
      case '1/3':
        newWidth = unitWidth / 3;
        break;
    }
    
    // 小数第2位で四捨五入
    newWidth = Math.round(newWidth * 100) / 100;
    
    return { ...row, width: newWidth };
  });
};

// ウィンドウサイズを取得するヘルパー関数
const getWindowSize = () => {
  if (typeof window === 'undefined') return { width: 1000, height: 800 };
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

// mm2pixelを計算するヘルパー関数
const calculateMm2Pixel = (width: number, depth: number) => {
  const { width: pixelSizeW, height: pixelSizeD } = getWindowSize();
  const screenScale = 2/3; // 画面の短辺に対して何割の大きさにするか
  // 大きい方の寸法に合わせてスケールを決定
  return width - depth > 0 ? pixelSizeW / width*screenScale : pixelSizeD / depth*screenScale;
};

// Zustand ストアを作成
export const useTrayStore = create<TrayStore>((set) => ({
  // 初期状態
  grid: [{
    id: 'row1',
    width: 96,
    depth: 96,
    type: 'fill',
    division: 1
  }],
  totalWidth: 100,
  totalDepth: 100,
  totalHeight: 20,
  isStack: false,
  fillet: 2,
  edgeFillet: 1,
  thickness: 2,
  mm2pixel: calculateMm2Pixel(100, 100), // 初期値を計算
  selectedColumnId: null,
  
  // アクション実装
  addRow: (newRow) => {
    set(state => {
      // 新しい行の幅を計算
      const rows = [...state.grid];
      const rowWithWidth = { 
        ...newRow, 
        width: newRow.type === 'fixed' ? 20 : 0 // 固定型のデフォルト幅、それ以外は再計算
      };
      rows.push(rowWithWidth);
      
      // 幅を再計算
      const updatedRows = recalculateWidths(rows, state.totalWidth, state.thickness);
      
      // 負の幅をチェック
      if (updatedRows.some(row => row.width < 0)) {
        alert('Cannot add row: negative width would occur');
        return state;
      }
      
      return {
        ...state,
        grid: updatedRows
      };
    });
  },
  addColumn: (rowId) => {
    set(state => {
        // 行を検索
        const rowIndex = state.grid.findIndex(row => row.id === rowId);
        if (rowIndex === -1) return state;
        // 新しい列を追加
        const updatedRow = {
            ...state.grid[rowIndex],
            division: state.grid[rowIndex].division + 1,
        };
        // 行を更新
        const updatedGrid = [...state.grid];
        updatedGrid[rowIndex] = updatedRow;
        
        return {
            ...state,
            grid: updatedGrid
        };
    });
  },
  
  updateRow: (id, updates) => {
    set(state => {
      // 更新する行を検索
      const rowIndex = state.grid.findIndex(row => row.id === id);
      if (rowIndex === -1) return state;
      
      // 更新された行を含む新しい配列を作成
      const updatedGrid = [...state.grid];
      updatedGrid[rowIndex] = { ...updatedGrid[rowIndex], ...updates };
      
      // 必要に応じて幅を再計算
      const recalculatedGrid = updates.width !== undefined || updates.type !== undefined || updates.division !== undefined
        ? recalculateWidths(updatedGrid, state.totalWidth,state.thickness)
        : updatedGrid;
        
      // 負の幅をチェック
      if (recalculatedGrid.some(row => row.width < 0)) {
        alert('Cannot update size: negative width would occur');
        return state;
      }
      
      return {
        ...state,
        grid: recalculatedGrid
      };
    });
  },
  
  updateSize: (width, depth) => {
    set(state => {
      // 全体のサイズを更新
      const newState = {
        ...state,
        totalWidth: width,
        totalDepth: depth,
        mm2pixel: calculateMm2Pixel(width, depth) // mm2pixelを再計算
      };
      
      // 行の幅を再計算
      const recalculatedGrid = recalculateWidths(state.grid, width, state.thickness);
      
      // 負の幅をチェック
      if (recalculatedGrid.some(row => row.width < 0)) {
        alert('Cannot update size: negative width would occur');
        return state;
      }
      
      return {
        ...newState,
        grid: recalculatedGrid
      };
    });
  },
  removeColumn: (rowId) => {
    set(state => {
      // 行を検索
      const rowIndex = state.grid.findIndex(row => row.id === rowId);
      if (rowIndex === -1) return state;
      
      // 行のdivisionが1の場合、行自体を削除する
      if (state.grid[rowIndex].division === 1) {
        // 直接行を削除するロジックを実装（removeRowを呼び出さない）
        const filteredGrid = state.grid.filter(row => row.id !== rowId);
        
        // 幅を再計算
        const recalculatedGrid = recalculateWidths(filteredGrid, state.totalWidth, state.thickness);
        
        return {
          ...state,
          grid: recalculatedGrid
        };
      }
      
      // divisionが1より大きい場合、divisionを1減らす
      const updatedRow = {
        ...state.grid[rowIndex],
        division: state.grid[rowIndex].division - 1,
      };
      
      // 行を更新
      const updatedGrid = [...state.grid];
      updatedGrid[rowIndex] = updatedRow;
      
      return {
        ...state,
        grid: updatedGrid
      };
    });
  },
  setSelectedColumnId: (id) => set(state => ({
    ...state,
    selectedColumnId: id
  }))
}));

