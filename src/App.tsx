import { Provider } from 'jotai';
import Canvas from './components/Canvas';
import Controls from './components/Controls';
import Header from './components/Header';

function App() {
  return (
    <Provider>
      <div className="flex flex-col h-screen w-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Controls />
          <Canvas />
        </div>
      </div>
    </Provider>
  );
}

export default App;