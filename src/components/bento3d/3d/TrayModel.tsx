import { useTrayStore } from "@/stores/tray"
import { BufferGeometry } from "three"

type TrayModelProps = {
  geometries: BufferGeometry[]
}

export default function TrayModel({ geometries }: TrayModelProps) {
  const { totalWidth, totalDepth } = useTrayStore((state) => state)
  return (
    <group
      rotation={[Math.PI, 0, 0]}
      position={[-totalWidth / 2, totalDepth / 2, 0]}>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry} rotation={[Math.PI, 0, 0]}>
          <meshStandardMaterial color={"pink"} />
        </mesh>
      ))}
    </group>
  )
}
