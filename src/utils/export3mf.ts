import JSZip from "jszip"
import { ManifoldGeometriesWithInfo } from "@/stores/modular"

/**
 * 3MFフォーマットのXMLを生成する
 */
function generate3MFModelXml(geometries: ManifoldGeometriesWithInfo[]): string {
  let objectsXml = ''
  let buildItemsXml = ''

  for (let idx = 0; idx < geometries.length; idx++) {
    const geometryInfo = geometries[idx]
    const objectId = idx + 1
    
    try {
      const geometry = geometryInfo.geometry
      const positions = geometry.getAttribute('position')
      const indices = geometry.getIndex()

      if (!positions || !indices) {
        console.warn(`Skipping geometry ${geometryInfo.label}: invalid data`)
        continue
      }

      // 各オブジェクトの頂点とトライアングルを生成
      let verticesXml = ''
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        const z = positions.getZ(i)
        verticesXml += `          <vertex x="${x}" y="${y}" z="${z}" />\n`
      }
      
      let trianglesXml = ''
      for (let i = 0; i < indices.count; i += 3) {
        const v1 = indices.getX(i)
        const v2 = indices.getX(i + 1)
        const v3 = indices.getX(i + 2)
        trianglesXml += `          <triangle v1="${v1}" v2="${v2}" v3="${v3}" />\n`
      }

      // オブジェクトXMLを追加
      objectsXml += `    <object id="${objectId}" type="model" name="${geometryInfo.label || `object_${objectId}`}">
      <mesh>
        <vertices>
${verticesXml}        </vertices>
        <triangles>
${trianglesXml}        </triangles>
      </mesh>
    </object>
`

      // ビルドアイテムを追加
      buildItemsXml += `    <item objectid="${objectId}" />\n`
    } catch (error) {
      console.error(`Error processing geometry: ${geometryInfo.label}`, error)
    }
  }

  if (!objectsXml) {
    throw new Error("No valid geometries to export")
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <resources>
${objectsXml}  </resources>
  <build>
${buildItemsXml}  </build>
</model>`
}

/**
 * 3MFの[Content_Types].xmlを生成する
 */
function generateContentTypesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
</Types>`
}

/**
 * 3MFの.relsファイルを生成する
 */
function generateRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" />
</Relationships>`
}

/**
 * すべてのBinを個別のオブジェクトとして3MFファイルにエクスポートする
 * @param geometries - エクスポートするgeometry配列
 * @param filename - 出力ファイル名（デフォルト: gridfinity_all.3mf）
 */
export async function exportAs3MF(
  geometries: ManifoldGeometriesWithInfo[],
  filename: string = "gridfinity_all.3mf"
): Promise<void> {
  try {
    const modelXml = generate3MFModelXml(geometries)
    const contentTypesXml = generateContentTypesXml()
    const relsXml = generateRelsXml()
    
    // ZIPファイルを作成
    const zip = new JSZip()
    zip.file("[Content_Types].xml", contentTypesXml)
    zip.folder("_rels")?.file(".rels", relsXml)
    zip.folder("3D")?.file("3dmodel.model", modelXml)
    
    const zipBlob = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error creating 3MF:", error)
    throw error
  }
}

