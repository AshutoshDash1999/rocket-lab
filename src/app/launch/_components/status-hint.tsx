"use client";

import Link from "next/link";
import {
  type FlightConfig,
  type FlightState,
  TERMINAL,
  twrOf,
} from "@/lib/rocket/flight";
import { useFlightStore } from "@/lib/rocket/store/flight-store";

interface Hint {
  text: string;
  warn?: boolean;
  /** Offer a way back to the builder (the fix is a different rocket). */
  rebuild?: boolean;
}

/** What the player should know right now, if anything. */
function hintFor(cfg: FlightConfig, s: FlightState): Hint | null {
  if (TERMINAL.has(s.phase) || s.phase === "countdown") return null;
  if (s.phase === "pad") {
    return s.engineOn
      ? { text: "Test fire! The clamps are holding her down." }
      : { text: "Ready on the pad. Hit LAUNCH!" };
  }
  if (!s.airborne) {
    if (!s.engineOn) return { text: "Engine's off. Switch it on!" };
    const twr = twrOf(cfg, s);
    if (twr <= 1) {
      return twrOf(cfg, s, 1) > 1
        ? {
            text: `Not enough power to lift (thrust/weight ${twr.toFixed(2)}). Throttle up!`,
            warn: true,
          }
        : {
            text: `Too heavy! Thrust/weight is ${twr.toFixed(2)} at full power. Fit a more powerful engine or lighten the rocket.`,
            warn: true,
            rebuild: true,
          };
    }
    return null;
  }
  if (s.chute > 0 && s.chute < 1) return { text: "Parachute out!" };
  if (s.vy < -30 && s.alt < 4000 && s.chute === 0) {
    return {
      text:
        s.fuel > 0
          ? "Falling fast with no parachute. Fire the engine to slow down!"
          : "Falling fast with no parachute… brace!",
      warn: true,
    };
  }
  if (s.fuel === 0 && s.vy > 0) return { text: "Out of fuel. Coasting up…" };
  return null;
}

export function StatusHint() {
  const cfg = useFlightStore((st) => st.cfg);
  const state = useFlightStore((st) => st.state);
  const hint = hintFor(cfg, state);

  return (
    <output
      className={
        hint
          ? `absolute top-20 left-1/2 z-10 flex w-max max-w-[min(92%,28rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-x-3 rounded-[8px] border-[3px] border-pen px-4 py-1.5 text-center font-hand text-2xl leading-tight text-pen shadow-[3px_3px_0_var(--pen)] lg:top-5 ${
              hint.warn ? "bg-[#ffb3a8]" : "bg-paper-light"
            }`
          : "sr-only"
      }
    >
      {hint?.text}
      {hint?.rebuild && (
        <Link
          href="/build"
          className="font-sans text-base font-extrabold text-pen underline decoration-2 underline-offset-2"
        >
          Back to builder
        </Link>
      )}
    </output>
  );
}
