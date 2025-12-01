import React, { Suspense, lazy, memo, useMemo } from "react"

// アイコンコンポーネントのキャッシュ
const iconCache: Record<string, React.ComponentType<Record<string, unknown>>> = {}

// デフォルトアイコン（フォールバック用）
const DEFAULT_ICON_NAME = "box"
let defaultIcon: React.ComponentType<Record<string, unknown>> | null = null

// デフォルトアイコンを事前にロード
const loadDefaultIcon = () => {
  if (!defaultIcon) {
    defaultIcon = lazy(() => import(`../../../assets/icons/${DEFAULT_ICON_NAME}.svg`))
  }
  return defaultIcon
}

// アイコン名を正規化する関数
const normalizeIconName = (name: string): string => {
  // gridfinity用のlabel（bin001, bin001_base, bin001_unionなど）はboxアイコンにマッピング
  if (/^bin\d+(_(base|union|diff))?$/.test(name)) {
    return "box"
  }
  // その他の場合は元の名前を使用
  return name
}

// アイコンを取得する関数（キャッシュがあれば再利用）
const loadIcon = (name: string) => {
  const normalizedName = normalizeIconName(name)
  if (!iconCache[normalizedName]) {
    // 動的インポートが失敗した場合のフォールバックを実装
    iconCache[normalizedName] = lazy(async () => {
      try {
        return await import(`../../../assets/icons/${normalizedName}.svg`)
      } catch {
        // SVGファイルが見つからない場合、デフォルトアイコンを返す
        console.warn(`Icon "${normalizedName}" not found, using default icon "${DEFAULT_ICON_NAME}"`)
        return await import(`../../../assets/icons/${DEFAULT_ICON_NAME}.svg`)
      }
    })
  }
  return iconCache[normalizedName]
}

interface IconProps {
  name: string // SVGファイル名 (拡張子なし)
  color?: string // 上書き可能な色
  strokeWidth?: number // 上書き可能な線の太さ
  size?: number // アイコンのサイズ (幅と高さ)
  className?: string // 任意のクラス名
  onClick?: () => void // クリックイベントハンドラー
}

// エラーバウンダリコンポーネント
class IconErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("Icon component error:", error, errorInfo)
  }

  shouldComponentUpdate(nextProps: { children: React.ReactNode; fallback: React.ReactNode }, nextState: { hasError: boolean }) {
    // エラー状態が変わった場合、またはchildrenが変わった場合のみ更新
    return this.state.hasError !== nextState.hasError || this.props.children !== nextProps.children
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

const Icon: React.FC<IconProps> = memo(
  ({ name, size = 24, className = "", onClick }) => {
    // キャッシュからアイコンを取得または新たにロード
    const SvgIcon = loadIcon(name)
    
    // フォールバック用のデフォルトアイコン（一度だけ読み込む）
    const DefaultIcon = useMemo(() => loadDefaultIcon(), [])
    
    // フォールバック要素をメモ化して、不要な再レンダリングを防ぐ
    const fallbackElement = useMemo(
      () => (
        <Suspense fallback={<div className={`w-${size} h-${size}`} />}>
          <DefaultIcon
            className={`w-${size} h-${size} ${className}`}
            onClick={onClick}
          />
        </Suspense>
      ),
      [DefaultIcon, size, className, onClick]
    )

    return (
      <IconErrorBoundary fallback={fallbackElement}>
        <Suspense fallback={<div className={`w-${size} h-${size}`} />}>
          <SvgIcon
            className={`w-${size} h-${size} ${className}`}
            onClick={onClick}
          />
        </Suspense>
      </IconErrorBoundary>
    )
  }
)

export default Icon
