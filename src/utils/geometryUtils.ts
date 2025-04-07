
import {
    BufferAttribute,
    BufferGeometry,
    DoubleSide,
    Mesh,
    MeshStandardMaterial,
    
  } from "three";
  
  // Modularの幾何学インターフェイスをThree.jsのBufferGeometryに変換
  const convertGeometryInterop = (interop: any): BufferGeometry | null => {
    switch (interop?.variant) {
      case "Mesh": {
        const { data } = interop;
        const geometry = new BufferGeometry();
  
        const { vertices, normals, faces } = data;
        geometry.setAttribute(
          "position",
          new BufferAttribute(new Float32Array(vertices.flat(1)), 3)
        );
        geometry.setAttribute(
          "normal",
          new BufferAttribute(new Float32Array(normals.flat(1)), 3)
        );
        if (faces !== undefined) {
          geometry.setIndex(
            new BufferAttribute(new Uint32Array(faces.flat(1)), 1)
          );
        }
  
        return geometry;
      }
      
      default:
        return null;
    }
  };
// / Modularの幾何学インターフェイスをThree.jsのMeshに変換
  const convertGeometryInteropForExport = (interop:any):Mesh | null => {
  switch(interop?.variant) {
    case "Mesh": {
      const { data } = interop;
      const { vertices, normals, uv, faces } = data
                const geometry = new BufferGeometry()
                const positionAttrib = new BufferAttribute(
                  new Float32Array(vertices.flat()),
                  3
                )
                const normalAttrib = new BufferAttribute(
                  new Float32Array(normals.flat()),
                  3
                )
                geometry.setAttribute("position", positionAttrib)
                geometry.setAttribute("normal", normalAttrib)
                if (uv !== undefined) {
                  const uvAttrib = new BufferAttribute(
                    new Float32Array(uv.flat()),
                    2
                  )
                  geometry.setAttribute("uv", uvAttrib)
                }
                if (faces !== undefined) {
                  const index = new BufferAttribute(
                    new Uint32Array(faces.flat()),
                    1
                  )
                  geometry.setIndex(index)
                }
      
      return new Mesh(
        new BufferGeometry(),
        new MeshStandardMaterial({
          side: DoubleSide,
        })
      );
    }
    default:
      return null;
  }}


  export {convertGeometryInterop, convertGeometryInteropForExport}