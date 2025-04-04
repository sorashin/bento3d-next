import { useAtom } from 'jotai';
import { clearPointsAtom, polylinePointsAtom } from '@/stores/points';
import { useEffect, useMemo } from 'react';
import { nodesAtom, updateNodePropertyAtom, pointNodeIdAtom } from '@/stores/modular';
import { useControls } from "leva";
import { Schema } from 'leva/dist/declarations/src/types';
import { useMachine } from '@xstate/react';
import { machine } from '@/stores/machine';
import { isDrawAtom } from '@/stores/settings';


const Controls = () => {
  const [polylines] = useAtom(polylinePointsAtom);
  const [,updateNodeProperty] = useAtom(updateNodePropertyAtom);
  const [nodes] = useAtom(nodesAtom);
  
  const [,setPointNode] = useAtom(pointNodeIdAtom);
  const [,clearPoints] = useAtom(clearPointsAtom);
  

  const [isDraw,setIsDraw] = useAtom(isDrawAtom);

    
  
  // Levaコントロール用のパラメータを生成
  const params = useMemo(() => {
    console.log('nodes', nodes);
    return nodes
      .map((node) => {
        
        const { properties, label } = node;
        
        const property = properties.find((prop) => prop.name === "value"||prop.name === "content");
        if (property === undefined) {
          return null;
        }
        

        const { value } = property;
        
        if (node.label !== undefined && value.type === "Number") {//Number兼NumberSlider
          const range = properties.find((prop: { name: string; }) => prop.name === 'range');
          const step = properties.find((prop: { name: string; }) => prop.name === 'step');

          const parameter = {
            id: node.id,
            name: node.label,
            value: value.content,
          };

          if(range?.value.type === 'Vector2d' && step?.value.type === 'Number') {
            return {
              min: range.value.content[0],
              max: range.value.content[1],
              step: step.value.content,
              ...parameter
            };
          }
          
          return parameter;
        }else if(node.label !== undefined && value.type === "String"){
          console.log('string', value);
          if(label === "points"){
            setPointNode(node.id);
          }
          const parameter = {
            id: node.id,
            name: node.label,
            value: value.content,
          };
          
          return parameter;
        }
        return null;
      })
      .reduce((acc, curr) => {
        if (curr !== null) {
          if ('min' in curr) {
            acc[curr.name] = {
              value: curr.value,
              min: curr.min,
              max: curr.max,
              step: curr.step,
              onEditEnd: (value: number) => {
                updateNodeProperty({ 
                  id: curr.id, 
                  value
                });
              },
            };
          } else if(typeof(curr.value) == "string"){
            console.log('curr', curr);
            acc[curr.name] = {
              value: curr.value,
              onEditEnd: (value: string) => {
                updateNodeProperty({ 
                  id: curr.id, 
                  value
                });
              },
            };
          } else {
            acc[curr.name] = {
              value: curr.value,
              onEditEnd: (value: number) => {
                updateNodeProperty({ 
                  id: curr.id, 
                  value
                });
              },
            };
          }
        }
        
        return acc;
      }, {} as Schema);
  }, [nodes, updateNodeProperty]);
  useEffect(()=>{
    console.log('params', params);
  }, [params]);

  useControls(params, [params]);

  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-700 p-4 overflow-auto flex flex-col fixed top-0 left-0 bottom-0 z-10">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Polylines</h2>

      
        <button
          onClick={() => setIsDraw(!isDraw)}
          className={`px-4 py-2 rounded-md ${
            isDraw 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-300 text-gray-700'
          }`}
        >
          {isDraw ? 'Disable Drawing' : 'Enable Drawing'}
        </button>

      <button onClick={clearPoints} className='bg-red-500 text-white px-4 py-2 rounded-md'>Clear Points</button>
      
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