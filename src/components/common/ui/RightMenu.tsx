import React, { useState } from "react"

import ReactGA from "react-ga4"
import Icon from "@/components/common/ui/Icon"
import updates from "@/assets/updates.json"
import { Tooltip } from "react-tooltip"
import { motion } from "framer-motion"
import { Ad } from "@/components/common/ui/Ad"
import { useSettingsStore } from "@/stores/settings"
import { useTrayStore } from "@/stores/tray"
import GeometryExporter from "./GeometryExporter"
import { useNavigationStore } from "@/stores/navigation"
import { useModularStore } from "@/stores/modular"
import { STLExporter } from "three-stdlib"
import {
  DoubleSide,
  Mesh as ThreeMesh,
  MeshStandardMaterial,
  Object3D,
} from "three"

export const RightMenu: React.FC = () => {
  const { openDialog, openDrawer } = useSettingsStore((state) => state)
  const { totalWidth, totalHeight, totalDepth } = useTrayStore((state) => state)
  const { currentNav } = useNavigationStore((state) => state)
  const { manifoldGeometries } = useModularStore((state) => state)
  const [isOrdering, setIsOrdering] = useState(false)

  const latestUpdate = updates.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0]
  const isNew =
    new Date().getTime() - new Date(latestUpdate.date).getTime() <=
    7 * 24 * 60 * 60 * 1000

  const handleClick = (label: string) => {
    console.log("clicked!", label)
    ReactGA.event({
      category: "Download Button",
      action: `W:${totalWidth} H:${totalHeight} D:${totalDepth}`,
      label: label,
    })
  }

  const handleOrderClick = async () => {
    if (isOrdering) return

    setIsOrdering(true)
    try {
      // Find the tray geometry
      const trayGeometry = manifoldGeometries.find(g => g.label === "tray")

      if (!trayGeometry) {
        alert("Please generate the tray geometry first")
        return
      }

      // Generate STL from geometry (same logic as GeometryExporter)
      const mesh = new ThreeMesh(
        trayGeometry.geometry,
        new MeshStandardMaterial({ side: DoubleSide })
      )
      const root = new Object3D()
      root.add(mesh)
      const exporter = new STLExporter()
      const stlData = exporter.parse(root)
      const blob = new Blob([stlData], { type: "application/octet-stream" })

      // Create FormData
      const formData = new FormData()
      formData.append("stl", blob, `tray_W${totalWidth}xD${totalDepth}xH${totalHeight}.stl`)
      formData.append("width", totalWidth.toString())
      formData.append("depth", totalDepth.toString())
      formData.append("height", totalHeight.toString())

      // Send to Cloud Function
      const cloudFunctionUrl = import.meta.env.VITE_CLOUD_FUNCTION_URL || "http://localhost:8080"
      const response = await fetch(`${cloudFunctionUrl}/createCheckoutSession`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create checkout session")
      }

      const data = await response.json()

      // Track analytics
      ReactGA.event({
        category: "Order Button",
        action: `W:${totalWidth} H:${totalHeight} D:${totalDepth}`,
        label: "Order 3D Print",
      })

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error("Error creating order:", error)
      alert(`Failed to create order: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsOrdering(false)
    }
  }

  const isOrderDisabled = totalWidth > 400 || totalDepth > 400 || totalHeight > 100 || manifoldGeometries.length === 0

  return (
    <>
      <motion.div
        className={`absolute h-auto top-20 md:top-8 right-4 md:right-8 w-fit md:w-[240px] py-2 z-20 bg-surface-sheet-l rounded-md backdrop-blur-sm flex flex-col gap-2 items-center justify-center`}
        layout>
        <motion.div
          className="flex flex-row justify-between w-full px-2"
          layout>
          <div className="flex justify-end">
            <button
              className="b-button bg-transparent"
              onClick={() => openDialog("feedback")}
              data-tooltip-content={"Feedback"}
              data-tooltip-id={"hint-tooltip"}>
              💬
            </button>
            <button
              className="b-button bg-transparent relative"
              onClick={() => openDrawer("update")}
              data-tooltip-content={"Updates"}
              data-tooltip-id={"hint-tooltip"}>
              📣
              {isNew && (
                <span className="size-2 rounded-full bg-system-error-h absolute bottom-1.5 right-1.5 border-spacing-1 border-system-error-l"></span>
              )}
            </button>
            <a
              className="b-button bg-transparent"
              href="https://polar-tadpole-97b.notion.site/Bento3D-e40483712b304d389d7c2da26196e113?pvs=4"
              target="_blank"
              rel="noreferrer"
              data-tooltip-content={"Document"}
              data-tooltip-id={"hint-tooltip"}>
              📖
            </a>
          </div>
        </motion.div>
        {currentNav === 2 && (
          <motion.div
            className="pt-2 px-2 border-t-[0.5px] border-content-xl-a w-full"
            layout>
            <p className="w-full my-2 text-center text-xs text-content-m-a font-display">
              Download STLs
            </p>
            <GeometryExporter />

            <div className="w-full px-2 mt-4 mb-2">
              <button
                onClick={handleOrderClick}
                disabled={isOrderDisabled || isOrdering}
                className="b-button bg-content-h text-surface-base hover:bg-content-m w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                data-tooltip-content={
                  isOrderDisabled
                    ? "Max size: 400x400x100mm"
                    : "Order 3D print service"
                }
                data-tooltip-id={"hint-tooltip"}>
                <Icon name="3dp" className="size-4" />
                {isOrdering ? "Processing..." : "Order 3D Print"}
              </button>
            </div>

            <div className="flex w-full flex-col items-end px-2">
              <div className="flex flex-row items-center gap-1 text-sm relative group py-0.5 text-content-m w-fit">
                <a
                  href="https://polar-tadpole-97b.notion.site/Bento3D-e40483712b304d389d7c2da26196e113#9d32764885c746438fa229644e0149f9"
                  target="_blank"
                  rel="noreferrer">
                  Assembly Tips
                </a>
                <Icon name="arrow-up-right" className="size-5" />
                <span className="absolute left-0 bottom-0 w-0 border-b-[1px] border-content-l group-hover:w-full transition-all"></span>
              </div>
              <div className="flex flex-row items-center gap-1 text-sm relative group py-0.5 text-content-m w-fit">
                <a href="https://polar-tadpole-97b.notion.site/Bento3D-e40483712b304d389d7c2da26196e113#d826cb9d4d844200a0fbd5f7df783f14">
                  How to fix broken STLs
                </a>
                <Icon name="arrow-up-right" className="size-5" />
                <span className="absolute left-0 bottom-0 w-0 border-b-[1px] border-content-l group-hover:w-full transition-all"></span>
              </div>
              <div className="flex flex-row items-center gap-1 text-sm relative group py-0.5 mb-2 text-content-m w-fit">
                <a href="https://buymeacoffee.com/lodgefabq" target="_blank" rel="noreferrer">
                  Support Us
                </a>
                <Icon name="coffee" className="size-5" />
                <span className="absolute left-0 bottom-0 w-0 border-b-[1px] border-content-l group-hover:w-full transition-all"></span>
              </div>
            </div>
          </motion.div>
        )}
        <Ad />

        <Tooltip
          id="hint-tooltip"
          place="bottom"
          className="text-xs"
          style={{
            backgroundColor: "#1C1C1C",
            color: "#ffffff",
            fontSize: "12px",
            padding: "2px 4px 2px 4px",
            borderRadius: "4px",
            userSelect: "none",
          }}
          noArrow
        />
      </motion.div>
    </>
  )
}
