"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PartShape } from "@/components/common/part-shape";
import { toonButton } from "@/components/common/toon-button";
import { useFlightStore } from "@/lib/rocket/store/flight-store";
import { useRocketStore } from "@/lib/rocket/store/rocket-store";
import { primeLaunchAudio, useLaunchAudio } from "../_hooks/use-launch-audio";
import { ControlPanel } from "./control-panel";
import { FlightView } from "./flight-view";
import { fmtClock } from "./format";
import { CARD, Card } from "./panel";
import { AltitudePanel, MotionPanel, VehiclePanel } from "./telemetry";

/** Keys typed into these shouldn't fly the rocket. */
const isField = (t: EventTarget | null) =>
  t instanceof HTMLElement &&
  (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(t.tagName));

const STEER_KEYS: Record<string, -1 | 1> = {
  ArrowLeft: -1,
  a: -1,
  A: -1,
  ArrowRight: 1,
  d: 1,
  D: 1,
};

/** Title card with the T± mission clock. */
function MissionClock() {
  const text = useFlightStore(({ state: s }) =>
    s.phase === "pad"
      ? "On the pad"
      : s.phase === "countdown"
        ? `T−${fmtClock(Math.ceil(s.countdown))}`
        : `T+${fmtClock(s.t)}`,
  );
  return (
    <div className={`${CARD} flex items-center gap-3 px-3 py-2`}>
      <div className="hidden size-9 shrink-0 sm:block">
        <PartShape partId="capsule" fit />
      </div>
      <div>
        <h1 className="hidden font-display text-lg font-semibold leading-none text-pen sm:block">
          Launch pad
        </h1>
        <p className="font-display text-lg font-semibold leading-tight text-pen tabular-nums sm:font-hand sm:text-xl sm:font-normal sm:text-pen/70">
          {text}
        </p>
      </div>
    </div>
  );
}

const KEYS: [string, string][] = [
  ["Space", "launch / stage"],
  ["P", "parachute"],
  ["W / S", "power"],
  ["← / →", "steer"],
  ["R", "reset"],
];

/** Keyboard reference, pinned under the velocity card. */
function KeyHints({ className = "" }: { className?: string }) {
  return (
    <Card title="Keys" className={className}>
      <dl className="mt-1.5 space-y-1">
        {KEYS.map(([key, action]) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <dt>
              <kbd className="rounded-[6px] border-2 border-pen bg-paper px-1.5 font-display text-sm font-semibold text-pen shadow-[2px_2px_0_var(--pen)]">
                {key}
              </kbd>
            </dt>
            <dd className="font-hand text-lg leading-none text-pen/70">
              {action}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

/** /launch: loads the handed-over rocket, runs the sim loop and keyboard. */
export function LaunchControl() {
  const [ready, setReady] = useState(false);
  const hasRocket = useFlightStore((st) => st.parts.length > 0);
  const returnTo = useRocketStore((st) => st.returnTo);
  useLaunchAudio();

  // Rehydrate the handed-over rocket after mount so server and client render match.
  useEffect(() => {
    void Promise.resolve(useRocketStore.persist.rehydrate()).then(() => {
      useFlightStore.getState().init(useRocketStore.getState().parts);
      setReady(true);
    });
  }, []);

  // Fixed-step physics on every animation frame.
  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      useFlightStore.getState().tick((now - last) / 1000);
      last = now;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  // Space launch, then stage · G stage · P parachute · ←/→ A/D steer · W/S ↑/↓ power · R reset.
  useEffect(() => {
    if (!ready) return;
    const fs = () => useFlightStore.getState();
    const onKeyDown = (e: KeyboardEvent) => {
      if (isField(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      const dir = STEER_KEYS[e.key];
      if (dir) {
        e.preventDefault();
        fs().setSteer(dir);
        return;
      }
      if (e.repeat && e.code === "Space") return;
      const { state, launch, stage, deployChute, setThrottle, reset } = fs();
      const keys: Record<string, () => void> = {
        " ":
          state.phase === "pad"
            ? () => {
                primeLaunchAudio();
                launch();
              }
            : stage,
        g: stage,
        G: stage,
        p: deployChute,
        P: deployChute,
        w: () => setThrottle(state.throttle + 0.1),
        W: () => setThrottle(state.throttle + 0.1),
        ArrowUp: () => setThrottle(state.throttle + 0.1),
        s: () => setThrottle(state.throttle - 0.1),
        S: () => setThrottle(state.throttle - 0.1),
        ArrowDown: () => setThrottle(state.throttle - 0.1),
        r: reset,
        R: reset,
      };
      if (keys[e.key]) {
        e.preventDefault();
        keys[e.key]();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const dir = STEER_KEYS[e.key];
      if (dir && fs().steer === dir) fs().setSteer(0);
    };
    const onBlur = () => fs().setSteer(0);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [ready]);

  const backLink = (
    <Link
      href={returnTo}
      aria-label="Back"
      className={`${toonButton} bg-paper-light px-3 sm:px-4`}
    >
      ←<span className="hidden sm:inline">Back</span>
    </Link>
  );

  if (!ready || !hasRocket) {
    return (
      <div className="paper flex min-h-dvh flex-col select-none">
        <div className="flex justify-end p-3 sm:p-5">{backLink}</div>
        {!ready ? (
          <p className="grid flex-1 place-items-center font-hand text-3xl text-pen/60">
            Rolling the rocket out…
          </p>
        ) : (
          <div className="blueprint grid flex-1 place-items-center p-6 text-center">
            <div className="paper max-w-sm rounded-[10px] border-[3px] border-pen p-6 shadow-[5px_5px_0_var(--pen)]">
              <h2 className="font-display text-3xl font-semibold text-pen">
                No rocket on the pad
              </h2>
              <p className="mt-2 font-hand text-2xl leading-tight text-pen/70">
                Build one first, then hit Launch in the builder.
              </p>
              <Link
                href="/blueprints"
                className={`${toonButton} mt-5 bg-toon-yellow`}
              >
                Go build a rocket
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="paper relative flex min-h-dvh flex-col select-none lg:block lg:h-dvh lg:overflow-hidden">
      <FlightView className="relative h-[62dvh] shrink-0 border-b-[3px] border-pen lg:absolute lg:inset-0 lg:h-auto lg:border-b-0" />

      {/* Top edge: mission clock left, exit right. Overlays the view at every size. */}
      <div className="absolute top-3 left-16 z-20 lg:top-5 lg:left-20">
        <MissionClock />
      </div>
      <div className="absolute top-3 right-3 z-20 lg:top-5 lg:right-5">
        {backLink}
      </div>

      {/* Readouts: stacked below the view on small screens, pinned to the edges on large. */}
      <div className="relative z-20 grid gap-3 p-3 sm:grid-cols-2 lg:pointer-events-none lg:absolute lg:inset-0 lg:block lg:p-0">
        <div className="contents lg:pointer-events-auto lg:absolute lg:top-24 lg:left-20 lg:flex lg:w-60 lg:flex-col lg:gap-3">
          <AltitudePanel />
          <VehiclePanel />
        </div>
        <div className="contents lg:pointer-events-auto lg:absolute lg:top-24 lg:right-5 lg:flex lg:w-56 lg:flex-col lg:gap-3">
          <MotionPanel />
          <KeyHints className="hidden lg:block" />
        </div>
        <ControlPanel className="order-first sm:col-span-2 lg:pointer-events-auto lg:absolute lg:bottom-5 lg:left-1/2 lg:-translate-x-1/2 lg:flex-nowrap" />
      </div>
    </div>
  );
}
