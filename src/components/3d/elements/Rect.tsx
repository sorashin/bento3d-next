import { Line, Html } from "@react-three/drei";
import { useState } from "react";
import { Vector2, Vector3 } from "three";
import * as THREE from "three";
import { shelfSize, unitAtom } from "../../../stores/settings";
import { useAtom, useAtomValue } from "jotai";
import { selectedGeometryAtom } from "@/stores/select";

type RectProps = {
  id: string;
  width: number;
  height: number;
  dir: Vector2;
  startPos: Vector2;
  onDelete?: (id: string) => void;
  onResize?: (id: string, width: number) => void;
  onClick?: (id: string) => void;
};

export const Rect = (props: RectProps) => {
  const { id, width, height, dir, startPos } = props;
  const [hovered, setHovered] = useState(false);
  const unit = useAtomValue(unitAtom);
  const [selectedElement, setSelectedElement] = useAtom(selectedGeometryAtom);

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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, edge: string) => {
    e.stopPropagation();
    e.dataTransfer.setData("text/plain", `${id}-${edge}`);
  };


  return (
    <>
    {selectedElement.id === id && (
      <>
      {/* 辺ADに対応するHtml */}
      <Html position={[(pointA.x + pointD.x) / 2, (pointA.y + pointD.y) / 2, 0]}>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, "AB")}
          style={{
            width: `5px`,
            height: "10px",
            backgroundColor: "rgba(0, 0, 255, 0.5)",
            transform: `translate(-50%, -50%) rotate(${Math.atan2(
              normalizedDir.y,
              normalizedDir.x
            )}rad)`,
            cursor: "grab",
          }}
        />
      </Html>

      {/* 辺BCに対応するHtml */}
      <Html position={[(pointB.x + pointC.x) / 2, (pointB.y + pointC.y) / 2, 0]}>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, "CD")}
          style={{
            width: `5px`,
            height: "10px",
            backgroundColor: "rgba(255, 0, 0, 0.5)",
            transform: `translate(-50%, -50%) rotate(${Math.atan2(
              normalizedDir.y,
              normalizedDir.x
            )}rad)`,
            cursor: "grab",
          }}
        />
      </Html>
      <Html position={[(pointA.x + pointB.x) / 2, (pointB.y + pointC.y) / 2, 0]}>
        <select
          style={{
            
            backgroundColor: "rgba(0, 255, 0, 0.5)",
            transform: `translate(-50%, -50%) rotate(${Math.atan2(
              normalizedDir.y,
              normalizedDir.x
            )}rad)`,
            cursor: "pointer",
          }}
          value={props.width}
          onChange={(e) => {
            const newWidth = parseFloat(e.target.value)/unit;
            if (props.onResize) props.onResize(id, newWidth);
          }}
        >
          {(Object.values([50, 60, 70, 80, 90, 100, 110, 120]) as shelfSize[]).map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </Html>
      </>
    )}

      <group
        onClick={(e) => {
          e.stopPropagation();
          if (props.onClick) props.onClick(id);
        }}
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
    </>
  );
};
