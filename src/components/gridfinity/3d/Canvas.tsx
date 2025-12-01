import { Canvas as ThreeCanvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, GizmoViewport, GizmoHelper } from "@react-three/drei"

import { useModularStore } from "@/stores/modular"
import Model from "./Model"
import BoundingBox from "./BoundingBox"
import BomSlider from "../ui/BomSlider"
import { useEffect, useMemo, useState, useRef } from "react"
import { Object3D, Group, Box3, Vector3 } from "three"
import { useGridfinityStore, Bin } from "@/stores/gridfinity"
import Icon from "@/components/common/ui/Icon"
import { useNavigationStore } from "@/stores/navigation"

// binsの中に含まれるuの値で最も大きい値を選出する関数
const getMaxU = (bins: Bin[]): number => {
  if (bins.length === 0) return 0
  return Math.max(...bins.map((bin) => bin.u))
}

// カメラをモデルのバウンディングボックスに合わせて調整するコンポーネント
const CameraController = ({ 
  modelRef, 
  geometryCount 
}: { 
  modelRef: React.RefObject<Group | null>
  geometryCount: number
}) => {
  const { camera, controls } = useThree()
  const lastGeometryCount = useRef(0)

  useFrame(() => {
    if (!modelRef.current) return

    // ジオメトリが変更された場合のみカメラを調整
    if (lastGeometryCount.current === geometryCount) return
    lastGeometryCount.current = geometryCount

    // モデルのバウンディングボックスを計算
    const box = new Box3()
    box.setFromObject(modelRef.current)

    if (box.isEmpty()) return

    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())

    // モデルの最大サイズを取得（対角線の長さを考慮）
    const maxSize = Math.max(size.x, size.y, size.z)
    const diagonal = Math.sqrt(size.x * size.x + size.y * size.y + size.z * size.z)

    // カメラをモデルの中心に向ける
    // モデル全体が見えるように適切な距離を計算
    const distance = diagonal * 1.2 // マージンを追加

    // カメラの位置を調整（デフォルトの角度を維持）
    // 現在のカメラ位置の方向を保持しつつ、距離を調整
    const currentPos = camera.position.clone()
    const currentDistance = currentPos.length()
    
    if (currentDistance > 0.1) {
      // 現在の方向を維持
      const direction = currentPos.normalize()
      camera.position.copy(center).add(direction.multiplyScalar(distance))
    } else {
      // デフォルト位置の場合（斜め上から見る角度）
      camera.position.set(0, -distance * 0.7, distance * 0.7)
    }

    // カメラをモデルの中心に向ける
    camera.lookAt(center)

    // OrbitControlsのターゲットをモデルの中心に設定
    if (controls && 'target' in controls && 'update' in controls) {
      const orbitControls = controls as unknown as { target: Vector3; update: () => void }
      if (orbitControls.target instanceof Vector3) {
        orbitControls.target.copy(center)
        orbitControls.update()
      }
    }

    // ズームを調整（モデルが画面に収まるように）
    if (camera.type === "OrthographicCamera") {
      // モデルの最大サイズに基づいてズームを計算
      // より大きなモデルにはより小さいズーム値を設定
      const baseZoom = 4
      const zoomFactor = Math.max(maxSize / 100, 1) // 100mmを基準とする
      camera.zoom = Math.max(baseZoom / zoomFactor, 0.5) // 最小ズームを0.5に設定
      camera.updateProjectionMatrix()
    }
  })

  return null
}

const Canvas = () => {
  const { manifoldGeometries } = useModularStore()
  const [isBoundingBoxVisible, setIsBoundingBoxVisible] = useState(false)
  const { currentNav } = useNavigationStore()
  const modelGroupRef = useRef<Group>(null)
  
  useEffect(() => {
    Object3D.DEFAULT_UP.set(0, 0, 1) //Z軸を上にする
  }, [])
  const { totalRows, totalCols, bins } = useGridfinityStore((state) => state)
  
  // binsの中に含まれるuの値で最も大きい値を選出
  const maxU = useMemo(() => getMaxU(bins), [bins])
  
  
  
  return (
    <div className="flex-1 relative">
      
      {currentNav == 1 && <div className="absolute bottom-8 inset-x-0 flex justify-center items-center gap-2 pointer-events-none">
        <div className="flex flex-row items-center gap-2 bg-content-dark-l-a rounded-md shadow-sm p-2 z-10 pointer-events-auto">
        <button
          onClick={(e) => {
            setIsBoundingBoxVisible(!isBoundingBoxVisible)
            // クリック後にフォーカスを外して、DOM要素が選択されないようにする
            e.currentTarget.blur()
          }}
          className="b-button hover:bg-content-xl-a cursor-pointer"
          title={
            isBoundingBoxVisible
              ? "バウンディングボックスを非表示"
              : "バウンディングボックスを表示"
          }>
          <Icon name="major" className="size-8" />
        </button>
        <BomSlider />
        </div>
        
      </div>}
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
        <color attach="background" args={["#dddddd"]} />
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
        <group ref={modelGroupRef}>
          <BoundingBox
            width={42 * totalCols}
            height={7 * maxU + 4.4}
            depth={42 * totalRows}
            showText={true}
            color="#666666"
            isShow={isBoundingBoxVisible}>
            <Model manifoldGeometries={manifoldGeometries} />
          </BoundingBox>
        </group>
        <CameraController
          modelRef={modelGroupRef}
          geometryCount={manifoldGeometries.length}
        />
      </ThreeCanvas>
    </div>
  )
}

export default Canvas
