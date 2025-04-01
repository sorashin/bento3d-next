import { Modular } from 'nodi-modular';
import { BufferGeometry } from 'three';
import { convertGeometryInterop } from './geometryUtils';

export const evaluateGraph = async (
  modular: Modular | null,
  setGeometries: (geometries: BufferGeometry[]) => void
) => {
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
}; 