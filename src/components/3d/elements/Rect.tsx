
import { Line } from "@react-three/drei";
import { useState } from "react";
import { Vector2, Vector3 } from "three";
import * as THREE from "three";

type RectProps = {
  id: string;
  width: number;
  height: number;
  dir: Vector2;
  startPos: Vector2;
};

export const Rect = (props: RectProps) => {
    const { id, width, height, dir, startPos} = props;
    const [hovered, setHovered] = useState(false);
  
    // 正規化された方向ベクトル
    const normalizedDir = dir.clone().normalize();
    
    // 直角方向のベクトル（dirを90度回転）
    const perpDir = new Vector2(-normalizedDir.y, normalizedDir.x);
    
    // 各頂点の計算
    // A = startPos
    const pointA = new Vector3(startPos.x, startPos.y, 0);
    
    // B = startPosからdirの方向にwidthだけ移動した点
    const pointB = new Vector3(
      startPos.x + normalizedDir.x * width,
      startPos.y + normalizedDir.y * width,
      0
    );
    
    // C = Bからdirの直角方向にheightだけ移動した点
    const pointC = new Vector3(
      pointB.x + perpDir.x * height,
      pointB.y + perpDir.y * height,
      0
    );
    
    // D = Aからdirの直角方向にheightだけ移動した点
    const pointD = new Vector3(
      startPos.x + perpDir.x * height,
      startPos.y + perpDir.y * height,
      0
    );
    
    // ポイントから形状を作成
    const shape = new THREE.Shape();
    shape.moveTo(pointA.x, pointA.y);
    shape.lineTo(pointB.x, pointB.y);
    shape.lineTo(pointC.x, pointC.y);
    shape.lineTo(pointD.x, pointD.y);
    shape.lineTo(pointA.x, pointA.y); // 閉じる
    
  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      {/* 形状の枠線 */}
      <Line 
        points={[pointA, pointB, pointC, pointD, pointA]} 
        color={hovered ? "#ff7b00" : "#28ce4f"} 
        lineWidth={1}
      />
      
      {/* 形状の塗りつぶし */}
      <mesh>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial 
          color={"lightgreen"}
          transparent={true}
        opacity={hovered ? 0.5 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
