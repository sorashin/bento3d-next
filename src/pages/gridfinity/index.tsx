
import Canvas from "@/components/gridfinity/3d/Canvas"
import { useModularStore } from "@/stores/modular"
import Module from "manifold-3d"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { geometry2mesh, mesh2geometry } from "@/utils/geometryUtils"
import { BufferGeometry } from "three"
import { RightMenu } from "@/components/gridfinity/ui/RightMenu"
export function Page() {
  const { slug } = useParams<{ slug: string }>()
  const [manifoldModule, setManifoldModule] = useState<Awaited<
    ReturnType<typeof Module>
  > | null>(null)
  const { manifoldGeometries, setManifoldGeometries, geometries } = useModularStore(
    (state) => state
  )

  const processGeometries = useMemo(() => {
    if (!manifoldModule || slug !== "gridfinity") return null

    const { Manifold, Mesh } = manifoldModule
    const gridfinityGeometries = geometries
      .filter((geometry) =>
        ["gridfinity"].some((key) =>
          geometry.label?.includes(key)
        )
      )
      .sort((a, b) => {
        const numA = parseInt(a.label?.match(/\d+/)?.[0] || "0")
        const numB = parseInt(b.label?.match(/\d+/)?.[0] || "0")
        return numA - numB
      })
    console.log("gridfinityGeometries", gridfinityGeometries)
    if (gridfinityGeometries.length < 2) return null

    try {
      const manifolds = gridfinityGeometries.map((geometry) => {
        try {
          const { vertProperties, triVerts } = geometry2mesh(geometry.geometry)
          const mesh = new Mesh({ numProp: 3, vertProperties, triVerts })
          mesh.merge()
          return new Manifold(mesh)
        } catch (e) {
          console.error(
            `このジオメトリでManifold化に失敗: label=${
              geometry.label
            }, id=${JSON.stringify(geometry.id)}`,
            geometry,
            e
          )
          return null
        }
      })

      // gridfinityの処理
      const gridfinity001Index = gridfinityGeometries.findIndex(
        (g) => g.label === "gridfinity001"
      )
      const gridfinity002s = gridfinityGeometries.filter((g) => g.label === "gridfinity002")
      const gridfinity002Manifolds = gridfinity002s.map((g) => {
        const { vertProperties, triVerts } = geometry2mesh(g.geometry)
        const mesh = new Mesh({ numProp: 3, vertProperties, triVerts })
        mesh.merge()
        return new Manifold(mesh)
      })

      let gridfinityResult = manifolds[gridfinity001Index]
      for (const gridfinity002 of gridfinity002Manifolds) {
        gridfinityResult = Manifold.union(gridfinityResult!, gridfinity002)
      }
      

      return [
        {
          label: "gridfinity",
          id: "gridfinity",
          geometry: mesh2geometry(gridfinityResult!.getMesh()),
        }
      ]
    } catch (error) {
      console.error("Error processing geometry:", error)
      return null
    }
  }, [manifoldModule, slug, geometries])

  useEffect(() => {
    if (slug === "gridfinity" && processGeometries) {
      setManifoldGeometries(
        processGeometries.filter(
          (g): g is { label: string; id: string; geometry: BufferGeometry } =>
            g.geometry !== undefined
        )
      )
    }
  }, [slug, processGeometries])

  useEffect(() => {
    const initManifold = async () => {
      const wasm = await Module()
      wasm.setup()
      setManifoldModule(wasm)
    }
    initManifold()
  }, [])


  return (
    <>
      <Canvas />
      <RightMenu />
    </>
  )
}
