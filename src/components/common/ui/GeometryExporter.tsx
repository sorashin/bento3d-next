import { useModularStore } from "@/stores/modular"
import { showSaveFilePicker } from "@/utils/filePicker"
import { FC, useCallback, useMemo, useState } from "react"
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from "three"
import {
  GLTFExporter,
  OBJExporter,
  PLYExporter,
  STLExporter,
} from "three-stdlib"

const GeometryExporter: FC = () => {
  const [format, setFormat] = useState<string | null>("stl")
  const modular = useModularStore((state) => state.modular)
  const handle = modular

  const variant = useMemo(() => {
    const { surfaces, curves, meshes, points } = spreadsheet ?? {}
    if (surfaces !== undefined && surfaces.length > 0) {
      return "surface"
    } else if (curves !== undefined && curves.length > 0) {
      return "curve"
    } else if (meshes !== undefined && meshes.length > 0) {
      return "mesh"
    } else if (points !== undefined && points.length > 0) {
      return "point"
    }
    return null
  }, [spreadsheet])

  const parseMesh = useCallback(
    async (object: Object3D) => {
      switch (format) {
        case "stl": {
          return new STLExporter().parse(object)
        }
        case "obj": {
          return new OBJExporter().parse(object)
        }
        case "gltf":
        case "glb": {
          const buffer = await new GLTFExporter().parseAsync(object, {
            binary: format === "glb",
          })
          if (buffer instanceof ArrayBuffer) {
            return buffer
          }
          return JSON.stringify(buffer)
        }
        case "ply": {
          return new PLYExporter().parse(object, () => {}, {
            binary: true,
          })
        }
      }
      return null
    },
    [format]
  )

  const handleExport = useCallback(async () => {
    const { surfaces, curves, meshes, points } = spreadsheet ?? {}
    switch (variant) {
      // case "surface": {
      //   if (format === "json") {
      //     await showSaveFilePicker({
      //       generator: () => Promise.resolve(JSON.stringify(surfaces)),
      //       suggestedName: `${variant}.${format}`,
      //       types: [
      //         {
      //           description: `${format?.toUpperCase()} file`,
      //           accept: {
      //             "application/octet-stream": [`.${format}`],
      //           },
      //         },
      //       ],
      //     })
      //     // handleClose()
      //   } else {
      //     await showSaveFilePicker({
      //       generator: async () => {
      //         const objects = (surfaces ?? []).map((surface) => {
      //           const tess = handle?.tessellateSurfaces(
      //             [surface],
      //             surfaceTesselation
      //           )
      //           if (tess === undefined) {
      //             return new Object3D()
      //           }
      //           const { vertices, normals, faces } = tess
      //           const geometry = new BufferGeometry()
      //           const position = new BufferAttribute(
      //             new Float32Array(vertices.flat()),
      //             3
      //           )
      //           const normal = new BufferAttribute(
      //             new Float32Array(normals.flat()),
      //             3
      //           )
      //           geometry.setAttribute("position", position)
      //           geometry.setAttribute("normal", normal)
      //           if (faces !== undefined) {
      //             const index = new BufferAttribute(
      //               new Uint32Array(faces.flat()),
      //               1
      //             )
      //             geometry.setIndex(index)
      //           }
      //           return new Mesh(
      //             geometry,
      //             new MeshStandardMaterial({
      //               side: DoubleSide,
      //             })
      //           )
      //         })

      //         const root = new Object3D()
      //         objects.forEach((mesh) => {
      //           root.add(mesh)
      //         })
      //         const data = await parseMesh(root)
      //         return data
      //       },
      //       suggestedName: `${variant}.${format}`,
      //       types: [
      //         {
      //           description: `${format?.toUpperCase()} file`,
      //           accept: {
      //             "application/octet-stream": [`.${format}`],
      //           },
      //         },
      //       ],
      //     })
      //     // handleClose()
      //     return
      //   }
      //   break
      // }
      // case "curve": {
      //   await showSaveFilePicker({
      //     generator: async () => {
      //       const data = await parseCurve(curves ?? [])
      //       return data
      //     },
      //     suggestedName: `${variant}.${format}`,
      //     types: [
      //       {
      //         description: `${format?.toUpperCase()} file`,
      //         accept: {
      //           "application/octet-stream": [`.${format}`],
      //         },
      //       },
      //     ],
      //   })
      //   handleClose()
      //   return
      // }
      case "mesh": {
        if (format === "json") {
          await showSaveFilePicker({
            generator: () => Promise.resolve(JSON.stringify(meshes)),
            suggestedName: `${variant}.${format}`,
            types: [
              {
                description: `${format?.toUpperCase()} file`,
                accept: {
                  "application/octet-stream": [`.${format}`],
                },
              },
            ],
          })
          // handleClose()
        } else {
          await showSaveFilePicker({
            generator: async () => {
              const objects = (meshes ?? []).map((mesh) => {
                const { vertices, normals, uv, faces } = mesh
                const geometry = new BufferGeometry()
                const positionAttrib = new BufferAttribute(
                  new Float32Array(vertices.flat()),
                  3
                )
                const normalAttrib = new BufferAttribute(
                  new Float32Array(normals.flat()),
                  3
                )
                geometry.setAttribute("position", positionAttrib)
                geometry.setAttribute("normal", normalAttrib)
                if (uv !== undefined) {
                  const uvAttrib = new BufferAttribute(
                    new Float32Array(uv.flat()),
                    2
                  )
                  geometry.setAttribute("uv", uvAttrib)
                }
                if (faces !== undefined) {
                  const index = new BufferAttribute(
                    new Uint32Array(faces.flat()),
                    1
                  )
                  geometry.setIndex(index)
                }
                return new Mesh(
                  geometry,
                  new MeshStandardMaterial({
                    side: DoubleSide,
                  })
                )
              })

              const root = new Object3D()
              objects.forEach((object) => {
                root.add(object)
              })
              const data = await parseMesh(root)
              return data
            },
            suggestedName: `${variant}.${format}`,
            types: [
              {
                description: `${format?.toUpperCase()} file`,
                accept: {
                  "application/octet-stream": [`.${format}`],
                },
              },
            ],
          })
          // handleClose()
          return
        }

        break
      }
    }
  }, [handle, variant, format, parseMesh])

  return (
    <div>
      <button onClick={handleExport}>Export Geometry</button>
    </div>
  )
}
export default GeometryExporter
