import { RightMenu as CommonRightMenu } from "@/components/common/ui/RightMenu"
import GeometryExporter from "./GeometryExporter"

export const RightMenu = () => {
  return (
    <CommonRightMenu
      geometryExporter={<GeometryExporter />}
      showGeometryExporterAtNav={1}
      showAdditionalLinks={false}
    />
  )
}

