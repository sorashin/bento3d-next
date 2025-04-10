import { useSettingsStore } from "@/stores/settings"
import { useFakeTrayStore, useTrayStore } from "@/stores/tray"
import { useState } from "react"

interface RangeSliderProps {
  min: number
  max: number
  label: string
  position: "top" | "left" | "right" | "bottom"
}

export const RangeSlider: React.FC<RangeSliderProps> = (props) => {
  const { max, min, label, position } = props
  const { updateSize, totalWidth, totalDepth, totalHeight } = useTrayStore()
  const { updateFakeSize } = useFakeTrayStore()

  // labelに基づいて適切な初期値を取得
  const getInitialValue = () => {
    switch (label) {
      case "width":
        return totalWidth
      case "depth":
        return totalDepth
      case "height":
        return totalHeight
      default:
        return 105
    }
  }

  const [isDragging, setIsDragging] = useState(false)
  const [value, setValue] = useState(getInitialValue()) // 現在の設定値
  const [yPos, setYPos] = useState(0) // 現在のボーダー幅
  const [startY, setStartY] = useState(0) // ドラッグ開始時のY座標
  const [startX, setStartX] = useState(0) // ドラッグ開始時のX座標
  const { setCameraMode } = useSettingsStore()
  const rulerRange = 400

  // 位置に応じたクラス名を生成
  const getPositionClasses = () => {
    switch (position) {
      case "left":
        return "fixed left-8 lg:left-16 top-1/2 -translate-y-1/2 h-14"
      case "right":
        return "fixed right-8 lg:right-16 top-1/2 -translate-y-1/2 h-14"
      case "top":
        return "fixed top-8 lg:top-16 left-1/2 -translate-x-1/2 w-14"
      case "bottom":
      default:
        return "fixed bottom-8 lg:bottom-16 left-1/2 -translate-x-1/2 w-14"
    }
  }

  // スライダーの向きを取得
  const getSliderOrientation = () => {
    return ["left", "right"].includes(position) ? "vertical" : "horizontal"
  }

  // Y座標またはX座標の変化に基づいて値を更新
  const calculateNewValue = (currentPos: number) => {
    // 垂直か水平かによって異なる計算を使用
    if (["left", "right"].includes(position)) {
      const diffY = startY - currentPos // 方向を反転（マイナスをつけない）
      const newYPos = Math.max(-rulerRange, Math.min(rulerRange, diffY))
      const mappedValue =
        Math.round(((newYPos + rulerRange) / (rulerRange * 2)) * (max - min)) +
        min

      setValue(mappedValue)
      setYPos(newYPos)
    } else {
      const diffX = startX - currentPos // 方向を反転（マイナスをつけない）
      const newXPos = Math.max(-rulerRange, Math.min(rulerRange, diffX))
      const mappedValue =
        Math.round(((newXPos + rulerRange) / (rulerRange * 2)) * (max - min)) +
        min

      setValue(mappedValue)
      setYPos(newXPos) // yPosを再利用
    }
  }

  return (
    <>
      <div
        className={`group ${getPositionClasses()} transition font-display text-content-dark-h-a pointer-events-auto`}>
        <p>{value}</p>
        <input
          type="range"
          className={`range-slider ${getSliderOrientation()}`}
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
          onMouseDown={(e) => {
            setIsDragging(true)
            setStartY(e.clientY)
            setStartX(e.clientX)
            setCameraMode("front")
          }}
          onMouseMove={(e) => {
            if (isDragging) {
              calculateNewValue(
                ["left", "right"].includes(position) ? e.clientY : e.clientX
              )
              const fakeSizeUpdate: {
                width?: number
                depth?: number
                height?: number
              } = {}
              if (label === "width") {
                fakeSizeUpdate.width = value
              } else if (label === "depth") {
                fakeSizeUpdate.depth = value
              } else if (label === "height") {
                fakeSizeUpdate.height = value
              }
              updateFakeSize({
                width: label === "width" ? value : undefined,
                depth: label === "depth" ? value : undefined,
                height: label === "height" ? value : undefined,
              })
            }
          }}
          onMouseUp={() => {
            setIsDragging(false)

            // labelに基づいて適切なプロパティを更新
            const sizeUpdate: {
              width?: number
              depth?: number
              height?: number
            } = {}
            if (label === "width") {
              sizeUpdate.width = value
            } else if (label === "depth") {
              sizeUpdate.depth = value
            } else if (label === "height") {
              sizeUpdate.height = value
            }

            updateSize(sizeUpdate)
            setCameraMode("perspective")
          }}
          onTouchStart={(e) => {
            setIsDragging(true)
            setStartY(e.touches[0].clientY)
            setStartX(e.touches[0].clientX)
          }}
          onTouchMove={(e) => {
            if (isDragging) {
              calculateNewValue(
                ["left", "right"].includes(position)
                  ? e.touches[0].clientY
                  : e.touches[0].clientX
              )
              updateFakeSize({
                width: label === "width" ? value : undefined,
                depth: label === "depth" ? value : undefined,
                height: label === "height" ? value : undefined,
              })
            }
          }}
          onTouchEnd={() => {
            setIsDragging(false)

            // labelに基づいて適切なプロパティを更新 (タッチイベント用)
            const sizeUpdate: {
              width?: number
              depth?: number
              height?: number
            } = {}
            if (label === "width") {
              sizeUpdate.width = value
            } else if (label === "depth") {
              sizeUpdate.depth = value
            } else if (label === "height") {
              sizeUpdate.height = value
            }

            updateSize(sizeUpdate)
            setCameraMode("perspective")
          }}
        />
      </div>
    </>
  )
}
