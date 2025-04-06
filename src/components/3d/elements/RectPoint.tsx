import { rectAtom } from "@/stores/rect"
import { Sphere } from "@react-three/drei"
import { useAtomValue } from "jotai"

type RectPointProps = {}

export const RectPoint = (props: RectPointProps) => {
  const rects = useAtomValue(rectAtom)
  return (
    <>
      {rects.map((rect, index) => {
        return rect.map((point, pointIndex) => {
          return (
            <Sphere
              key={`${index}-${pointIndex}`}
              args={[0.1, 16, 16]}
              position={[point.x, point.y, 1]}>
              <meshStandardMaterial color="red" />
            </Sphere>
          )
        })
      })}
    </>
  )
}
