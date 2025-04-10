import Icon from "@/components/common/ui/Icon"
import { FC, useEffect, useState } from "react"
import ReactGA from "react-ga4"
import useAdVisibility from "@/hooks/useAdVisibility"
import { useSettingsStore } from "@/stores/settings"

// define type

export const Ad: FC = () => {
  const [showAds, setShowAds] = useState(true)
  const { openDialog, isGAInitialized } = useSettingsStore((state) => state)

  const onAdViewable = () => {
    ReactGA.event({
      category: "AdBanner",
      action: `ad_viewable`,
    })
  }
  const adRef = useAdVisibility(onAdViewable, 1000)

  const closeAd = () => {
    console.log("close ad")
    ReactGA.event({
      category: "AdBanner",
      action: `close_click`,
    })
  }
  const clickAd = () => {
    console.log("click ad")
    ReactGA.event({
      category: "AdBanner",
      action: `banner_click`,
    })
  }

  useEffect(() => {
    if (showAds && isGAInitialized) {
      ReactGA.event({
        category: "AdBanner",
        action: `ad_impression`,
      })
    }
  }, [showAds, isGAInitialized])
  if (!showAds) {
    return null
  }
  return (
    <div className="mx-2 relative md:block hidden" ref={adRef}>
      <button
        onClick={() => {
          setShowAds(false)
          closeAd()
        }}
        className="absolute top-2 right-2 rounded-full bg-content-l hover:scale-105 transition-all p-1">
        <Icon name="close" className="size-3 stroke-[4px] text-content-m" />
      </button>
      <button
        className="rounded-sm overflow-hidden block"
        onClick={() => {
          openDialog("ad")
          clickAd()
        }}>
        <img src="/images/ads/ad002.png" alt="" />
      </button>
    </div>
  )
}
