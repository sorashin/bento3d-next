import { useCallback, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector2, Vector3 } from 'three';
import { Line, Sphere } from '@react-three/drei';
import { useAtom } from 'jotai';
import { addPointAtom, polylinePointsAtom } from '../store/polylineStore';

const PolylineDrawer = () => {
  const { raycaster, camera, gl } = useThree();
  const [points] = useAtom(polylinePointsAtom);
  const [, addPoint] = useAtom(addPointAtom);

  // 画面クリック時にポイントを追加
  const handleCanvasClick = useCallback((event: MouseEvent) => {
    // キャンバス上のマウス位置を正規化された座標に変換
    const mouse = new Vector2(
      (event.clientX / gl.domElement.clientWidth) * 2 - 1,
      -(event.clientY / gl.domElement.clientHeight) * 2 + 1
    );

    // レイキャスターを更新して、マウス位置から3D空間内の点を取得
    raycaster.setFromCamera(mouse, camera);

    // Z=0平面との交点を計算
    const planeNormal = new Vector3(0, 0, 1);
    const planeConstant = 0; // Z=0平面
    const ray = raycaster.ray;
    
    const denominator = planeNormal.dot(ray.direction);
    if (Math.abs(denominator) > 0.0001) {
      const t = -(ray.origin.dot(planeNormal) + planeConstant) / denominator;
      if (t >= 0) {
        const intersectionPoint = new Vector3()
          .copy(ray.origin)
          .add(ray.direction.clone().multiplyScalar(t));
        
        // 2D平面上の点として追加
        addPoint(new Vector2(intersectionPoint.x, intersectionPoint.y));
      }
    }
  }, [raycaster, camera, gl, addPoint]);

  // キャンバスクリックイベントのセットアップ
  useMemo(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('click', handleCanvasClick);
    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [gl, handleCanvasClick]);

  // 3D空間に描画するためのベクトル配列を作成
  const polylinePoints = useMemo(() => {
    return points.map(point => new Vector3(point.position.x, point.position.y, 0));
  }, [points]);

  return (
    <>
      {/* ポリライン描画 */}
      {polylinePoints.length > 1 && (
        <Line
          points={polylinePoints}
          color="#00aaff"
          lineWidth={3}
        />
      )}
      
      {/* 各ポイントを球体として表示 */}
      {polylinePoints.map((point, index) => (
        <Sphere key={index} args={[0.1, 16, 16]} position={point}>
          <meshStandardMaterial color="#ff4400" />
        </Sphere>
      ))}
    </>
  );
};

export default PolylineDrawer;