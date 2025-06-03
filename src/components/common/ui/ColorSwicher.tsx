import Icon from "@/components/common/ui/Icon"

import React from "react"
import fillements from "@/assets/fillements.json"
import { useSettingsStore } from "@/stores/settings"
import { Tooltip } from "react-tooltip"

export interface ColorSwitcherProps {}
export const ColorSwitcher: React.FC<ColorSwitcherProps> = () => {
  const { fillament, setFillament } = useSettingsStore()

  return (
    <div className="flex items-center gap-2 pointer-events-auto">
      <select
        name=""
        id=""
        value={fillament.series}
        onChange={(e) => {
          setFillament({ ...fillament, series: e.target.value })
        }}>
        {fillements.map((fillament) => (
          <option value={fillament.series}>{fillament.series}</option>
        ))}
      </select>
      {fillements
        .filter((item) => item.series === fillament.series)
        .map((item) =>
          item.colors.map((color) => (
            <div
              key={color.name}
              data-tooltip-id="color-tooltip"
              data-tooltip-content={color.name}
              style={{ backgroundColor: color.hex }}
              className="w-4 h-4 rounded-full"
              onClick={() => {
                setFillament({
                  ...item,
                  name: color.name,
                  hex: color.hex,
                  threeHEX: color.threeHEX,
                  metalness: color.metalness,
                  roughness: color.roughness,
                  url: color.url,
                })
              }}></div>
          ))
        )}
      <Tooltip
        id="color-tooltip"
        place="bottom"
        className="text-xs"
        style={{
          backgroundColor: "#1C1C1C",
          color: "#ffffff",
          fontSize: "12px",
          padding: "2px 4px 2px 4px",
          borderRadius: "4px",
          userSelect: "none",
          fontFamily: "sans-serif",
        }}
        noArrow
      />
    </div>
  )
}
