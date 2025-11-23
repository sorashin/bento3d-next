import GeometryExporter from "@/components/common/ui/GeometryExporter"
import Canvas from "@/components/gridfinity/3d/Canvas"
import { useModularStore } from "@/stores/modular"
import { gridfinityLabelProcessor } from "@/utils/gridfinityLabelProcessor"
import { useEffect, useMemo, useState } from "react"
import { useGridfinityStore } from "@/stores/gridfinity"
import { geometryBooleanProcessor } from "@/utils/geometryBooleanProcessor"
import Module from "manifold-3d"

export function Page() {
  const { geometries, setManifoldGeometries } = useModularStore()
  const { bins } = useGridfinityStore()
  const [manifoldModule, setManifoldModule] = useState<Awaited<ReturnType<typeof Module>> | null>(null)

  // manifoldModuleを初期化
  useEffect(() => {
    const initManifold = async () => {
      const wasm = await Module()
      wasm.setup()
      setManifoldModule(wasm)
    }
    initManifold()
  }, [])

  const geomWId = useMemo(() => {
    const gs = geometryBooleanProcessor(gridfinityLabelProcessor(geometries, bins), manifoldModule)
    setManifoldGeometries(gs)
    console.log("gs", gs)
    return gs
  }, [geometries, bins, manifoldModule, setManifoldGeometries])
  console.log("geomWId", geomWId)
  return (
    <>
      <Canvas />
      <div className="absolute bottom-16 right-16">
        <GeometryExporter />
      </div>
    </>
  )
}
