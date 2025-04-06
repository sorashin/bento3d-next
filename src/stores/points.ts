import { atom } from 'jotai';
import { Vector2 } from 'three';
import { wallAtom, wallOverridesAtom, Wall } from './rect'; // wallAtomをインポート

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
    const newPoints = points.map((point) => ({
      id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: point
    }));
    const newPolyline: Polyline = {
      id: `polyline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      points: newPoints
    };
    const updatedPolylines = [...polylines, newPolyline];
    set(polylinePointsAtom, updatedPolylines);
    return { id: newPolyline.id, polylines: updatedPolylines };
  }
);


// 特定のポリラインの特定のポイントの位置を更新するアクション

// 特定のポリラインの特定のポイントの位置を更新するアトム
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
    // 1. ポリライン情報を更新
    const polylines = get(polylinePointsAtom);
    const updatedPolylines = polylines.map(polyline => {
      if (polyline.id === polylineId) {
        const updatedPoints = polyline.points.map(point => {
          if (point.id === pointId) {
            return { ...point, position: newPosition };
          } else {
            return point;
          }
        });
        return { ...polyline, points: updatedPoints };
      } else {
        return polyline;
      }
    });
    set(polylinePointsAtom, updatedPolylines);

    // 2. wallOverrides内の関連する壁の座標も更新
    const wallOverrides = get(wallOverridesAtom);
    const walls = get(wallAtom);
    const updatedOverrides: Record<string, Partial<Wall>> = { ...wallOverrides };
    let hasOverrideUpdates = false;

    walls.forEach(wall => {
      const wallId = wall.id;
      const wallIdParts = wallId.split('-');

      // wallIdの形式が正しくない場合はスキップ
      if (wallIdParts.length < 6) {
        return;
      }

      
      const wallPolylineId = wallIdParts[1] + '-' + wallIdParts[2]+'-'+wallIdParts[3];
      const startPointId = wallIdParts[4] + '-' + wallIdParts[5]+'-'+ wallIdParts[6];

      if (wallPolylineId === polylineId) {
        // wallOverridesにwallIdが存在するか確認
        if (wallOverrides[wallId]) {
          const polyline = updatedPolylines.find(p => p.id === wallPolylineId);
          if (!polyline) {
            return;
          }

          const pointIndex = polyline.points.findIndex(p => p.id === startPointId);
          if (pointIndex === -1) {
            return;
          }

          // 開始点の更新
          if (startPointId === pointId) {
            updatedOverrides[wallId] = {
              ...updatedOverrides[wallId],
              start: newPosition
            };
            hasOverrideUpdates = true;
          }

          // 終了点の更新
          if (pointIndex + 1 < polyline.points.length) {
            const endPointId = polyline.points[pointIndex + 1].id;
            if (endPointId === pointId) {
              updatedOverrides[wallId] = {
                ...updatedOverrides[wallId],
                end: newPosition
              };
              hasOverrideUpdates = true;
            }
          }
        }
      }
    });

    if (hasOverrideUpdates) {
      set(wallOverridesAtom, updatedOverrides);
    }
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

