import { useState, useRef, useEffect, MouseEvent } from "react"
import Icon from "@/components/common/ui/Icon"
import { BIN_U_MIN, BIN_U_MAX } from "@/stores/gridfinity"

interface USelectorProps {
  value: number
  onChange: (value: number) => void
}

export const USelector = ({ value, onChange }: USelectorProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ドロップダウン外をクリックしたら閉じる
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen])

  const toggleDropdown = (e: MouseEvent) => {
    e.stopPropagation()
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleUChange = (newU: number) => {
    onChange(newU)
    setIsDropdownOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        onMouseDown={(e) => e.stopPropagation()}
        className="text-xs text-sub-blue bg-transparent border border-sub-blue rounded px-1 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-sub-blue w-fit flex items-center gap-1">
        <span>u{value}</span>
        <Icon
          name="chevron-down"
          className="size-3 text-sub-blue"
        />
      </button>
      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-sub-blue rounded shadow-lg z-20 min-w-full">
          {Array.from(
            { length: BIN_U_MAX - BIN_U_MIN + 1 },
            (_, i) => BIN_U_MIN + i
          ).map((u) => (
            <button
              key={u}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleUChange(u)
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className={`w-full text-left px-2 py-1 text-xs text-sub-blue hover:bg-sub-blue/10 transition-colors ${
                value === u ? "bg-sub-blue/20 font-semibold" : ""
              }`}>
              u{u}({u*7}mm)
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

