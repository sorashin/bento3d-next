import Canvas from "@/components/bento3d/3d/Canvas"
import GeometryExporter from "@/components/common/ui/GeometryExporter"
import { GridEditor } from "@/components/common/ui/GridEditor"
import { Header } from "@/components/common/ui/Header"
import { LeftMenu } from "@/components/common/ui/LeftMenu"
import { RightMenu } from "@/components/common/ui/RightMenu"
import { RangeSlider } from "@/components/common/ui/Slider"
import { useModularStore } from "@/stores/modular"
import { useNavigationStore } from "@/stores/navigation"
import { useTrayStore } from "@/stores/tray"
import { useEffect } from "react"

export function Page() {
  const { currentNav } = useNavigationStore()
  const trayState = useTrayStore()
  const { thickness } = useTrayStore((state) => state)
  const { inputNodeId, updateNodeProperty } = useModularStore((state) => state)

  useEffect(() => {
    console.log("trayStore state:", trayState)
    if (!inputNodeId) return
    updateNodeProperty(
      inputNodeId!,
      `{"trayStore":${JSON.stringify(trayState)}}`
    )
  }, [trayState, inputNodeId])

  return (
    <>
      <Header />
      <div className="absolute bottom-16 right-16 z-20">
        <GeometryExporter />
      </div>

      {/* Canvas は常に表示し続ける */}
      <Canvas />

      {/* UIコンポーネントだけを条件付きで表示 */}
      {currentNav == 0 && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <RangeSlider min={30} max={400} label={"width"} position={"bottom"} />
          <RangeSlider
            min={thickness}
            max={200}
            label={"height"}
            position={"right"}
          />
          <RangeSlider min={30} max={400} label={"depth"} position={"left"} />
        </div>
      )}

      {currentNav == 1 && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex items-center justify-center w-1/2 h-1/2">
            <GridEditor />
          </div>
        </div>
      )}
      <LeftMenu />
      <RightMenu step={2} />
    </>
  )
}
