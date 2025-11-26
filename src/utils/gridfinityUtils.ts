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

/**
 * Normalizes bins so that the minimum start position is (0, 0).
 * Shifts all bins by the offset needed to make coordinates non-negative.
 * Returns the normalized bins array.
 */
export const normalizeBins = (bins: Bin[]): Bin[] => {
  if (bins.length === 0) return bins;

  // Find minimum x and y coordinates
  let minX = Infinity;
  let minY = Infinity;

  bins.forEach((bin) => {
    if (bin.start[0] < minX) minX = bin.start[0];
    if (bin.start[1] < minY) minY = bin.start[1];
  });

  // If already normalized (min is 0 or positive), return as-is
  if (minX >= 0 && minY >= 0) {
    return bins;
  }

  // Calculate offset to shift all bins
  const offsetX = minX < 0 ? -minX : 0;
  const offsetY = minY < 0 ? -minY : 0;

  // Shift all bins
  return bins.map((bin) => ({
    ...bin,
    start: [bin.start[0] + offsetX, bin.start[1] + offsetY] as [number, number],
    end: [bin.end[0] + offsetX, bin.end[1] + offsetY] as [number, number],
  }));
};

