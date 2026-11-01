export type Box = { x: number; y: number; w: number; h: number; index: number };

type Item = { index: number; area: number };

/** Squarified treemap. Large entries stay close to square instead of becoming strips. */
export function treemap(weights: number[], width: number, height: number): Box[] {
  const total = weights.reduce((sum, n) => sum + n, 0);
  if (total <= 0 || width < 1 || height < 1) return [];
  const items = weights
    .map((bytes, index) => ({ index, area: (bytes / total) * width * height }))
    .filter((item) => item.area > 0)
    .sort((a, b) => b.area - a.area);
  const out: Box[] = [];
  squarify(items, { x: 0, y: 0, w: width, h: height }, out);
  return out;
}

function squarify(items: Item[], box: BoxSpace, out: Box[]) {
  if (items.length === 0 || box.w < 1 || box.h < 1) return;
  if (items.length === 1) {
    out.push({ x: box.x, y: box.y, w: box.w, h: box.h, index: items[0].index });
    return;
  }
  const vertical = box.w < box.h;
  const side = vertical ? box.h : box.w;
  const row: Item[] = [];
  let rest = items;
  while (rest.length > 0) {
    const next = rest[0];
    if (row.length === 0 || worst(row, side) >= worst([...row, next], side)) {
      row.push(next);
      rest = rest.slice(1);
    } else {
      break;
    }
  }
  const rowArea = row.reduce((sum, item) => sum + item.area, 0);
  const thickness = rowArea / side;
  let cursor = vertical ? box.y : box.x;
  for (const item of row) {
    const extent = item.area / thickness;
    if (vertical) {
      out.push({ x: box.x, y: cursor, w: thickness, h: extent, index: item.index });
    } else {
      out.push({ x: cursor, y: box.y, w: extent, h: thickness, index: item.index });
    }
    cursor += extent;
  }
  if (vertical) {
    squarify(rest, { x: box.x + thickness, y: box.y, w: box.w - thickness, h: box.h }, out);
  } else {
    squarify(rest, { x: box.x, y: box.y + thickness, w: box.w, h: box.h - thickness }, out);
  }
}

type BoxSpace = { x: number; y: number; w: number; h: number };

function worst(row: Item[], side: number): number {
  const sum = row.reduce((total, item) => total + item.area, 0);
  let max = 0;
  let min = Number.POSITIVE_INFINITY;
  for (const item of row) {
    if (item.area > max) max = item.area;
    if (item.area < min) min = item.area;
  }
  const side2 = side * side;
  const sum2 = sum * sum;
  return Math.max((side2 * max) / sum2, sum2 / (side2 * min));
}
