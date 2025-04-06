import { Line } from "@react-three/drei"
import { Vector2, Vector3 } from "three"
import { rectAtom, Wall } from "@/stores/rect"

import { Rect } from "./Rect"
import { useCallback, useEffect } from "react"
import { shelfDepthAtom } from "@/stores/settings"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { mutableWallAtom } from "@/stores/rect"
import { GeometrySelection, selectedGeometryAtom } from "@/stores/select"
import { Ruler } from "./Ruler"
import { WallElement } from "./WallElement"
import { rectNodeIdAtom, updateNodePropertyAtom } from "@/stores/modular"

type WallProps = {
  wall: Wall
}

export const WallElem = (props: WallProps) => {
  const { start, end, id, align, grid } = props.wall
  const shelfDepth = useAtomValue(shelfDepthAtom)
  const setMutableWall = useSetAtom(mutableWallAtom)
  const [, setSelectedElement] = useAtom(selectedGeometryAtom)
  const [, updateNodeProperty] = useAtom(updateNodePropertyAtom)
  const [rectNodeId] = useAtom(rectNodeIdAtom)

  // 壁の方向ベクトルを計算
  const direction = new Vector2().subVectors(end, start).normalize()

  const walls = useAtomValue(mutableWallAtom)
  const rects = useAtomValue(rectAtom)
  //start-end間の長さを計算
  const length = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  )

  // Rectを削除する関数
  const handleRectSelect = useCallback(
    (rectId: string) => {
      const updatedSelectState: GeometrySelection = {
        id: rectId,
        type: "rect",
        fit_view: false,
      }
      setSelectedElement(updatedSelectState)
    },
    [props.wall.id, setMutableWall, walls]
  )
  const handleRectResize = useCallback(
    (rectId: string, newWidth: number) => {
      const updatedWalls = walls.map((wall) => {
        if (wall.id === props.wall.id) {
          return {
            ...wall,
            grid: wall.grid.map((gridItem) => {
              if (gridItem.id === rectId) {
                return { ...gridItem, width: newWidth }
              }
              return gridItem
            }),
          }
        }
        return wall
      })
      setMutableWall(updatedWalls)
    },
    [props.wall.id, setMutableWall, walls]
  )
  const handleRectDelete = useCallback(
    (rectId: string) => {
      const updatedWalls = walls.map((wall) => {
        if (wall.id === props.wall.id) {
          return {
            ...wall,
            grid: wall.grid.filter((gridItem) => gridItem.id !== rectId),
          }
        }
        return wall
      })
      setMutableWall(updatedWalls)
    },
    [props.wall.id, setMutableWall, walls]
  )

  useEffect(() => {
    if (!walls || !rectNodeId) return
    updateNodeProperty({
      id: rectNodeId!,
      value: `{"rects":${JSON.stringify(rects)}}`,
    })
  }, [setMutableWall, walls])

  return (
    <>
      <WallElement start={start} end={end} />

      <Ruler start={start} end={end} value={length} setValue={() => {}} />

      {grid.map((g, index) => {
        // 前のグリッドの幅の合計を計算（現在のインデックスまで）
        const previousWidths = grid
          .slice(0, index)
          .reduce((sum, item) => sum + item.width, 0)

        // startPointを算出：startの座標から方向ベクトルに沿って移動
        const gridStartPoint = new Vector2(
          start.x + direction.x * previousWidths,
          start.y + direction.y * previousWidths
        )

        return (
          <Rect
            id={g.id}
            key={g.id}
            width={g.width}
            height={shelfDepth}
            startPos={gridStartPoint}
            dir={direction}
            onClick={() => handleRectSelect(g.id)} // クリックイベントを追加
            onResize={(id, width) => handleRectResize(id, width)} // リサイズイベントを追加
            onDelete={() => handleRectDelete(g.id)} // 選択イベントを追加
          />
        )
      })}
    </>
  )
}
