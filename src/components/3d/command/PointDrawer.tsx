import { useCallback, useEffect } from 'react';


import { useAtom, useAtomValue } from 'jotai';
import { 
  
  midPointAtom,
} from '@/stores/points';

import { Point } from '@/components/3d/elements/Point';
import { polylinePointsAtom } from '@/stores/points';
import { getNodePropertyAtom} from '@/stores/modular';






const PointDrawer = () => {
  
  const [midPoint, setMidPoint] = useAtom(midPointAtom);
  const [polylinePoints] = useAtom(polylinePointsAtom);
  const getNodeProperty = useAtomValue(getNodePropertyAtom);
  

  
    useEffect(() => {
    const nodeProperty = getNodeProperty("midPoints");
    console.log('midPointNode',nodeProperty);
  }, [polylinePoints]);

  return (
    <>
      {
        midPoint.map((point) => (
          <Point point={point} />
        ))
      }
      
    </>
  );
};

export default PointDrawer;