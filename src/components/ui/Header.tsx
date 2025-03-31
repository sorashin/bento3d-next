import { useAtom } from 'jotai';
import { clearPointsAtom, polylinePointsAtom } from '../../stores/polylineStore';

const Header = () => {
  const [points] = useAtom(polylinePointsAtom);
  const [, clearPoints] = useAtom(clearPointsAtom);

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Polyline Drawer</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            Points: <span className="font-semibold">{points.length}</span>
          </div>
          <button
            onClick={clearPoints}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;