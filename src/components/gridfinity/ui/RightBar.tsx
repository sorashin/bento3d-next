import { motion } from "framer-motion"
import GeometryExporter from "./GeometryExporter"

export const RightBar = () => {
  return (
    <motion.div
      className="absolute h-auto top-20 md:top-8 right-4 md:right-8 w-fit md:w-[240px] py-2 z-20 bg-surface-sheet-l rounded-md backdrop-blur-sm flex flex-col gap-2 items-center justify-center"
      layout>
      <motion.div
        className="flex flex-col gap-2 w-full px-2"
        layout>
        <p className="w-full my-2 text-center text-xs text-content-m-a font-display">
          Download STLs
        </p>
        <GeometryExporter />
      </motion.div>
    </motion.div>
  )
}

