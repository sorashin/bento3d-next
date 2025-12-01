import { Bin, useGridfinityStore } from "@/stores/gridfinity"
import { MouseEvent } from "react"
import Icon from "@/components/common/ui/Icon"
import { USelector } from "./USelector"

interface GridBinProps {
  bin: Bin
  totalRows: number
  totalCols: number
  offsetX: number
  offsetY: number
  index: number
  onResizeStart: (index: number) => void
  onDelete: (index: number) => void
}

export const GridBin = ({ bin, totalRows, totalCols, offsetX, offsetY, index, onResizeStart, onDelete }: GridBinProps) => {
  const { updateBin } = useGridfinityStore()
  const cellWidth = 100 / totalRows
  const cellHeight = 100 / totalCols

  // オフセットを適用して表示位置を計算
  const displayX = bin.start[0] - offsetX
  const displayY = bin.start[1] - offsetY

  const style = {
    left: `${displayX * cellWidth}%`,
    top: `${displayY * cellHeight}%`,
    width: `${bin.rows * cellWidth}%`,
    height: `${bin.cols * cellHeight}%`,
  }

  const handleResizeMouseDown = (e: MouseEvent) => {
    e.stopPropagation()
    onResizeStart(index)
  }

  const handleBinMouseDown = (e: MouseEvent) => {
    // 子要素（selector、ボタンなど）をクリックした場合は処理をスキップ
    const target = e.target as HTMLElement
    if (target.closest('select, button, [role="button"]')) {
      return
    }
    e.stopPropagation()
  }

  const handleDeleteClick = (e: MouseEvent) => {
    e.stopPropagation()
    onDelete(index)
  }

  const handleUChange = (newU: number) => {
    updateBin(index, {
      ...bin,
      u: newU,
    })
  }

  return (
    <div
      className="absolute flex flex-col items-center justify-center bg-sub-blue/30 border-1 border-sub-blue rounded-sm group"
      style={style}
      onMouseDown={handleBinMouseDown}>
      <span className="absolute inset-1.5 border-1 border-sub-blue rounded-sm bin-shadow-inner pointer-events-none" />
      <span className="space-y-1 pointer-events-auto z-10 text-center">
        <p className="text-sm font-display text-sub-blue">
          {bin.rows}x{bin.cols}
        </p>
        {/* U Selector */}
        <USelector value={bin.u} onChange={handleUChange} />

        {/* Delete Button */}
        <button
          className={`absolute ${
            bin.cols > 1 ? "left-1/2 transform -translate-x-1/2 bottom-3" : "left-1 bottom-1"
          } w-8 h-8 flex items-center justify-center cursor-pointer mt-2 opacity-0 group-hover:opacity-100 transition-opacity`}
          onClick={handleDeleteClick}
          onMouseDown={(e) => e.stopPropagation()}>
          <Icon
            name="trash"
            size={16}
            className="text-sub-blue/56 stroke-2 hover:text-sub-blue"
          />
        </button>
      </span>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={handleResizeMouseDown}>
        <div className="w-0 h-0 border-solid border-r-[10px] border-b-[10px] border-l-[10px] border-t-[10px] border-r-sub-blue border-b-sub-blue border-l-transparent border-t-transparent transform translate-x-1 translate-y-1" />
      </div>
    </div>
  )
}
