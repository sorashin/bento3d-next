import { Line } from "@react-three/drei";
import { Vector2, Vector3 } from "three";
import { Wall } from "@/stores/rect";
import * as THREE from "three";
import { Rect } from "./Rect";
import { use, useCallback } from "react";
import { shelfDepthAtom } from "@/stores/settings";
import { useAtomValue } from "jotai";




type WallProps = {
  wall: Wall;
};


export const WallElem = (props: WallProps) => {
  //console.log("PreviewPolyline");
  const {start, end, id, align, grid} = props.wall;
  const wallThickness = 1; // 壁の厚さ
  const shelfDepth = useAtomValue(shelfDepthAtom  );
  
  
  // 壁の方向ベクトルを計算
  const direction = new Vector2().subVectors(end, start).normalize();
  
  // 方向ベクトルを90度回転させて厚さ方向のベクトルを得る
  const thicknessDir = new Vector2(-direction.y, direction.x).multiplyScalar(wallThickness / 2);
  
  // 長方形の4つの頂点を計算
  const corner1 = new Vector3(start.x, start.y, 0);
  
  // corner2 = end (右上)
  const corner2 = new Vector3(end.x, end.y, 0);
  
  // corner3：endから厚さ方向に移動した点 (右下)
  const corner3 = new Vector3(
    end.x - thicknessDir.x,
    end.y - thicknessDir.y,
    0
  );
  
  // corner4：startから厚さ方向に移動した点 (左下)
  const corner4 = new Vector3(
    start.x - thicknessDir.x,
    start.y - thicknessDir.y,
    0
  );
  // 頂点座標から平面のジオメトリを作成
  const shape = new THREE.Shape();
  shape.moveTo(corner1.x, corner1.y);
  shape.lineTo(corner2.x, corner2.y);
  shape.lineTo(corner3.x, corner3.y);
  shape.lineTo(corner4.x, corner4.y);
  shape.lineTo(corner1.x, corner1.y);


  
  
  return (
    <>
      
      <mesh>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial 
          color="lightblue" 
          side={THREE.DoubleSide} 
          transparent
          opacity={1}
        />
      </mesh>
      {grid.map((g, index) => {
        
        
        // 前のグリッドの幅の合計を計算（現在のインデックスまで）
        const previousWidths = grid.slice(0, index).reduce((sum, item) => sum + item.width, 0);
        
        // startPointを算出：startの座標から方向ベクトルに沿って移動
        const gridStartPoint = new Vector2(
          start.x + direction.x * previousWidths,
          start.y + direction.y * previousWidths
        );
        
        return (
          <Rect 
            id={g.id}
            key={g.id}
            width={g.width}
            height={shelfDepth}
            startPos={gridStartPoint}
            dir={direction}
          />
        );
      })}
    </>
  );
};
