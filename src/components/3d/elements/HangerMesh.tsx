
import { BufferGeometry, DoubleSide, RepeatWrapping, SRGBColorSpace } from "three";
import { useEffect } from "react";

type HangerMeshProps = {
    geometry: BufferGeometry;
};

export default function HangerMesh({ geometry }: HangerMeshProps) {
    

    // geometryの属性をコンソールに出力
    useEffect(() => {
        console.log("Geometry Attributes:", geometry.attributes);
    }, [geometry]);

    return (
      <>
      <mesh geometry={geometry} rotation={[Math.PI, 0, 0]}>
        <meshStandardMaterial color="red" />
      </mesh>
      
      </>
      
    );
}