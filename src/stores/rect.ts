import { atom } from "jotai";
import { Vector2 } from "three";
import { polylinePointsAtom } from './points';
import { defaultShelfSizeAtom, unitAtom } from './settings';

export interface Wall {
  start: Vector2;
  end: Vector2;
  id: string;
  align: string;
  grid: {
      width: number;
      id: string;
  }[]
}


// 手動編集された壁のオーバーライド情報を保持するアトム
export const wallOverridesAtom = atom<Record<string, Partial<Wall>>>({});

// wallAtom -> 壁の作成・削除（=pointsの更新）
// mutableWallAtom -> 壁内部の情報の変更

// 元のwallAtomを、オーバーライド情報を考慮するように修正
export const wallAtom = atom((get) => {
  console.log("wallAtom derived calculation running");
  const polylines = get(polylinePointsAtom);
  const defaultShelfSize = get(defaultShelfSizeAtom)/get(unitAtom);
  const overrides = get(wallOverridesAtom);
  
  if (polylines.length === 0) return [];
  
  const generatedWalls = polylines.flatMap(polyline => {
    const points = polyline.points;
    if (points.length < 2) return [];
    return points.slice(0, -1).map((point, index) => {
      const wallId = `wall-${polyline.id}-${point.id}`;
      // 壁の長さを計算
      const start = point.position;
      const end = points[index + 1].position;
      const length = start.distanceTo(end);
      
      // グリッド数を計算（defaultShelfSizeで割った値）
      const gridCount = Math.floor(length / defaultShelfSize);
      
      // グリッド数に基づいて複数のグリッドを生成
      const grids = Array.from(
        { length: Math.max(1, gridCount) }, 
        (_, i) => ({
          width: defaultShelfSize,
          id: `grid-${polyline.id}-${point.id}-${i}`
        })
      );
      const baseWall = {
        start: point.position,
        end: points[index + 1].position,
        id: wallId,
        align: 'default',
        grid: grids,
      };
      
      // オーバーライド情報があれば適用
      return overrides[wallId] 
        ? { ...baseWall, ...overrides[wallId] }
        : baseWall;
    });
  });
  
  return generatedWalls;
});

// 編集可能なwallAtom
export const mutableWallAtom = atom(
  (get) => get(wallAtom),
  (get, set, updatedWalls: Wall[]) => {
    const currentWalls = get(wallAtom);
    const overrides = { ...get(wallOverridesAtom) };
    
    // 変更された壁を特定してオーバーライドに登録
    updatedWalls.forEach(updatedWall => {
      const originalWall = currentWalls.find(w => w.id === updatedWall.id);
      if (!originalWall) return;
      
      // 変更があった場合のみオーバーライド情報を保存
      if (JSON.stringify(originalWall) !== JSON.stringify(updatedWall)) {
        overrides[updatedWall.id] = {
          ...updatedWall
        };
      }
    });
    
    // オーバーライド情報を更新
    set(wallOverridesAtom, overrides);
  }
);

// オーバーライドをクリアするアトム
export const clearWallOverrideAtom = atom(
  null,
  (get, set, wallId?: string) => {
    const overrides = { ...get(wallOverridesAtom) };
    
    if (wallId) {
      // 特定の壁のオーバーライドを削除
      delete overrides[wallId];
    } else {
      // すべてのオーバーライドをクリア
      return set(wallOverridesAtom, {});
    }
    
    set(wallOverridesAtom, overrides);
  }
);