"use client";

import { useFlightStore } from "@/lib/rocket/store/flight-store";

/** Giant 3 · 2 · 1 · LIFTOFF! that pops in over the scene. */
export function Countdown() {
  const text = useFlightStore(({ state: s }) =>
    s.phase === "countdown"
      ? String(Math.max(1, Math.ceil(s.countdown)))
      : s.phase === "flying" && s.airborne && s.t < 1.6
        ? "LIFTOFF!"
        : null,
  );
  if (!text) return null;

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none absolute inset-0 z-20 grid place-items-center"
    >
      {/* Depth is a solid offset copy behind the face: text-shadow on stroked
          text renders hollow in some browsers. */}
      <span
        key={text}
        className={`rl-pop relative grid font-display font-bold leading-none [-webkit-text-stroke:4px_var(--pen)] [paint-order:stroke_fill] ${
          text.length > 1
            ? "text-7xl sm:text-8xl"
            : "text-[9rem] sm:text-[12rem]"
        }`}
      >
        <span
          aria-hidden
          className="col-start-1 row-start-1 translate-x-1.5 translate-y-1.5 text-pen"
        >
          {text}
        </span>
        <span className="relative col-start-1 row-start-1 text-toon-yellow">
          {text}
        </span>
      </span>
    </div>
  );
}
