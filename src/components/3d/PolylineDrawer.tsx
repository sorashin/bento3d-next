import { useCallback, useEffect, useMemo, useState } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { Vector2, Vector3 } from 'three';
import { Line, Plane, Sphere } from '@react-three/drei';
import { useAtom } from 'jotai';
import { 
  polylinePointsAtom, 
  createNewPolylineAtom,
} from '../../stores/polylineStore';
import * as THREE from "three";
import { Polyline } from './elements/Polyline';
import { Cursor } from './elements/Cursor';
import { useKey } from '@/hooks/useKey';

const PolylineDrawer = () => {
  const [polylines] = useAtom(polylinePointsAtom);
  
  const [currentCursorPoint, setCurrentCursorPoint] = useState<THREE.Vector2>(
    new THREE.Vector2(0, 0),
  );
  const [points, setPoints] = useState<THREE.Vector2[]>([]);
  const [previewPoints, setPreviewPoints] = useState<THREE.Vector2[]>([]);
  const [, createNewPolyline] = useAtom(createNewPolylineAtom);

  const { isPressed: isPressedEscape } = useKey({
    conditions: (e) => e.key === "Escape"
  });
  const { isPressed: isPressedEnter } = useKey({
    conditions: (e) => e.key === "Enter",
  });

  

  // 新しいポリラインの作成
  const complete = useCallback(() => {
    createNewPolyline({ points: points })
    setPreviewPoints([]);
    setPoints([]);
  }, [points, createNewPolyline]);

  const cancel = useCallback(() => {
    setPreviewPoints([]);
    setPoints([]);
  }, []);

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

  return (
    <>
      <Plane
        position={[0, 0, 0]}
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
      {/* プレビューの表示 */}
      {previewPoints.length > 0 && (
        <Polyline points={previewPoints} color="tomato" />
      )}
      <Cursor point={currentCursorPoint} />
    </>
  );
};

export default PolylineDrawer;