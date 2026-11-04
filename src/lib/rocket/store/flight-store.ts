import { create } from "zustand";
import type { PlacedPart } from "../canvas";
import {
  COUNTDOWN,
  DT,
  type FlightConfig,
  type FlightState,
  flightConfig,
  initialFlight,
  step,
  TERMINAL,
} from "../flight";

/** Longest frame gap simulated at once; a stalled tab resumes instead of fast-forwarding. */
const MAX_FRAME = 0.1;

interface FlightStore {
  parts: PlacedPart[];
  cfg: FlightConfig;
  state: FlightState;
  /** Held steering input: −1 left, 1 right. */
  steer: -1 | 0 | 1;
  /** Bumped on every (re)start so one-shot animations replay. */
  run: number;
  /** Unsimulated time carried between frames, s. */
  acc: number;

  init: (parts: PlacedPart[]) => void;
  reset: () => void;
  launch: () => void;
  toggleEngine: () => void;
  setThrottle: (throttle: number) => void;
  setSteer: (steer: -1 | 0 | 1) => void;
  /** Advance by a frame's worth of real time, in fixed physics steps. */
  tick: (dt: number) => void;
}

const live = (s: FlightState) => !TERMINAL.has(s.phase);

export const useFlightStore = create<FlightStore>()((set, get) => {
  const fresh = (parts: PlacedPart[]) => {
    const cfg = flightConfig(parts.map((p) => p.partId));
    return { parts, cfg, state: initialFlight(cfg), steer: 0 as const, acc: 0 };
  };
  const update = (fn: (s: FlightState) => Partial<FlightState>) => {
    const { state } = get();
    if (live(state)) set({ state: { ...state, ...fn(state) } });
  };

  return {
    ...fresh([]),
    run: 0,

    init: (parts) => set((st) => ({ ...fresh(parts), run: st.run + 1 })),
    reset: () => get().init(get().parts),

    launch: () =>
      update((s) =>
        s.phase === "pad" ? { phase: "countdown", countdown: COUNTDOWN } : {},
      ),
    toggleEngine: () =>
      update((s) => ({ engineOn: !s.engineOn && s.fuel > 0 })),
    setThrottle: (throttle) =>
      update(() => ({ throttle: Math.min(1, Math.max(0, throttle)) })),
    setSteer: (steer) => set({ steer }),

    tick: (dt) => {
      const { state, cfg, steer, acc } = get();
      if (!live(state)) return;
      let s = state;
      let left = acc + Math.min(dt, MAX_FRAME);
      while (left >= DT) {
        s = step(s, cfg, steer, DT);
        left -= DT;
      }
      set({ state: s, acc: left });
    },
  };
});
