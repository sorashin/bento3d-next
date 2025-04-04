import { Html } from "@react-three/drei";

import { useRef } from "react";

import { useState } from "react";
import * as THREE from 'three';


// ハンドルコンポーネント
type HandleProps = {
    position: [number, number, number];
    rotation: [number, number, number];
    onDrag: (offset: number) => void;
    side: 'left' | 'right';
  };
  
  const Handle: React.FC<HandleProps> = ({ position, rotation, onDrag, side }) => {
    
    const startPosRef = useRef<number | null>(null);
    
  
    // ドラッグの開始
    const handleMouseDown = (e: React.MouseEvent) => {
      startPosRef.current = e.clientX;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
  
    // ドラッグ中
    const handleMouseMove = (e: MouseEvent) => {
      if (startPosRef.current !== null) {
        const offset = (e.clientX - startPosRef.current) / 100; // スケーリング係数
        onDrag(side === 'left' ? -offset : offset); // 左右で方向を反転
        startPosRef.current = e.clientX;
      }
    };
  
    // ドラッグの終了
    const handleMouseUp = () => {
      startPosRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  
    return (
      <Html
        position={position}
        rotation={rotation}
        transform
        occlude
        distanceFactor={10}
      >
        <div 
          className="handle"
          style={{
            width: '20px',
            height: '20px',
            background: 'rgba(255,255,255,0.7)',
            border: '2px solid #666',
            borderRadius: '50%',
            cursor: 'ew-resize',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            userSelect: 'none'
          }}
          onMouseDown={handleMouseDown}
        >
          <span>{side === 'left' ? '◀' : '▶'}</span>
        </div>
      </Html>
    );
  };

// 長方形コンポーネント
type ResizableRectangleProps = {
    initialWidth?: number;
    height?: number;
    depth?: number;
    color?: string;
    rotation?: [number, number, number];
  };
  
  export const ResizableRectangle: React.FC<ResizableRectangleProps> = ({
    initialWidth = 2,
    height = 1,
    depth = 0.1,
    color = '#ff6600',
    rotation = [0, 0, 0]
  }) => {
    const [width, setWidth] = useState(initialWidth);
    const meshRef = useRef<THREE.Mesh>(null);
    
    // ハンドルのドラッグに応じて幅を更新
    const handleDrag = (offset: number) => {
      setWidth(prev => Math.max(0.5, prev + offset)); // 最小幅を設定
    };
  
    // 回転行列を計算して位置を調整する
    const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(
      new THREE.Euler(rotation[0], rotation[1], rotation[2])
    );
    
    // 左ハンドルの位置を計算
    const leftPos = new THREE.Vector3(-width / 2, 0, 0)
      .applyMatrix4(rotationMatrix)
      .toArray();
      
    // 右ハンドルの位置を計算
    const rightPos = new THREE.Vector3(width / 2, 0, 0)
      .applyMatrix4(rotationMatrix)
      .toArray();
  
    return (
      <group rotation={rotation}>
        {/* 長方形のメッシュ */}
        <mesh ref={meshRef}>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={color} />
        </mesh>
        
        {/* 左側のハンドル */}
        <Handle 
          position={leftPos as [number, number, number]} 
          rotation={rotation} 
          onDrag={handleDrag} 
          side="left" 
        />
        
        {/* 右側のハンドル */}
        <Handle 
          position={rightPos as [number, number, number]} 
          rotation={rotation} 
          onDrag={handleDrag} 
          side="right" 
        />
      </group>
    );
  };