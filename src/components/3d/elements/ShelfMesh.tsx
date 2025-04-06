import { BufferGeometry } from "three"
import { useMemo } from "react"

type ShelfMeshProps = {
  geometries: BufferGeometry[]
}

const getRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}

export default function ShelfMesh({ geometries }: ShelfMeshProps) {
  const colors = useMemo(() => {
    return geometries.map(() => getRandomColor())
  }, [geometries.length]) // geometriesの長さが変わった時だけ更新

  return (
    <group rotation={[Math.PI, 0, 0]}>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry} rotation={[Math.PI, 0, 0]}>
          <meshStandardMaterial color={colors[index]} />
        </mesh>
      ))}
    </group>
  )
}
