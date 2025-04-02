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
    (get, set, { id, value }: { id: string; value: number|string }) => {
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
        evaluateGraph(modular, (geometries) => set(geometriesAtom, geometries));
        
      } catch (error) {
        console.error("Error in changeNodeProperty:", error);
      }
    }
  );

export const getNodePropertyAtom = atom((get) => {
  return (label: string) => {
    
    
    const nodes = get(nodesAtom);
    const targetNode = nodes.find(node => node.label === label);
    
    if (!targetNode) {
      return null;
    }

    // const property = targetNode.properties.find(
    //   prop => prop.name === "value" || prop.name === "content"
    // );

    // if (!property) {
    //   return null;
    // }

    return {
      id: targetNode.id,
      // value: property.value.type === "String" 
      //   ? property.value.content as string
      //   : property.value.content as number,
      outputs: targetNode.outputs
    };
  };
});

