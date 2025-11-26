import { useModularStore } from "@/stores/modular"
import Icon from "@/components/common/ui/Icon"
import { FC, useState, useEffect, useRef } from "react"
import {
  DoubleSide,
  Mesh as ThreeMesh,
  MeshStandardMaterial,
  Object3D,
} from "three"
import { STLExporter } from "three-stdlib"
import { exportAllAsSTLZip } from "@/utils/exportStl"
import { exportAs3MF } from "@/utils/export3mf"

const GeometryExporter: FC = () => {
  const { manifoldGeometries } = useModularStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // すべてのSTLをZIPとしてダウンロード
  const downloadAllSTLsAsZip = async () => {
    try {
      await exportAllAsSTLZip(manifoldGeometries)
      setIsDropdownOpen(false)
    } catch {
      alert("Failed to create ZIP file")
    }
  }

  // すべてのBinを個別のオブジェクトとして3MFに含める
  const downloadAllBinsAs3MF = async () => {
    try {
      await exportAs3MF(manifoldGeometries)
      setIsDropdownOpen(false)
    } catch {
      alert("Failed to create 3MF file")
    }
  }

  // 画面の他の部分をクリックしたらドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen])

  return (
    <div className="p-0">
      {manifoldGeometries.length > 0 ? (
        <>
          <ul className="grid grid-cols-1 w-full gap-2 max-h-80 overflow-y-auto mb-4">
            {manifoldGeometries.map((geometry) => (
              <li
                key={geometry.id}
                onClick={async () => {
                  const mesh = new ThreeMesh(
                    geometry.geometry,
                    new MeshStandardMaterial({ side: DoubleSide })
                  )
                  const root = new Object3D()
                  root.add(mesh)
                  const exporter = new STLExporter()
                  const data = exporter.parse(root)
                  const blob = new Blob([data], {
                    type: "application/octet-stream",
                  })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `${geometry.label || "gridfinity"}.stl`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="flex justify-between items-center p-2 gap-1 cursor-pointer rounded-md hover:bg-surface-sheet-m transition">
                <Icon
                  name={"bin"}
                  className="stroke-[2px] text-content-h size-9"
                />
                <p className="text-content-m text-sm grow">
                  {geometry.label || "no-name"}
                </p>
                <button className="b-button bg-surface-ev1 !text-white items-center !py-1 justify-center hover:!bg-content-h-a">
                  <Icon name="download" className="size-6" />
                </button>
              </li>
            ))}
          </ul>

          
          <div className="relative" ref={dropdownRef}>
            <button
              className="relative b-button bg-primary !text-white w-full !hover:bg-primary/86 flex items-center gap-0"
              onClick={downloadAllBinsAs3MF}>
                <span className="grow">
                  
              Download All as 3MF
                </span>
              <span 
                className="w-8 flex items-center justify-center border-l-1 border-content-dark-h-a"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsDropdownOpen(!isDropdownOpen)
                }}>
                <Icon name="chevron-down" className="size-4"></Icon>
              </span>
              
            </button>
            {isDropdownOpen && (
              <ul className="absolute top-full left-0 right-0 mt-1 bg-surface-ev1 text-content-dark-h-a text-center rounded-md shadow-lg border-1 border-content-dark-xl-a z-30 overflow-hidden">
                <li 
                  onClick={downloadAllSTLsAsZip}
                  className="block w-full px-4 py-2 cursor-pointer hover:bg-content-dark-xxl-a transition-colors text-sm select-none pointer-events-auto">
                  Download All as ZIP
                </li>
                <li 
                  onClick={downloadAllBinsAs3MF}
                  className="block w-full px-4 py-2 cursor-pointer hover:bg-content-dark-xxl-a transition-colors text-sm border-t border-content-dark-l-a select-none pointer-events-auto">
                  Download All as 3MF
                </li>
              </ul>
            )}
          </div>
        </>
      ) : (
        <div className="bg-system-error-l flex flex-col items-center justify-center p-2 rounded-md w-full text-system-error-h">
          <div className="flex items-start gap-1 justify-start">
            <Icon name="alert" className="size-6" />
            <h3 className="text-base leading-tight mb-2 font-bold ">
              Failed to generate geometry
            </h3>
          </div>
          <p className="text-xs ml-6">Try changing grid settings or bins</p>
        </div>
      )}
    </div>
  )
}

export default GeometryExporter

