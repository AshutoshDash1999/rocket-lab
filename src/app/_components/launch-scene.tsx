"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { skyAt } from "@/app/launch/_components/atmosphere";
import { Cloud, LaunchPad, PadSmoke } from "@/app/launch/_components/scenery";
import {
  FlameShape,
  PartShape,
  partSize,
} from "@/components/common/part-shape";
import type { PartId } from "@/lib/rocket/parts";

/** The little rocket on the pad, top to bottom. */
const STACK: PartId[] = ["nose-cone", "tank-small", "engine-small"];
const ROCKET_H = STACK.reduce((h, id) => h + partSize(id).h, 0);
const ROCKET_W = 160;
const TOWER_H = Math.round(ROCKET_H * 0.85);
/** LaunchPad draws `width + 200` wide and `towerHeight + 30` tall. */
const PAD_W = ROCKET_W + 200;
const PAD_H = TOWER_H + 30;

const CLOUDS = [
  { top: "9%", scale: 1.1, variant: 0, duration: 95, delay: -10, rest: "30vw" },
  {
    top: "22%",
    scale: 0.7,
    variant: 1,
    duration: 130,
    delay: -70,
    rest: "64vw",
  },
  {
    top: "36%",
    scale: 0.9,
    variant: 2,
    duration: 110,
    delay: -40,
    rest: "8vw",
  },
  {
    top: "14%",
    scale: 0.55,
    variant: 1,
    duration: 150,
    delay: -115,
    rest: "84vw",
  },
  {
    top: "48%",
    scale: 0.6,
    variant: 0,
    duration: 120,
    delay: -90,
    rest: "46vw",
  },
];

type Phase = "idle" | "countdown" | "liftoff" | "gone";

const COUNTDOWN_MS = 1800;
const LIFTOFF_MS = 2600;
const RETURN_MS = 900;

/**
 * Day-time launch site behind the login card. Clouds drift, the scene leans a
 * little with the pointer, and the rocket on the pad launches when tapped.
 */
export function LaunchScene() {
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState(3);
  const [launches, setLaunches] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Pointer parallax: write -1..1 into CSS vars, at most once a frame.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const fine = window.matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    if (!fine.matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--px", String((e.clientX / innerWidth) * 2 - 1));
        el.style.setProperty("--py", String((e.clientY / innerHeight) * 2 - 1));
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  function launch() {
    if (phase !== "idle") return;
    const later = (ms: number, fn: () => void) =>
      timers.current.push(window.setTimeout(fn, ms));

    setCount(3);
    setPhase("countdown");
    later(COUNTDOWN_MS / 3, () => setCount(2));
    later((COUNTDOWN_MS * 2) / 3, () => setCount(1));
    later(COUNTDOWN_MS, () => setPhase("liftoff"));
    later(COUNTDOWN_MS + LIFTOFF_MS, () => setPhase("gone"));
    later(COUNTDOWN_MS + LIFTOFF_MS + RETURN_MS, () => {
      setLaunches((n) => n + 1);
      setPhase("idle");
    });
  }

  const burning = phase === "liftoff";
  const smoking = burning || (phase === "countdown" && count === 1);

  return (
    <div
      ref={root}
      className="absolute inset-0 overflow-hidden [--g:clamp(96px,20vh,180px)] [--px:0] [--py:0] [--s:0.5] md:[--s:0.62]"
      style={{ backgroundImage: skyAt(0) }}
    >
      <Sun />

      {/* Clouds: slowest drift, strongest parallax. */}
      <div aria-hidden className="rl-parallax absolute inset-0 [--depth:22px]">
        {CLOUDS.map((c) => (
          <div
            key={`${c.top}-${c.variant}-${c.scale}`}
            className="rl-cloud absolute left-0"
            style={
              {
                top: c.top,
                animationDuration: `${c.duration}s`,
                animationDelay: `${c.delay}s`,
                "--rest-x": c.rest,
              } as CSSProperties
            }
          >
            <div style={{ transform: `scale(${c.scale})` }}>
              <Cloud variant={c.variant} />
            </div>
          </div>
        ))}
      </div>

      {/* Hills, then ground. */}
      <div
        aria-hidden
        className="rl-parallax rl-hills absolute -inset-x-10 h-24 [--depth:10px]"
        style={{ bottom: "calc(var(--g) - 6px)" }}
      />
      <div
        aria-hidden
        className="rl-ground absolute inset-x-0 bottom-0 border-t-[3px] border-pen"
        style={{ height: "var(--g)" }}
      />

      {/* Launch site: pad and rocket, anchored on the ground. */}
      <div
        className="absolute right-[3%] xl:right-[12%]"
        style={{
          bottom: "calc(var(--g) - var(--s) * 14px)",
          width: `calc(var(--s) * ${PAD_W}px)`,
          height: `calc(var(--s) * ${PAD_H}px)`,
        }}
      >
        <div
          aria-hidden
          className="absolute bottom-0 left-0 origin-bottom-left"
          style={{ transform: "scale(var(--s))" }}
        >
          <LaunchPad width={ROCKET_W} towerHeight={TOWER_H} />
          {smoking && (
            <div
              className="absolute"
              style={{ left: PAD_W / 2, top: PAD_H - 26 }}
            >
              <PadSmoke scale={1} />
            </div>
          )}
        </div>

        {phase === "idle" && <TapHint />}

        {/* Rocket: unscaled wrapper flies, scaled child draws. */}
        <div
          key={launches}
          className={`absolute ${phase === "idle" && launches > 0 ? "rl-pop" : ""}`}
          style={{
            left: "calc(var(--s) * 100px)",
            bottom: "calc(var(--s) * 12px)",
            width: `calc(var(--s) * ${ROCKET_W}px)`,
            height: `calc(var(--s) * ${ROCKET_H}px)`,
          }}
        >
          <button
            type="button"
            onClick={launch}
            disabled={phase !== "idle"}
            aria-label="Launch the rocket, just for fun"
            className={`rl-liftoff absolute inset-0 cursor-pointer rounded-md outline-offset-4 disabled:cursor-default ${
              phase === "liftoff" || phase === "gone" ? "rl-liftoff-go" : ""
            }`}
            style={{ "--liftoff-ms": `${LIFTOFF_MS}ms` } as CSSProperties}
          >
            {/* Shake lives on its own layer so it can't override the scale. */}
            <div
              className={`absolute inset-0 ${phase === "countdown" ? "rl-strain" : ""}`}
            >
              <div
                className="absolute bottom-0 left-0 origin-bottom-left"
                style={{ transform: "scale(var(--s))" }}
              >
                <div className="relative transition-transform duration-200 hover:-translate-y-1.5">
                  {STACK.map((id) => (
                    <PartShape key={id} partId={id} />
                  ))}
                  {burning && (
                    <div className="flame absolute top-full left-0 -z-10 -mt-3 origin-top">
                      <FlameShape />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>

          {phase === "countdown" && (
            <span
              key={count}
              aria-live="polite"
              className="rl-pop absolute -top-14 left-1/2 -ml-5 w-10 text-center font-display text-5xl font-semibold text-pen [text-shadow:2px_2px_0_var(--paper-light)]"
            >
              {count}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Hand-written nudge centred over the rocket's nose. Sits above the login card's layer so it is never covered. */
function TapHint() {
  return (
    <div
      aria-hidden
      className="rl-hint pointer-events-none absolute z-20 flex -translate-x-1/2 flex-col items-center"
      style={{
        left: `calc(var(--s) * ${PAD_W / 2}px)`,
        bottom: `calc(var(--s) * ${ROCKET_H + 12}px + 4px)`,
      }}
    >
      <span className="rounded-md bg-paper-light/90 px-2 font-hand text-2xl leading-tight whitespace-nowrap text-pen">
        <span className="pointer-coarse:hidden">click</span>
        <span className="hidden pointer-coarse:inline">tap</span> to launch!
      </span>
      <svg aria-hidden="true" viewBox="0 0 24 30" width={20} height={26}>
        <path
          d="M12 3 C8 10 16 16 12 26 M6 20 L12 27 L18 20"
          fill="none"
          stroke="#1b1b29"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Sun() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 120"
      className="absolute top-[2%] right-[4%] size-14 md:top-[6%] md:right-auto md:left-[6%] md:size-28"
    >
      <g className="rl-sun-rays" style={{ transformOrigin: "60px 60px" }}>
        {Array.from({ length: 10 }, (_, i) => i * 36).map((deg) => (
          <path
            key={deg}
            d="M60 6 L66 22 L54 22 Z"
            fill="#ffd23f"
            stroke="#1b1b29"
            strokeWidth={3}
            strokeLinejoin="round"
            transform={`rotate(${deg} 60 60)`}
          />
        ))}
      </g>
      <circle
        cx={60}
        cy={60}
        r={30}
        fill="#ffd23f"
        stroke="#1b1b29"
        strokeWidth={3.5}
      />
      <path
        d="M46 54 Q50 50 54 54 M66 54 Q70 50 74 54 M50 68 Q60 76 70 68"
        fill="none"
        stroke="#1b1b29"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
}
