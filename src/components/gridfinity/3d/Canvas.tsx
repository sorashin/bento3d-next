import { Canvas as ThreeCanvas } from "@react-three/fiber"
import { OrbitControls, GizmoViewport, GizmoHelper } from "@react-three/drei"

import { useModularStore } from "@/stores/modular"
import Model from "./Model"
import BoundingBox from "./BoundingBox"
import { useEffect, useMemo, useState } from "react"
import { Object3D } from "three"
import { useGridfinityStore, Bin } from "@/stores/gridfinity"
import Icon from "@/components/common/ui/Icon"

// binsの中に含まれるuの値で最も大きい値を選出する関数
const getMaxU = (bins: Bin[]): number => {
  if (bins.length === 0) return 0
  return Math.max(...bins.map((bin) => bin.u))
}

const Canvas = () => {
  const { manifoldGeometries } = useModularStore()
  const [isBoundingBoxVisible, setIsBoundingBoxVisible] = useState(true)
  useEffect(() => {
    Object3D.DEFAULT_UP.set(0, 0, 1) //Z軸を上にする
  }, [])
  const { totalRows, totalCols, bins } = useGridfinityStore((state) => state)
  
  // binsの中に含まれるuの値で最も大きい値を選出
  const maxU = useMemo(() => getMaxU(bins), [bins])
  
  // CSS変数からsurface-baseの色を取得
  const surfaceBaseColor = useMemo(() => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--color-surface-base')
        .trim() || '#E7E7E7'
    }
    return '#E7E7E7'
  }, [])
  
  return (
    <div className="flex-1 relative">
      <button
        onClick={() => setIsBoundingBoxVisible(!isBoundingBoxVisible)}
        className="absolute bottom-4 left-4 z-10 b-button bg-content-xxl-a hover:bg-content-xl-a"
        title={isBoundingBoxVisible ? "バウンディングボックスを非表示" : "バウンディングボックスを表示"}>
        <Icon
          name="major"
          className="size-8"
        />
      </button>
      <ThreeCanvas
        orthographic
        camera={{
          position: [0, -100, 100], // clipping 問題解決するため zを１００にする
          fov: 40,
          zoom: 4,
          near: 0.001,
          far: 10000,
        }}
        frameloop="demand">
        <color attach="background" args={[surfaceBaseColor]} />
        <ambientLight intensity={1.8} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <GizmoHelper margin={[50, 100]} alignment="bottom-right" scale={0.5}>
          <GizmoViewport
            axisColors={["hotpink", "aquamarine", "#3498DB"]}
            labelColor="black"
          />
        </GizmoHelper>

        <OrbitControls
          enableRotate={true}
          enablePan={true}
          enableZoom={true}
          zoomSpeed={0.5}
        />
        {/* <gridHelper
          args={[100, 100, "#555555", "#444444"]}
          rotation={[Math.PI / 2, 0, 0]}
        /> */}
        <BoundingBox
          width={42 * totalCols}
          height={7 * maxU + 4.4}
          depth={42 * totalRows}
          showText={true}
          color="#666666"
          isShow={isBoundingBoxVisible}>
          <Model
            geometries={manifoldGeometries.map((geometry) => geometry.geometry)}
          />
        </BoundingBox>
      </ThreeCanvas>
    </div>
  )
}

export default Canvas
