import { atom } from 'jotai';
import { Modular, NodeInterop } from 'nodi-modular';
import { BufferGeometry } from 'three';
import { convertGeometryInterop } from '@/components/3d/utils/geometryUtils';
import init from 'nodi-modular';
import shelfs from "@/assets/graph/shelfs.json";

export const modularAtom = atom<Modular | null>(null);
export const nodesAtom = atom<NodeInterop[]>([]);
export const geometriesAtom = atom<BufferGeometry[]>([]);
export const pointNodeIdAtom = atom<string|null>(null);

export const initializeModular = async (
  setModular: (modular: Modular) => void
) => {
  await init();
  setModular(Modular.new());
};

export const loadGraph = (
  modular: Modular | null,
  setNodes: (nodes: NodeInterop[]) => void,
  setGeometries: (geometries: BufferGeometry[]) => void
) => {
  if (!modular) return;
  
  modular.loadGraph(JSON.stringify(shelfs.graph));
  const nodes = modular.getNodes();
  setNodes(nodes);
  evaluateGraph(modular, setGeometries);
};

export const evaluateGraph = async (
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
    (get, set, { id, value, evaluate }: { id: string; value: number|string; evaluate: () => Promise<void> }) => {
      const modular = get(modularAtom);
      if (!modular) {
        console.warn("modular is not initialized");
        return;
      }
  
      try {
        
        const property = typeof value === 'string' 
          ? {
              name: "content",
              value: {
                type: "String" as const,
                content: value,
              },
            }
          : {
              name: "value",
              value: {
                type: "Number" as const,
                content: value as number,
              },
            };
        
        
        
        modular.changeNodeProperty(id, property);
        
        evaluate();
        console.log("value updated", value);
      } catch (error) {
        console.error("Error in changeNodeProperty:", error);
      }
    }
  );