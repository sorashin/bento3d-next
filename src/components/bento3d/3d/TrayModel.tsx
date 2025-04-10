import { useTrayStore } from "@/stores/tray"
import { BufferGeometry } from "three"
import { Edges } from "@react-three/drei"

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
          <meshStandardMaterial color={"#ffffff"} />
          <Edges
            // linewidth={4}
            scale={1.0}
            threshold={15} // Display edges only when the angle between two faces exceeds this value (default=15 degrees)
            color="#aaaaaa"
          />
        </mesh>
      ))}
    </group>
  )
}
