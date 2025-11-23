import { useGridfinityStore } from "@/stores/gridfinity"
import { motion } from "framer-motion"

export const LeftBar = () => {
  const {
    totalRows,
    totalCols,
    workAreaWidth,
    workAreaHeight,
    workAreaDimension,
    setTotalRows,
    setTotalCols,
    setWorkAreaWidth,
    setWorkAreaHeight,
    setWorkAreaDimension,
  } = useGridfinityStore()

  return (
    <motion.div
      className="absolute top-20 md:top-8 left-4 md:left-8 z-20 md:w-[240px] h-fit flex flex-col gap-2 items-start font-display bg-surface-sheet-l backdrop-blur-lg rounded-md p-4"
      layout>
      <h3 className="text-content-h-a text-sm font-semibold mb-2">Grid Settings</h3>
      
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-2">
          <label htmlFor="totalRows" className="text-content-m-a text-xs">
            Total Rows
          </label>
          <input
            id="totalRows"
            type="number"
            min={1}
            value={totalRows}
            onChange={(e) => setTotalRows(parseInt(e.target.value) || 1)}
            className="b-input w-full px-3 py-2 rounded-md bg-content-xxl-a text-content-h-a focus:outline-none focus:ring-1 focus:ring-content-l-a"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="totalCols" className="text-content-m-a text-xs">
            Total Cols
          </label>
          <input
            id="totalCols"
            type="number"
            min={1}
            value={totalCols}
            onChange={(e) => setTotalCols(parseInt(e.target.value) || 1)}
            className="b-input w-full px-3 py-2 rounded-md bg-content-xxl-a text-content-h-a focus:outline-none focus:ring-1 focus:ring-content-l-a"
          />
        </div>

        <div className="border-t border-content-xl-a pt-4 mt-2">
          <h4 className="text-content-h-a text-xs font-semibold mb-3">Work Area</h4>
          
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="workAreaWidth" className="text-content-m-a text-xs">
                Width (mm)
              </label>
              <input
                id="workAreaWidth"
                type="number"
                min={0}
                step={0.1}
                value={workAreaWidth}
                onChange={(e) => setWorkAreaWidth(parseFloat(e.target.value) || 0)}
                className="b-input w-full px-3 py-2 rounded-md bg-content-xxl-a text-content-h-a focus:outline-none focus:ring-1 focus:ring-content-l-a"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="workAreaHeight" className="text-content-m-a text-xs">
                Height (mm)
              </label>
              <input
                id="workAreaHeight"
                type="number"
                min={0}
                step={0.1}
                value={workAreaHeight}
                onChange={(e) => setWorkAreaHeight(parseFloat(e.target.value) || 0)}
                className="b-input w-full px-3 py-2 rounded-md bg-content-xxl-a text-content-h-a focus:outline-none focus:ring-1 focus:ring-content-l-a"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="workAreaDimension" className="text-content-m-a text-xs">
                Dimension (mm)
              </label>
              <input
                id="workAreaDimension"
                type="number"
                min={0}
                step={0.1}
                value={workAreaDimension}
                onChange={(e) => setWorkAreaDimension(parseFloat(e.target.value) || 0)}
                className="b-input w-full px-3 py-2 rounded-md bg-content-xxl-a text-content-h-a focus:outline-none focus:ring-1 focus:ring-content-l-a"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

