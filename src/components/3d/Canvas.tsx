import { Canvas as ThreeCanvas } from '@react-three/fiber';
import { OrthographicCamera, OrbitControls } from '@react-three/drei';
import PolylineDrawer from './PolylineDrawer';
import HangerMesh from '@/components/3d/elements/HangerMesh';
import { useAtom } from 'jotai';
import { geometriesAtom } from '@/stores/modular';

const Canvas = () => {
  const [geometries] = useAtom(geometriesAtom);
  return (
    <div className="flex-1 bg-gray-200 dark:bg-gray-800">
      <ThreeCanvas shadows>
        <color attach="background" args={['#1e293b']} />
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <OrthographicCamera
          makeDefault
          position={[0, 0, 5]}
          zoom={150}
          near={0.1}
          far={1000}
        />
        <OrbitControls
          enableRotate={false}
          enablePan={true}
          enableZoom={true}
          zoomSpeed={0.5}
        />
        <gridHelper args={[20, 20, '#444444', '#222222']} rotation={[Math.PI / 2, 0, 0]} />
        <PolylineDrawer />
        {geometries.map((geometry, index) => (
          <HangerMesh key={index} geometry={geometry} />
        ))}
      </ThreeCanvas>
    </div>
  );
};

export default Canvas;