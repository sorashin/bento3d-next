import { useTexture } from "@react-three/drei";
import { BufferGeometry, DoubleSide, RepeatWrapping, SRGBColorSpace } from "three";
import { useEffect } from "react";

type HangerMeshProps = {
    geometry: BufferGeometry;
};

export default function HangerMesh({ geometry }: HangerMeshProps) {
    const [color, normal, displacement] = useTexture([
      "/textures/pine/color.jpg",
      "/textures/pine/normal.jpg",
      "/textures/pine/displacement.jpg"
    ]);
    color.colorSpace = SRGBColorSpace;

    const offsetX = 0.5; // offset along the x-axis
    const offsetY = 0.5; // offset along the y-axis
    const scale = 1; // scale of the texture

    color.repeat.set(scale, scale);
    color.wrapS = RepeatWrapping;
    color.wrapT = RepeatWrapping;
    color.offset.set(offsetX, offsetY);
    normal.repeat.set(scale, scale);
    normal.wrapS = RepeatWrapping;
    normal.wrapT = RepeatWrapping;
    normal.offset.set(offsetX, offsetY);
    displacement.repeat.set(scale, scale);
    displacement.wrapS = RepeatWrapping;
    displacement.wrapT = RepeatWrapping;
    displacement.offset.set(offsetX, offsetY);

    // geometryの属性をコンソールに出力
    useEffect(() => {
        console.log("Geometry Attributes:", geometry.attributes);
    }, [geometry]);

    return (
      <>
      <mesh geometry={geometry}>
        <meshStandardMaterial 
          map={color} 
          normalMap={normal} 
          displacementMap={displacement}
          displacementScale={scale}
          side={DoubleSide}
        />
      </mesh>
      <mesh>
        <boxGeometry args={[10, 10, 10]} />
      <meshStandardMaterial 
          map={color} 
          normalMap={normal} 
          displacementMap={displacement}
          displacementScale={scale}
          side={DoubleSide}
        />
      </mesh>
      </>
      
    );
}