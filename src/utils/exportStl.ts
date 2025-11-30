import JSZip from "jszip"
import {
  DoubleSide,
  Mesh as ThreeMesh,
  MeshStandardMaterial,
  Object3D,
} from "three"
import { STLExporter } from "three-stdlib"
import { ManifoldGeometriesWithInfo } from "@/stores/modular"

/**
 * すべてのgeometryをSTL形式でZIPファイルにまとめてエクスポートする
 * @param geometries - エクスポートするgeometry配列
 * @param filename - 出力ファイル名（デフォルト: gridfinity_all_bins.zip）
 */
export async function exportAllAsSTLZip(
  geometries: ManifoldGeometriesWithInfo[],
  filename: string = "gridfinity_all_bins.zip"
): Promise<void> {
  try {
    const zip = new JSZip()
    
    for (const geometry of geometries) {
      const mesh = new ThreeMesh(
        geometry.geometry,
        new MeshStandardMaterial({ side: DoubleSide })
      )
      const root = new Object3D()
      root.add(mesh)
      const exporter = new STLExporter()
      const stlData = exporter.parse(root)
      const fileName = `${geometry.label || "gridfinity"}.stl`
      zip.file(fileName, stlData)
    }
    
    const zipBlob = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error creating ZIP:", error)
    throw error
  }
}

