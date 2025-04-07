import Canvas from "@/components/bento3d/3d/Canvas"
import GeometryExporter from "@/components/common/ui/GeometryExporter"

export function Page() {
  return (
    <>
      <Canvas />
      {/* UI実装など */}
      <div className="absolute bottom-16 right-16">
        <GeometryExporter />
      </div>
    </>
  )
}
