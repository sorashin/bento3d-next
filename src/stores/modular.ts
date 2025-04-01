import { atom } from 'jotai';
import { Modular } from 'nodi-modular';
import { BufferGeometry } from 'three';
import { convertGeometryInterop } from '@/components/3d/utils/geometryUtils';
import init from 'nodi-modular';
import shelfs from "@/assets/graph/shelfs.json";

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
    (get, set, { id, value, evaluate }: { id: string; value: number; evaluate: () => Promise<void> }) => {
      const modular = get(modularAtom);
      if (!modular) {
        console.warn("modular is not initialized");
        return;
      }
  
      try {
        
        
        const property = {
          name: "value",
          value: {
            type: "Number" as const,
            content: value,
          },
        };
        
        const propertyCopy = {
          name: property.name,
          value: { ...property.value },
        };
        
        
        modular.changeNodeProperty(id, propertyCopy);
        
        
        evaluate();
        
      } catch (error) {
        console.error("Error in changeNodeProperty:", error);
      }
    }
  );