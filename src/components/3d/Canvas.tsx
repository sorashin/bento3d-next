import { Canvas as ThreeCanvas } from '@react-three/fiber';
import {  OrbitControls, GizmoViewport, GizmoHelper } from '@react-three/drei';
import PolylineDrawer from './PolylineDrawer';
import HangerMesh from '@/components/3d/elements/HangerMesh';
import { useAtom } from 'jotai';
import { geometriesAtom } from '@/stores/modular';

const Canvas = () => {
  const [geometries] = useAtom(geometriesAtom);
  
  return (
    <div className="flex-1 bg-gray-200 dark:bg-gray-800">
      <ThreeCanvas 
        orthographic
        camera={{
          position: [0, 0, 100], // clipping 問題解決するため zを１００にする
          fov: 40,
          zoom: 500,
          near: 0.1,
          far: 10000,
        }}
        frameloop="demand"
      >
        <color attach="background" args={['#1e293b']} />
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <GizmoHelper margin={[50, 100]} alignment="bottom-right" scale={0.5}>
          <GizmoViewport
            axisColors={["hotpink", "aquamarine", "#3498DB"]}
            labelColor="black"
          />
        </GizmoHelper>
        
        <OrbitControls
          enableRotate={true}
          enablePan={true}
          enableZoom={true}
          zoomSpeed={0.5}
        />
        <gridHelper args={[20, 20, '#444444', '#222222']} rotation={[Math.PI / 2, 0, 0]} />
        <PolylineDrawer />
        <group rotation={[Math.PI, 0, 0]} >
          {geometries.map((geometry, index) => (
            <HangerMesh key={index} geometry={geometry} />
          ))}
        </group>
      </ThreeCanvas>
    </div>
  );
};

export default Canvas;