import { useAtom } from 'jotai';
import { polylinePointsAtom } from '../store/polylineStore';

const Controls = () => {
  const [points] = useAtom(polylinePointsAtom);

  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-700 p-4 overflow-auto flex flex-col">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Points</h2>
      
      {points.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-sm italic">
          No points yet. Click on the canvas to add points.
        </div>
      ) : (
        <div className="space-y-2">
          {points.map((point, index) => (
            <div 
              key={point.id} 
              className="bg-white dark:bg-gray-600 p-2 rounded shadow-sm"
            >
              <div className="text-sm font-medium dark:text-white">Point {index + 1}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">
                X: {point.position.x.toFixed(2)}, Y: {point.position.y.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-auto pt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>Click on the canvas to add points.</p>
        <p className="mt-1">A polyline will be drawn connecting all points in sequence.</p>
      </div>
    </div>
  );
};

export default Controls;