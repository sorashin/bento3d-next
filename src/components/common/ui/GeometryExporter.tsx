import { useModularStore } from "@/stores/modular"
import { showSaveFilePicker } from "@/utils/filePicker"
import { FC, useCallback, useEffect, useMemo, useState } from "react"
import { DoubleSide, Mesh, MeshStandardMaterial, Object3D } from "three"
import { STLExporter } from "three-stdlib"
import Icon from "./Icon"
import { useTrayStore } from "@/stores/tray"
import { useParams } from "react-router-dom"

const GeometryExporter: FC = () => {
  const [format] = useState<string | null>("stl")
  const geometries = useModularStore((state) => state.geometries)
  const nodes = useModularStore((state) => state.nodes)
  const { totalWidth, totalDepth, totalHeight } = useTrayStore((state) => state)

  const { slug } = useParams<{ slug: string }>()
  const gridCSS = (slug: string) => {
    switch (slug) {
      case "bento3d":
        return `grid-cols-1 md:grid-cols-3 [&>li:first-child]:col-span-full [&>li:not(:first-child)]:col-span-1`
      default:
        return ``
    }
  }

  const geometriesWithInfo = useMemo(() => {
    return geometries.map((geometry) => {
      const gn = nodes.filter(
        (node) => node.id === geometry.id.graphNodeSet?.nodeId
      )
      const label = gn?.[0]?.label
      return { ...geometry, label }
    })
  }, [geometries, nodes])

  const parseMesh = useCallback(
    async (object: Object3D) => {
      switch (format) {
        case "stl": {
          return new STLExporter().parse(object)
        }
      }
      return null
    },
    [format]
  )

  const handleExportSingle = useCallback(
    async (index: number) => {
      if (!format || !geometriesWithInfo[index]) return

      const { id, geometry, label } = geometriesWithInfo[index]
      // IDを含めたファイル名にする - IDは文字列として扱う

      if (format === "json") {
        await showSaveFilePicker({
          generator: () => Promise.resolve(JSON.stringify(geometry)),
          suggestedName: `${label}-W${totalWidth}-D${totalDepth}-H${totalHeight}.${format}`,
          types: [
            {
              description: `${format?.toUpperCase()} file`,
              accept: {
                "application/octet-stream": [`.${format}`],
              },
            },
          ],
        })
      } else {
        await showSaveFilePicker({
          generator: async () => {
            const mesh = new Mesh(
              geometry.clone(),
              new MeshStandardMaterial({
                side: DoubleSide,
              })
            )

            const root = new Object3D()
            root.add(mesh)

            const data = await parseMesh(root)
            return data
          },
          suggestedName: `${label}-W${totalWidth}-D${totalDepth}-H${totalHeight}.${format}`,
          types: [
            {
              description: `${format?.toUpperCase()} file`,
              accept: {
                "application/octet-stream": [`.${format}`],
              },
            },
          ],
        })
      }
    },
    [format, geometries, parseMesh]
  )
  useEffect(() => {
    console.log("geometries", geometries)
  }, [geometries])

  return (
    <div className="p-0">
      {geometriesWithInfo.length > 0 ? (
        <ul className={`grid grid-cols-1 w-full ${gridCSS(slug!)} gap-2`}>
          {geometriesWithInfo.map((geometry, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-2 flex-col gap-1 cursor-pointer rounded-md hover:bg-surface-sheet-m transition"
              onClick={() => handleExportSingle(index)}>
              <Icon
                name={geometry.label || "bento-box"} // 空の場合はデフォルトのアイコン名 "box" を使用
                className="stroke-[2px] stroke-content-m size-2/3"
              />
              <button className="b-button bg-surface-ev1 !text-white items-center !py-1 w-full justify-center hover:!bg-content-h-a">
                <Icon name="download" className="size-4" />
                {geometry.label || `geometry ${index + 1}`}
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
          <p className="text-xs ml-6">Try changing W/D/H size or partition</p>
        </div>
      )}
    </div>
  )
}

export default GeometryExporter
