import { useCallback, useEffect, useMemo, useState } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { Vector2, Vector3 } from 'three';
import { Line, Plane, Sphere } from '@react-three/drei';
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
import { WallElement } from '@/components/3d/elements/WallElement';

import { useKey } from '@/hooks/useKey';
import { geometriesAtom, modularAtom, pointNodeIdAtom } from '@/stores/modular';
import { updateNodePropertyAtom } from '@/stores/modular';
import { isDrawAtom, snapAtom, snapLengthAtom } from '@/stores/settings';
import { snapToGrid, detectSnapDirection, SnapDirection } from './snap';
import { Rule } from 'postcss';
import { Ruler } from '../elements/Ruler';

const PolylineDrawer = () => {
  const [polylines] = useAtom(polylinePointsAtom);
  
  const [pointNodeId] = useAtom(pointNodeIdAtom);
  const [currentCursorPoint, setCurrentCursorPoint] = useState<THREE.Vector2>(
    new THREE.Vector2(0, 0),
  );
  const [points, setPoints] = useState<THREE.Vector2[]>([]);
  const [previewPoints, setPreviewPoints] = useState<THREE.Vector2[]>([]);
  const [wallSegments, setWallSegments] = useState<{start: THREE.Vector2, end: THREE.Vector2}[]>([]);
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

  const [isDraw, setIsDraw] = useAtom(isDrawAtom);
  const [snapState, setSnapState] = useState<SnapDirection>("none");
  const [guidelinePoints, setGuidelinePoints] = useState<Vector3[]>([]);

  

  // 新しいポリラインの作成
  const complete = useCallback(() => {
    const result = createNewPolyline({ points: points });
    if (result) {
      // Panel nodeの値を更新
      updateNodeProperty({
        id: pointNodeId!,
        value: `{"points":${JSON.stringify(getFirstPolylinePoints3D(result.polylines))}}`
      });
    }
    setPreviewPoints([]);
    setPoints([]);
    setIsDraw(false);
    setSnapState('none');
    setGuidelinePoints([]);
  }, [points, createNewPolyline, pointNodeId, updateNodeProperty, setIsDraw]);
  
  // キャンセル処理
  const cancel = useCallback(() => {
    setPreviewPoints([]);
    setPoints([]);
    setIsDraw(false);
    setSnapState('none');
    setGuidelinePoints([]);
  }, [setIsDraw]);

  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (e.button === 0) {
        let currentPoints = [...points, currentCursorPoint];
        setPoints(currentPoints);
        setSnapState('none');
        setGuidelinePoints([]);
      }
    },
    [points, currentCursorPoint],
  );

  const onPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const clonedPts = [...points];

      let currentPt = new THREE.Vector2(
        e.intersections[0].point.x,
        e.intersections[0].point.y,
      );
      
      // グリッドスナップ
      if (snap) {
        currentPt.x = snapToGrid(currentPt.x, snapLength);
        currentPt.y = snapToGrid(currentPt.y, snapLength);
      }

      // 前の点があれば水平・垂直方向にスナップ
      if (points.length > 0) {
        const previousPoint = points[points.length - 1];
        
        // スナップ方向を検出し、ガイドラインを生成
        const { snapDirection, guidelinePoints: newGuidelinePoints, snappedPoint } = detectSnapDirection(
          previousPoint,
          currentPt
        );
        
        setSnapState(snapDirection);
        setGuidelinePoints(newGuidelinePoints);
        currentPt = snappedPoint;
      }

      setCurrentCursorPoint(currentPt);

      clonedPts.push(currentPt);
      setPreviewPoints(clonedPts);
    },
    [points, snap, snapLength],
  );

  // previewPointsが更新されたら壁セグメントを更新する
  useEffect(() => {
    if (previewPoints.length >= 2) {
      const segments = [];
      for (let i = 0; i < previewPoints.length - 1; i++) {
        segments.push({
          start: previewPoints[i],
          end: previewPoints[i + 1]
        });
      }
      setWallSegments(segments);
    } else {
      setWallSegments([]);
    }
  }, [previewPoints]);

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
  }, [isPressedEscape, cancel]);
  
  return isDraw && (
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
      
      {/* スナップガイドラインの表示 */}
      {snapState !== 'none' && guidelinePoints.length === 2 && (
        <Line
          points={guidelinePoints}
          color={snapState === 'horizontal' ? "#00FFFF" : "#FF00FF"}
          lineWidth={1}
          opacity={0.5}
          transparent
        />
      )}
      
      {/* プレビューの表示 */}
      {previewPoints.length > 0 && (
        <Polyline points={previewPoints} color="tomato" />
      )}
      
      {/* 壁要素の表示 */}
      {wallSegments.map((segment, index) => {
        // 2点間の距離を計算
        const distance = segment.start.distanceTo(segment.end);
        return(
          <>
          <WallElement 
          key={`wall-${index}`}
          start={segment.start}
          end={segment.end}
        />
        <Ruler start={segment.start} end={segment.end} value={distance} key={`ruler-${index}`}/>
          </>
        )
      }
      )}
      
      <Cursor point={currentCursorPoint} />
    </>
  );
};

export default PolylineDrawer;