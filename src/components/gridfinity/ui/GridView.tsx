import { useState, useRef, useCallback, useMemo } from "react"
import { useGridfinityStore, VIRTUAL_GRID_MAX_ROWS, VIRTUAL_GRID_MAX_COLS } from "@/stores/gridfinity"
import { GridBin } from "./GridBin"
import { DimensionLabel } from "./DimensionLabel"

export const GridView = () => {
  const { totalRows, totalCols, bins, addBin, updateBin, removeBin } = useGridfinityStore()
  const [isDragging, setIsDragging] = useState(false)
  const [resizingBinIndex, setResizingBinIndex] = useState<number | null>(null)
  const [startCell, setStartCell] = useState<[number, number] | null>(null)
  const [endCell, setEndCell] = useState<[number, number] | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // virtualGridを計算: 既存bins + 作成中のbinを包含し、上下左右に1マス余白を持つ
  const virtualGrid = useMemo(() => {
    let minX = 0
    let minY = 0
    let maxX = totalRows
    let maxY = totalCols

    // 既存binsの範囲を計算
    bins.forEach((bin) => {
      if (bin.start[0] < minX) minX = bin.start[0]
      if (bin.start[1] < minY) minY = bin.start[1]
      const endX = bin.start[0] + bin.rows
      const endY = bin.start[1] + bin.cols
      if (endX > maxX) maxX = endX
      if (endY > maxY) maxY = endY
    })

    // 作成中/リサイズ中のbinを考慮
    if (startCell && endCell) {
      const minCol = Math.min(startCell[0], endCell[0])
      const maxCol = Math.max(startCell[0], endCell[0])
      const minRow = Math.min(startCell[1], endCell[1])
      const maxRow = Math.max(startCell[1], endCell[1])
      
      if (minCol < minX) minX = minCol
      if (minRow < minY) minY = minRow
      const previewEndX = maxCol + 1
      const previewEndY = maxRow + 1
      if (previewEndX > maxX) maxX = previewEndX
      if (previewEndY > maxY) maxY = previewEndY
    }

    // 上下左右に1マス余白を追加
    const calculatedRows = maxX - minX + 2 // +1 (範囲) + 1 (右余白)
    const calculatedCols = maxY - minY + 2 // +1 (範囲) + 1 (下余白)
    
    return {
      rows: Math.min(calculatedRows, VIRTUAL_GRID_MAX_ROWS),
      cols: Math.min(calculatedCols, VIRTUAL_GRID_MAX_COLS),
      offsetX: minX - 1, // 左に1マス余白
      offsetY: minY - 1, // 上に1マス余白
    }
  }, [totalRows, totalCols, bins, startCell, endCell])

  // マウス座標からグリッドセルの座標を取得（virtualGridベース、オフセット適用）
  const getCellFromMouse = useCallback((e: React.MouseEvent<HTMLDivElement>): [number, number] | null => {
    if (!gridRef.current) return null
    
    const rect = gridRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const cellWidth = rect.width / virtualGrid.rows
    const cellHeight = rect.height / virtualGrid.cols
    
    const col = Math.floor(x / cellWidth)
    const row = Math.floor(y / cellHeight)
    
    // 範囲チェック（virtualGridの範囲内）
    if (col >= 0 && col < virtualGrid.rows && row >= 0 && row < virtualGrid.cols) {
      // オフセットを適用して実際の座標を返す
      return [col + virtualGrid.offsetX, row + virtualGrid.offsetY]
    }
    return null
  }, [virtualGrid])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const cell = getCellFromMouse(e)
    if (cell) {
      setIsDragging(true)
      setStartCell(cell)
      setEndCell(cell)
    }
  }, [getCellFromMouse])

  const handleResizeStart = useCallback((index: number) => {
    const bin = bins[index]
    setResizingBinIndex(index)
    setStartCell(bin.start)
    setEndCell(bin.end)
  }, [bins])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const cell = getCellFromMouse(e)
    if (!cell) return

    if (isDragging && startCell) {
      setEndCell(cell)
    } else if (resizingBinIndex !== null && startCell) {
      // リサイズ中は左上固定で右下を動かす
      const [startCol, startRow] = startCell
      let [mouseCol, mouseRow] = cell
      
      // 左上より小さくならないように制限（1x1以上）
      mouseCol = Math.max(mouseCol, startCol)
      mouseRow = Math.max(mouseRow, startRow)
      
      setEndCell([mouseCol, mouseRow])
    }
  }, [isDragging, resizingBinIndex, startCell, getCellFromMouse])

  // Bin同士が重複しているかチェック
  const isOverlapping = useCallback((bin1: { start: [number, number], end: [number, number] }, bin2: { start: [number, number], end: [number, number] }): boolean => {
    const [minCol1, minRow1] = bin1.start
    const [maxCol1, maxRow1] = bin1.end
    const [minCol2, minRow2] = bin2.start
    const [maxCol2, maxRow2] = bin2.end
    
    return !(
      maxCol1 < minCol2 ||
      maxCol2 < minCol1 ||
      maxRow1 < minRow2 ||
      maxRow2 < minRow1
    )
  }, [])

  const handleMouseUp = useCallback(() => {
    if (startCell && endCell) {
      const minCol = Math.min(startCell[0], endCell[0])
      const maxCol = Math.max(startCell[0], endCell[0])
      const minRow = Math.min(startCell[1], endCell[1])
      const maxRow = Math.max(startCell[1], endCell[1])
      
      const horizontalSize = maxCol - minCol + 1
      const verticalSize = maxRow - minRow + 1
      
      const newBinData = {
        start: [minCol, minRow] as [number, number],
        end: [maxCol, maxRow] as [number, number],
        rows: horizontalSize,
        cols: verticalSize,
      }

      // 重複チェック（自分自身は除外）
      const hasOverlap = bins.some((existingBin, index) => {
        if (index === resizingBinIndex) return false
        return isOverlapping(newBinData, existingBin)
      })
      
      if (!hasOverlap) {
        if (resizingBinIndex !== null) {
          // リサイズ更新
          const existingBin = bins[resizingBinIndex]
          updateBin(resizingBinIndex, {
            ...existingBin,
            ...newBinData,
          })
        } else if (isDragging) {
          // 新規作成
          addBin({
            u: 3,
            unitSize: 42,
            layer: 0,
            ...newBinData,
          })
        }
      }
    }
      
    // リセット
    setIsDragging(false)
    setResizingBinIndex(null)
    setStartCell(null)
    setEndCell(null)
  }, [isDragging, resizingBinIndex, startCell, endCell, addBin, updateBin, bins, isOverlapping])

  // 選択範囲を計算（previewBin用）- virtualGridベース（オフセット適用）
  const getSelectionRect = () => {
    if (!startCell || !endCell) return null
    
    const minCol = Math.min(startCell[0], endCell[0])
    const maxCol = Math.max(startCell[0], endCell[0])
    const minRow = Math.min(startCell[1], endCell[1])
    const maxRow = Math.max(startCell[1], endCell[1])
    
    const previewBin = {
      start: [minCol, minRow] as [number, number],
      end: [maxCol, maxRow] as [number, number],
    }

    const hasOverlap = bins.some((existingBin, index) => {
      // リサイズ中の自分自身とは重複チェックしない
      if (index === resizingBinIndex) return false
      return isOverlapping(previewBin, existingBin)
    })
    
    // virtualGridベースで位置を計算（オフセットを考慮）
    const displayCol = minCol - virtualGrid.offsetX
    const displayRow = minRow - virtualGrid.offsetY
    const rows = maxCol - minCol + 1
    const cols = maxRow - minRow + 1
    return {
      left: (displayCol / virtualGrid.rows) * 100,
      top: (displayRow / virtualGrid.cols) * 100,
      width: (rows / virtualGrid.rows) * 100,
      height: (cols / virtualGrid.cols) * 100,
      hasOverlap,
      rows,
      cols,
    }
  }

  const selectionRect = getSelectionRect()
  const ratio = (virtualGrid.rows && virtualGrid.cols) ? virtualGrid.rows / virtualGrid.cols : 1

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div
        ref={gridRef}
        className="relative overflow-hidden "
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: `min(80vw, 1200px, calc(min(80vh, 800px) * ${ratio}))`,
          height: `min(80vh, 800px, calc(min(80vw, 1200px) / ${ratio}))`,
          aspectRatio: `${virtualGrid.rows} / ${virtualGrid.cols}`,
          display: "grid",
          gridTemplateColumns: `repeat(${virtualGrid.rows}, 1fr)`,
          gridTemplateRows: `repeat(${virtualGrid.cols}, 1fr)`,
        }}>
        {/* virtualGridのセル */}
        {Array.from({ length: virtualGrid.cols }).map((_, i) =>
          Array.from({ length: virtualGrid.rows }).map((_, j) => (
            <div
              key={`cell-${i}-${j}`}
              className="absolute"
              style={{
                top: `${(1 / virtualGrid.cols) * 100 * i}%`,
                left: `${(1 / virtualGrid.rows) * 100 * j}%`,
                width: `${(1 / virtualGrid.rows) * 100}%`,
                height: `${(1 / virtualGrid.cols) * 100}%`,
              }}>
              <div
                className={`w-full h-full pr-1 pb-1 ${j == 0 ? "pl-1" : ""} ${
                  i == 0 ? "pt-1" : ""
                }`}>
                <div className="w-full h-full bg-content-xxl-a rounded-sm hover:bg-sub-blue/26 transition-colors" />
              </div>
            </div>
          ))
        )}

        {/* totalRows x totalCols の範囲を示すボーダー（オフセット考慮） */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${((0 - virtualGrid.offsetX) / virtualGrid.rows) * 100}%`,
            top: `${((0 - virtualGrid.offsetY) / virtualGrid.cols) * 100}%`,
            width: `${(totalRows / virtualGrid.rows) * 100}%`,
            height: `${(totalCols / virtualGrid.cols) * 100}%`,
          }}
        />

        {/* 下側の寸法表示（totalCols x 42 mm）*/}
        <div
          className="absolute pointer-events-none text-content-m"
          style={{
            left: `${((0 - virtualGrid.offsetX) / virtualGrid.rows) * 100}%`,
            top: `calc(${
              ((0 - virtualGrid.offsetY + totalCols) / virtualGrid.cols) * 100
            }% + 8px)`,
            width: `${(totalRows / virtualGrid.rows) * 100}%`,
            height: "24px",
          }}>
          <DimensionLabel value={totalRows * 42} orientation="horizontal" />
        </div>

        {/* 右側の寸法表示（totalRows x 42 mm）*/}
        <div
          className="absolute pointer-events-none text-content-m"
          style={{
            left: `calc(${
              ((0 - virtualGrid.offsetX + totalRows) / virtualGrid.rows) * 100
            }% + 8px)`,
            top: `${((0 - virtualGrid.offsetY) / virtualGrid.cols) * 100}%`,
            width: "24px",
            height: `${(totalCols / virtualGrid.cols) * 100}%`,
          }}>
          <DimensionLabel value={totalCols * 42} orientation="vertical" />
        </div>

        {/* 既存のBin (リサイズ中は非表示) - virtualGridベースで表示（オフセット適用） */}
        {bins.map(
          (bin, index) =>
            index !== resizingBinIndex && (
              <GridBin
                key={index}
                bin={bin}
                totalRows={virtualGrid.rows}
                totalCols={virtualGrid.cols}
                offsetX={virtualGrid.offsetX}
                offsetY={virtualGrid.offsetY}
                index={index}
                onResizeStart={handleResizeStart}
                onDelete={removeBin}
              />
            )
        )}

        {/* 選択範囲（previewBin） */}
        {selectionRect && (
          <div
            className={`absolute border-2 border-dashed rounded-sm pointer-events-none flex items-center justify-center ${
              selectionRect.hasOverlap
                ? "bg-system-error-l/30 border-system-error-h"
                : "bg-sub-blue/20 border-sub-blue"
            }`}
            style={{
              left: `${selectionRect.left}%`,
              top: `${selectionRect.top}%`,
              width: `${selectionRect.width}%`,
              height: `${selectionRect.height}%`,
            }}>
            <span className={`text-sm font-display select-none ${
              selectionRect.hasOverlap
                ? "text-system-error-h"
                : "text-sub-blue"
            }`}>
              {selectionRect.rows} × {selectionRect.cols}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
