import Canvas from "@/components/gridfinity/3d/Canvas"
import { Header } from "@/components/common/ui/Header"
import { LeftMenu } from "@/components/gridfinity/ui/LeftMenu"
import { RightMenu } from "@/components/gridfinity/ui/RightMenu"
import { GridView } from "@/components/gridfinity/ui/GridView"
import { useModularStore } from "@/stores/modular"
import { gridfinityLabelProcessor } from "@/utils/gridfinityLabelProcessor"
import { useEffect, useState, useCallback } from "react"
import { useGridfinityStore } from "@/stores/gridfinity"
import { geometryBooleanProcessor } from "@/utils/geometryBooleanProcessor"
import { useNavigationStore, nevigations } from "@/stores/navigation"
import { useSettingsStore } from "@/stores/settings"
import Module from "manifold-3d"
import { Toast } from "@/components/common/ui/Toast"
import DialogAd from "@/components/common/ui/DialogAd"
import DialogFeedback from "@/components/common/ui/DialogFeedback"
import DrawerUpdates from "@/components/common/ui/DrawerUpdates"

export function Page() {
  const { geometries, setManifoldGeometries, inputNodeId, updateNodeProperty, evaluateGraph, nodes } = useModularStore()
  const gridfinityState = useGridfinityStore()
  const { bins } = gridfinityState
  const { currentNav, setCurrentNavArray } = useNavigationStore()
  const { setIsPreviewLoad } = useSettingsStore()
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

  // geometry処理 - 3D画面(currentNav === 1)の時だけ実行
  useEffect(() => {
    // Plan画面(currentNav === 0)では重い処理をスキップ
    if (currentNav === 0) return
    if (!manifoldModule) return
    
    const labeledGeometries = gridfinityLabelProcessor(geometries, bins, nodes)
    const gs = geometryBooleanProcessor(
      labeledGeometries,
      manifoldModule
    )
    setManifoldGeometries(gs)
    setIsPreviewLoad(false)
  }, [geometries, bins, nodes, manifoldModule, setManifoldGeometries, setIsPreviewLoad, currentNav])

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
      <LeftMenu />
      <RightMenu />
      <DialogAd />
      <DialogFeedback />
      <DrawerUpdates />
      <Toast />

      {/* Plan画面 */}
      {currentNav === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none bg-surface-base">
          <div className="w-full h-full pointer-events-auto">
            <GridView />
          </div>
        </div>
      )}
      {currentNav === 1 && <Canvas />}

      {/* Preview画面はCanvasが既に表示されている */}
    </>
  )
}
