// グリッドにスナップさせる関数
export const snapToGrid = (value: number, snapLength: number) => {
  return Math.round(value / snapLength) * snapLength;
};