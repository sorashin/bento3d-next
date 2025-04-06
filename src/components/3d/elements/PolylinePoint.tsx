import { polylinePointsAtom } from "@/stores/points"
import { Sphere } from "@react-three/drei"
import { useAtomValue } from "jotai"

type PolylinePointProps = {}

export const PolylinePoint = (props: PolylinePointProps) => {
  const polylines = useAtomValue(polylinePointsAtom)
  return (
    <>
      {polylines.map((polyline, index) => {
        return polyline.points.map((point, pointIndex) => {
          const pos = point.position
          return (
            <Sphere
              key={`${index}-${pointIndex}`}
              args={[0.1, 16, 16]}
              position={[pos.x, pos.y, 1]}>
              <meshStandardMaterial color="blue" />
            </Sphere>
          )
        })
      })}
    </>
  )
}
