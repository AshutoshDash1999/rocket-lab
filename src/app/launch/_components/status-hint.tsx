"use client";

import Link from "next/link";
import {
  activeFuel,
  activeStage,
  chuteAdvice,
  type FlightConfig,
  type FlightState,
  remaining,
  stagesLeft,
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
    const kit = remaining(cfg, s);
    if (!kit.hasFins)
      return {
        text: "No fins: expect a wobbly ride! Steer against the lean.",
        warn: true,
        rebuild: true,
      };
    if (!kit.hasNose)
      return { text: "No nose cone: the blunt top adds drag.", warn: true };
    return { text: "Ready on the pad. Hit LAUNCH!" };
  }
  const stageEmpty = activeFuel(s) === 0 || activeStage(cfg, s).thrust === 0;
  if (stageEmpty && stagesLeft(cfg, s) > 1) {
    return { text: "Stage spent. Press Space to drop it!" };
  }
  if (!s.airborne) {
    if (s.throttle === 0) return { text: "Power's at zero. Throttle up (W)!" };
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
  const chute = chuteAdvice(cfg, s);
  if (
    !remaining(cfg, s).hasFins &&
    Math.abs(s.heading) > (15 * Math.PI) / 180 &&
    s.chuteState === "packed"
  ) {
    return { text: "Wobbling! Steer against the lean (← / →).", warn: true };
  }
  if (chute.kind === "torn") {
    return {
      text:
        s.chuteTear?.cause === "burn"
          ? "Parachute burned! Never fire the engine under a chute."
          : "Parachute torn! It opened too fast.",
      warn: true,
    };
  }
  if (chute.kind === "armed")
    return { text: "Parachute armed. It opens in thicker air." };
  if (s.chuteState === "reefed") return { text: "Parachute out! Reefed…" };
  if (s.vy < -30 && s.alt < 4000 && chute.kind !== "deployed") {
    const fuel = activeFuel(s) > 0;
    return {
      text:
        chute.kind === "ok"
          ? "Falling fast. Open the parachute now (P)!"
          : chute.kind === "too-fast"
            ? `Too fast for the chute (max ${Math.round(chute.safeSpeed)} m/s).${fuel ? " Burn to slow down!" : ""}`
            : fuel
              ? "Falling fast with no parachute. Fire the engine to slow down!"
              : "Falling fast with no parachute… brace!",
      warn: true,
    };
  }
  if (activeFuel(s) === 0 && s.vy > 0)
    return { text: "Out of fuel. Coasting up…" };
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
