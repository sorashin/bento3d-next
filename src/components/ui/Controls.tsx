import { useAtom } from 'jotai';
import { polylinePointsAtom } from '../../stores/polylineStore';

const Controls = () => {
  const [polylines] = useAtom(polylinePointsAtom);

  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-700 p-4 overflow-auto flex flex-col">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Polylines</h2>
      
      {polylines.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-sm italic">
          No polylines yet. Click on the canvas to start drawing.
        </div>
      ) : (
        <div className="space-y-4">
          {polylines.map((polyline, polylineIndex) => (
            <div key={polyline.id} className="bg-white dark:bg-gray-600 p-2 rounded shadow-sm">
              <div className="text-sm font-medium dark:text-white">Polyline {polylineIndex + 1}</div>
              <div className="space-y-2 mt-2">
                {polyline.points.map((point, pointIndex) => (
                  <div key={point.id} className="text-xs text-gray-500 dark:text-gray-300">
                    Point {pointIndex + 1}: X: {point.position.x.toFixed(2)}, Y: {point.position.y.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-auto pt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>Click on the canvas to add points.</p>
        <p className="mt-1">Press Enter to complete a polyline.</p>
      </div>
    </div>
  );
};

export default Controls;