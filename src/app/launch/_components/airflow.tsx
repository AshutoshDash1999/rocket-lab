"use client";

import { type CSSProperties, useId, useSyncExternalStore } from "react";
import { partSize } from "@/components/common/part-shape";
import type { Box, PlacedPart } from "@/lib/rocket/canvas";
import {
  type Airflow as Flow,
  MAX_Q_LIMIT,
  MAX_Q_WARN,
} from "@/lib/rocket/flight";
import { Puff } from "./scenery";

const PEN = "#1b1b29";
const RED = "#ff4a3d";

/** Air pressure at which the compression cap is fully drawn, Pa. */
const Q_VISIBLE = 20_000;
/** Below this speed the air barely notices the rocket, m/s. */
const MIN_SPEED = 15;
/** Most streaks drawn at once, at STREAK_FULL_SPEED and above. */
const STREAKS = 16;
/** Speed at which the streaks are longest, densest and boldest, m/s. */
const STREAK_FULL_SPEED = 1200;
/** On-screen slide rate of the streaks per m/s of rocket speed, px/s. */
const STREAK_PX_PER_MS = 1.6;
/** Air density below which there is no air left to streak (~55 km), kg/m³. */
const STREAK_MIN_DENSITY = 0.005;

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (cb: () => void) => {
  const m = window.matchMedia(REDUCE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const useReducedMotion = () =>
  useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia(REDUCE).matches,
    () => false,
  );

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const mod = (a: number, n: number) => ((a % n) + n) % n;

/** White → red as the pressure climbs past the warning line. */
function shockTint(qFrac: number) {
  const t = clamp01((qFrac - MAX_Q_WARN) / (1 - MAX_Q_WARN));
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${mix(255, 255)} ${mix(255, 74)} ${mix(255, 61)})`;
}

/**
 * Air acting on the rocket, drawn in the frame of its motion: the container is
 * centred on the rocket and turned so "up" is the direction of travel, so the
 * oncoming air always meets the leading face, whether nose-first on the way
 * up or tail-first when falling back.
 *
 * `layer="back"` (under the rocket): streaks, vapor cone, compression cap.
 * `layer="front"` (over it): the heating glow on the leading face.
 */
export function Airflow({
  layer,
  flow,
  heading,
  t,
  cx,
  cy,
  w,
  h,
}: {
  layer: "back" | "front";
  flow: Flow;
  /** Nose direction, radians. */
  heading: number;
  /** Mission time, s: drives the streaks. */
  t: number;
  /** Rocket centre on screen, px. */
  cx: number;
  cy: number;
  /** Rocket size on screen, px. */
  w: number;
  h: number;
}) {
  const id = useId();
  const still = useReducedMotion();
  if (flow.speed < MIN_SPEED) return null;

  const rel = flow.travel - heading;
  const c = Math.abs(Math.cos(rel));
  const sn = Math.abs(Math.sin(rel));
  /** Distance from the centre to the face meeting the air. */
  const lead = c * (h / 2) + sn * (w / 2);
  /** Half the width the rocket presents to the air (body, not fin tips). */
  const half = Math.max(6, (c * w * 0.7 + sn * h) / 2);
  /** Length of the rocket along the flow. */
  const span = 2 * lead;

  const qFrac = flow.q / MAX_Q_LIMIT;
  const air = clamp01(Math.sqrt(flow.q / Q_VISIBLE));
  const { mach } = flow;

  const frame: CSSProperties = {
    transform: `translate(${cx}px, ${cy}px) rotate(${flow.travel}rad)`,
  };

  if (layer === "front") {
    if (flow.heat < 0.04) return null;
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0"
        style={frame}
      >
        <svg
          aria-hidden="true"
          overflow="visible"
          width={0}
          height={0}
          className="block"
        >
          <defs>
            <radialGradient id={`${id}heat`}>
              <stop offset="0%" stopColor="#fff6c2" stopOpacity={0.95} />
              <stop offset="40%" stopColor="#ffb02e" stopOpacity={0.8} />
              <stop offset="75%" stopColor={RED} stopOpacity={0.45} />
              <stop offset="100%" stopColor={RED} stopOpacity={0} />
            </radialGradient>
          </defs>
          <g
            opacity={flow.heat}
            className="rl-heat"
            style={{ mixBlendMode: "screen" }}
          >
            <ellipse
              cx={0}
              cy={-lead + half * 0.15}
              rx={half * 1.45}
              ry={half * 0.95}
              fill={`url(#${id}heat)`}
            />
          </g>
        </svg>
      </div>
    );
  }

  // Streaks follow speed: faster means longer, quicker, more and bolder lines.
  // They only fade once there is almost no air left to see.
  const speedFrac = clamp01(flow.speed / STREAK_FULL_SPEED);
  const streakOn = speedFrac * clamp01(flow.density / STREAK_MIN_DENSITY);

  if (air < 0.03 && streakOn < 0.02 && flow.heat < 0.04) return null;

  // Compression cap → bow shock. Below Mach 1 the squeezed air is a soft dome
  // ahead of the face; past it the shock sharpens and sweeps back into a cone
  // at the Mach angle, standing closer to the rocket the faster it goes.
  const mu =
    mach <= 1 ? 1.25 : Math.max(0.35, Math.min(1.25, Math.asin(1 / mach)));
  const standoff = half * (mach <= 1 ? 0.7 : 0.7 / mach) + 4;
  const apexY = -lead - standoff;
  const wing = half * 2.6;
  const tipX = half * 0.6 + wing * Math.sin(mu);
  const tipY = apexY + wing * Math.cos(mu);
  const shockPath = `M ${-tipX} ${tipY} Q ${-half * 1.1} ${apexY} 0 ${apexY} Q ${half * 1.1} ${apexY} ${tipX} ${tipY}`;
  const shockOpacity = Math.max(air * 0.9, flow.heat * 0.8);
  const shockW = Math.max(2, half * (mach > 1 ? 0.14 : 0.26));
  const tint = flow.heat > 0.3 ? "#ffb02e" : shockTint(qFrac);

  // Streaks: thin lines of air sliding past the body.
  const travelPx = flow.speed * STREAK_PX_PER_MS;
  const len = h * (0.04 + 0.9 * speedFrac);
  const period = span + h * 0.9 + len;
  const count = Math.max(2, Math.round(STREAKS * speedFrac));
  const streakOpacity = (0.2 + 0.7 * speedFrac) * clamp01(streakOn * 4);
  const streaks = Array.from({ length: count }, (_, i) => {
    const side = i % 2 ? 1 : -1;
    const x = side * (half * 0.8 + ((i * 37) % 11) * half * 0.11);
    const pos = mod(i * 0.618 * period + (still ? 0 : t * travelPx), period);
    const y0 = -lead - len + pos;
    const op = Math.sin((Math.PI * pos) / period);
    return { x, y0, op, key: i };
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-0 left-0"
      style={frame}
    >
      <svg
        aria-hidden="true"
        overflow="visible"
        width={0}
        height={0}
        className="block"
      >
        <defs>
          <radialGradient id={`${id}cap`}>
            <stop offset="0%" stopColor="#fff" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
          <linearGradient id={`${id}vapor`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.95} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={`${id}plasma`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffb02e" stopOpacity={0.9} />
            <stop offset="100%" stopColor={RED} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Streaks */}
        <g
          stroke="#fff"
          strokeLinecap="round"
          strokeWidth={Math.max(1.5, half * (0.035 + 0.05 * speedFrac))}
        >
          {streaks.map((s) => (
            <line
              key={s.key}
              x1={s.x}
              x2={s.x}
              y1={s.y0}
              y2={s.y0 + len}
              opacity={streakOpacity * s.op}
            />
          ))}
        </g>

        {/* Vapor cone: a flared white collar near Mach 1 in moist low air. */}
        {flow.vapor > 0.02 && (
          <path
            d={`M ${-half * 0.95} ${-lead + span * 0.18}
                Q 0 ${-lead + span * 0.05} ${half * 0.95} ${-lead + span * 0.18}
                L ${half * 2.4} ${-lead + span * 0.75}
                Q 0 ${-lead + span * 0.6} ${-half * 2.4} ${-lead + span * 0.75} Z`}
            fill={`url(#${id}vapor)`}
            stroke={PEN}
            strokeOpacity={0.25}
            strokeWidth={2}
            strokeLinejoin="round"
            opacity={flow.vapor * 0.9}
          />
        )}

        {/* Plasma trail on fast, hot falls. */}
        {flow.heat > 0.04 && (
          <path
            d={`M ${-tipX} ${tipY} Q ${-half * 1.6} ${-lead + span * 0.8} ${-half * 0.5} ${-lead + span * 1.6}
                L ${half * 0.5} ${-lead + span * 1.6}
                Q ${half * 1.6} ${-lead + span * 0.8} ${tipX} ${tipY} Z`}
            fill={`url(#${id}plasma)`}
            opacity={flow.heat * 0.7}
            className="rl-heat"
          />
        )}

        {/* Squeezed air piled up ahead of the leading face. */}
        <ellipse
          cx={0}
          cy={-lead - standoff * 0.45}
          rx={half * 1.15}
          ry={standoff * 0.75 + 3}
          fill={`url(#${id}cap)`}
          opacity={air * 0.8}
        />
        <g fill="none" strokeLinecap="round" opacity={shockOpacity}>
          <path
            d={shockPath}
            stroke={PEN}
            strokeOpacity={0.35}
            strokeWidth={shockW + 3}
          />
          <path d={shockPath} stroke={tint} strokeWidth={shockW} />
        </g>
      </svg>
    </div>
  );
}

/** Body half-width at a part's middle, as a fraction of the part drawing's width. */
const BODY_HALF = 0.3;

/**
 * Compressed-air steering jets, drawn in the rocket's own (rotated) frame.
 * To swing the nose right, gas shoots out to the left near the nose, and a
 * smaller jet at the tail pushes the other way: the pair turns the rocket.
 */
export function RcsPuffs({
  steer,
  empty,
  parts,
  box,
  scale,
}: {
  steer: -1 | 0 | 1;
  /** Out of air: just a weak sputter. */
  empty: boolean;
  parts: readonly PlacedPart[];
  box: Box;
  scale: number;
}) {
  if (steer === 0) return null;
  const capsule = parts.find((p) => p.partId === "capsule");
  const top = parts[0];
  const anchor = capsule ?? top;
  if (!anchor) return null;
  const size = partSize(anchor.partId);
  const cx = (box.w / 2) * scale;
  const noseY = (anchor.y - box.y + size.h * (capsule ? 0.62 : 0.5)) * scale;
  const tailY = box.h * 0.82 * scale;
  const reach = size.w * BODY_HALF * scale;
  const puff = Math.max(12, 70 * scale);

  const jets = [
    // Nose jet fires opposite the turn.
    { x: cx - steer * reach, y: noseY, dir: -steer, k: 1 },
    // Tail jet fires with it, smaller.
    { x: cx + steer * reach, y: tailY, dir: steer, k: 0.6 },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {jets.map((j) =>
        (empty ? [0] : [0, 1, 2]).map((n) => (
          <Puff
            key={`${j.k}-${n}`}
            size={puff * j.k * (empty ? 0.6 : 1)}
            tone={empty ? "#bcb8c6" : "#ffffff"}
            className={empty ? "rl-rcs-sputter" : "rl-rcs"}
            style={
              {
                left: j.x - (puff * j.k) / 2,
                top: j.y - (puff * j.k) / 2,
                "--dx": `${j.dir * puff * j.k * 1.6}px`,
                animationDelay: `${n * 110}ms`,
              } as CSSProperties
            }
          />
        )),
      )}
    </div>
  );
}
