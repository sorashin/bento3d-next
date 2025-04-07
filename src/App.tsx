import Canvas from "./components/3d/Canvas"
import { useEffect } from "react"
import { useModularStore } from "@/stores/modular"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom"
import Controls from "./components/ui/Controls"

// グラフを表示するコンポーネント
function GraphRenderer() {
  const { slug } = useParams<{ slug: string }>()
  const { modular, initializeModular, loadGraph } = useModularStore()

  useEffect(() => {
    initializeModular()
  }, [])

  useEffect(() => {
    if (modular && slug) {
      loadGraph(slug)
    }
  }, [modular, slug])

  return (
    <div className="flex flex-1 overflow-hidden">
      <Canvas />
      <Controls />
    </div>
  )
}

function App() {
  return (
    <div className="flex flex-col h-screen w-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/gridfinity" replace />} />
          <Route path="/:slug" element={<GraphRenderer />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
