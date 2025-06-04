import Icon from "@/components/common/ui/Icon"

import React, { useState, useRef, useEffect } from "react"
import filaments from "@/assets/filaments.json"
import { Color, useSettingsStore } from "@/stores/settings"
import { Tooltip } from "react-tooltip"
import { AnimatePresence, motion } from "framer-motion"

export interface ColorSwitcherProps {}
export const ColorSwitcher: React.FC<ColorSwitcherProps> = () => {
  const { currentFillament, setFillament } = useSettingsStore()

  const [selectedTab, setSelectedTab] = useState(currentFillament.series)
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <motion.div
      ref={containerRef}
      className="flex items-center gap-2 pointer-events-auto p-2 bg-surface-sheet-h rounded-lg"
      layout>
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <>
            <motion.img
              src={currentFillament.color.sampleImage}
              alt=""
              className="w-64 h-64 rounded-md"
              layoutId="color-image"
            />

            <div className="flex flex-col gap-2 h-full overflow-y-auto">
              {filaments.map((item) => {
                return (
                  <>
                    <p className="text-sm text-content-m-a">{item.series}</p>
                    <div className="grid grid-cols-6 gap-4 w-fit">
                      {item.colors.map((color) => (
                        <div
                          key={color.name}
                          data-tooltip-id="color-tooltip"
                          data-tooltip-content={color.name}
                          style={{ backgroundColor: color.hex }}
                          className="w-7 h-7 rounded-full cursor-pointer"
                          onClick={() => {
                            setFillament({
                              ...currentFillament,
                              color: {
                                name: color.name,
                                sampleImage: color.url,
                                hex: color.hex,
                                threeHEX: color.threeHEX,
                                metalness: color.metalness,
                                roughness: color.roughness,
                                url: color.url,
                              },
                            })
                          }}></div>
                      ))}
                    </div>
                  </>
                )
              })}
            </div>
          </>
        ) : (
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsExpanded(true)}>
            <span
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: currentFillament.color.hex }}></span>
            <p className="text-sm text-content-m-a">
              {currentFillament.color.name}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

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
    </motion.div>
  )
}
