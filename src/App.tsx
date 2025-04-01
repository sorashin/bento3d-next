import { Provider, useAtom } from 'jotai';
import Canvas from './components/3d/Canvas';
import Controls from './components/ui/Controls';
import Header from './components/ui/Header';
import { useEffect, useCallback } from 'react';
import { modularAtom, nodesAtom, geometriesAtom, evaluateGraph } from '@/stores/modular';
import init, { Modular } from 'nodi-modular';
import hanger from "@/assets/graph/hanger.json";
import { convertGeometryInterop } from './components/3d/utils/geometryUtils';
import { BufferGeometry } from 'three';


function App() {
  const [modular, setModular] = useAtom(modularAtom);
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [geometries, setGeometries] = useAtom(geometriesAtom);

  const evaluateGraph = useCallback(async () => {
    if (!modular) return;

    try {
      const result = await modular.evaluate();
      if (!result || !result.geometryIdentifiers) {
        setGeometries([]);
        return;
      }

      const gs = Array.isArray(result.geometryIdentifiers) 
        ? result.geometryIdentifiers
            .map((id) => {
              const interop = modular.findGeometryInteropById(id);
              return interop ? convertGeometryInterop(interop) : null;
            })
            .filter((g): g is BufferGeometry => g !== null)
        : [];
      
      setGeometries(gs);
    } catch (error) {
      console.error("Error evaluating graph:", error);
      setGeometries([]);
    }
  }, [modular, setGeometries]);

  useEffect(() => {
    (async () => {
      await init();
      setModular(Modular.new());
    })();
  }, [init]);

  useEffect(() => {
    if (modular !== null) {
      modular.loadGraph(JSON.stringify(hanger.graph));
      // modular.loadGraph(JSON.stringify(brickWall.graph));
      const nodes = modular.getNodes();
      const numberNodes = nodes.filter((n) => n.variant === "Number" || n.variant === "NumberSlider");
      setNodes(numberNodes);
      
      evaluateGraph();
    }
  }, [modular, evaluateGraph]);


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