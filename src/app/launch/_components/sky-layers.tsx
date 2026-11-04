"use client";

import type { CSSProperties, ReactNode } from "react";
import { TERMINAL } from "@/lib/rocket/flight";
import { useFlightStore } from "@/lib/rocket/store/flight-store";
import { band, LAYERS, layerAt } from "./atmosphere";

const PEN = "#1b1b29";
const ink = {
  stroke: PEN,
  strokeWidth: 3,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

/**
 * Far-off scenery for each layer of the atmosphere. These sit "far away", so
 * they drift past slowly (`px per metre` parallax) instead of at rocket scale,
 * and fade in and out with altitude.
 */
export function SkyBackdrop({
  alt,
  x,
  view,
  baseY,
}: {
  alt: number;
  /** Horizontal position, m: nudges the far layers sideways. */
  x: number;
  view: { w: number; h: number };
  /** Screen y of the rocket's base, px. */
  baseY: number;
}) {
  /** Screen y of something at altitude `a` drifting at `p` px per metre. */
  const far = (a: number, p: number) => baseY - (a - alt) * p;
  const onScreen = (y: number, pad = 160) => y > -pad && y < view.h + pad;
  const sway = -x * 0.004;

  const planeY = far(10_000, 0.08);
  const ozoneY = far(25_000, 0.03);
  const balloonY = far(32_000, 0.04);
  const nlcY = far(83_000, 0.04);
  const meteors = band(alt, 48_000, 55_000, 82_000, 90_000);
  const aurora = band(alt, 84_000, 94_000);
  // Earth's curved edge rises from the bottom as the rocket climbs.
  const limb = band(alt, 28_000, 100_000);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {onScreen(ozoneY) && (
        <div
          className="absolute right-0 left-0 h-40 -translate-y-1/2"
          style={{
            top: ozoneY,
            opacity: 0.55,
            background:
              "linear-gradient(to bottom, transparent, rgb(120 230 220 / 0.45) 50%, transparent)",
          }}
        >
          <span className="absolute top-1/2 right-6 -translate-y-1/2 font-hand text-xl font-bold text-[#c9fff6]/80">
            ozone layer
          </span>
        </div>
      )}

      {onScreen(planeY) && (
        <Drifter top={planeY} className="rl-plane" duration={16}>
          <Airliner />
        </Drifter>
      )}

      {onScreen(balloonY) && (
        <div
          className="rl-bob absolute"
          style={{ top: balloonY - 60, left: `calc(22% + ${sway}px)` }}
        >
          <WeatherBalloon />
        </div>
      )}

      {meteors > 0 && (
        <div className="absolute inset-0" style={{ opacity: meteors }}>
          {[
            { left: "18%", top: "10%", delay: 0 },
            { left: "62%", top: "4%", delay: 1.1 },
            { left: "80%", top: "26%", delay: 2.3 },
            { left: "38%", top: "18%", delay: 3.2 },
          ].map((m) => (
            <span
              key={m.left}
              className="rl-meteor absolute block h-0.75 w-24 rounded-full"
              style={{
                left: m.left,
                top: m.top,
                animationDelay: `${m.delay}s`,
                background:
                  "linear-gradient(to right, transparent, #fffdf7 80%, #ffd23f)",
              }}
            />
          ))}
        </div>
      )}

      {onScreen(nlcY) && (
        <svg
          aria-hidden="true"
          className="absolute left-0 w-full"
          style={{ top: nlcY - 30 }}
          height={60}
          viewBox="0 0 800 60"
          preserveAspectRatio="none"
        >
          {[14, 30, 46].map((y, i) => (
            <path
              key={y}
              d={`M-20 ${y} C 120 ${y - 14}, 240 ${y + 14}, 400 ${y} S 680 ${y - 12}, 820 ${y}`}
              fill="none"
              stroke="#bfe4ff"
              strokeOpacity={0.55 - i * 0.12}
              strokeWidth={5}
              strokeLinecap="round"
            />
          ))}
        </svg>
      )}

      {aurora > 0 && (
        <div
          className="absolute inset-x-0 top-0 h-[55%]"
          style={{ opacity: aurora }}
        >
          <svg
            aria-hidden="true"
            className="rl-aurora absolute inset-0 h-full w-full"
            viewBox="0 0 800 300"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="rl-aurora-g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#b37bff" stopOpacity="0" />
                <stop offset="0.35" stopColor="#b37bff" stopOpacity="0.45" />
                <stop offset="0.75" stopColor="#5dffa8" stopOpacity="0.6" />
                <stop offset="1" stopColor="#5dffa8" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 60 C140 20 260 120 400 70 S640 10 800 80 L800 280 C640 210 520 260 400 230 S140 190 0 260 Z"
              fill="url(#rl-aurora-g)"
            />
            <path
              d="M0 110 C160 70 300 160 460 110 S700 70 800 130 L800 240 C660 200 520 250 380 210 S120 200 0 230 Z"
              fill="url(#rl-aurora-g)"
              opacity={0.7}
            />
          </svg>
        </div>
      )}

      {limb > 0 && (
        <div
          className="absolute left-1/2 rounded-[50%] border-t-[3px] border-pen"
          style={{
            width: view.w * 3,
            height: view.w * 3,
            top: view.h - limb * view.h * 0.22,
            transform: `translateX(calc(-50% + ${sway * 2}px))`,
            background:
              "radial-gradient(circle at 50% 0%, #4f9bff, #2f7cf6 30%, #1f57a4 60%)",
            boxShadow: "0 -18px 40px 6px rgb(120 190 255 / 0.55)",
          }}
        />
      )}
    </div>
  );
}

/** Crosses the view sideways on a loop at a fixed height. */
function Drifter({
  top,
  className,
  duration,
  children,
}: {
  top: number;
  className: string;
  duration: number;
  children: ReactNode;
}) {
  return (
    <div className="absolute inset-x-0" style={{ top }}>
      <div
        className={`absolute -translate-y-1/2 ${className}`}
        style={{ animationDuration: `${duration}s` } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}

function Airliner() {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 44" width={96} height={35}>
      <g {...ink}>
        <path d="M44 22 L30 4 H40 L64 20 Z" fill="#a9c1ff" />
        <path
          d="M8 24 C8 18 16 16 26 16 H96 C108 16 116 20 116 24 C116 28 108 30 96 30 H20 C12 30 8 28 8 24 Z"
          fill="#fffdf7"
        />
        <path d="M14 18 L6 6 H16 L28 17 Z" fill="#ff4a3d" />
        <path d="M54 28 L42 42 H52 L72 28 Z" fill="#a9c1ff" />
      </g>
      <path
        d="M70 21 h4 M80 21 h4 M90 21 h4"
        stroke={PEN}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}

function WeatherBalloon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 80 130" width={64} height={104}>
      <g {...ink}>
        <path
          d="M40 4 C66 4 74 30 64 52 C58 66 48 74 40 76 C32 74 22 66 16 52 C6 30 14 4 40 4 Z"
          fill="#fffdf7"
        />
        <path d="M40 76 V110" fill="none" strokeWidth={2.5} />
        <rect x={30} y={108} width={20} height={16} rx={3} fill="#ffd23f" />
      </g>
      <path
        d="M28 22 C30 14 36 11 42 11"
        fill="none"
        stroke="#dcd8e8"
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** "Entering the Stratosphere" card each time the rocket crosses a layer boundary. */
export function LayerToast() {
  const run = useFlightStore((st) => st.run);
  const id = useFlightStore(({ state: s }) =>
    s.airborne && !TERMINAL.has(s.phase) ? layerAt(s.alt).id : null,
  );
  const reachedStrat = useFlightStore(
    (st) => st.state.maxAlt >= LAYERS[1].from,
  );
  // Liftoff already starts in the troposphere; only announce coming back down into it.
  if (!id || (id === "troposphere" && !reachedStrat)) return null;
  const layer = LAYERS.find((l) => l.id === id) ?? LAYERS[0];

  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 top-[34%] z-10 flex justify-center px-4"
    >
      <div
        key={`${run}-${id}`}
        className="rl-layer-toast max-w-sm rounded-xs border-[3px] border-pen bg-paper-light px-5 py-2 text-center shadow-[4px_4px_0_var(--pen)]"
      >
        <p className="font-hand text-xl leading-none text-pen/70">
          Entering the
        </p>
        <p className="font-display text-3xl font-bold text-pen">{layer.name}</p>
        <p className="font-sans text-sm font-semibold text-pen/80">
          {layer.blurb}
        </p>
      </div>
    </div>
  );
}
