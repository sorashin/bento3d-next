import { useCallback, useEffect, useMemo, useState } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { Vector2, Vector3 } from 'three';
import { Line, Plane,  Sphere } from '@react-three/drei';
import { useAtom, useAtomValue } from 'jotai';
import { 
  polylinePointsAtom, 
  createNewPolylineAtom,
  getFirstPolylinePoints3D,
  midPointAtom,
} from '@/stores/points';
import * as THREE from "three";
import { Polyline } from '@/components/3d/elements/Polyline';
import { Cursor } from '@/components/3d/elements/Cursor';
import { Point } from '@/components/3d/elements/Point';
import { useKey } from '@/hooks/useKey';
import { geometriesAtom, modularAtom, pointNodeIdAtom } from '@/stores/modular';
import { updateNodePropertyAtom } from '@/stores/modular';
import { snapAtom, snapLengthAtom } from '@/stores/settings';
import { wallAtom } from '@/stores/rect';
import { WallElem } from '../elements/Wall';




const PolylineDrawer = () => {
  const [polylines] = useAtom(polylinePointsAtom);
  const walls = useAtomValue(wallAtom);
  const [pointNodeId] = useAtom(pointNodeIdAtom);
  const [currentCursorPoint, setCurrentCursorPoint] = useState<THREE.Vector2>(
    new THREE.Vector2(0, 0),
  );
  const [points, setPoints] = useState<THREE.Vector2[]>([]);
  const [previewPoints, setPreviewPoints] = useState<THREE.Vector2[]>([]);
  const [, createNewPolyline] = useAtom(createNewPolylineAtom);
  const [, updateNodeProperty] = useAtom(updateNodePropertyAtom);
  const [modular] = useAtom(modularAtom);
  const [, setGeometries] = useAtom(geometriesAtom);
  const snap = useAtomValue(snapAtom);
  const snapLength = useAtomValue(snapLengthAtom);
  const { isPressed: isPressedEscape } = useKey({
    conditions: (e) => e.key === "Escape"
  });
  const { isPressed: isPressedEnter } = useKey({
    conditions: (e) => e.key === "Enter",
  });

  

  // 新しいポリラインの作成
  const complete = useCallback(() => {
    const result = createNewPolyline({ points: points });
    if (result) {
      //Panel nodeの値を更新
      updateNodeProperty({
        id: pointNodeId!,
        value: `{"points":${JSON.stringify(getFirstPolylinePoints3D(result.polylines))}}`
      });
    }
    setPreviewPoints([]);
    setPoints([]);
  }, [points, createNewPolyline, pointNodeId, modular, setGeometries]);
  //キャンセル処理
  const cancel = useCallback(() => {
    setPreviewPoints([]);
    setPoints([]);
  }, []);

  // グリッドにスナップさせる関数
  const snapToGrid = useCallback(
    (value: number) => {
      return Math.round(value / snapLength) * snapLength;
    },
    [snapLength],
  );

  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (e.button === 0) {
        let currentPoints = [...points, currentCursorPoint];
        //TODO: もし閉じたポリラインになっていたら完了
        // if (points.length > 2) {
        //   const firstPt = currentPoints[0];
        //   const lastPt = currentPoints[currentPoints.length - 1];
        //   const dist = firstPt.distanceTo(lastPt);
        //   if (dist < 0.001) {
        //     complete();
        //     return;
        //   }
        // }
        //TODO: history処理
        setPoints(currentPoints);
      }
    },
    [points,
      currentCursorPoint,
      complete,
      cancel,
    ],
  );

  const onPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const clonedPts = [...points];

      let currentPt = new THREE.Vector2(
        e.intersections[0].point.x,
        e.intersections[0].point.y,
      );
      if (snap) {
        currentPt.x = snapToGrid(currentPt.x);
        currentPt.y = snapToGrid(currentPt.y);
      }

      setCurrentCursorPoint(currentPt);

      clonedPts.push(currentPt);
      setPreviewPoints(clonedPts);
    },
    [points,
      currentCursorPoint,
      complete,
      cancel,
    ],
  );

  // Enterキーでポリラインを完了
  useEffect(() => {
    if (isPressedEnter && points.length > 1) {
      complete();
    }
  }, [isPressedEnter, points, complete]);

  // Escapeキーでキャンセル
  useEffect(() => {
    if (isPressedEscape) {
      cancel();
    }
  }, [isPressedEscape]);

  useEffect(() => {
    console.log("polylines", polylines);
  }, [polylines]);

  return (
    <>
      <Plane
        position={[0, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        scale={1000}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        <meshStandardMaterial transparent={true} opacity={0.0} />
      </Plane>
      {/* 完了したポリラインの表示 */}
      {polylines.map(polyline => (
        polyline.points.length > 0 && (  // ポイントが存在する場合のみ表示
          <Polyline 
            key={polyline.id} 
            points={polyline.points.map(p => p.position)} 
            color="blue" 
          />
        )
      ))}
      {walls.length > 0 && (
        walls.map((wall, index) => (
          <WallElem 
            key={wall.id} 
            wall ={wall}
          />
        ))
      )}
      
      {/* プレビューの表示 */}
      {previewPoints.length > 0 && (
        <Polyline points={previewPoints} color="tomato" />
      )}
      
      <Cursor point={currentCursorPoint} />
    </>
  );
};

export default PolylineDrawer;