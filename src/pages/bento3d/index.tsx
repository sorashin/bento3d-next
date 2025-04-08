import Canvas from "@/components/bento3d/3d/Canvas"
import GeometryExporter from "@/components/common/ui/GeometryExporter"
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
    </>
  )
}
