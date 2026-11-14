import {
  overlapsBelow,
  PartShape,
  partSize,
} from "@/components/common/part-shape";
import type { PlacedPart } from "@/lib/rocket/canvas";

const PAD = 24;

/** The fitted viewBox and draw order for a non-empty blueprint, shared with the OG image. */
export function blueprintLayout(parts: readonly PlacedPart[]) {
  const boxes = parts.map((p) => ({ p, ...partSize(p.partId) }));
  const minX = Math.min(...boxes.map((b) => b.p.x));
  const minY = Math.min(...boxes.map((b) => b.p.y));
  const maxX = Math.max(...boxes.map((b) => b.p.x + b.w));
  const maxY = Math.max(...boxes.map((b) => b.p.y + b.h));
  // Parachutes wrap over the part below, so they draw last, as on the canvas.
  const ordered = [...parts].sort(
    (a, b) => Number(overlapsBelow(a.partId)) - Number(overlapsBelow(b.partId)),
  );
  return {
    ordered,
    x: minX - PAD,
    y: minY - PAD,
    w: maxX - minX + PAD * 2,
    h: maxY - minY + PAD * 2,
  };
}

/**
 * A static, scaled-to-fit drawing of a blueprint's parts on the blue grid.
 * Each part is a nested SVG placed at its canvas position inside one viewBox.
 */
export function BlueprintPreview({
  parts,
  className = "",
}: {
  parts: readonly PlacedPart[];
  className?: string;
}) {
  if (parts.length === 0) {
    return (
      <div
        className={`blueprint grid place-items-center font-hand text-xl text-white/70 ${className}`}
      >
        empty blueprint
      </div>
    );
  }

  const { ordered, x, y, w, h } = blueprintLayout(parts);

  return (
    <div className={`blueprint ${className}`}>
      <svg
        aria-hidden="true"
        viewBox={`${x} ${y} ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        className="size-full"
      >
        {ordered.map((p) => (
          <g key={p.uid} transform={`translate(${p.x} ${p.y})`}>
            <PartShape partId={p.partId} />
          </g>
        ))}
      </svg>
    </div>
  );
}
