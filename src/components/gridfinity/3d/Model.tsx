import { Edges } from "@react-three/drei"
import { BufferGeometry } from "three"

type ModelProps = {
  geometries: BufferGeometry[]
}

export default function Model({ geometries }: ModelProps) {
  
  return (
    <group rotation={[Math.PI, 0, 0]}>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry} rotation={[Math.PI, 0, 0]}>
          <meshStandardMaterial color={"#338FE8"} />
          <Edges
            // linewidth={4}
            scale={1.0}
            threshold={45} // Display edges only when the angle between two faces exceeds this value (default=15 degrees)
            color="#aaaaaa"
          />
        </mesh>
      ))}
    </group>
  )
}
