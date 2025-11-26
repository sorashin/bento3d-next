import { useRef, ReactNode, useState } from "react"
import { Group, Box3, Vector3 } from "three"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import { BoxGeometry, EdgesGeometry, LineSegments } from "three"

type BoundingBoxProps = {
  children: ReactNode
  width?: number
  height?: number
  depth?: number
  showText?: boolean
  color?: string
}

export default function BoundingBox({
  children,
  width,
  height,
  depth,
  showText = true,
  color = "#666666",
}: BoundingBoxProps) {
  const groupRef = useRef<Group>(null)
  const boxRef = useRef<LineSegments>(null)
  const boxGeometryRef = useRef<BoxGeometry | null>(null)
  const [boxCenter, setBoxCenter] = useState<Vector3>(new Vector3())
  const [boxSize, setBoxSize] = useState<Vector3>(new Vector3())

  useFrame(() => {
    if (!groupRef.current || !boxRef.current) return

    // 子要素のバウンディングボックスを計算
    const box = new Box3()
    box.setFromObject(groupRef.current)

    if (box.isEmpty()) return

    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())

    // サイズが変更された場合のみ更新
    const sizeChanged = 
      Math.abs(size.x - boxSize.x) > 0.01 ||
      Math.abs(size.y - boxSize.y) > 0.01 ||
      Math.abs(size.z - boxSize.z) > 0.01

    if (sizeChanged) {
      setBoxSize(size)
      setBoxCenter(center)

      // バウンディングボックスのジオメトリを更新
      if (boxGeometryRef.current) {
        boxGeometryRef.current.dispose()
      }
      boxGeometryRef.current = new BoxGeometry(size.x, size.y, size.z)
      const edgesGeometry = new EdgesGeometry(boxGeometryRef.current)
      
      if (boxRef.current.geometry) {
        boxRef.current.geometry.dispose()
      }
      boxRef.current.geometry = edgesGeometry
    }

    // ボックスの位置を中心に設定（毎フレーム更新）
    boxRef.current.position.copy(center)
    setBoxCenter(center)
  })

  // テキストの位置を計算（バウンディングボックスの各面に配置）
  const textOffset = Math.max(boxSize.x, boxSize.y, boxSize.z) * 0.6

  return (
    <group>
      <group ref={groupRef}>{children}</group>
      <lineSegments ref={boxRef}>
        <edgesGeometry />
        <lineBasicMaterial color={color} />
      </lineSegments>
      {showText &&
        (width !== undefined ||
          height !== undefined ||
          depth !== undefined) && (
          <group>
            {width !== undefined && (
              <Text
                position={[boxCenter.x + textOffset, boxCenter.y, 0]}
                rotation={[0, 0, -Math.PI / 2]}
                fontSize={5}
                color={color}
                anchorX="center"
                anchorY="bottom">
                {width.toFixed(2)}mm
              </Text>
            )}
            {height !== undefined && (
              <Text
                position={[
                  boxCenter.x + boxSize.x / 2,
                  boxCenter.y + boxSize.y / 2,
                  boxCenter.z,
                ]}
                rotation={[Math.PI / 2, 0, -Math.PI / 2]}
                fontSize={5}
                color={color}
                anchorX="center"
                anchorY="bottom">
                {height.toFixed(2)}mm
              </Text>
            )}
            {depth !== undefined && (
              <Text
                position={[boxCenter.x, boxCenter.y + textOffset, 0]}
                fontSize={5}
                color={color}
                anchorX="center"
                anchorY="middle">
                {depth.toFixed(2)}mm
              </Text>
            )}
          </group>
        )}
    </group>
  )
}

