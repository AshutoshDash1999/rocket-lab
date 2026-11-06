"use client";

import { toonButton } from "@/components/common/toon-button";
import {
  activeStage,
  isBurning,
  rcsCapacity,
  stagesLeft,
  TERMINAL,
  thrustNow,
} from "@/lib/rocket/flight";
import { useFlightStore } from "@/lib/rocket/store/flight-store";
import { fmtInt } from "./format";
import { AirTank, PowerDial } from "./gauges";
import { CARD, LABEL } from "./panel";
import { ParachuteControl } from "./parachute-control";

/** Press-and-hold steering button. */
function SteerButton({ dir, disabled }: { dir: -1 | 1; disabled: boolean }) {
  const setSteer = useFlightStore((st) => st.setSteer);
  const active = useFlightStore((st) => st.steer === dir);
  const release = () => setSteer(0);
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={dir < 0 ? "Steer left (hold)" : "Steer right (hold)"}
      aria-pressed={active}
      title={dir < 0 ? "Hold, or ← / A" : "Hold, or → / D"}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setSteer(dir);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setSteer(dir);
        }
      }}
      onKeyUp={release}
      onBlur={release}
      className={`${toonButton} size-12 touch-none px-0 text-xl ${
        active
          ? "translate-x-[3px] translate-y-[3px] bg-toon-yellow shadow-none"
          : "bg-paper-light"
      }`}
    >
      {dir < 0 ? "◀" : "▶"}
    </button>
  );
}

const Divider = () => (
  <span
    aria-hidden
    className="hidden h-10 w-[2px] rounded-full bg-pen/15 sm:block"
  />
);

/** The launch console: launch, stage, power, steering, reset. */
export function ControlPanel({ className = "" }: { className?: string }) {
  const cfg = useFlightStore((st) => st.cfg);
  const s = useFlightStore((st) => st.state);
  const { launch, stage, setThrottle, reset } = useFlightStore.getState();

  const over = TERMINAL.has(s.phase);
  const burning = isBurning(cfg, s);
  const canStage = s.phase === "flying" && stagesLeft(cfg, s) > 1;
  const pct = Math.round(s.throttle * 100);
  const airPct = Math.round((s.air / rcsCapacity(cfg)) * 100);
  const noAir = s.air <= 0;
  const canSteer = !over && s.airborne && !noAir;
  const launchLabel =
    s.phase === "pad"
      ? "LAUNCH"
      : s.phase === "countdown"
        ? `T−${Math.max(1, Math.ceil(s.countdown))}`
        : over
          ? "Flight over"
          : "In flight";

  return (
    <section
      aria-label="Launch controls"
      className={`${CARD} flex flex-wrap items-center justify-center gap-x-4 gap-y-3 p-3 ${className}`}
    >
      <button
        type="button"
        onClick={launch}
        disabled={s.phase !== "pad"}
        aria-keyshortcuts="Space"
        className={`${toonButton} h-14 min-w-36 whitespace-nowrap bg-toon-red px-6 text-2xl tracking-wide shadow-[4px_4px_0_var(--pen)] ${
          s.phase === "pad" ? "rl-ready" : ""
        }`}
      >
        {launchLabel}
      </button>

      {cfg.stages.length > 1 && (
        <button
          type="button"
          onClick={stage}
          disabled={!canStage}
          aria-keyshortcuts="Space G"
          title="Drop the spent stage (Space or G)"
          className={`${toonButton} h-14 flex-col gap-0 whitespace-nowrap bg-toon-yellow leading-none`}
        >
          <span>STAGE</span>
          <span className="font-sans text-xs font-bold text-pen/70">
            {s.stage + 1} of {cfg.stages.length}
          </span>
        </button>
      )}

      <Divider />

      <div className="flex items-center gap-2">
        <PowerDial power={s.throttle} lit={burning} />
        <div className="w-36">
          <div className="flex items-baseline justify-between">
            <label htmlFor="power" className={LABEL}>
              Engine power
            </label>
            <span className="font-display text-lg font-semibold leading-none text-pen tabular-nums">
              {pct}%
            </span>
          </div>
          <input
            id="power"
            type="range"
            min={0}
            max={100}
            step={5}
            value={pct}
            disabled={over}
            onChange={(e) => setThrottle(Number(e.target.value) / 100)}
            aria-keyshortcuts="W S"
            className="toon-range w-full"
          />
          <p className="font-sans text-xs font-bold text-pen/60 tabular-nums">
            {fmtInt(thrustNow(cfg, s))} / {fmtInt(activeStage(cfg, s).thrust)}{" "}
            kN
          </p>
        </div>
      </div>

      <Divider />

      <div className="flex items-center gap-2">
        <SteerButton dir={-1} disabled={!canSteer} />
        <div className="w-16 text-center">
          <p className={LABEL}>Steer</p>
          <p
            className={`font-hand text-lg leading-none ${noAir ? "text-toon-red" : "text-pen/70"}`}
          >
            {noAir ? "no air" : s.airborne ? "hold" : "after liftoff"}
          </p>
        </div>
        <SteerButton dir={1} disabled={!canSteer} />
        <div
          className="flex items-center gap-1"
          title="Compressed air for the steering jets. It does not refill."
        >
          <AirTank fraction={airPct / 100} />
          <div className="leading-none">
            <p className={LABEL}>Air</p>
            <p
              className={`font-display text-lg font-semibold tabular-nums ${
                airPct < 15 ? "text-toon-red" : "text-pen"
              }`}
            >
              {airPct}%
            </p>
          </div>
        </div>
      </div>

      <ParachuteControl />

      <Divider />

      <button
        type="button"
        onClick={reset}
        aria-keyshortcuts="R"
        className={`${toonButton} h-14 whitespace-nowrap bg-paper-light`}
      >
        ↺ Reset
      </button>
    </section>
  );
}
