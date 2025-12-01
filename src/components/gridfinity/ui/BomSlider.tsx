import Icon from "@/components/common/ui/Icon"
import { useSettingsStore } from "@/stores/settings"
import React from "react"

export interface BomSliderProps {}

export const BomSlider: React.FC<BomSliderProps> = () => {
  const { bom, setBom } = useSettingsStore()

  return (
    <div className="b-input flex justify-center items-center gap-2 pointer-events-auto text-content-m h-9">
      <Icon name="bom-shrink" className="size-8" />

      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={bom}
        onChange={(e) => setBom(Number(e.target.value))}
      />

      <Icon name="bom-explode" className="size-8" />
    </div>
  )
}

export default BomSlider

