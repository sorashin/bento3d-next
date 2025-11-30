import { Edges } from "@react-three/drei"
import { ManifoldGeometriesWithInfo } from "@/stores/modular"
import { useSettingsStore } from "@/stores/settings"

type ModelProps = {
  manifoldGeometries: ManifoldGeometriesWithInfo[]
}

// ラベルから番号を抽出する関数（例: bin_2x2_u1_001_union → 1）
const extractBinNumber = (label: string): number => {
  const match = label.match(/bin_\d+x\d+_u\d+_(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

// ラベルに基づいてZ軸オフセットを計算する関数
const calculateZOffset = (label: string, bom: number): number => {
  // basePlateで終わるラベルは移動しない
  if (label === "basePlate") {
    return 0
  }

  // bin_*_unionの場合はパララックス移動
  if (label.includes("bin_") ) {
    const binNumber = extractBinNumber(label)
    // 番号に基づいて移動距離を計算（番号 * 50mm * bom）
    return - binNumber * 50 * bom
  }

  // その他のラベルは移動しない
  return 0
}

export default function Model({ manifoldGeometries }: ModelProps) {
  const { bom } = useSettingsStore()
  
  return (
    <group rotation={[Math.PI, 0, 0]}>
      {manifoldGeometries.map((geometryInfo, index) => {
        const zOffset = calculateZOffset(geometryInfo.label, bom)
        
        return (
          <mesh 
            key={index} 
            geometry={geometryInfo.geometry} 
            rotation={[Math.PI, 0, 0]}
            position={[0, 0, zOffset]}
          >
            <meshStandardMaterial color={"#338FE8"} />
            <Edges
              // linewidth={4}
              scale={1.0}
              threshold={45} // Display edges only when the angle between two faces exceeds this value (default=15 degrees)
              color="#aaaaaa"
            />
          </mesh>
        )
      })}
    </group>
  )
}
