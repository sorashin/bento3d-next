import { atom } from 'jotai';
import { Modular } from 'nodi-modular';
import { BufferGeometry } from 'three';
import { convertGeometryInterop } from '@/components/3d/utils/geometryUtils';
import init from 'nodi-modular';
import hanger from "@/assets/graph/hanger.json";

export const modularAtom = atom<Modular | null>(null);
export const nodesAtom = atom<any[]>([]);
export const geometriesAtom = atom<BufferGeometry[]>([]);

export const initializeModular = async (
  setModular: (modular: Modular) => void
) => {
  await init();
  setModular(Modular.new());
};

export const loadGraph = (
  modular: Modular | null,
  setNodes: (nodes: any[]) => void,
  setGeometries: (geometries: BufferGeometry[]) => void
) => {
  if (!modular) return;
  
  modular.loadGraph(JSON.stringify(hanger.graph));
  const nodes = modular.getNodes();
  const numberNodes = nodes.filter(
    (n) => n.variant === "Number" || n.variant === "NumberSlider"
  );
  setNodes(numberNodes);
  evaluateGraph(modular, setGeometries);
};

const evaluateGraph = async (
  modular: Modular | null,
  setGeometries: (geometries: BufferGeometry[]) => void
) => {
  if (!modular) return;
  
  try {
    const result = await modular.evaluate();
    const { geometryIdentifiers } = result;
    
    const gs = geometryIdentifiers!
      .map((id) => {
        const interop = modular.findGeometryInteropById(id);
        return interop ? convertGeometryInterop(interop) : null;
      })
      .filter((g): g is BufferGeometry => g !== null);
    
    setGeometries(gs);
  } catch (error) {
    console.error("Error evaluating graph:", error);
    setGeometries([]);
  }
};

export const updateNodePropertyAtom = atom(
    null,
    (get, set, { id, value, evaluate }: { id: string; value: number; evaluate: () => Promise<void> }) => {
      const modular = get(modularAtom);
      if (!modular) return;
  
      try {
        const property = {
          name: "value",
          value: {
            type: "Number" as const,
            content: value,
          },
        };
        
        const propertyCopy = {
          ...property,
          value: { ...property.value },
        };
        
        modular.changeNodeProperty(id, propertyCopy);
        
        // evaluateCallbackを実行
        evaluate();
      } catch (error) {
        console.error("Error updating node property:", error);
      }
    }
  );