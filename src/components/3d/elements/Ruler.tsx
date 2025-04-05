import { Line, Html } from "@react-three/drei";
import { Vector2, Vector3 } from "three";
import { useState } from "react";

type RulerProps = {
  start: Vector2;
  end: Vector2;
  value: number;
  setValue?: (value: number) => void;
};

export const Ruler = (props: RulerProps) => {
  const { start, end, value, setValue } = props;
  const rulerSize = 0.4;
  const offset = 0.8;
  const color = "#666666"
  
  // フォーカス状態を管理
  const [focused, setFocused] = useState(false);

  // 点A、B
  const basePointA = new Vector2(start.x, start.y);
  const basePointB = new Vector2(end.x, end.y);

  // start -> end ベクトル
  const startToEnd = new Vector2().subVectors(basePointB, basePointA);
  const endToStart = new Vector2().subVectors(basePointA, basePointB);

  // ベクトルを90度回転（時計回り・反時計回り）
  // 時計回り90度: (x,y) -> (y,-x)
  // 反時計回り90度: (x,y) -> (-y,x)
  const startVecRotated = new Vector2(startToEnd.y, -startToEnd.x).normalize().multiplyScalar(rulerSize);
  const endVecRotated = new Vector2(-endToStart.y, endToStart.x).normalize().multiplyScalar(rulerSize);

  // オフセットベクトルを計算（startVecRotatedの方向に固定量）
  const offsetVec = startVecRotated.clone().normalize().multiplyScalar(offset);

  // 全ての点をオフセット
  const pointA = new Vector2(basePointA.x + offsetVec.x, basePointA.y + offsetVec.y);
  const pointB = new Vector2(basePointB.x + offsetVec.x, basePointB.y + offsetVec.y);
  const pointC = new Vector2(pointA.x + startVecRotated.x, pointA.y + startVecRotated.y);
  const pointD = new Vector2(pointB.x + endVecRotated.x, pointB.y + endVecRotated.y);

  // A-Cの中点
  const midpointAC = new Vector2(
    (pointA.x + pointC.x) / 2,
    (pointA.y + pointC.y) / 2
  );

  // B-Dの中点
  const midpointBD = new Vector2(
    (pointB.x + pointD.x) / 2,
    (pointB.y + pointD.y) / 2
  );

  // 線Eの中点（A-Cの中点とB-Dの中点の中点）
  const midpointE = new Vector2(
    (midpointAC.x + midpointBD.x) / 2,
    (midpointAC.y + midpointBD.y) / 2
  );

  // E線の方向ベクトルを計算（A-Cの中点からB-Dの中点へのベクトル）
  const eLineVector = new Vector2().subVectors(midpointBD, midpointAC);
  
  // E線に垂直なベクトルを計算（90度回転）
  const perpendicular = new Vector2(-eLineVector.y, eLineVector.x).normalize();
  
  // HTMLを配置するためのオフセットベクトルを計算
  const htmlOffsetVec = perpendicular.clone().multiplyScalar(0.15);
  const htmlPosition = new Vector3(midpointE.x + htmlOffsetVec.x, midpointE.y + htmlOffsetVec.y, 0.03);

  // 3D点の作成
  const points3D_A_C = [
    new Vector3(pointA.x, pointA.y, 0.0),
    new Vector3(pointC.x, pointC.y, 0.0)
  ];

  const points3D_B_D = [
    new Vector3(pointB.x, pointB.y, 0.0),
    new Vector3(pointD.x, pointD.y, 0.0)
  ];

  const points3D_E = [
    new Vector3(midpointAC.x, midpointAC.y, 0.0),
    new Vector3(midpointBD.x, midpointBD.y, 0.0)
  ];

  // 値の変更処理
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (setValue) {
      const newValue = parseFloat(e.target.value);
      if (!isNaN(newValue)) {
        setValue(newValue);
      }
    }
  };

  // E線の角度を計算（入力欄の回転に使用）
  const eLineAngle = Math.atan2(eLineVector.y, eLineVector.x);
  const eLineDegrees = eLineAngle * (180 / Math.PI);

  return (
    <>
      {/* A-C線 */}
      <Line points={points3D_A_C} color={color} lineWidth={1} />
      
      {/* B-D線 */}
      <Line points={points3D_B_D} color={color} lineWidth={1} />
      
      {/* E線（A-Cの中点とB-Dの中点を結ぶ線） */}
      <Line points={points3D_E} color={color} lineWidth={1.5} />
      
      {/* E線に沿ってHTMLを配置 */}
      <Html position={htmlPosition} center>
        <div 
          style={{
            transform: `translate(-50%, 0%) rotate(0deg)`,
            background: focused ? 'rgba(240, 240, 240, 0.8)' : 'rgba(255, 255, 255, 0.5)',
            padding: '2px 4px',
            borderRadius: '3px',
            border: '1px solid #ccc',
            fontSize: '12px',
            transition: 'background 0.2s',
            width: '40px',
            textAlign: 'center',
            pointerEvents: 'auto',
            // transformOrigin: 'center bottom'
          }}
        >
          <input
            type="text"
            value={value}
            onChange={handleValueChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              outline: 'none',
              textAlign: 'center',
              fontSize: '12px',
            }}
          />
        </div>
      </Html>
    </>
  );
};