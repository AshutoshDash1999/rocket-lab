"use client";

import {
  overlapsBelow,
  PartShape,
  partSize,
} from "@/components/common/part-shape";
import {
  type Box,
  type Camera,
  GRID,
  type PlacedPart,
  SEAM,
  type Snap,
} from "@/lib/rocket/canvas";
import { PARTS } from "@/lib/rocket/parts";
import { ZoomControls } from "./zoom-controls";

/**
 * Infinite, pannable, zoomable blueprint. Parts live in world units inside a
 * camera-transformed layer; dragging and panning are driven by the builder.
 */
export function BlueprintCanvas({
  ref,
  camera,
  panning,
  parts,
  loose,
  badJoints,
  draggingUid,
  landing,
  onPressCanvas,
  onPressPart,
  onNudge,
  onRemove,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomFit,
}: {
  ref: React.Ref<HTMLElement>;
  camera: Camera;
  /** Space held or a pan in progress: show the hand cursor everywhere. */
  panning: "ready" | "active" | null;
  parts: readonly PlacedPart[];
  /** Parts not joined to the rocket: drawn faded, left behind at launch. */
  loose: readonly PlacedPart[];
  /** Touching pairs that don't fit, as [upper uid, lower uid]. */
  badJoints: readonly [string, string][];
  /** Part currently being dragged (drawn faded in place). */
  draggingUid: string | null;
  /** Where the dragged part would land (world units), shown as a dashed outline. */
  landing: (Box & Snap) | null;
  /** Pointer down on empty canvas: starts a pan. */
  onPressCanvas: (e: React.PointerEvent<HTMLElement>) => void;
  onPressPart: (e: React.PointerEvent<HTMLElement>, part: PlacedPart) => void;
  onNudge: (uid: string, dx: number, dy: number) => void;
  onRemove: (uid: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomFit: () => void;
}) {
  const { x, y, zoom } = camera;
  const major = 100 * zoom;
  const minor = 20 * zoom;
  // A lone part on an empty canvas isn't "loose": it's the start of a rocket.
  const looseUids = new Set(parts.length > 1 ? loose.map((p) => p.uid) : []);
  const byUid = new Map(parts.map((p) => [p.uid, p]));

  return (
    <section
      ref={ref}
      aria-labelledby="canvas-heading"
      onPointerDown={onPressCanvas}
      style={{
        backgroundPosition: `${x}px ${y}px`,
        backgroundSize: `${major}px ${major}px, ${major}px ${major}px, ${minor}px ${minor}px, ${minor}px ${minor}px`,
      }}
      className={`blueprint relative min-h-0 flex-1 touch-none overflow-hidden ${
        panning === "active"
          ? "cursor-grabbing"
          : panning === "ready"
            ? "cursor-grab [&_*]:!cursor-grab"
            : "cursor-grab"
      }`}
    >
      <h2 id="canvas-heading" className="sr-only">
        Blueprint canvas
      </h2>

      {parts.length === 0 && !landing && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center p-6 text-center font-hand text-white/90">
          <p className="-rotate-2 text-4xl leading-tight">
            Drop parts anywhere
            <span className="block text-2xl text-white/65">
              drag the blueprint to look around
            </span>
          </p>
        </div>
      )}

      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ transform: `translate(${x}px, ${y}px) scale(${zoom})` }}
      >
        <div>
          {parts.map((item) => {
            const part = PARTS[item.partId];
            const isLoose = looseUids.has(item.uid);
            return (
              <div
                key={item.uid}
                tabIndex={0}
                role="group"
                aria-roledescription="movable part"
                aria-label={`${part.name}${isLoose ? ", not attached" : ""}. Arrow keys move it, Delete removes it.`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onPressPart(e, item);
                }}
                onKeyDown={(e) => {
                  const step = e.shiftKey ? GRID * 4 : GRID;
                  const moves: Record<string, [number, number]> = {
                    ArrowUp: [0, -step],
                    ArrowDown: [0, step],
                    ArrowLeft: [-step, 0],
                    ArrowRight: [step, 0],
                  };
                  if (moves[e.key]) {
                    e.preventDefault();
                    onNudge(item.uid, ...moves[e.key]);
                  } else if (e.key === "Delete" || e.key === "Backspace") {
                    e.preventDefault();
                    onRemove(item.uid);
                  }
                }}
                style={{ left: item.x, top: item.y }}
                className={`group absolute cursor-grab touch-none rounded-[4px] outline-offset-4 hover:z-20 focus-visible:z-20 focus-visible:outline-toon-yellow ${
                  overlapsBelow(item.partId) ? "z-[1]" : ""
                } ${
                  draggingUid === item.uid
                    ? "opacity-30"
                    : isLoose
                      ? "opacity-55"
                      : ""
                }`}
              >
                <PartShape partId={item.partId} />
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 -rotate-1 rounded-[6px] border-2 border-pen bg-paper-light px-2 py-0.5 font-hand text-xl leading-none font-bold whitespace-nowrap text-pen shadow-[2px_2px_0_var(--pen)] group-hover:block group-focus-visible:block">
                  {part.name}
                  {isLoose && (
                    <span className="ml-1.5 text-toon-red">· not attached</span>
                  )}
                </span>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onRemove(item.uid)}
                  className="absolute top-0 right-0 hidden size-7 place-items-center rounded-full border-[2.5px] border-pen bg-paper-light text-sm font-extrabold text-pen shadow-[2px_2px_0_var(--pen)] group-hover:grid [@media(hover:none)]:grid"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        {badJoints.map(([upperUid, lowerUid]) => {
          const lower = byUid.get(lowerUid);
          if (!lower) return null;
          const { w } = partSize(lower.partId);
          return (
            <div
              key={`${upperUid}-${lowerUid}`}
              aria-hidden
              title="These parts don't fit together"
              className="pointer-events-none absolute rounded-full bg-toon-red"
              style={{
                left: lower.x + 14,
                top: lower.y + SEAM / 2 - 3,
                width: w - 28,
                height: 6,
              }}
            />
          );
        })}

        {landing && (
          <div
            aria-hidden
            className={`pointer-events-none absolute rounded-[4px] border-[3px] border-dashed ${
              landing.fit === "ok"
                ? "border-toon-yellow"
                : landing.fit === "blocked"
                  ? "border-toon-red bg-toon-red/15"
                  : "border-white/70"
            }`}
            style={{
              left: landing.x,
              top: landing.y,
              width: landing.w,
              height: landing.h,
            }}
          >
            {landing.fit === "blocked" && landing.reason && (
              <span className="absolute top-1/2 left-full ml-3 w-max max-w-56 -translate-y-1/2 -rotate-1 rounded-[6px] border-2 border-pen bg-[#ffb3a8] px-2 py-0.5 font-hand text-xl leading-tight font-bold text-pen shadow-[2px_2px_0_var(--pen)]">
                ✕ {landing.reason}
              </span>
            )}
          </div>
        )}
      </div>

      <ZoomControls
        zoom={zoom}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onReset={onZoomReset}
        onFit={onZoomFit}
      />
    </section>
  );
}
