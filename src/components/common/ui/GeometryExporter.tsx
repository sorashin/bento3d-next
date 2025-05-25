import { useModularStore } from "@/stores/modular"
import { showSaveFilePicker } from "@/utils/filePicker"
import { FC, useCallback, useEffect, useMemo, useState } from "react"
import {
  BufferGeometry,
  DoubleSide,
  Mesh as ThreeMesh,
  MeshStandardMaterial,
  Object3D,
  BufferAttribute,
} from "three"
import { STLExporter } from "three-stdlib"
import Icon from "./Icon"
import { useTrayStore } from "@/stores/tray"
import { useParams } from "react-router-dom"
import { GeometryIdentifier } from "nodi-modular"
import Module from "manifold-3d"
import { convertGeometryInteropToJson } from "@/utils/geometryUtils"

// Convert Manifold Mesh to Three.js BufferGeometry
function mesh2geometry(mesh: any) {
  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new BufferAttribute(mesh.vertProperties, 3))
  geometry.setIndex(new BufferAttribute(mesh.triVerts, 1))
  return geometry
}

// Convert Three.js BufferGeometry to Manifold Mesh
function geometry2mesh(geometry: BufferGeometry) {
  const positions = geometry.getAttribute("position")
  const indices = geometry.getIndex()

  const vertProperties = new Float32Array(positions.array)
  const triVerts = new Uint32Array(indices ? indices.array : [])

  return { vertProperties, triVerts }
}

const GeometryExporter: FC = () => {
  const [format] = useState<string | null>("stl")
  const geometries = useModularStore((state) => state.geometries)
  const nodes = useModularStore((state) => state.nodes)
  const { totalWidth, totalDepth, totalHeight } = useTrayStore((state) => state)
  const [manifoldModule, setManifoldModule] = useState<any>(null)

  useEffect(() => {
    const initManifold = async () => {
      const wasm = await Module()
      wasm.setup()
      setManifoldModule(wasm)
    }
    initManifold()
  }, [])

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

  const processedGeometry = useMemo(() => {
    if (!manifoldModule || slug !== "tray") return null

    const { Manifold, Mesh } = manifoldModule
    const trayGeometries = geometriesWithInfo
      .filter((geometry) => geometry.label?.includes("tray"))
      .sort((a, b) => {
        const numA = parseInt(a.label?.match(/\d+/)?.[0] || "0")
        const numB = parseInt(b.label?.match(/\d+/)?.[0] || "0")
        return numA - numB
      })
    console.log("trayGeometries", trayGeometries)
    if (trayGeometries.length < 4) return null

    try {
      // Convert geometries to Manifold meshes
      const manifolds = trayGeometries.map((geometry) => {
        const { vertProperties, triVerts } = geometry2mesh(geometry.geometry)
        const mesh = new Mesh({ numProp: 3, vertProperties, triVerts })
        mesh.merge()
        return new Manifold(mesh)
      })

      // // tray001を取得
      const tray001 = trayGeometries.find((g) => g.label == "tray001")

      // // tray002をすべて取得
      const tray002s = trayGeometries.filter((g) => g.label === "tray002")
      console.log("tray002s", tray002s, "tray001", tray001)

      // Manifoldに変換

      const tray002Manifolds = tray002s.map((g) => {
        const { vertProperties, triVerts } = geometry2mesh(g.geometry)
        const mesh = new Mesh({ numProp: 3, vertProperties, triVerts })
        mesh.merge()

        return new Manifold(mesh)
      })
      console.log("tray002Manifolds", tray002Manifolds)
      // differenceを順番に適用
      let result = manifolds[0]
      for (const tray002 of tray002Manifolds) {
        //何番目の処理かを表示
        console.log("tray002", tray002, "result", result)
        result = Manifold.difference(result, tray002)
      }

      // 1. tray001 と tray002 の difference
      // let result = Manifold.difference(manifolds[0], manifolds[2])

      // // 2. 1の結果と tray003 の difference
      // result = Manifold.difference(result, manifolds[3])

      // // 3. 2の結果と tray004 の union
      // result = Manifold.union(result, manifolds[3])

      // Convert back to Three.js geometry
      return mesh2geometry(result.getMesh())
    } catch (error) {
      console.error("Error processing geometry:", error)
      return null
    }
  }, [geometriesWithInfo, manifoldModule, slug])

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
            const mesh = new ThreeMesh(
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
      {processedGeometry && (
        <button
          className="b-button bg-surface-ev1 !text-white items-center !py-1 w-full justify-center hover:!bg-content-h-a mb-4"
          onClick={async () => {
            const mesh = new ThreeMesh(
              processedGeometry,
              new MeshStandardMaterial({ side: DoubleSide })
            )
            const root = new Object3D()
            root.add(mesh)
            const exporter = new STLExporter()
            const data = exporter.parse(root)
            const blob = new Blob([data], { type: "application/octet-stream" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `processed-tray.stl`
            a.click()
            URL.revokeObjectURL(url)
          }}>
          <Icon name="download" className="size-4" />
          合成済みトレイをSTLでダウンロード
        </button>
      )}
      {geometriesWithInfo.length > 0 ? (
        <ul className={`grid grid-cols-1 w-full ${gridCSS(slug!)} gap-2`}>
          {/* {geometriesWithInfo.map((geometry, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-2 flex-col gap-1 cursor-pointer rounded-md hover:bg-surface-sheet-m transition"
              onClick={() => handleExportSingle(index)}>
              <Icon
                // name={geometry.label || "bento-box"} // 空の場合はデフォルトのアイコン名 "box" を使用
                name="bento-box"
                className="stroke-[2px] stroke-content-m size-2/3"
              />
              <button className="b-button bg-surface-ev1 !text-white items-center !py-1 w-full justify-center hover:!bg-content-h-a">
                <Icon name="download" className="size-4" />
                {geometry.label || `geometry ${index + 1}`}
              </button>
            </li>
          ))} */}
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
