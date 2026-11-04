import type { PartId } from "./parts";

/** A part placed freely on the canvas. x/y is its top-left corner in canvas px. */
export interface PlacedPart {
  uid: string;
  partId: PartId;
  x: number;
  y: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

export type Box = Point & Size;

/** Blueprint minor grid, px. Free drops snap to it. */
export const GRID = 20;
/** Stacked parts overlap by this much so their outlines merge into one line. */
export const SEAM = 4;
/** Minimum reach (px) of the stacking magnet around another part's top/bottom edge. */
const MAGNET = 22;

/** True when two boxes overlap by more than the stacking seam. */
const collides = (a: Box, b: Box) =>
  Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > SEAM &&
  Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > SEAM;

/** Pan offset (screen px) and scale of the infinite blueprint. */
export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 3;
export const ZOOM_STEP = 1.2;

const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

/** Canvas-relative screen point → world point. */
export const screenToWorld = (p: Point, cam: Camera): Point => ({
  x: (p.x - cam.x) / cam.zoom,
  y: (p.y - cam.y) / cam.zoom,
});

/** Zoom to `zoom`, keeping the world point under the screen point `focus` fixed. */
export function zoomAt(cam: Camera, focus: Point, zoom: number): Camera {
  const z = clampZoom(zoom);
  const w = screenToWorld(focus, cam);
  return { x: focus.x - w.x * z, y: focus.y - w.y * z, zoom: z };
}

/** Camera that frames `boxes` inside a viewport of `view` with `pad` px margin. */
export function fitCamera(boxes: readonly Box[], view: Size, pad = 60): Camera {
  if (boxes.length === 0) return { x: 0, y: 0, zoom: 1 };
  const minX = Math.min(...boxes.map((b) => b.x));
  const minY = Math.min(...boxes.map((b) => b.y));
  const maxX = Math.max(...boxes.map((b) => b.x + b.w));
  const maxY = Math.max(...boxes.map((b) => b.y + b.h));
  const zoom = clampZoom(
    Math.min(
      1.5,
      (view.w - pad * 2) / (maxX - minX),
      (view.h - pad * 2) / (maxY - minY),
    ),
  );
  return {
    x: view.w / 2 - ((minX + maxX) / 2) * zoom,
    y: view.h / 2 - ((minY + maxY) / 2) * zoom,
    zoom,
  };
}

/**
 * Where a part dropped at `raw` lands: stacked onto a nearby part's top or
 * bottom edge (centred on it) if one is close, otherwise snapped to the grid.
 * Coordinates are world units; the canvas is unbounded.
 */
export function snapPosition(
  raw: Point,
  size: Size,
  others: readonly Box[],
): Point & { stacked: boolean } {
  const cx = raw.x + size.w / 2;
  let best: Point | null = null;
  // Dropping onto a part counts as stacking: reach scales with the part's height.
  let bestDist = Math.max(MAGNET, size.h * 0.6);

  for (const o of others) {
    const ocx = o.x + o.w / 2;
    if (Math.abs(cx - ocx) > Math.min(size.w, o.w) / 2) continue;
    const x = ocx - size.w / 2;
    const below = { x, y: o.y + o.h - SEAM };
    const above = { x, y: o.y - size.h + SEAM };
    for (const c of [below, above]) {
      const d = Math.abs(raw.y - c.y);
      // Skip slots already taken by another part.
      if (d < bestDist && !others.some((b) => collides({ ...c, ...size }, b))) {
        bestDist = d;
        best = c;
      }
    }
  }

  if (best) return { ...best, stacked: true };
  const grid = {
    x: Math.round(raw.x / GRID) * GRID,
    y: Math.round(raw.y / GRID) * GRID,
  };
  return { ...grid, stacked: false };
}

/** Lay parts out as one centred column, top to bottom, resting on `bottomY`. */
export function stackColumn(
  ids: readonly PartId[],
  centerX: number,
  bottomY: number,
  sizeOf: (id: PartId) => Size,
): PlacedPart[] {
  const heights = ids.map((id) => sizeOf(id).h);
  const total = heights.reduce((a, h) => a + h, 0) - SEAM * (ids.length - 1);
  let y = Math.max(0, bottomY - total);
  return ids.map((partId, i) => {
    const { w } = sizeOf(partId);
    const part = { uid: `starter-${i}`, partId, x: centerX - w / 2, y };
    y += heights[i] - SEAM;
    return part;
  });
}
