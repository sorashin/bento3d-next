import { atom } from 'jotai';
import { Vector2 } from 'three';

// ポリラインの頂点座標を格納する配列
export interface PolylinePoint {
  id: string;
  position: Vector2;
}

// ポリラインの頂点を格納するアトム
export const polylinePointsAtom = atom<PolylinePoint[]>([]);

// 新しいポイントを追加するアクション
export const addPointAtom = atom(
  null,
  (get, set, newPosition: Vector2) => {
    const points = get(polylinePointsAtom);
    const newPoint: PolylinePoint = {
      id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: newPosition,
    };
    set(polylinePointsAtom, [...points, newPoint]);
  }
);

// 特定のポイントの位置を更新するアクション（将来の実装用）
export const updatePointPositionAtom = atom(
  null,
  (get, set, { id, newPosition }: { id: string; newPosition: Vector2 }) => {
    const points = get(polylinePointsAtom);
    const updatedPoints = points.map(point => 
      point.id === id ? { ...point, position: newPosition } : point
    );
    set(polylinePointsAtom, updatedPoints);
  }
);

// ポリラインのすべてのポイントをクリアするアクション
export const clearPointsAtom = atom(
  null,
  (_, set) => {
    set(polylinePointsAtom, []);
  }
);

// 操作履歴を管理するためのアトム（将来の実装用）
export interface HistoryAction {
  type: 'ADD_POINT' | 'UPDATE_POINT' | 'CLEAR_POINTS';
  data: any;
  timestamp: number;
}

export const historyAtom = atom<HistoryAction[]>([]);

// 履歴に操作を追加するアクション（将来の実装用）
export const addHistoryActionAtom = atom(
  null,
  (get, set, action: Omit<HistoryAction, 'timestamp'>) => {
    const history = get(historyAtom);
    const newAction: HistoryAction = {
      ...action,
      timestamp: Date.now(),
    };
    set(historyAtom, [...history, newAction]);
  }
);