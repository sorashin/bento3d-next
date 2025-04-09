import { useTrayStore } from "@/stores/tray"

type DimProps = {
  rowId: string
  colId: string
  position: "top" | "left" | "right" | "bottom"
  offset: number
}

const Dim: React.FC<DimProps> = ({ colId, rowId, position, offset }) => {
  const { grid, updateRow, mm2pixel } = useTrayStore()
  const row = grid.find((r) => r.id === rowId)

  if (!row) return null

  // typeの変更を処理するハンドラ
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as "fill" | "1/2" | "1/3" | "fixed"
    updateRow(rowId, { type: newType })
  }

  // スタイルを計算
  const getStyleByPosition = () => {
    const pixelDepth = row.depth * mm2pixel
    const offsetPx = offset * mm2pixel

    switch (position) {
      case "top":
        return {
          top: 0 + offsetPx,
          left: 0,
          right: 0,
        }
      case "bottom":
        return {
          bottom: 0 + offsetPx,
          left: 0,
          right: 0,
        }
      case "left":
        return {
          left: 0 + offsetPx,
          top: pixelDepth / 2,
          transform: "translateY(-50%) rotate(-90deg)",
        }
      case "right":
        return {
          right: 0 + offsetPx,
          top: pixelDepth / 2,
          transform: "translateY(-50%) rotate(90deg)",
        }
    }
  }

  const dimStyle = getStyleByPosition()

  // 矢印の長さと位置を計算
  const getArrowDimensions = () => {
    const pixelWidth = row.width * mm2pixel
    const pixelDepth = row.depth * mm2pixel

    // 水平方向（上下の場合）と垂直方向（左右の場合）で矢印の長さを決定
    const length =
      position === "top" || position === "bottom"
        ? pixelWidth - 0 // 左右に少し余白を持たせる
        : pixelDepth - 0

    return {
      length,
      height: 10, // 矢印の高さ（太さ）
    }
  }

  const { length, height } = getArrowDimensions()

  return (
    <div className="absolute flex items-center" style={dimStyle}>
      <div className="flex flex-col items-center w-full">
        <svg width={length} height={height} className="">
          <defs>
            <marker
              id={`arrowstart-${colId + rowId}`}
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto">
              <polygon
                points="10 0, 0 3.5, 10 7"
                fill="var(--color-system-info)"
              />
            </marker>
            <marker
              id={`arrowend-${colId + rowId}`}
              markerWidth="10"
              markerHeight="7"
              refX="0"
              refY="3.5"
              orient="auto">
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="var(--color-system-info)"
              />
            </marker>
          </defs>
          <line
            x1="10"
            y1={height / 2}
            x2={length - 10}
            y2={height / 2}
            stroke="var(--color-system-info)"
            strokeWidth="1"
            markerStart={`url(#arrowstart-${colId + rowId})`}
            markerEnd={`url(#arrowend-${colId + rowId})`}
          />
        </svg>
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-row items-center bg-system-info rounded-sm z-10">
          <select
            value={row.type}
            onChange={handleTypeChange}
            className="text-overline p-1 cursor-pointer focus:outline-none">
            <option value="fill">fill(1)</option>
            <option value="1/2">fill(1/2)</option>
            <option value="1/3">fill(1/3)</option>
            <option value="fixed">fixed</option>
          </select>
          <div className="border-r border-content-dark-l-a h-[20px] mx-[2px]"></div>
          {row.type === "fixed" ? (
            <input
              type="number"
              step="0.1"
              value={row.width}
              onChange={(e) => {
                const newValue = e.target.value
                // 小数第1位までのフォーマットに制限（正規表現で検証）
                if (newValue && /^\d+(\.\d{0,1})?$/.test(newValue)) {
                  const newWidth = parseFloat(newValue)
                  if (!isNaN(newWidth)) {
                    updateRow(rowId, { width: newWidth })
                  }
                }
              }}
              className="h-full px-1 py-[2px] text-xs hover:bg-content-dark-l-a transition w-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          ) : (
            <p className="h-full px-1 py-[2px] text-xs">{row.width}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dim
