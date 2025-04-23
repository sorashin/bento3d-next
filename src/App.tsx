import { lazy, Suspense, useEffect, memo } from "react"
import { useModularStore } from "@/stores/modular"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom"

// NotFoundコンポーネント作成
const NotFound = () => (
  <div className="flex-1 flex items-center justify-center">Page Not Found</div>
)

// 動的インポートを静的にするためのマッピングオブジェクトを作成
const pageComponents: Record<string, any> = {
  bento3d: () =>
    import("./pages/bento3d/index").then((module) => ({
      default: module.Page,
    })),
  gridfinity: () =>
    import("./pages/gridfinity/index").then((module) => ({
      default: module.Page,
    })),
  tray: () =>
    import("./pages/tray/index").then((module) => ({
      default: module.Page,
    })),
}

// ModularInitializerコンポーネント - modularの初期化だけを担当
const ModularInitializer = memo(({ slug }: { slug?: string }) => {
  const initializeModular = useModularStore((state) => state.initializeModular)
  const loadGraph = useModularStore((state) => state.loadGraph)
  const modular = useModularStore((state) => state.modular)

  useEffect(() => {
    console.log("ModularInitializer mounted")
    initializeModular()
  }, [])

  useEffect(() => {
    if (modular && slug) {
      loadGraph(slug)
    }
  }, [modular, slug, loadGraph])

  return null
})

// PageLoaderコンポーネント - memoを削除してslugの変更に確実に反応するように
const PageLoader = ({ slug }: { slug: string }) => {
  const PageComponent = lazy(() => {
    const loader = pageComponents[slug]
    return loader ? loader() : Promise.resolve({ default: NotFound })
  })

  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          loading...
        </div>
      }>
      <PageComponent />
    </Suspense>
  )
}

// GraphRendererコンポーネント - URLパラメータを取得しPageLoaderに渡す
const GraphRenderer = () => {
  const { slug } = useParams<{ slug: string }>()

  return (
    <>
      <ModularInitializer slug={slug} />
      {/* keyプロパティを追加して、slugが変わるたびにPageLoaderが再マウントされるようにする */}
      <PageLoader key={slug} slug={slug || ""} />
    </>
  )
}

function App() {
  return (
    <div className="flex flex-col h-screen w-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/tray" replace />} />
          <Route path="/:slug" element={<GraphRenderer />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
