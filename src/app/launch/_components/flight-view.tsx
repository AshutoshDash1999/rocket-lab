"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { CHUTE_ANCHOR_Y } from "@/components/common/part-shape";
import {
  activeStage,
  attachedParts,
  isBurning,
  remaining,
} from "@/lib/rocket/flight";
import { useFlightStore } from "@/lib/rocket/store/flight-store";
import { skyAt } from "./atmosphere";
import { Countdown } from "./countdown";
import { CrashBurst } from "./crash-burst";
import { fmtInt } from "./format";
import { OutcomeBanner } from "./outcome-banner";
import { DRAWING_PX_PER_M, RocketModel, rocketBox } from "./rocket-model";
import { Cloud, Dust, LaunchPad, PadSmoke, ParachuteShape } from "./scenery";
import { LayerToast, SkyBackdrop } from "./sky-layers";
import { StatusHint } from "./status-hint";

/** Minimum height of the ground band below the pad, screen px. */
const GROUND_H = 64;
/** Clouds repeat sideways every this many metres. */
const CLOUD_PERIOD = 700;

/** Fixed cloud field: one cloud per altitude band, scattered sideways. */
const CLOUDS = Array.from({ length: 64 }, (_, i) => ({
  alt: 280 + i * 125 + ((i * 53) % 60),
  x: (((i * 389) % 997) / 997) * CLOUD_PERIOD,
  variant: i % 3,
  size: 1.2 + ((i * 29) % 10) / 12,
}));

/** ParachuteShape's drawn size, and how far above its bottom its lines meet, px. */
const CANOPY_W = 240;
const CANOPY_H = 190;
const CHUTE_LINES_INSET = 4;

const mod = (a: number, n: number) => ((a % n) + n) % n;

/**
 * Side-view flight scene. The camera keeps the rocket centred and follows it
 * up once it leaves the lower part of the view; scenery moves past it.
 */
export function FlightView({ className = "" }: { className?: string }) {
  const cfg = useFlightStore((st) => st.cfg);
  const s = useFlightStore((st) => st.state);
  const run = useFlightStore((st) => st.run);

  const ref = useRef<HTMLElement>(null);
  const [view, setView] = useState({ w: 800, h: 600 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setView({ w: e.contentRect.width, h: e.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const parts = attachedParts(cfg, s);
  const dropped = s.stage > 0 ? cfg.stages[s.stage - 1].parts : [];
  const burningUids = new Set(activeStage(cfg, s).parts.map((p) => p.uid));
  const box = rocketBox(parts);
  const chutePart = parts.find((p) => p.partId === "parachute");
  const chuteTop = chutePart ? chutePart.y - box.y : 0;
  const chuteShown =
    s.chuteState === "reefed" ||
    s.chuteState === "open" ||
    (s.chuteState === "torn" && s.chute > 0);
  // Drag area grows with diameter squared, so the canopy's width follows √fill.
  const spread = Math.sqrt(s.chute);
  const scale = Math.min(0.7, Math.max(0.12, (view.h * 0.36) / box.h));
  const ppm = DRAWING_PX_PER_M * scale;

  const rocketW = box.w * scale;
  const rocketH = box.h * scale;

  // Chase camera: the rocket's middle sits at the centre of the view from the
  // pad onwards, and the world scrolls past it.
  const baseY = view.h / 2 + rocketH / 2;
  const groundY = baseY;
  /** Camera offset: how far the world has scrolled down to keep the rocket in view, px. */
  const cam = baseY - (groundY - s.alt * ppm);
  const toY = (altM: number) => groundY + cam - altM * ppm;
  const toX = (xM: number) => view.w / 2 + (xM - s.x) * ppm;
  const groundTop = toY(0);
  const groundVisible = groundTop < view.h + 40;

  const burning = isBurning(cfg, s);
  const crashed = s.phase === "crashed";
  const landed = s.phase === "landed";
  // Altitude ruler: 10 m ticks while slow, 100 m once ticks would blur together.
  const tick = ppm * 10 >= 28 && Math.abs(s.vy) < 400 ? 10 : 100;
  const altTop = (groundY + cam) / ppm;
  const altBottom = Math.max(0, (groundY + cam - view.h) / ppm);
  const ticks: number[] = [];
  for (let a = Math.ceil(altBottom / tick) * tick; a <= altTop; a += tick) {
    ticks.push(a);
    if (ticks.length > 80) break;
  }

  return (
    <section
      ref={ref}
      aria-label="Flight view"
      className={`relative min-h-0 overflow-hidden ${className}`}
      style={{ backgroundImage: skyAt(s.alt) }}
    >
      <div
        key={run}
        className={`absolute inset-0 ${crashed ? "rl-shake" : ""}`}
      >
        <div
          aria-hidden
          className="rl-stars absolute inset-0"
          style={{
            opacity: Math.min(1, Math.max(0, (s.alt - 12_000) / 40_000)),
            backgroundPosition: `${-s.x * ppm * 0.02}px ${cam * 0.002}px`,
          }}
        />

        <SkyBackdrop alt={s.alt} x={s.x} view={view} baseY={baseY} />

        {CLOUDS.map((c) => {
          const y = toY(c.alt);
          if (y < -200 || y > view.h + 60) return null;
          const x =
            view.w / 2 +
            (mod(c.x - s.x, CLOUD_PERIOD) - CLOUD_PERIOD / 2) * ppm;
          const cs = scale * 1.4 * c.size;
          return (
            <div
              key={c.alt}
              className="absolute top-0 left-0 origin-top-left"
              style={{
                transform: `translate(${x - 75 * cs}px, ${y - 35 * cs}px) scale(${cs})`,
              }}
            >
              <Cloud variant={c.variant} />
            </div>
          );
        })}

        {groundVisible && (
          <>
            <div
              aria-hidden
              className="rl-hills absolute right-0 left-0 h-24"
              style={{
                top: groundTop - 90,
                backgroundPositionX: -s.x * ppm * 0.4,
              }}
            />
            <div
              aria-hidden
              className="rl-ground absolute right-0 left-0 border-t-[3px] border-pen"
              style={{
                top: groundTop,
                height: Math.max(GROUND_H, view.h - groundTop) + 40,
                backgroundPositionX: -s.x * ppm,
              }}
            />
            <div
              className="absolute top-0 left-0 origin-top-left"
              style={{
                transform: `translate(${toX(0) - ((box.w + 200) * scale) / 2}px, ${
                  groundTop - (box.h * 0.85 + 30) * scale + 14 * scale
                }px) scale(${scale})`,
              }}
            >
              <LaunchPad width={box.w} towerHeight={box.h * 0.85} />
            </div>
          </>
        )}

        {/* Rocket: positioned by its base centre, rotated about its middle. */}
        <div
          className="absolute top-0 left-0"
          style={{
            width: rocketW,
            height: rocketH,
            transform: `translate(${view.w / 2 - rocketW / 2}px, ${baseY - rocketH}px) rotate(${s.heading}rad)`,
          }}
        >
          {chuteShown && (
            <div
              className={`absolute left-1/2 origin-bottom ${
                s.chuteState === "torn"
                  ? "rl-chute-tear"
                  : landed
                    ? "rl-chute-collapse"
                    : ""
              }`}
              style={{
                // Lines meet 4 px above the art's bottom edge; put that on the pack.
                bottom:
                  rocketH -
                  (chuteTop + CHUTE_ANCHOR_Y + CHUTE_LINES_INSET) * scale,
                width: CANOPY_W * scale,
                height: CANOPY_H * scale,
                transform: `translateX(-50%) scale(${0.25 + 0.75 * spread}, ${0.45 + 0.55 * spread})`,
              }}
            >
              <div className="rl-chute-eject origin-bottom">
                <div
                  className="origin-top-left"
                  style={{ transform: `scale(${scale})` }}
                >
                  <ParachuteShape />
                </div>
              </div>
            </div>
          )}
          <div
            className={`h-full w-full origin-bottom ${
              burning && !s.airborne ? "rl-strain" : ""
            } ${landed ? "rl-squash" : ""}`}
          >
            <div
              className="origin-top-left"
              style={{ transform: `scale(${scale})` }}
            >
              <RocketModel
                parts={parts}
                dropped={dropped}
                burningUids={burningUids}
                box={box}
                flame={burning ? s.throttle : 0}
                wrecked={crashed}
              />
            </div>
          </div>
        </div>

        {groundVisible && (
          <div
            className="absolute"
            style={{ left: view.w / 2, top: groundTop }}
          >
            {burning && s.alt < 80 && <PadSmoke scale={scale} />}
            {landed && <Dust scale={scale} />}
            {crashed && <CrashBurst scale={scale} />}
          </div>
        )}

        {/* Altitude ruler pinned to the left edge. */}
        <div
          aria-hidden
          className="absolute top-0 bottom-0 left-0 w-14 border-r-[3px] border-pen bg-paper-light/85"
        >
          {ticks.map((a) => {
            const major = a % (tick * 5) === 0;
            return (
              <div
                key={a}
                className="absolute right-0 flex items-center gap-1"
                style={{ top: toY(a), transform: "translateY(-50%)" }}
              >
                {major && (
                  <span className="font-hand text-base leading-none font-bold text-pen tabular-nums">
                    {a >= 1000
                      ? `${(a / 1000).toFixed(a % 1000 ? 1 : 0)}k`
                      : fmtInt(a)}
                  </span>
                )}
                <span
                  className={`block h-[3px] rounded-full bg-pen ${major ? "w-4" : "w-2"}`}
                />
              </div>
            );
          })}
          <div
            className="absolute right-0 h-0 w-0 border-y-[9px] border-r-[12px] border-y-transparent border-r-toon-red"
            style={{ top: baseY - 9 }}
          />
        </div>
      </div>

      <LayerToast />
      <StatusHint />
      <Countdown />
      <OutcomeBanner />
      <p className="sr-only">
        Rocket has {remaining(cfg, s).chutes} parachute
        {remaining(cfg, s).chutes === 1 ? "" : "s"}
        {remaining(cfg, s).hasLegs ? " and landing legs" : ""}.
      </p>
    </section>
  );
}
