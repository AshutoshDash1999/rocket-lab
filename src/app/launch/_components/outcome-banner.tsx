"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { toonButton } from "@/components/common/toon-button";
import {
  type CrashTip,
  crashAdvice,
  type FlightConfig,
  type FlightState,
  totalThrust,
} from "@/lib/rocket/flight";
import { useFlightStore } from "@/lib/rocket/store/flight-store";
import { fmtAlt, fmtClock, fmtDeg, fmtInt, fmtOne } from "./format";
import { LABEL } from "./panel";

interface Outcome {
  title: string;
  note: string;
  tone: string;
  /** Let the crash animation play for a moment before covering it. */
  delayed?: boolean;
}

function outcomeFor(cfg: FlightConfig, s: FlightState): Outcome | null {
  switch (s.phase) {
    case "landed":
      return {
        title: "Touchdown!",
        note: `Soft landing at ${fmtOne(s.impactSpeed)} m/s. Nicely done.`,
        tone: "bg-toon-green",
      };
    case "crashed":
      return s.crashReason === "tilt"
        ? {
            title: "Tipped over!",
            note: `Touched down leaning ${fmtDeg(Math.abs(s.heading))}. Land upright.`,
            tone: "bg-[#ffb3a8]",
            delayed: true,
          }
        : {
            title: "Crashed!",
            note: s.chuteTear
              ? s.chuteTear.cause === "burn"
                ? `Hit the ground at ${fmtInt(s.impactSpeed)} m/s. The engine burned through the parachute: throttle down to 0% before you pull it.`
                : `Hit the ground at ${fmtInt(s.impactSpeed)} m/s. Your parachute tore opening at ${fmtInt(s.chuteTear.speed)} m/s. Wait until you've slowed down.`
              : `Hit the ground at ${fmtInt(s.impactSpeed)} m/s. Add a parachute or legs, or slow down with the engine.`,
            tone: "bg-[#ffb3a8]",
            delayed: true,
          };
    case "space":
      return {
        title: "You reached space!",
        note: `Crossed the 100 km line ${fmtClock(s.t)} after liftoff.`,
        tone: "bg-toon-yellow",
      };
    case "grounded":
      return totalThrust(cfg) === 0
        ? {
            title: "No engine, no liftoff",
            note: "Add an engine to the rocket in the builder.",
            tone: "bg-paper-light",
          }
        : {
            title: "Never left the pad",
            note: "Thrust never beat weight. Fit a more powerful engine or carry less.",
            tone: "bg-paper-light",
          };
    default:
      return null;
  }
}

/** How long the crash animation plays before the card covers it. */
const CRASH_REVEAL_MS = 1000;

/** Mounts its children only after `delayMs`; renders them immediately when 0. */
function DelayedReveal({
  delayMs,
  children,
}: {
  delayMs: number;
  children: ReactNode;
}) {
  const [shown, setShown] = useState(delayMs === 0);
  useEffect(() => {
    if (delayMs === 0) return;
    const id = setTimeout(() => setShown(true), delayMs);
    return () => clearTimeout(id);
  }, [delayMs]);
  return shown ? children : null;
}

/** End-of-flight card: verdict, flight stats, fly again / back to builder. */
export function OutcomeBanner() {
  const cfg = useFlightStore((st) => st.cfg);
  const state = useFlightStore((st) => st.state);
  const reset = useFlightStore((st) => st.reset);
  const outcome = outcomeFor(cfg, state);
  if (!outcome) return null;
  const tips: CrashTip[] = crashAdvice(cfg, state);

  const alt = fmtAlt(state.maxAlt);
  const stats = [
    { label: "Max altitude", value: `${alt.value} ${alt.unit}` },
    { label: "Top speed", value: `${fmtInt(state.maxSpeed)} m/s` },
    { label: "Flight time", value: fmtClock(state.t) },
  ];

  return (
    <DelayedReveal
      key={state.phase}
      delayMs={outcome.delayed ? CRASH_REVEAL_MS : 0}
    >
      <div className="absolute inset-0 z-30 grid place-items-center p-4">
        <div
          role="alert"
          className="paper rl-pop w-full max-w-sm rounded-[10px] border-[3px] border-pen p-5 text-center text-pen shadow-[5px_5px_0_var(--pen)]"
        >
          <h2
            className={`mx-auto inline-block rounded-[8px] border-[3px] border-pen px-3 py-0.5 font-display text-3xl font-semibold ${outcome.tone}`}
          >
            {outcome.title}
          </h2>
          <p className="mt-3 font-hand text-2xl leading-tight">
            {outcome.note}
          </p>
          {tips.length > 0 && (
            <div className="mt-3 rounded-[8px] border-[2.5px] border-pen bg-paper-light p-3 text-left">
              <p className={LABEL}>What would help</p>
              <ul className="mt-1 space-y-1">
                {tips.map((tip) => (
                  <li key={tip.missing} className="leading-tight">
                    <span className="font-sans text-sm font-extrabold">
                      {tip.missing}.
                    </span>{" "}
                    <span className="font-hand text-xl">{tip.fix}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <dl className="mt-4 grid grid-cols-3 gap-2">
            {stats.map((st) => (
              <div key={st.label}>
                <dt className={LABEL}>{st.label}</dt>
                <dd className="font-display text-lg font-semibold tabular-nums">
                  {st.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/build" className={`${toonButton} bg-paper-light`}>
              Back to builder
            </Link>
            <button
              type="button"
              onClick={reset}
              className={`${toonButton} bg-toon-yellow`}
            >
              Fly again
            </button>
          </div>
        </div>
      </div>
    </DelayedReveal>
  );
}
