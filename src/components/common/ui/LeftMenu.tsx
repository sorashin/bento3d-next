import { useEffect, useState } from "react"
import Icon from "@/components/common/ui/Icon"
import { Tooltip } from "react-tooltip"
import { useSettingsStore } from "@/stores/settings"
import { useNavigate, useLocation } from "react-router-dom"

const modes = [
  {
    label: "Partition",
    slug: "tray",
    img: "bento-partition",
    sampleImg: ["/images/partitions/000.png", "/images/partitions/004.jpg"],
  },
  {
    label: "Partition & Box",
    slug: "bento3d",
    img: "bento-box",
    sampleImg: [
      "/images/cases/000.jpg",
      "/images/cases/001.jpg",
      "/images/cases/002.png",
    ],
  },
]

export const LeftMenu = () => {
  const [currentMode, setCurrentMode] = useState(0)
  const { openDialog } = useSettingsStore((state) => state)
  const navigate = useNavigate()
  const location = useLocation()

  // URLのパスからslugを取得して、対応するモードインデックスを設定
  useEffect(() => {
    const currentPath = location.pathname
    const slug = currentPath.split("/")[1] // パスからslugを抽出

    // slugに合わせてcurrentModeを設定
    const modeIndex = modes.findIndex((mode) => mode.slug === slug)
    if (modeIndex !== -1) {
      setCurrentMode(modeIndex)
    }
  }, [location.pathname])

  const handleModeChange = (slug: string) => {
    navigate(`/${slug}`)
  }

  return (
    <div className="absolute top-8 left-8 z-20 w-64 flex gap-2 items-center font-display">
      {/* <h1 className="flex gap-1 items-center">
          <span className="-indent-96 absolute">Bento3d</span>
          <img src="/logo.svg" alt="bento3d" className="w-32 h-auto" />
        </h1> */}

      <button className="b-button bg-transparent flex flex-row items-center gap-2 min-w-[180px] hover:bg-[rgba(255,255,255,.56)] px-4 b-dropdown group border-[1px] border-content-l-a">
        <Icon
          name={modes[currentMode].img}
          className="w-8 h-8 stroke-3 stroke-content-m"
        />
        <p className="flex-grow text-left font-semibold text-content-h-a">
          {modes[currentMode].label}
        </p>

        <Icon
          name="chevron-down"
          className="size-4 text-content-m group-hover:translate-y-0.5 transition-all"
        />
        <div className="b-dropdown-contents left-0 top-[calc(100%+8px)] origin-[20%_0%] bg-surface-base shadow-lg rounded-sm p-2">
          <ul className="flex flex-row gap-2">
            {modes.map((mode, index) => (
              <li
                key={index}
                className="flex flex-col items-center gap-2 w-[240px] hover:bg-[rgba(255,255,255,.72)] group child-group p-2 rounded-[6px]"
                onClick={() => handleModeChange(mode.slug)}>
                <p className="w-full text-left text-lg mb-4 ml-2 mt-2 font-semibold text-content-h-a">
                  {mode.label}
                </p>
                <Icon
                  name={mode.img}
                  className="size-2/3 stroke-[2px] stroke-content-m mb-4"
                />
                <div className="grid grid-cols-3 gap-1 w-full">
                  {mode.sampleImg.map((img, index) => (
                    <img
                      src={img}
                      className="size-full rounded-sm filter saturate-60 opacity-80 mix-blend-multiply child-group-hover:saturate-100 child-group-hover:opacity-100"
                      key={index}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </button>
      <button
        className="b-button bg-transparent"
        onClick={() => openDialog("setting")}
        data-tooltip-content={"setting"}
        data-tooltip-id={"setting-tooltip"}>
        <Icon name="config" className="w-4 h-4 text-content-m-a"></Icon>
      </button>
      <Tooltip
        id="setting-tooltip"
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
    </div>
  )
}
