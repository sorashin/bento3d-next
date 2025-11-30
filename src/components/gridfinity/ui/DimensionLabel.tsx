type DimensionLabelProps = {
  value: number
  orientation: "horizontal" | "vertical"
  className?: string
}

export const DimensionLabel = ({ value, orientation, className = "" }: DimensionLabelProps) => {
  const label = `${value}mm`

  if (orientation === "horizontal") {
    return (
      <div className={`relative flex items-center justify-center w-full h-full select-none ${className}`}>
        {/* 線のSVG（引き伸ばし可） */}
        <svg viewBox="0 0 200 24" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {/* 左端の ⊢ */}
          <line x1="2" y1="4" x2="2" y2="20" stroke="currentColor" strokeWidth="1" />
          {/* 左側の水平線（テキストの左まで） */}
          <line x1="2" y1="12" x2="80" y2="12" stroke="currentColor" strokeWidth="1.5" />
          {/* 右側の水平線（テキストの右から） */}
          <line x1="120" y1="12" x2="198" y2="12" stroke="currentColor" strokeWidth="1.5" />
          {/* 右端の ⊣ */}
          <line x1="198" y1="4" x2="198" y2="20" stroke="currentColor" strokeWidth="1"/>
        </svg>
        {/* テキスト（引き伸ばしなし） */}
        <span className="relative z-10 text-sm font-medium whitespace-nowrap">
          {label}
        </span>
      </div>
    )
  }

  // vertical
  return (
    <div className={`relative flex items-center justify-center w-full h-full select-none ${className}`}>
      {/* 線のSVG（引き伸ばし可） */}
      <svg viewBox="0 0 24 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {/* 上端の ⊤ */}
        <line x1="4" y1="2" x2="20" y2="2" stroke="currentColor" strokeWidth="1" />
        {/* 上側の垂直線（テキストの上まで） */}
        <line x1="12" y1="2" x2="12" y2="80" stroke="currentColor" strokeWidth="1.5" />
        {/* 下側の垂直線（テキストの下から） */}
        <line x1="12" y1="120" x2="12" y2="198" stroke="currentColor" strokeWidth="1.5" />
        {/* 下端の ⊥ */}
        <line x1="4" y1="198" x2="20" y2="198" stroke="currentColor" strokeWidth="1" />
      </svg>
      {/* テキスト（引き伸ばしなし、回転） */}
      <span
        className="relative z-10 text-sm font-medium whitespace-nowrap"
        style={{ transform: "rotate(-90deg)" }}
      >
        {label}
      </span>
    </div>
  )
}
