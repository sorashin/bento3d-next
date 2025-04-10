import { useFakeTrayStore, useTrayStore } from "@/stores/tray"
import { useMemo } from "react"
import * as THREE from "three"

export default function TrayModel() {
  const { totalWidth, totalHeight, totalDepth, fillet, thickness } =
    useTrayStore((state) => state)
  const { fakeTotalWidth, fakeTotalHeight, fakeTotalDepth } = useFakeTrayStore(
    (state) => state
  )

  // 角丸の長方形のShapeを作成
  const shape = useMemo(() => {
    const shape = new THREE.Shape()

    // 長方形の中心を原点として座標を計算
    const width = fakeTotalWidth
    const depth = fakeTotalDepth
    const radius = fillet

    // 角丸の長方形のパスを描画（時計回り）
    shape.moveTo(-width / 2 + radius, -depth / 2)
    shape.lineTo(width / 2 - radius, -depth / 2)
    shape.quadraticCurveTo(
      width / 2,
      -depth / 2,
      width / 2,
      -depth / 2 + radius
    )
    shape.lineTo(width / 2, depth / 2 - radius)
    shape.quadraticCurveTo(width / 2, depth / 2, width / 2 - radius, depth / 2)
    shape.lineTo(-width / 2 + radius, depth / 2)
    shape.quadraticCurveTo(
      -width / 2,
      depth / 2,
      -width / 2,
      depth / 2 - radius
    )
    shape.lineTo(-width / 2, -depth / 2 + radius)
    shape.quadraticCurveTo(
      -width / 2,
      -depth / 2,
      -width / 2 + radius,
      -depth / 2
    )

    return shape
  }, [fakeTotalDepth, fakeTotalWidth, fillet])

  // 押し出し設定
  const extrudeSettings: THREE.ExtrudeGeometryOptions = useMemo(() => {
    return {
      steps: 1,
      depth: fakeTotalHeight,
      bevelEnabled: true,
    }
  }, [fakeTotalHeight])

  return (
    <mesh position={[0, 0, 0]}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial color="#fff" side={THREE.DoubleSide} />
    </mesh>
  )
}
