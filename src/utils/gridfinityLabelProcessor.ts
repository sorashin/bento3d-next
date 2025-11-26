import { GeometryWithId } from "@/stores/modular"
import { ManifoldGeometriesWithInfo } from "@/stores/modular"
import { Bin } from "@/stores/gridfinity"
import { NodeInterop } from "nodi-modular"

/**
 * GridfinityStoreの情報を元に、geometry配列にlabelを付与する関数
 * 
 * ルール:
 * - node.labelが"mesh"以外の場合は、node.labelをそのままラベルとして使用
 * - node.labelが"mesh"の場合は、Binごとの処理を行う
 *   - 各Binごとに、base用のgeometry（1つ）とunion用のgeometry（rows × cols個）が順番に並んでいる
 *   - labelの命名規則: bin_{rows}x{cols}_u{u}_{binNumber}_base, bin_{rows}x{cols}_u{u}_{binNumber}_union
 * 
 * @param geometries - modular store内のgeometries配列
 * @param bins - GridfinityStoreのbins配列
 * @param nodes - modular store内のnodes配列
 * @returns geometryBooleanProcessorに渡せる形式の配列
 */
export function gridfinityLabelProcessor(
  geometries: GeometryWithId[],
  bins: Bin[],
  nodes: NodeInterop[]
): ManifoldGeometriesWithInfo[] {
  const result: ManifoldGeometriesWithInfo[] = []
  
  // geometryからnode.labelを取得するヘルパー関数
  const getNodeLabel = (geometry: GeometryWithId): string | undefined => {
    const nodeId = geometry.id.graphNodeSet?.nodeId
    const node = nodes.find((n) => n.id === nodeId)
    return node?.label
  }

  // node.labelが"mesh"のgeometryと、それ以外を分離
  const meshGeometries: GeometryWithId[] = []
  const nonMeshGeometries: { geometry: GeometryWithId; label: string }[] = []

  for (const geometry of geometries) {
    const nodeLabel = getNodeLabel(geometry)
    if (nodeLabel === "mesh") {
      meshGeometries.push(geometry)
    } else if (nodeLabel) {
      // node.labelが"mesh"以外の場合は、そのままラベルとして使用
      nonMeshGeometries.push({ geometry, label: nodeLabel })
    } else {
      // node.labelがない場合はmeshとして扱う
      meshGeometries.push(geometry)
    }
  }

  // node.labelが"mesh"以外のgeometryは、そのままラベルを付与して追加
  for (const { geometry, label } of nonMeshGeometries) {
    result.push({
      label,
      id: JSON.stringify(geometry.id),
      geometry: geometry.geometry,
    })
  }

  // node.labelが"mesh"のgeometryは、Binごとの処理を行う
  let geometryIndex = 0

  // 各Binごとに処理
  for (let binIndex = 0; binIndex < bins.length; binIndex++) {
    const bin = bins[binIndex]
    const binNumber = String(binIndex + 1).padStart(3, '0') // bin001, bin002, ...
    const unionCount = bin.rows * bin.cols

    // base用のgeometry（1つ）
    if (geometryIndex < meshGeometries.length) {
      const baseGeometry = meshGeometries[geometryIndex]
      result.push({
        label: `bin_${bin.rows}x${bin.cols}_u${bin.u}_${binNumber}_base`,
        id: JSON.stringify(baseGeometry.id), // GeometryIdentifierを文字列に変換
        geometry: baseGeometry.geometry,
      })
      geometryIndex++
    }

    // union用のgeometry（rows × cols個）
    for (let i = 0; i < unionCount; i++) {
      if (geometryIndex < meshGeometries.length) {
        const unionGeometry = meshGeometries[geometryIndex]
        result.push({
          label: `bin_${bin.rows}x${bin.cols}_u${bin.u}_${binNumber}_union`,
          id: JSON.stringify(unionGeometry.id), // GeometryIdentifierを文字列に変換
          geometry: unionGeometry.geometry,
        })
        geometryIndex++
      }
    }
  }

  // 残りのmesh geometry（binsの数より多い場合）はそのまま追加（labelなし）
  while (geometryIndex < meshGeometries.length) {
    const remainingGeometry = meshGeometries[geometryIndex]
    result.push({
      label: "",
      id: JSON.stringify(remainingGeometry.id),
      geometry: remainingGeometry.geometry,
    })
    geometryIndex++
  }

  return result
}

