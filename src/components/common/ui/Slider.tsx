import { useSettingsStore } from "@/stores/settings"
import { useFakeTrayStore, useTrayStore } from "@/stores/tray"
import { useEffect, useRef, useState } from "react"
import Icon from "./Icon"

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
  const inputRef = useRef<HTMLInputElement>(null)

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
        return "fixed top-8 lg:top-16 left-1/2 -translate-x-1/2 w-32"
      case "bottom":
      default:
        return "fixed bottom-8 lg:bottom-16 left-1/2 -translate-x-1/2 w-32"
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (/^\d*$/.test(newValue)) {
      // 数字のみを許可
      const numericValue = Math.floor(Number(newValue)) // 小数点以下を切り捨て
      updateFakeSize({
        width: label === "width" ? numericValue : undefined,
        depth: label === "depth" ? numericValue : undefined,
        height: label === "height" ? numericValue : undefined,
      })
      updateSize({
        width: label === "width" ? numericValue : undefined,
        depth: label === "depth" ? numericValue : undefined,
        height: label === "height" ? numericValue : undefined,
      })
    } else {
      inputRef.current!.value = String(value)
    }
  }

  // set input value to phantomSize.depth
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = String(value)
    }
  }, [value])

  return (
    <>
      <div
        className={`group ${getPositionClasses()} transition font-display text-content-dark-h-a pointer-events-auto flex justify-center`}>
        <Icon
          name={
            ["top", "bottom"].includes(position) ? "chevron-left" : "chevron-up"
          }
          className={`absolute ${
            ["top", "bottom"].includes(position)
              ? "-left-6 w-4 h-full group-hover:-left-8"
              : "-top-6 w-full h-4 group-hover:-top-8"
          } transition-all text-content-m-a`}
        />
        <Icon
          name={
            ["top", "bottom"].includes(position)
              ? "chevron-right"
              : "chevron-down"
          }
          className={`absolute ${
            ["top", "bottom"].includes(position)
              ? "-right-6 w-4 h-full group-hover:-right-8"
              : "-bottom-6 w-full h-4 group-hover:-bottom-8"
          } transition-all text-content-m-a`}
        />
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
        <div className="absolute flex flex-col justify-center items-center gap-[2px] inset-0 h-[56px] w-[128px] text-center pointer-events-none  text-white">
          <p className="text-xs relative text-content-dark-m-a">
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </p>
          <p className="relative items-center flex">
            <input
              type="text"
              className="text-lg max-w-[50px] text-content-white pointer-events-auto bg-transparent hover:bg-content-dark-xl-a rounded-[4px] focus:bg-content-dark-xl-a text-center focus:ring-1 focus:ring-content-dark-l-a focus:outline-none"
              defaultValue={String(value)}
              ref={inputRef}
              onFocus={(e) => e.target.select()}
              onChange={handleInputChange}
            />
            <span className="absolute -right-5 text-overline text-content-dark-m-a">
              mm
            </span>
          </p>
        </div>
      </div>
    </>
  )
}
