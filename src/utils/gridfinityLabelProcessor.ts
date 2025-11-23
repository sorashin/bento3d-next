import { GeometryWithId } from "@/stores/modular"
import { ManifoldGeometriesWithInfo } from "@/stores/modular"
import { Bin } from "@/stores/gridfinity"

/**
 * GridfinityStoreの情報を元に、geometry配列にlabelを付与する関数
 * 
 * ルール:
 * - 各Binごとに、base用のgeometry（1つ）とunion用のgeometry（rows × cols個）が順番に並んでいる
 * - labelの命名規則: bin{番号}_base, bin{番号}_union
 * 
 * @param geometries - modular store内のgeometries配列
 * @param bins - GridfinityStoreのbins配列
 * @returns geometryBooleanProcessorに渡せる形式の配列
 */
export function gridfinityLabelProcessor(
  geometries: GeometryWithId[],
  bins: Bin[]
): ManifoldGeometriesWithInfo[] {
  const result: ManifoldGeometriesWithInfo[] = []
  let geometryIndex = 0

  // 各Binごとに処理
  for (let binIndex = 0; binIndex < bins.length; binIndex++) {
    const bin = bins[binIndex]
    const binNumber = String(binIndex + 1).padStart(3, '0') // bin001, bin002, ...
    const unionCount = bin.rows * bin.cols

    // base用のgeometry（1つ）
    if (geometryIndex < geometries.length) {
      const baseGeometry = geometries[geometryIndex]
      result.push({
        label: `bin${binNumber}_base`,
        id: JSON.stringify(baseGeometry.id), // GeometryIdentifierを文字列に変換
        geometry: baseGeometry.geometry,
      })
      geometryIndex++
    }

    // union用のgeometry（rows × cols個）
    for (let i = 0; i < unionCount; i++) {
      if (geometryIndex < geometries.length) {
        const unionGeometry = geometries[geometryIndex]
        result.push({
          label: `bin${binNumber}_union`,
          id: JSON.stringify(unionGeometry.id), // GeometryIdentifierを文字列に変換
          geometry: unionGeometry.geometry,
        })
        geometryIndex++
      }
    }
  }

  // 残りのgeometry（binsの数より多い場合）はそのまま追加（labelなし）
  while (geometryIndex < geometries.length) {
    const remainingGeometry = geometries[geometryIndex]
    result.push({
      label: "",
      id: JSON.stringify(remainingGeometry.id),
      geometry: remainingGeometry.geometry,
    })
    geometryIndex++
  }

  return result
}

