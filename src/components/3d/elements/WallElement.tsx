
import { Vector2 } from "three";
import * as THREE from "three";

type WallElementProps = {
  start: Vector2;
    end: Vector2;
};

export const WallElement = (props: WallElementProps) => {
    const { start, end } = props;
    const wallThickness = 0.5; // 壁の厚さ
  
    // 壁の方向ベクトルを計算
    const direction = new Vector2().subVectors(end, start).normalize();
  
    // 方向ベクトルを90度回転させて厚さ方向のベクトルを得る
    const thicknessDir = new Vector2(-direction.y, direction.x).multiplyScalar(
      wallThickness / 2
    );
  
    // 長方形の4つの頂点を計算
    const corner1 = new THREE.Vector3(start.x, start.y, 0);
  
    // corner2 = end (右上)
    const corner2 = new THREE.Vector3(end.x, end.y, 0);
  
    // corner3：endから厚さ方向に移動した点 (右下)
    const corner3 = new THREE.Vector3(end.x - thicknessDir.x, end.y - thicknessDir.y, 0);
  
    // corner4：startから厚さ方向に移動した点 (左下)
    const corner4 = new THREE.Vector3(
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
    </>
  );
};
