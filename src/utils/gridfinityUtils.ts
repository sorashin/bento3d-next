import { Bin } from '@/stores/gridfinity';

/**
 * Calculates the minimum grid dimensions required to fit all bins.
 * Returns { totalRows, totalCols } where:
 * totalRows is the count along the X axis (width)
 * totalCols is the count along the Y axis (height)
 * Defaults to 3x3 if no bins exist.
 */
export const calculateGridSize = (bins: Bin[]) => {
  if (bins.length === 0) {
    return { totalRows: 3, totalCols: 3 };
  }

  let maxX = 0;
  let maxY = 0;

  bins.forEach((bin) => {
    // bin.start is [x, y]
    // bin.rows is width (x-axis span)
    // bin.cols is height (y-axis span)
    const endX = bin.start[0] + bin.rows;
    const endY = bin.start[1] + bin.cols;

    if (endX > maxX) maxX = endX;
    if (endY > maxY) maxY = endY;
  });

  return {
    totalRows: Math.max(3, maxX),
    totalCols: Math.max(3, maxY),
  };
};

