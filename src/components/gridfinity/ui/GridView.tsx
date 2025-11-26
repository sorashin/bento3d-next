import { useState, useRef, useCallback } from "react"
import { useGridfinityStore } from "@/stores/gridfinity"
import { GridBin } from "./GridBin"

export const GridView = () => {
  const { totalRows, totalCols, bins, addBin, updateBin, removeBin } = useGridfinityStore()
  const [isDragging, setIsDragging] = useState(false)
  const [resizingBinIndex, setResizingBinIndex] = useState<number | null>(null)
  const [startCell, setStartCell] = useState<[number, number] | null>(null)
  const [endCell, setEndCell] = useState<[number, number] | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // マウス座標からグリッドセルの座標を取得
  const getCellFromMouse = useCallback((e: React.MouseEvent<HTMLDivElement>): [number, number] | null => {
    if (!gridRef.current) return null
    
    const rect = gridRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const cellWidth = rect.width / totalRows
    const cellHeight = rect.height / totalCols
    
    const col = Math.floor(x / cellWidth)
    const row = Math.floor(y / cellHeight)
    
    // 範囲チェック
    if (col >= 0 && col < totalRows && row >= 0 && row < totalCols) {
      return [col, row]
    }
    return null
  }, [totalRows, totalCols])

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

  // 選択範囲を計算（previewBin用）
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
    
    return {
      left: (minCol / totalRows) * 100,
      top: (minRow / totalCols) * 100,
      width: ((maxCol - minCol + 1) / totalRows) * 100,
      height: ((maxRow - minRow + 1) / totalCols) * 100,
      hasOverlap,
    }
  }

  const selectionRect = getSelectionRect()
  const ratio = (totalRows && totalCols) ? totalRows / totalCols : 1

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div
        ref={gridRef}
        className="relative border-2 border-content-l rounded-md overflow-hidden bg-white p-1"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: `min(80vw, 1200px, calc(min(80vh, 800px) * ${ratio}))`,
          height: `min(80vh, 800px, calc(min(80vw, 1200px) / ${ratio}))`,
          aspectRatio: `${totalRows} / ${totalCols}`,
          display: "grid",
          gridTemplateColumns: `repeat(${totalRows}, 1fr)`,
          gridTemplateRows: `repeat(${totalCols}, 1fr)`,
          // gap: `4px`,
        }}>
        {/* グリッド線 */}
        {/* {Array.from({ length: totalCols - 1 }).map((_, i) => (
          <div
            key={`row-${i}`}
            className="absolute w-full h-full border-t border-content-xl-a bg-system-error-l"
            style={{ top: `${((i + 1) / totalCols) * 100}%` }}
          />
        ))}
        {Array.from({ length: totalRows - 1 }).map((_, i) => (
          <div
            key={`col-${i}`}
            className="absolute h-full border-l border-content-xl-a"
            style={{ left: `${((i + 1) / totalRows) * 100}%` }}
          />
        ))} */}
        {/* グリッド線 */}
        {Array.from({ length: totalCols  }).map((_, i) => (
          Array.from({ length: totalRows  }).map((_, j) => (
          <div
            key={`col-${i}-${j}`}
            className="absolute"
            style={{ 
              top: `${(1 / totalCols) * 100 * i}%`,
              left: `${(1 / totalRows) * 100 * j}%`,
              width: `${(1 / totalRows) * 100}%`,
              height: `${(1 / totalCols) * 100}%`,
             }}
          >
            <div className={`w-full h-full pr-1 pb-1 ${j==0?"pl-1":""} ${i==0 ? "pt-1" : ""}`} >
              <div className="w-full h-full bg-content-xxl-a rounded-sm hover:bg-content-xl-a" />
            </div>
          </div>
        ))
        ))}
        

        {/* 既存のBin (リサイズ中は非表示) */}
        {bins.map(
          (bin, index) =>
            index !== resizingBinIndex && (
              <GridBin
                key={index}
                bin={bin}
                totalRows={totalRows}
                totalCols={totalCols}
                index={index}
                onResizeStart={handleResizeStart}
                onDelete={removeBin}
              />
            )
        )}

        {/* 選択範囲（previewBin） */}
        {selectionRect && (
          <div
            className={`absolute border-2 border-dashed rounded-sm pointer-events-none ${
              selectionRect.hasOverlap
                ? "bg-system-error-l/30 border-system-error-h"
                : "bg-sub-blue/20 border-sub-blue"
            }`}
            style={{
              left: `${selectionRect.left}%`,
              top: `${selectionRect.top}%`,
              width: `${selectionRect.width}%`,
              height: `${selectionRect.height}%`,
            }}
          />
        )}
      </div>
    </div>
  )
}
