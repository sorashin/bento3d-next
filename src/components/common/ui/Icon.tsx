import React, { Suspense } from "react"

interface IconProps {
  name: string // SVGファイル名 (拡張子なし)
  color?: string // 上書き可能な色
  strokeWidth?: number // 上書き可能な線の太さ
  size?: number // アイコンのサイズ (幅と高さ)
  className?: string // 任意のクラス名
}

const Icon: React.FC<IconProps> = ({
  name,

  size = 24,
  className = "",
}) => {
  const SvgIcon = React.lazy(() => import(`../../../assets/icons/${name}.svg`))
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SvgIcon className={`w-${size} h-${size} ${className}`} />
    </Suspense>
  )
}

export default Icon
