import { useTrayStore } from "@/stores/tray"
import { Edges } from "@react-three/drei"
import { useParams } from "react-router-dom"
import { useEffect, useMemo } from "react"
import { GeometryWithId, useModularStore } from "@/stores/modular"
import { useSettingsStore } from "@/stores/settings"
import * as THREE from "three"
import { Vector3 } from "three"

const directions = (parts: string): Vector3 => {
  switch (parts) {
    case "lid":
      return new Vector3(0, 0, 1)
    case "tray":
      return new Vector3(0, 0, 0)
    case "latch":
      return new Vector3(0, -1, 0)
    case "box":
      return new Vector3(0, 0, -1)
    default:
      return new Vector3(0, 0, 0)
  }
}

export default function TrayModel() {
  const { totalDepth, totalHeight } = useTrayStore((state) => state)

  const { bom } = useSettingsStore((state) => state)
  const { slug } = useParams<{ slug: string }>()
  const { manifoldGeometries } = useModularStore((state) => state)

  useEffect(() => {
    console.log(
      "manifoldGeometries Updated in TrayModel.ts",
      manifoldGeometries
    )
  }, [manifoldGeometries])

  return (
    <group rotation={[Math.PI, 0, 0]}>
      {manifoldGeometries.map((geometry, index) => {
        // 法線を再計算
        geometry.geometry.computeVertexNormals()
        // trayの場合は追加の移動を適用するNodiの不具合修正までの間の対応
        const extraOffset =
          geometry.label === "latch"
            ? new Vector3(0, totalDepth / 2 + 7, -totalHeight - 3)
            : new Vector3(0, 0, 0)

        return (
          <mesh
            key={index}
            geometry={geometry.geometry}
            position={
              slug === "bento3d"
                ? directions(geometry.label || "")
                    .multiplyScalar(-100 * bom)
                    .add(extraOffset)
                : [0, 0, 0]
            }
            rotation={[Math.PI, 0, 0]}>
            <meshStandardMaterial
              color={geometry.label === "tray" ? "#ffffff" : "#3581d8"}
              flatShading={true}
            />

            <Edges
              // linewidth={4}
              scale={1.0}
              threshold={45} // Display edges only when the angle between two faces exceeds this value (default=15 degrees)
              color="#aaaaaa"
            />
          </mesh>
        )
      })}
    </group>
  )
}
