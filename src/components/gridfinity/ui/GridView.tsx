import { useState, useRef, useCallback } from "react"
import { useGridfinityStore, Bin } from "@/stores/gridfinity"

export const GridView = () => {
  const { totalRows, totalCols, bins, addBin } = useGridfinityStore()
  const [isDragging, setIsDragging] = useState(false)
  const [startCell, setStartCell] = useState<[number, number] | null>(null)
  const [endCell, setEndCell] = useState<[number, number] | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // マウス座標からグリッドセルの座標を取得
  // totalRows: 横方向（列数）、totalCols: 縦方向（行数）
  const getCellFromMouse = useCallback((e: React.MouseEvent<HTMLDivElement>): [number, number] | null => {
    if (!gridRef.current) return null
    
    const rect = gridRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // totalRowsが横方向（列数）、totalColsが縦方向（行数）
    const cellWidth = rect.width / totalRows
    const cellHeight = rect.height / totalCols
    
    const col = Math.floor(x / cellWidth)
    const row = Math.floor(y / cellHeight)
    
    // 範囲チェック: colは0～totalRows-1、rowは0～totalCols-1
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

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && startCell) {
      const cell = getCellFromMouse(e)
      if (cell) {
        setEndCell(cell)
      }
    }
  }, [isDragging, startCell, getCellFromMouse])

  // Bin同士が重複しているかチェック
  const isOverlapping = useCallback((bin1: { start: [number, number], end: [number, number] }, bin2: { start: [number, number], end: [number, number] }): boolean => {
    const [minCol1, minRow1] = bin1.start
    const [maxCol1, maxRow1] = bin1.end
    const [minCol2, minRow2] = bin2.start
    const [maxCol2, maxRow2] = bin2.end
    
    // 重複チェック: 一方のBinがもう一方のBinと重なっているか
    return !(
      maxCol1 < minCol2 || // bin1がbin2の左側
      maxCol2 < minCol1 || // bin2がbin1の左側
      maxRow1 < minRow2 || // bin1がbin2の上側
      maxRow2 < minRow1   // bin2がbin1の上側
    )
  }, [])

  const handleMouseUp = useCallback(() => {
    if (isDragging && startCell && endCell) {
      // 選択範囲の左上と右下を計算
      // startCell/endCell: [col, row] = [横方向, 縦方向]
      const minCol = Math.min(startCell[0], endCell[0])
      const maxCol = Math.max(startCell[0], endCell[0])
      const minRow = Math.min(startCell[1], endCell[1])
      const maxRow = Math.max(startCell[1], endCell[1])
      
      // ブロックのサイズを計算
      // rows: 横方向のサイズ（列数）、cols: 縦方向のサイズ（行数）
      const horizontalSize = maxCol - minCol + 1  // 横方向（rows）
      const verticalSize = maxRow - minRow + 1    // 縦方向（cols）
      
      // 新しいBinを作成
      const newBin: Bin = {
        u: 3,
        rows: horizontalSize,  // 横方向のサイズ
        cols: verticalSize,    // 縦方向のサイズ
        unitSize: 42,
        start: [minCol, minRow],
        end: [maxCol, maxRow],
        layer: 0,
      }
      
      // 既存のBinと重複していないかチェック
      const hasOverlap = bins.some(existingBin => 
        isOverlapping(newBin, existingBin)
      )
      
      if (!hasOverlap) {
        addBin(newBin)
      }
      
      setIsDragging(false)
      setStartCell(null)
      setEndCell(null)
    }
  }, [isDragging, startCell, endCell, addBin, bins, isOverlapping])

  // 選択範囲を計算（previewBin用）
  const getSelectionRect = () => {
    if (!startCell || !endCell) return null
    
    const minCol = Math.min(startCell[0], endCell[0])
    const maxCol = Math.max(startCell[0], endCell[0])
    const minRow = Math.min(startCell[1], endCell[1])
    const maxRow = Math.max(startCell[1], endCell[1])
    
    // 既存のBinと重複しているかチェック
    const previewBin = {
      start: [minCol, minRow] as [number, number],
      end: [maxCol, maxRow] as [number, number],
    }
    const hasOverlap = bins.some(existingBin => 
      isOverlapping(previewBin, existingBin)
    )
    
    // totalRowsが横方向（列数）、totalColsが縦方向（行数）
    return {
      left: (minCol / totalRows) * 100,
      top: (minRow / totalCols) * 100,
      width: ((maxCol - minCol + 1) / totalRows) * 100,
      height: ((maxRow - minRow + 1) / totalCols) * 100,
      hasOverlap,
    }
  }

  // 既存のBinを表示するためのスタイルを計算
  // totalRowsが横方向（列数）、totalColsが縦方向（行数）
  // bin.rows: 横方向のサイズ、bin.cols: 縦方向のサイズ
  const getBinStyle = (bin: Bin) => {
    const cellWidth = 100 / totalRows  // 横方向の列数
    const cellHeight = 100 / totalCols // 縦方向の行数
    
    return {
      left: `${bin.start[0] * cellWidth}%`,
      top: `${bin.start[1] * cellHeight}%`,
      width: `${bin.rows * cellWidth}%`,   // rowsは横方向のサイズ
      height: `${bin.cols * cellHeight}%`, // colsは縦方向のサイズ
    }
  }

  const selectionRect = getSelectionRect()

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div
        ref={gridRef}
        className="relative border-2 border-content-l rounded-md overflow-hidden bg-white"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: "min(80vw, 1200px)",
          height: "min(80vh, 800px)",
          aspectRatio: `${totalRows} / ${totalCols}`, // 横/縦
          display: "grid",
          gridTemplateColumns: `repeat(${totalRows}, 1fr)`, // 横方向（列数）
          gridTemplateRows: `repeat(${totalCols}, 1fr)`,   // 縦方向（行数）
        }}>
        {/* グリッド線 */}
        {/* 横方向の線（縦方向の行数-1本） */}
        {Array.from({ length: totalCols - 1 }).map((_, i) => (
          <div
            key={`row-${i}`}
            className="absolute w-full border-t border-content-xl-a"
            style={{ top: `${((i + 1) / totalCols) * 100}%` }}
          />
        ))}
        {/* 縦方向の線（横方向の列数-1本） */}
        {Array.from({ length: totalRows - 1 }).map((_, i) => (
          <div
            key={`col-${i}`}
            className="absolute h-full border-l border-content-xl-a"
            style={{ left: `${((i + 1) / totalRows) * 100}%` }}
          />
        ))}
        
        {/* 既存のBin */}
        {bins.map((bin, index) => (
          <div
            key={index}
            className="absolute bg-primary/30 border-2 border-primary rounded-sm pointer-events-none"
            style={getBinStyle(bin)}
          />
        ))}
        
        {/* 選択範囲（previewBin） */}
        {selectionRect && (
          <div
            className={`absolute border-2 border-dashed rounded-sm pointer-events-none ${
              selectionRect.hasOverlap
                ? "bg-system-error-l/30 border-system-error-h"
                : "bg-primary/20 border-primary"
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

