import type { CSSProperties } from "react";
import {
  FlameShape,
  overlapsBelow,
  PartShape,
  partSize,
} from "@/components/common/part-shape";
import {
  type Box,
  DRAWING_PX_PER_M,
  type PlacedPart,
} from "@/lib/rocket/canvas";
import { PARTS } from "@/lib/rocket/parts";

export { DRAWING_PX_PER_M };

/** Bounding box of all placed parts, in builder (drawing) px. */
export function rocketBox(parts: readonly PlacedPart[]): Box {
  if (parts.length === 0) return { x: 0, y: 0, w: 1, h: 1 };
  const boxes = parts.map((p) => ({ x: p.x, y: p.y, ...partSize(p.partId) }));
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  return {
    x,
    y,
    w: Math.max(...boxes.map((b) => b.x + b.w)) - x,
    h: Math.max(...boxes.map((b) => b.y + b.h)) - y,
  };
}

/** Deterministic scatter for debris: direction, distance and spin per part. */
const debrisVars = (i: number): CSSProperties =>
  ({
    "--dx": `${(i % 2 ? 1 : -1) * (260 + ((i * 97) % 340))}px`,
    "--dy": `${-(220 + ((i * 61) % 320))}px`,
    "--rot": `${(i % 2 ? 1 : -1) * (180 + ((i * 113) % 360))}deg`,
    animationDelay: `${(i * 23) % 90}ms`,
  }) as CSSProperties;

/**
 * The builder's parts drawn at their relative positions, in drawing px.
 * Flames hang under the burning stage's engines; when `wrecked`, the parts
 * fly apart. The stage just dropped falls away below.
 */
export function RocketModel({
  parts,
  dropped,
  burningUids,
  box,
  flame,
  wrecked,
}: {
  /** Parts still attached. */
  parts: readonly PlacedPart[];
  /** The stage most recently dropped, drawn falling away. */
  dropped: readonly PlacedPart[];
  /** Parts in the stage that is firing. */
  burningUids: ReadonlySet<string>;
  box: Box;
  /** Flame length as a fraction (engine power), 0 hides it. */
  flame: number;
  wrecked: boolean;
}) {
  return (
    <div className="relative" style={{ width: box.w, height: box.h }}>
      {dropped.length > 0 && (
        <div
          key={dropped[0].uid}
          aria-hidden
          className="rl-stage-drop absolute top-0 left-0"
        >
          {dropped.map((p) => (
            <div
              key={p.uid}
              className="absolute"
              style={{ left: p.x - box.x, top: p.y - box.y }}
            >
              <PartShape partId={p.partId} />
            </div>
          ))}
        </div>
      )}
      {parts.map((p, i) => (
        <div
          key={p.uid}
          className={`absolute ${wrecked ? "rl-debris" : ""}`}
          style={{
            left: p.x - box.x,
            top: p.y - box.y,
            zIndex: overlapsBelow(p.partId) ? 1 : undefined,
            ...(wrecked ? debrisVars(i) : {}),
          }}
        >
          {!wrecked &&
            flame > 0 &&
            burningUids.has(p.uid) &&
            PARTS[p.partId].thrust > 0 && (
              <div
                aria-hidden
                className="flame absolute top-full left-0 -z-10 -mt-3 origin-top"
                style={{ transform: `scaleY(${0.45 + flame * 0.9})` }}
              >
                <FlameShape />
              </div>
            )}
          <PartShape partId={p.partId} />
        </div>
      ))}
    </div>
  );
}
