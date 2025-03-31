import { Provider } from 'jotai';
import Canvas from './components/3d/Canvas';
import Controls from './components/ui/Controls';
import Header from './components/ui/Header';

function App() {
  return (
    
      <div className="flex flex-col h-screen w-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Controls />
          <Canvas />
        </div>
      </div>
    
  );
}

export default App;