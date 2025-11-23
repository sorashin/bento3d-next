import Canvas from "@/components/gridfinity/3d/Canvas"
import { Header } from "@/components/common/ui/Header"
import { LeftBar } from "@/components/gridfinity/ui/LeftBar"
import { RightBar } from "@/components/gridfinity/ui/RightBar"
import { GridView } from "@/components/gridfinity/ui/GridView"
import { useModularStore } from "@/stores/modular"
import { gridfinityLabelProcessor } from "@/utils/gridfinityLabelProcessor"
import { useEffect, useMemo, useState, useCallback } from "react"
import { useGridfinityStore } from "@/stores/gridfinity"
import { geometryBooleanProcessor } from "@/utils/geometryBooleanProcessor"
import { useNavigationStore, nevigations } from "@/stores/navigation"
import Module from "manifold-3d"

export function Page() {
  const { geometries, setManifoldGeometries, inputNodeId, updateNodeProperty, evaluateGraph } = useModularStore()
  const gridfinityState = useGridfinityStore()
  const { bins } = gridfinityState
  const { currentNav, setCurrentNavArray } = useNavigationStore()
  const [manifoldModule, setManifoldModule] = useState<Awaited<ReturnType<typeof Module>> | null>(null)

  // navigation設定をgridfinity用に設定
  useEffect(() => {
    setCurrentNavArray(nevigations["gridfinity"])
  }, [setCurrentNavArray])

  // manifoldModuleを初期化
  useEffect(() => {
    const initManifold = async () => {
      const wasm = await Module()
      wasm.setup()
      setManifoldModule(wasm)
    }
    initManifold()
  }, [])

  // geometry処理
  useMemo(() => {
    if (!manifoldModule) return
    const gs = geometryBooleanProcessor(
      gridfinityLabelProcessor(geometries, bins),
      manifoldModule
    )
    setManifoldGeometries(gs)
  }, [geometries, bins, manifoldModule, setManifoldGeometries])

  // Preview画面への切り替え時にgraph更新を実行
  const handleDLView = useCallback(async () => {
    if (!inputNodeId) return
    try {
      updateNodeProperty(
        inputNodeId,
        `{"gridfinityStore":${JSON.stringify(gridfinityState)}}`
      )
      await evaluateGraph()
    } catch (error) {
      console.error("Error updating graph:", error)
    }
  }, [inputNodeId, gridfinityState, updateNodeProperty, evaluateGraph])

  return (
    <>
      
      <Header onClickDL={handleDLView} />
      <LeftBar />
      <RightBar />
      
      {/* Plan画面 */}
      {currentNav === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-full h-full pointer-events-auto">
            <GridView />
          </div>
        </div>
      )}
      {
        currentNav === 1 && (
          <Canvas />
        )
      }
      
      {/* Preview画面はCanvasが既に表示されている */}
    </>
  )
}
