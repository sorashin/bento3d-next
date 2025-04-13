import React, { act } from "react"
import { Vector3 } from "three"
import { Line, Html, Sphere, Text } from "@react-three/drei"

interface Dim3dProps {
  pointA: [number, number, number] | Vector3
  pointB: [number, number, number] | Vector3
  label: string
  color?: string
  lineWidth?: number
  active: boolean
}

const Dim3d: React.FC<Dim3dProps> = ({
  pointA,
  pointB,
  label,
  active = false,
  color = active ? "#4597F7" : "#999",
  lineWidth = active ? 2 : 1,
}) => {
  // Vector3オブジェクトに変換
  const vecA = pointA instanceof Vector3 ? pointA : new Vector3(...pointA)
  const vecB = pointB instanceof Vector3 ? pointB : new Vector3(...pointB)

  const size = 10

  // 基準平面を決定（XY平面またはYZ平面）
  const isXYPlane = label === "width" || label === "depth"

  // A→Bベクトル
  const vecAB = new Vector3().subVectors(vecB, vecA)

  // 回転軸を決定
  const rotationAxis = isXYPlane ? new Vector3(0, 0, 1) : new Vector3(1, 0, 0)

  // A→Bを時計回りに90度回転させたベクトル（正規化して長さ0.5に設定）
  const vecRotatedFromA = vecAB
    .clone()
    .applyAxisAngle(rotationAxis, -Math.PI / 2)
    .normalize()
    .multiplyScalar(size)

  // B→Aを反時計回りに90度回転させたベクトル（正規化して長さsizeに設定）
  const vecRotatedFromB = vecAB
    .clone()
    .negate()
    .applyAxisAngle(rotationAxis, Math.PI / 2)
    .normalize()
    .multiplyScalar(size)

  // 点C: Aから回転ベクトルを加えた点
  const vecC = new Vector3().addVectors(vecA, vecRotatedFromA)

  // 点D: Bから回転ベクトルを加えた点
  const vecD = new Vector3().addVectors(vecB, vecRotatedFromB)

  // 基準平面に合わせて座標を調整（同一平面上に配置）
  if (isXYPlane) {
    // XY平面の場合、Z座標を揃える
    vecC.setZ(vecA.z)
    vecD.setZ(vecB.z)
  } else {
    // YZ平面の場合、X座標を揃える
    vecC.setX(vecA.x)
    vecD.setX(vecB.x)
  }

  // A-Cの中点(midAC)
  const midAC = new Vector3().addVectors(vecA, vecC).multiplyScalar(0.5)

  // B-Dの中点(midBD)
  const midBD = new Vector3().addVectors(vecB, vecD).multiplyScalar(0.5)

  // midAC-midBDの中点（ラベル位置）
  const labelPosition = new Vector3()
    .addVectors(midAC, midBD)
    .multiplyScalar(0.5)
  const labelRotation: [number, number, number] =
    label === "width"
      ? [0, 0, 0]
      : label === "depth"
      ? [0, 0, Math.PI / 2]
      : [Math.PI / 2, Math.PI / 2, 0]

  // 寸法線のポイント配列
  const points = [midAC, midBD]

  return (
    <>
      {/* 寸法線 */}
      <Line points={points} color={color} lineWidth={lineWidth} />

      {/* 補助線1: A to C */}
      <Line
        points={[vecA, vecC]}
        color={color}
        lineWidth={lineWidth}
        dashed={false}
      />

      {/* 補助線2: B to D */}
      <Line
        points={[vecB, vecD]}
        color={color}
        lineWidth={lineWidth}
        dashed={false}
      />

      {/* ラベルテキスト */}
      <Text
        color={active ? "#4597F7" : "#999"}
        anchorX={label === "width" || label === "depth" ? "center" : "left"}
        anchorY={label === "width" || label === "depth" ? "top" : "middle"}
        position={labelPosition}
        fontSize={3}
        rotation={labelRotation}>
        {label.charAt(0).toUpperCase() + label.slice(1)}
      </Text>
      {/* <Html position={labelPosition} center>
        <p
          style={{
            color: color,
            fontSize: "0.8rem",
            background: "rgba(0,0,0,0.5)",
            padding: "2px 5px",
            borderRadius: "3px",
            whiteSpace: "nowrap",
          }}>
          {label}
        </p>
      </Html> */}
    </>
  )
}

export default Dim3d
