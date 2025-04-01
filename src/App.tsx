import { useAtom } from 'jotai';
import Canvas from './components/3d/Canvas';
import Controls from './components/ui/Controls';
import Header from './components/ui/Header';
import { useEffect } from 'react';
import { 
  modularAtom, 
  nodesAtom, 
  geometriesAtom, 
  initializeModular,
  loadGraph 
} from '@/stores/modular';

function App() {
  const [modular, setModular] = useAtom(modularAtom);
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [geometries, setGeometries] = useAtom(geometriesAtom);

  useEffect(() => {
    initializeModular(setModular);
  }, []);

  useEffect(() => {
    if (modular) {
      loadGraph(modular, setNodes, setGeometries);
    }
  }, [modular]);

  return (
    <div className="flex flex-col h-screen w-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Controls />
        <Canvas />
      </div>
    </div>
  );
}

export default App;