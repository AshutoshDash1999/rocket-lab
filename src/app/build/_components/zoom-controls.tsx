import { MAX_ZOOM, MIN_ZOOM } from "@/lib/rocket/canvas";

const btn =
  "grid h-9 min-w-9 place-items-center rounded-[6px] px-2 font-display text-xl leading-none font-semibold text-pen transition-colors duration-100 hover:bg-paper active:bg-toon-yellow disabled:pointer-events-none disabled:opacity-35";

/** Screen-fixed zoom cluster for the blueprint: −, reset %, +, fit. */
export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onFit,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit: () => void;
}) {
  return (
    <div
      role="toolbar"
      aria-label="Zoom"
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute right-4 bottom-4 z-10 flex items-center gap-0.5 rounded-[8px] border-[2.5px] border-pen bg-paper-light p-1 shadow-[3px_3px_0_var(--pen)]"
    >
      <button
        type="button"
        onClick={onZoomOut}
        disabled={zoom <= MIN_ZOOM + 1e-6}
        aria-label="Zoom out"
        title="Zoom out (−)"
        className={btn}
      >
        −
      </button>
      <button
        type="button"
        onClick={onReset}
        aria-label={`Zoom ${Math.round(zoom * 100)}%. Reset to 100%`}
        title="Reset to 100% (0)"
        className={`${btn} w-16 text-base tabular-nums`}
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        disabled={zoom >= MAX_ZOOM - 1e-6}
        aria-label="Zoom in"
        title="Zoom in (+)"
        className={btn}
      >
        +
      </button>
      <span aria-hidden className="mx-0.5 h-6 w-[2px] rounded bg-pen/20" />
      <button
        type="button"
        onClick={onFit}
        aria-label="Fit rocket to view"
        title="Fit to view (1)"
        className={btn}
      >
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>Fit</title>
          <path d="M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4" />
        </svg>
      </button>
    </div>
  );
}
