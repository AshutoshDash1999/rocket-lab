"use client";

import { toonButton } from "@/components/common/toon-button";
import {
  type ChuteAdvice,
  chuteAdvice,
  remaining,
  TERMINAL,
} from "@/lib/rocket/flight";
import { useFlightStore } from "@/lib/rocket/store/flight-store";
import { fmtInt } from "./format";
import { LABEL } from "./panel";

/** A word on whether pulling the chute right now would work, and why. */
function adviceLine(a: ChuteAdvice): { text: string; tone: string } {
  switch (a.kind) {
    case "ok":
      return { text: "Safe to open", tone: "bg-toon-green" };
    case "too-fast":
      return {
        text: `Too fast! ${fmtInt(a.speed)} m/s, max ${fmtInt(a.safeSpeed)}`,
        tone: "bg-[#ffb3a8]",
      };
    case "too-thin":
      return { text: "Air too thin, opens lower", tone: "bg-toon-yellow" };
    case "burning":
      return { text: "Engine burning! Throttle to 0", tone: "bg-[#ffb3a8]" };
    case "armed":
      return { text: "Armed, waiting for air", tone: "bg-toon-yellow" };
    case "deployed":
      return { text: "Canopy out", tone: "bg-toon-green" };
    case "torn":
      return { text: "Torn!", tone: "bg-[#ffb3a8]" };
    default:
      return { text: "After liftoff", tone: "bg-paper" };
  }
}

/** Deploy button plus a live go / no-go readout for the parachute. */
export function ParachuteControl() {
  const cfg = useFlightStore((st) => st.cfg);
  const s = useFlightStore((st) => st.state);
  const deploy = useFlightStore((st) => st.deployChute);

  if (remaining(cfg, s).chutes === 0) return null;

  const advice = chuteAdvice(cfg, s);
  const line = adviceLine(advice);
  const label =
    s.chuteState === "packed"
      ? "Parachute"
      : s.chuteState === "armed"
        ? "Armed"
        : s.chuteState === "reefed"
          ? "Opening…"
          : s.chuteState === "open"
            ? "Chute open"
            : "Torn";
  // Stays pressable when it's risky: the player may choose to chance it.
  const canPull =
    s.chuteState === "packed" &&
    s.phase === "flying" &&
    s.airborne &&
    !TERMINAL.has(s.phase);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={deploy}
        disabled={!canPull}
        aria-keyshortcuts="P"
        title="Pull the parachute (P)"
        className={`${toonButton} h-14 whitespace-nowrap ${
          s.chuteState === "open" || s.chuteState === "reefed"
            ? "bg-toon-green"
            : "bg-paper-light"
        }`}
      >
        <span aria-hidden className="text-xl">
          ☂
        </span>
        {label}
      </button>
      <div className="w-36">
        <p className={LABEL}>Chute check</p>
        <output
          className={`mt-0.5 inline-block rounded-[6px] border-2 border-pen px-1.5 font-sans text-xs leading-tight font-bold text-pen ${line.tone}`}
        >
          {line.text}
        </output>
      </div>
    </div>
  );
}
