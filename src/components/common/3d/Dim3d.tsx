import React, { act } from "react"
import { Vector3 } from "three"
import { Line, Html, Sphere, Text } from "@react-three/drei"

interface Dim3dProps {
  pointA: [number, number, number] | Vector3
  pointB: [number, number, number] | Vector3
  label: string
  value?: number
  color?: string
  lineWidth?: number
  active: boolean
  offset?: number // オフセット値を設定するプロパティ
}

const Dim3d: React.FC<Dim3dProps> = ({
  pointA,
  pointB,
  label,
  value,
  active = false,
  color = active ? "#4597F7" : "#999",
  lineWidth = active ? 2 : 1,
  offset = 10, // デフォルトオフセット値
}) => {
  // Vector3オブジェクトに変換
  const vecA = pointA instanceof Vector3 ? pointA : new Vector3(...pointA)
  const vecB = pointB instanceof Vector3 ? pointB : new Vector3(...pointB)

  // 基準平面を決定（XY平面またはYZ平面）
  const isXYPlane = label === "width" || label === "depth"

  // 箱から遠ざかる方向へのオフセットベクトルを作成
  const offsetVector = new Vector3()
  if (label === "width") {
    // 幅の場合はY方向に遠ざける（上方向）
    offsetVector.set(0, -1, 0).multiplyScalar(offset)
  } else if (label === "depth") {
    // 奥行きの場合はX方向に遠ざける（右方向）
    offsetVector.set(1, 0, 0).multiplyScalar(offset)
  } else if (label === "height") {
    // 高さの場合はZ方向に遠ざける（手前方向）
    offsetVector.set(0, 1, 0).multiplyScalar(offset)
  }

  // 点AとBにオフセットを適用
  const offsetVecA = vecA.clone().add(offsetVector)
  const offsetVecB = vecB.clone().add(offsetVector)

  // A→Bベクトル（オフセット後）
  const vecAB = new Vector3().subVectors(offsetVecB, offsetVecA)

  // 回転軸を決定
  const rotationAxis = isXYPlane ? new Vector3(0, 0, 1) : new Vector3(1, 0, 0)

  // A→Bを時計回りに90度回転させたベクトル（正規化して長さoffsetに設定）
  const vecRotatedFromA = vecAB
    .clone()
    .applyAxisAngle(rotationAxis, -Math.PI / 2)
    .normalize()
    .multiplyScalar(offset)

  // B→Aを反時計回りに90度回転させたベクトル（正規化してoffset長さに設定）
  const vecRotatedFromB = vecAB
    .clone()
    .negate()
    .applyAxisAngle(rotationAxis, Math.PI / 2)
    .normalize()
    .multiplyScalar(offset)

  // 点C: オフセット後のAから回転ベクトルを加えた点
  const vecC = new Vector3().addVectors(offsetVecA, vecRotatedFromA)

  // 点D: オフセット後のBから回転ベクトルを加えた点
  const vecD = new Vector3().addVectors(offsetVecB, vecRotatedFromB)

  // 基準平面に合わせて座標を調整（同一平面上に配置）
  if (isXYPlane) {
    // XY平面の場合、Z座標を揃える
    vecC.setZ(offsetVecA.z)
    vecD.setZ(offsetVecB.z)
  } else {
    // YZ平面の場合、X座標を揃える
    vecC.setX(offsetVecA.x)
    vecD.setX(offsetVecB.x)
  }

  // A-Cの8割の位置にmidACを設定 (offsetVecAから見てvecCの方向に80%の位置)
  const midAC = new Vector3().copy(offsetVecA).lerp(vecC, 0.7)

  // B-Dの8割の位置(midBD)
  const midBD = new Vector3().copy(offsetVecB).lerp(vecD, 0.7)

  // midAC-midBDの中点（ラベル位置）
  const labelPosition = new Vector3()
    .addVectors(midAC, midBD)
    .multiplyScalar(0.5)

  // テキスト位置をオフセットと同様の方向に少し移動
  const textOffsetFactor = 0.4 // テキストオフセットの倍率
  if (label === "width") {
    // 幅の場合はY方向（上方向）に少し移動
    labelPosition.y -= offset * textOffsetFactor
  } else if (label === "depth") {
    // 奥行きの場合はX方向（右方向）に少し移動
    labelPosition.x += offset * textOffsetFactor
  } else if (label === "height") {
    // 高さの場合はZ方向（手前方向）に少し移動
    labelPosition.y += offset * textOffsetFactor
  }

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

      {/* 補助線1: オフセット後のA to C */}
      <Line
        points={[offsetVecA, vecC]}
        color={color}
        lineWidth={lineWidth}
        dashed={false}
      />

      {/* 補助線2: オフセット後のB to D */}
      <Line
        points={[offsetVecB, vecD]}
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
        fontSize={4}
        rotation={labelRotation}>
        {label.charAt(0).toUpperCase() + ":" + value}
      </Text>
    </>
  )
}

export default Dim3d
