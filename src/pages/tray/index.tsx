import Canvas from "@/components/bento3d/3d/Canvas"
import GeometryExporter from "@/components/common/ui/GeometryExporter"
import { GridEditor } from "@/components/common/ui/GridEditor"
import { Header } from "@/components/common/ui/Header"

export function Page() {
  return (
    <>
      <Canvas />
      {/* UI実装など */}
      <Header />
      <div className="absolute bottom-16 right-16">
        <GeometryExporter />
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="flex items-center justify-center w-1/2 h-1/2">
          <GridEditor />
        </div>
      </div>
    </>
  )
}
