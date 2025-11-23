import { BufferGeometry } from "three"
import { ManifoldGeometriesWithInfo } from "@/stores/modular"
import { mesh2geometry, geometry2mesh } from "./geometryUtils"

type ManifoldModule = Awaited<ReturnType<typeof import("manifold-3d")>>

/**
 * 命名規則に基づいてgeometryをboolean処理する汎用関数
 * 
 * 命名規則:
 * - [グループ名]_base: ベースとなるgeometry
 * - [グループ名]_union: unionするgeometry（複数存在可能）
 * - [グループ名]_diff: differenceするgeometry（複数存在可能）
 * 
 * 処理フロー:
 * 1. baseにunionを順次union（複数存在する場合も考慮）
 * 2. その結果からdiffを順次difference
 * 3. 命名規則に当てはまらないgeometryはそのまま返す
 * 
 * @param geometriesWithInfo - 処理対象のgeometry配列
 * @param manifoldModule - Manifold3Dモジュール（nullの場合は処理をスキップ）
 * @returns 処理済みgeometryの配列（元の構造を保持）
 */
export function geometryBooleanProcessor(
  geometriesWithInfo: (ManifoldGeometriesWithInfo & { label?: string })[],
  manifoldModule: ManifoldModule | null
): ManifoldGeometriesWithInfo[] {
  if (!manifoldModule) {
    // manifoldModuleがnullの場合は、そのまま返す
    return geometriesWithInfo.map((g) => ({
      label: g.label || "",
      id: g.id,
      geometry: g.geometry,
    }))
  }

  const { Manifold, Mesh } = manifoldModule

  // 命名規則に従うgeometryと従わないgeometryを分離
  const groupedGeometries = new Map<string, {
    base?: ManifoldGeometriesWithInfo & { label?: string }
    unions: (ManifoldGeometriesWithInfo & { label?: string })[]
    diffs: (ManifoldGeometriesWithInfo & { label?: string })[]
  }>()
  const ungroupedGeometries: (ManifoldGeometriesWithInfo & { label?: string })[] = []

  // geometryを分類
  for (const geometry of geometriesWithInfo) {
    const label = geometry.label
    if (!label) {
      ungroupedGeometries.push(geometry)
      continue
    }

    // 命名規則に従うかチェック: [グループ名]_base, [グループ名]_union, [グループ名]_diff
    const baseMatch = label.match(/^(.+)_base$/)
    const unionMatch = label.match(/^(.+)_union$/)
    const diffMatch = label.match(/^(.+)_diff$/)

    if (baseMatch) {
      const groupName = baseMatch[1]
      if (!groupedGeometries.has(groupName)) {
        groupedGeometries.set(groupName, { unions: [], diffs: [] })
      }
      groupedGeometries.get(groupName)!.base = geometry
    } else if (unionMatch) {
      const groupName = unionMatch[1]
      if (!groupedGeometries.has(groupName)) {
        groupedGeometries.set(groupName, { unions: [], diffs: [] })
      }
      groupedGeometries.get(groupName)!.unions.push(geometry)
    } else if (diffMatch) {
      const groupName = diffMatch[1]
      if (!groupedGeometries.has(groupName)) {
        groupedGeometries.set(groupName, { unions: [], diffs: [] })
      }
      groupedGeometries.get(groupName)!.diffs.push(geometry)
    } else {
      // 命名規則に当てはまらないgeometry
      ungroupedGeometries.push(geometry)
    }
  }

  const result: ManifoldGeometriesWithInfo[] = []

  // 各グループを処理
  for (const [groupName, group] of groupedGeometries.entries()) {
    // baseが存在しない場合はスキップ
    if (!group.base) {
      // baseがない場合、union/diffはそのまま返す
      for (const union of group.unions) {
        result.push({
          label: union.label || "",
          id: union.id,
          geometry: union.geometry,
        })
      }
      for (const diff of group.diffs) {
        result.push({
          label: diff.label || "",
          id: diff.id,
          geometry: diff.geometry,
        })
      }
      continue
    }

    try {
      // baseをManifoldに変換
      const { vertProperties, triVerts } = geometry2mesh(group.base.geometry)
      const baseMesh = new Mesh({ numProp: 3, vertProperties, triVerts })
      baseMesh.merge()
      let resultManifold = new Manifold(baseMesh)

      // unionを順次適用
      for (const unionGeometry of group.unions) {
        try {
          const { vertProperties, triVerts } = geometry2mesh(unionGeometry.geometry)
          const unionMesh = new Mesh({ numProp: 3, vertProperties, triVerts })
          unionMesh.merge()
          const unionManifold = new Manifold(unionMesh)
          resultManifold = Manifold.union(resultManifold, unionManifold)
        } catch (error) {
          console.error(
            `Error processing union geometry: label=${unionGeometry.label}, id=${unionGeometry.id}`,
            error
          )
          // unionに失敗した場合はスキップして続行
        }
      }

      // diffを順次適用
      for (const diffGeometry of group.diffs) {
        try {
          const { vertProperties, triVerts } = geometry2mesh(diffGeometry.geometry)
          const diffMesh = new Mesh({ numProp: 3, vertProperties, triVerts })
          diffMesh.merge()
          const diffManifold = new Manifold(diffMesh)
          resultManifold = Manifold.difference(resultManifold, diffManifold)
        } catch (error) {
          console.error(
            `Error processing diff geometry: label=${diffGeometry.label}, id=${diffGeometry.id}`,
            error
          )
          // diffに失敗した場合はスキップして続行
        }
      }

      // 結果をThree.js geometryに変換
      const processedGeometry = mesh2geometry(resultManifold.getMesh())
      result.push({
        label: groupName,
        id: group.base.id,
        geometry: processedGeometry,
      })
    } catch (error) {
      console.error(
        `Error processing group ${groupName}:`,
        error
      )
      // グループ処理に失敗した場合は、baseをそのまま返す
      result.push({
        label: group.base.label || groupName,
        id: group.base.id,
        geometry: group.base.geometry,
      })
    }
  }

  // 命名規則に当てはまらないgeometryをそのまま追加
  for (const geometry of ungroupedGeometries) {
    result.push({
      label: geometry.label || "",
      id: geometry.id,
      geometry: geometry.geometry,
    })
  }

  return result
}

