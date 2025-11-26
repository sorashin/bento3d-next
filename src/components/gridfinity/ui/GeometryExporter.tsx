import { useModularStore } from "@/stores/modular"
import Icon from "@/components/common/ui/Icon"
import { FC } from "react"
import {
  DoubleSide,
  Mesh as ThreeMesh,
  MeshStandardMaterial,
  Object3D,
} from "three"
import { STLExporter } from "three-stdlib"

const GeometryExporter: FC = () => {
  const { manifoldGeometries } = useModularStore()

  return (
    <div className="p-0">
      {manifoldGeometries.length > 0 ? (
        <ul className="grid grid-cols-1 w-full gap-2 max-h-80 overflow-y-auto">
          {manifoldGeometries.map((geometry) => (
            <li
              key={geometry.id}
              onClick={async () => {
                const mesh = new ThreeMesh(
                  geometry.geometry,
                  new MeshStandardMaterial({ side: DoubleSide })
                )
                const root = new Object3D()
                root.add(mesh)
                const exporter = new STLExporter()
                const data = exporter.parse(root)
                const blob = new Blob([data], {
                  type: "application/octet-stream",
                })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `${geometry.label || "gridfinity"}.stl`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="flex justify-between items-center p-2 gap-1 cursor-pointer rounded-md hover:bg-surface-sheet-m transition">
              <Icon
                name={"bin"}
                className="stroke-[2px] text-content-h size-9"
              />
              <p className="text-content-m text-sm grow">{geometry.label || "no-name"}</p>
              <button className="b-button bg-surface-ev1 !text-white items-center !py-1 justify-center hover:!bg-content-h-a">
                <Icon name="download" className="size-6" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-system-error-l flex flex-col items-center justify-center p-2 rounded-md w-full text-system-error-h">
          <div className="flex items-start gap-1 justify-start">
            <Icon name="alert" className="size-6" />
            <h3 className="text-base leading-tight mb-2 font-bold ">
              Failed to generate geometry
            </h3>
          </div>
          <p className="text-xs ml-6">Try changing grid settings or bins</p>
        </div>
      )}
    </div>
  )
}

export default GeometryExporter

