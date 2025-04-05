import { Vector2, Vector3 } from "three";

// スナップ方向の型定義
export type SnapDirection = 'none' | 'horizontal' | 'vertical';

// スナップ結果の型定義
export interface SnapResult {
  snapDirection: SnapDirection;
  guidelinePoints: Vector3[];
  snappedPoint: Vector2;
}

// グリッドにスナップさせる関数
export const snapToGrid = (value: number, snapLength: number) => {
  return Math.round(value / snapLength) * snapLength;
};

// スナップ方向を検出し、ガイドラインを生成する関数
export const detectSnapDirection = (
  previousPoint: Vector2,
  currentPoint: Vector2,
  threshold: number = 0.05,
  extensionLength: number = 100
): SnapResult => {
  if (!previousPoint) {
    return {
      snapDirection: 'none',
      guidelinePoints: [],
      snappedPoint: currentPoint.clone()
    };
  }

  // 差分を計算
  const dx = Math.abs(currentPoint.x - previousPoint.x);
  const dy = Math.abs(currentPoint.y - previousPoint.y);
  
  let snapDirection: SnapDirection = 'none';
  let guidelinePoints: Vector3[] = [];
  const snappedPoint = currentPoint.clone();
  
  // XとYの変化量を比較して、より小さい方向にスナップ
  if (dx < dy * threshold) {
    // X方向の変化が小さいので垂直方向にスナップ
    snapDirection = 'vertical';
    
    // 垂直方向のスナップポイント
    snappedPoint.x = previousPoint.x;
    
    // ガイドラインの設定
    const direction = currentPoint.y > previousPoint.y ? 1 : -1;
    guidelinePoints = [
      new Vector3(previousPoint.x, previousPoint.y, 0.01),
      new Vector3(previousPoint.x, previousPoint.y + direction * extensionLength, 0.01)
    ];
  } else if (dy < dx * threshold) {
    // Y方向の変化が小さいので水平方向にスナップ
    snapDirection = 'horizontal';
    
    // 水平方向のスナップポイント
    snappedPoint.y = previousPoint.y;
    
    // ガイドラインの設定
    const direction = currentPoint.x > previousPoint.x ? 1 : -1;
    guidelinePoints = [
      new Vector3(previousPoint.x, previousPoint.y, 0.01),
      new Vector3(previousPoint.x + direction * extensionLength, previousPoint.y, 0.01)
    ];
  }
  
  return {
    snapDirection,
    guidelinePoints,
    snappedPoint
  };
};

// 水平または垂直にスナップさせる関数
// previousPoint: 前の点
// currentPoint: 現在の点
// threshold: スナップする角度の閾値（度数法、デフォルトは10度）
export const snapToDirections = (
  previousPoint: Vector2,
  currentPoint: Vector2,
  threshold: number = .3
): Vector2 => {
  if (!previousPoint) return currentPoint;
  
  // 前の点から現在の点へのベクトル
  const dx = currentPoint.x - previousPoint.x;
  const dy = currentPoint.y - previousPoint.y;
  
  // ベクトルの角度（ラジアン）
  const angle = Math.atan2(dy, dx);
  // 度数法に変換
  const degrees = angle * (180 / Math.PI);
  
  // 角度の絶対値
  const absDegrees = Math.abs(degrees);
  
  // 結果を格納する新しいVector2を作成
  const result = currentPoint.clone();
  
  // 水平方向にスナップ（角度が0°または180°に近い場合）
  if (absDegrees < threshold || Math.abs(absDegrees - 180) < threshold) {
    result.y = previousPoint.y; // Y座標を前の点と同じに
  }
  // 垂直方向にスナップ（角度が90°または270°に近い場合）
  else if (Math.abs(absDegrees - 90) < threshold || Math.abs(absDegrees - 270) < threshold) {
    result.x = previousPoint.x; // X座標を前の点と同じに
  }
  
  return result;
};

// 水平方向のみにスナップさせる関数とvertical関数は変更なし