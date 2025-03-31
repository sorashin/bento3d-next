import { atom } from 'jotai';
import { Vector2 } from 'three';

// ポリラインの頂点座標を格納する配列
export interface PolylinePoint {
  id: string;
  position: Vector2;
}

// 単一のポリラインを表す型
export interface Polyline {
  id: string;
  points: PolylinePoint[];
}

// ポリラインの配列を格納するアトム
export const polylinePointsAtom = atom<Polyline[]>([]);

// 新しいポリラインを登録するアクション
export const createNewPolylineAtom = atom(
  null,
  (get, set,{points}:{points:Vector2[]}) => {
    const polylines = get(polylinePointsAtom);
    const newPoints = points.map((point, index) => ({
      id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: point
    }));
    const newPolyline: Polyline = {
      id: `polyline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      points: newPoints
    };
    set(polylinePointsAtom, [...polylines, newPolyline]);
    return newPolyline.id;
  }
);


// 特定のポリラインの特定のポイントの位置を更新するアクション
export const updatePointPositionAtom = atom(
  null,
  (get, set, { 
    polylineId, 
    pointId, 
    newPosition 
  }: { 
    polylineId: string;
    pointId: string; 
    newPosition: Vector2 
  }) => {
    const polylines = get(polylinePointsAtom);
    const updatedPolylines = polylines.map(polyline => 
      polyline.id === polylineId
        ? {
            ...polyline,
            points: polyline.points.map(point =>
              point.id === pointId ? { ...point, position: newPosition } : point
            )
          }
        : polyline
    );
    set(polylinePointsAtom, updatedPolylines);
  }
);

// すべてのポリラインをクリアするアクション
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