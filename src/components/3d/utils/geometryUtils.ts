import {
    BufferAttribute,
    BufferGeometry,
    CatmullRomCurve3,
    Vector3,
  } from "three";
  
  // Modularの幾何学インターフェイスをThree.jsのBufferGeometryに変換
  export const convertGeometryInterop = (interop: any): BufferGeometry | null => {
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
      
      case "Curve": {
        const { data } = interop;
        const geometry = new BufferGeometry();
        const { vertices } = data;
        
        // verticesを通過点とする曲線を生成
        const points = vertices.map((v: number[]) => new Vector3(v[0], v[1], v[2]));
        const curve = new CatmullRomCurve3(points);
        const points2 = curve.getPoints(50);
        const positions = new Float32Array(points2.length * 3);
        
        points2.forEach((p, i) => {
          positions[i * 3] = p.x;
          positions[i * 3 + 1] = p.y;
          positions[i * 3 + 2] = p.z;
        });
        
        geometry.setAttribute("position", new BufferAttribute(positions, 3));
        return geometry;
      }
      
      default:
        return null;
    }
  };