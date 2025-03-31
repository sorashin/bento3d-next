import { Line } from "@react-three/drei";
import { Vector2, Vector3 } from "three";

type PolylineProps = {
  points: Vector2[];
  color?: string;
};

export const Polyline = (props: PolylineProps) => {
  //console.log("PreviewPolyline");
  const points3D = props.points.map(
    (point) => new Vector3(point.x, point.y, 0),
  );

  return (
    <>
      <Line points={points3D} color={props.color ?? "black"} lineWidth={2} />
    </>
  );
};
