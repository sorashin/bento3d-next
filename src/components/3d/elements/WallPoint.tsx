import useConstantScale from "@/hooks/useConstantScale";
import { Sphere, Html } from "@react-three/drei";
import { useSetAtom } from "jotai";
import { Vector2, Vector3, Plane } from "three";
import { updatePointPositionAtom } from "@/stores/points";
import { useEffect, useRef, useState, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type WallPointProps = {
  point: Vector2;
  pointId?: string;
  polylineId?: string;
};

// コンポーネント外でスタイルを定義
const handleStyles = {
  container: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
    transform: 'translate(-50%, -50%)',
    touchAction: 'none',
    userSelect: 'none' as 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: '6px',
    height: '6px',
    backgroundColor: 'white',
    borderRadius: '50%',
  }
};

export const WallPoint = (props: WallPointProps) => {
  // 基本的な参照と状態
  const sphereRef = useConstantScale(1.5);
  const updatePointPosition = useSetAtom(updatePointPositionAtom);
  const { camera, gl, invalidate } = useThree();
  
  // 位置状態
  const [position, setPosition] = useState(new Vector3(props.point.x, props.point.y, 0));
  const lastAppliedPosition = useRef(new Vector2(props.point.x, props.point.y));
  
  // ドラッグ関連の状態
  const isDraggingRef = useRef(false);
  const dragOffset = useRef(new Vector3());
  const lastUpdateTime = useRef(0);
  const dragPlane = useRef(new Plane(new Vector3(0, 0, 1), 0));
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // マウス位置をスクリーン座標から正規化座標に変換
  const updateMousePosition = useCallback((clientX: number, clientY: number) => {
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();
    mouse.current.x = ((clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    mouse.current.y = -((clientY - rect.top) / canvas.clientHeight) * 2 + 1;
  }, [gl]);
  
  // マウス位置から世界座標を計算
  const getMouseWorldPosition = useCallback(() => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new Vector2(mouse.current.x, mouse.current.y), camera);
    
    const intersection = new Vector3();
    raycaster.ray.intersectPlane(dragPlane.current, intersection);
    return intersection.add(dragOffset.current);
  }, [camera]);
  
  // 位置更新処理
  const updatePosition = useCallback(() => {
    if (!isDraggingRef.current) return;
    
    const worldPos = getMouseWorldPosition();
    const x = Number(worldPos.x.toFixed(3));
    const y = Number(worldPos.y.toFixed(3));
    
    setPosition(new Vector3(x, y, 0));
    
    // スロットリングされた更新
    const now = Date.now();
    if (now - lastUpdateTime.current > 100 && props.pointId && props.polylineId) {
      updatePointPosition({
        polylineId: props.polylineId,
        pointId: props.pointId,
        newPosition: new Vector2(x, y)
      });
      lastAppliedPosition.current.set(x, y);
      lastUpdateTime.current = now;
    }
  }, [getMouseWorldPosition, props.polylineId, props.pointId, updatePointPosition]);
  
  // ドラッグ開始処理
  const startDrag = useCallback((clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    lastUpdateTime.current = Date.now();
    
    updateMousePosition(clientX, clientY);
    
    // オフセット計算
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new Vector2(mouse.current.x, mouse.current.y), camera);
    
    const intersection = new Vector3();
    raycaster.ray.intersectPlane(dragPlane.current, intersection);
    dragOffset.current.subVectors(new Vector3(position.x, position.y, 0), intersection);
    
    document.body.style.cursor = 'grabbing';
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
  }, [camera, position, updateMousePosition]);
  
  // HTML要素ドラッグ開始
  const handleHtmlDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startDrag(e.clientX, e.clientY);
  };
  
  // グローバルマウス移動
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    updateMousePosition(e.clientX, e.clientY);
    updatePosition();
    invalidate(); // frameloop="demand"対応のため
  }, [updateMousePosition, updatePosition, invalidate]);
  
  // ドラッグ終了
  const handleGlobalMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    
    if (props.pointId && props.polylineId) {
      const worldPos = getMouseWorldPosition();
      const finalX = Number(worldPos.x.toFixed(3));
      const finalY = Number(worldPos.y.toFixed(3));
      
      // 最終位置を更新
      const finalPosition = new Vector2(finalX, finalY);
      updatePointPosition({
        polylineId: props.polylineId,
        pointId: props.pointId,
        newPosition: finalPosition
      });
      
      lastAppliedPosition.current.copy(finalPosition);
      setPosition(new Vector3(finalX, finalY, 0));
    }
    
    // 後処理
    isDraggingRef.current = false;
    document.body.style.cursor = 'auto';
    window.removeEventListener('mousemove', handleGlobalMouseMove);
    window.removeEventListener('mouseup', handleGlobalMouseUp);
    invalidate();
  }, [getMouseWorldPosition, invalidate, props.pointId, props.polylineId, updatePointPosition]);
  
  // バックアップ用フレーム更新
  useFrame(() => {
    if (isDraggingRef.current) {
      updatePosition();
    }
  });
  
  // props変更時の位置更新
  useEffect(() => {
    if (isDraggingRef.current) return;
    
    if (
      Math.abs(props.point.x - lastAppliedPosition.current.x) > 0.001 ||
      Math.abs(props.point.y - lastAppliedPosition.current.y) > 0.001
    ) {
      setPosition(new Vector3(props.point.x, props.point.y, 0));
      lastAppliedPosition.current.set(props.point.x, props.point.y);
    }
  }, [props.point.x, props.point.y]);
  
  // クリーンアップ
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleGlobalMouseMove, handleGlobalMouseUp]);
  
  return (
    <group>
      <Sphere 
        ref={sphereRef} 
        position={[position.x, position.y, 0]}
        scale={[0.5, 0.5, 0.5]}
      >
        <meshStandardMaterial 
          color="#ffffff"
          transparent
          opacity={0.5}
        />
      </Sphere>
      
      <Html position={[position.x, position.y, 0]} center>
        <div
          onMouseDown={handleHtmlDragStart}
          style={{
            ...handleStyles.container,
            backgroundColor: isDraggingRef.current 
              ? 'rgba(255, 128, 0, 0.7)' 
              : 'rgba(0, 128, 255, 0.7)',
            cursor: isDraggingRef.current ? 'grabbing' : 'grab'
          }}
        >
          <div style={handleStyles.inner} />
        </div>
      </Html>
    </group>
  );
};