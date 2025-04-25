import { Canvas as ThreeCanvas } from "@react-three/fiber"
import {
  OrbitControls,
  GizmoViewport,
  GizmoHelper,
  Grid,
} from "@react-three/drei"

import { useModularStore } from "@/stores/modular"
import TrayModel from "./TrayModel"
import { useEffect, useRef, useState } from "react"
import { Object3D } from "three"
import PreviewModel from "./PreviewModel"
import { useNavigationStore } from "@/stores/navigation"
import { useSettingsStore } from "@/stores/settings"
import useConversion from "@/hooks/useConversion"
import * as THREE from "three"

const Canvas = () => {
  const { geometries } = useModularStore()
  const { currentNav } = useNavigationStore((state) => state)
  const { gridSize } = useSettingsStore((state) => state)
  const { deunit } = useConversion()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    Object3D.DEFAULT_UP.set(0, 0, 1) //Z軸を上にする
  }, [])

  useEffect(() => {
    // リサイズハンドラー関数
    const handleResize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight,
        })
      }
    }

    // 初期サイズを設定
    handleResize()

    // リサイズイベントリスナーを追加
    window.addEventListener("resize", handleResize)

    // クリーンアップ関数
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div className="flex-1" ref={canvasRef}>
      <ThreeCanvas
        orthographic
        camera={{
          position: [100, -100, 100], // clipping 問題解決するため zを１００にする
          fov: 40,
          zoom: 5,
          near: 0.1,
          far: 10000,
        }}
        frameloop="demand"
        resize={{ scroll: false, debounce: { scroll: 50, resize: 50 } }}>
        <Grid
          cellSize={deunit(gridSize)}
          sectionSize={deunit(gridSize) * 10}
          sectionColor={"#9faca8"}
          cellColor={"#b0bdbb"}
          cellThickness={0.8}
          sectionThickness={0.8}
          fadeDistance={250}
          rotation={[Math.PI / 2, 0, 0]}
          infiniteGrid={true}
          side={THREE.DoubleSide}
        />
        <color attach="background" args={["#cccccc"]} />
        <ambientLight intensity={2.8} />
        {/* axis helper */}

        <axesHelper args={[100]} />
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
          enablePan={true}
          enableZoom={true}
          enableRotate={currentNav === 2 ? true : false}
          makeDefault
          dampingFactor={0.3}
        />

        {currentNav == 0 && <PreviewModel />}
        {currentNav == 2 && <TrayModel geometries={geometries} />}
      </ThreeCanvas>
    </div>
  )
}

export default Canvas
