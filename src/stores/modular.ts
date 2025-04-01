import init, { Modular, NodeInterop } from "nodi-modular";
import { atom } from "jotai";
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Euler, Vector3 } from "three";
import { convertGeometryInterop } from "@/components/3d/utils/geometryUtils";




export const modularAtom = atom<Modular | null>(null);
export const nodesAtom = atom<NodeInterop[]>([]);
export const geometriesAtom = atom<BufferGeometry[]>([]);

export const updateNodePropertyAtom = atom(
    null,
    (get, set, { id, value }: { id: string; value: number }) => {
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
        
        // グラフを評価して幾何学データを更新
        evaluateGraph(modular, set);
      } catch (error) {
        console.error("Error updating node property:", error);
      }
    }
  );

  // ヘルパー関数
export const evaluateGraph = async (modular: Modular, set: any) => {
    try {
      const result = await modular.evaluate();
      const { geometryIdentifiers } = result;
      
      const gs = geometryIdentifiers
        .map((id) => {
          const interop = modular.findGeometryInteropById(id);
          return interop ? convertGeometryInterop(interop) : null;
        })
        .filter((g): g is BufferGeometry => g !== null);
      
      set(geometriesAtom, gs);
    } catch (error) {
      console.error("Error evaluating graph:", error);
      set(geometriesAtom, []);
    }
  };