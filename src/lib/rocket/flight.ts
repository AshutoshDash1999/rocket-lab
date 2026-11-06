/**
 * 2D flight model: one rigid body under thrust, gravity, drag and ground
 * contact, integrated at a fixed timestep. The rocket is a stack of stages;
 * only the lowest one still attached burns, and staging drops it.
 * Pure functions, no React. All tuning values live at the top.
 */
import { DRAWING_PX_PER_M, type PlacedPart, SEAM, type Size } from "./canvas";
import { PARTS, type PartId } from "./parts";
import { analyzeStack, type Stage } from "./stack";
import { G0, ISP } from "./stats";

/** Fixed physics timestep, s. */
export const DT = 1 / 60;
/** Kármán line: where space begins, m. */
export const SPACE_ALT = 100_000;
/** Seconds counted down before the clamps let go. */
export const COUNTDOWN = 3;
/** Engines light this many seconds before release, while the clamps still hold. */
const IGNITION_AT = 1;

/** Air density at sea level, kg/m³, thinning by e every SCALE_HEIGHT metres. */
const SEA_LEVEL_DENSITY = 1.225;
const SCALE_HEIGHT = 8500;
/** Drag area (Cd·A, m²) of the bare rocket. */
const BODY_CDA = 3.5;
/** Without a nose cone or capsule the blunt top drags this much more. */
const BLUNT_DRAG_MULT = 1.8;

// Missing parts -----------------------------------------------------------
/** Dynamic pressure at which a finless rocket wobbles hardest, Pa. */
const WOBBLE_Q = 20_000;
/** Least wobble while the engine burns, so it shows right off the pad. */
const WOBBLE_BURN_FLOOR = 0.3;
/** Peak wobble rate of a finless rocket, rad/s. */
const WOBBLE_RATE = (14 * Math.PI) / 180;
/** Without fins a lean grows by this fraction of itself per second at full q. */
const UNSTABLE_K = 0.5;
/** A blunt top makes the wobble this much worse. */
const BLUNT_WOBBLE_MULT = 1.3;
/** Without a capsule to steer, turning is this much slower. */
const NO_CAPSULE_TURN = 0.5;
/** A wobble past this counts as a problem worth mentioning. */
const BAD_WOBBLE = (20 * Math.PI) / 180;

// Parachutes -------------------------------------------------------------
/** Drag area (Cd·A, m²) of one fully open parachute. */
const CHUTE_CDA = 1200;
/** Drag coefficient of a round canopy; with CdA it gives the canopy's size. */
const CHUTE_CD = 0.8;
/** Canopy diameter, m. */
const CHUTE_DIAMETER = Math.sqrt((4 * CHUTE_CDA) / CHUTE_CD / Math.PI);
/** Canopy fill constant: a canopy fills in about this many diameters of travel. */
const CHUTE_FILL_N = 8;
/** Clamp on fill time, s, so it never snaps open instantly or takes forever. */
const CHUTE_FILL_MIN = 0.4;
const CHUTE_FILL_MAX = 4;
/** A reefed canopy first opens to this fraction of its drag area… */
export const REEF_FRACTION = 0.1;
/** …and holds there this long, s, before opening fully. */
const REEF_TIME = 3;
/** Opening shock: peak load while a canopy fills, as a multiple of steady drag. */
const CHUTE_CX = 1.6;
/** Load one parachute can take before it tears, N. ≈20 kPa while reefed. */
const CHUTE_MAX_LOAD = 3.8e6;
/** Below this air density (~35 km) a canopy can't inflate, kg/m³. */
const CHUTE_MIN_DENSITY = 0.02;

// Air -----------------------------------------------------------------------
/** Compressed air for the steering jets, kg. The capsule carries the big tank. */
const RCS_CAPSULE_AIR = 25;
/** Without a capsule, a small built-in bottle still allows some steering, kg. */
const RCS_BUILTIN_AIR = 8;
/** Air used while a steering jet fires, kg/s. */
const RCS_USE = 1;
/** Dynamic pressure the airframe survives, Pa. Past this it breaks apart. */
export const MAX_Q_LIMIT = 50_000;
/** Above this fraction of the limit, warn the player to throttle down. */
export const MAX_Q_WARN = 0.75;
/** Heating proxy √ρ·v³ at which the glow is full. */
const HEAT_FULL = 6e7;
/** Below this density (~15 km) there is too little moisture for a vapor cone, kg/m³. */
const VAPOR_MIN_DENSITY = 0.19;

const rad = (deg: number) => (deg * Math.PI) / 180;
/** Steering rate without and with fins, rad/s. */
const TURN_RATE = rad(30);
const FIN_TURN_RATE = rad(50);
/** Fastest survivable touchdown, m/s. Legs absorb more. */
export const SAFE_LANDING = 8;
const LEGS_SAFE_LANDING = 12;
/** Landing tilted further than this tips the rocket over. */
const MAX_LANDING_TILT = rad(25);
/** Height that counts as having left the pad, m. */
const LIFTOFF_ALT = 0.5;

export type FlightPhase =
  /** On the pad, held by clamps. Engines can be test-fired. */
  | "pad"
  | "countdown"
  | "flying"
  | "landed"
  | "crashed"
  | "space"
  /** Released but never left the pad: out of fuel or no engine. */
  | "grounded";

/** speed/tilt: bad touchdown. breakup: torn apart by air pressure in flight. */
export type CrashReason = "speed" | "tilt" | "breakup";

/**
 * packed: in its bag. armed: deployed in air too thin to fill, waits for
 * thicker air. reefed: partly open to soften the shock. open: fully open.
 * torn: ripped by the opening shock or burned by the engine.
 */
export type ChuteState = "packed" | "armed" | "reefed" | "open" | "torn";

export interface ChuteTear {
  cause: "fast" | "burn";
  /** Speed when it tore, m/s */
  speed: number;
}

export interface FlightConfig {
  /** Bottom stage first. */
  stages: Stage[];
}

export interface FlightState {
  phase: FlightPhase;
  /** Mission time since the clamps released, s */
  t: number;
  /** Seconds left in the countdown */
  countdown: number;
  /** Horizontal position from the pad, m */
  x: number;
  /** Altitude of the rocket's base, m */
  alt: number;
  vx: number;
  vy: number;
  /** Acceleration from all forces (what an onboard accelerometer + gravity reads), m/s² */
  ax: number;
  ay: number;
  /** Nose direction, radians from straight up; positive = right */
  heading: number;
  /** Index of the lowest stage still attached. */
  stage: number;
  /** Fuel left in each stage, kg */
  fuel: number[];
  /** Engine power, 0–1 */
  throttle: number;
  engineOn: boolean;
  /** Has left the ground since release */
  airborne: boolean;
  chuteState: ChuteState;
  /** Canopy fill as a fraction of its full drag area, 0–1 */
  chute: number;
  /** Time spent fully reefed, s */
  chuteTimer: number;
  chuteTear: ChuteTear | null;
  maxAlt: number;
  maxSpeed: number;
  /** Speed at touchdown, m/s */
  impactSpeed: number;
  crashReason: CrashReason | null;
  /** Largest lean from upright while under power, radians */
  maxTilt: number;
  /** Compressed air left for the steering jets, kg */
  air: number;
  /** Highest dynamic pressure so far, Pa */
  maxQ: number;
}

export const TERMINAL: ReadonlySet<FlightPhase> = new Set([
  "landed",
  "crashed",
  "space",
  "grounded",
]);

const EMPTY_STAGE: Stage = {
  parts: [],
  dryMass: 0,
  fuelMass: 0,
  thrust: 0,
  chutes: 0,
  hasLegs: false,
  hasFins: false,
  heightPx: 0,
};

/** Build the flight from parts on the canvas; loose parts are left behind. */
export function flightConfig(
  parts: readonly PlacedPart[],
  sizeOf: (id: PartId) => Size,
): FlightConfig {
  return { stages: analyzeStack(parts, sizeOf).stages };
}

export function initialFlight(cfg: FlightConfig): FlightState {
  return {
    phase: "pad",
    t: 0,
    countdown: 0,
    x: 0,
    alt: 0,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
    heading: 0,
    stage: 0,
    fuel: cfg.stages.map((st) => st.fuelMass),
    throttle: 1,
    engineOn: false,
    airborne: false,
    chuteState: "packed",
    chute: 0,
    chuteTimer: 0,
    chuteTear: null,
    maxAlt: 0,
    maxSpeed: 0,
    impactSpeed: 0,
    crashReason: null,
    maxTilt: 0,
    air: rcsCapacity(cfg),
    maxQ: 0,
  };
}

/** Compressed air the rocket starts with, kg. */
export const rcsCapacity = (cfg: FlightConfig) =>
  cfg.stages.some((st) => st.parts.some((p) => p.partId === "capsule"))
    ? RCS_CAPSULE_AIR
    : RCS_BUILTIN_AIR;

// Stage helpers ------------------------------------------------------------

export const activeStage = (cfg: FlightConfig, s: FlightState): Stage =>
  cfg.stages[s.stage] ?? EMPTY_STAGE;

export const activeFuel = (s: FlightState) => s.fuel[s.stage] ?? 0;

export const stagesLeft = (cfg: FlightConfig, s: FlightState) =>
  Math.max(0, cfg.stages.length - s.stage);

/** Parts still attached to the rocket, top → bottom. */
export const attachedParts = (cfg: FlightConfig, s: FlightState) =>
  cfg.stages
    .slice(s.stage)
    .reverse()
    .flatMap((st) => st.parts);

/** What the stages still attached carry. */
export function remaining(cfg: FlightConfig, s: FlightState) {
  const left = cfg.stages.slice(s.stage);
  return {
    chutes: left.reduce((n, st) => n + st.chutes, 0),
    hasLegs: left.some((st) => st.hasLegs),
    hasFins: left.some((st) => st.hasFins),
    hasNose: left.some((st) =>
      st.parts.some(
        (p) => p.partId === "capsule" || PARTS[p.partId].category === "nose",
      ),
    ),
    hasCapsule: left.some((st) => st.parts.some((p) => p.partId === "capsule")),
  };
}

/** Thrust of every stage, kN. */
export const totalThrust = (cfg: FlightConfig) =>
  cfg.stages.reduce((n, st) => n + st.thrust, 0);

export const massOf = (cfg: FlightConfig, s: FlightState) =>
  cfg.stages
    .slice(s.stage)
    .reduce((m, st, i) => m + st.dryMass + (s.fuel[s.stage + i] ?? 0), 0);

/** Thrust-to-weight ratio at the given throttle with the fuel left. Above 1 lifts off. */
export const twrOf = (
  cfg: FlightConfig,
  s: FlightState,
  throttle = s.throttle,
) => {
  const mass = massOf(cfg, s);
  return mass > 0
    ? (activeStage(cfg, s).thrust * 1000 * throttle) / (mass * G0)
    : 0;
};

export const isBurning = (cfg: FlightConfig, s: FlightState) =>
  s.engineOn &&
  activeFuel(s) > 0 &&
  s.throttle > 0 &&
  activeStage(cfg, s).thrust > 0;

export const thrustNow = (cfg: FlightConfig, s: FlightState) =>
  isBurning(cfg, s) ? activeStage(cfg, s).thrust * s.throttle : 0;

/** Can any stage still attached produce thrust? */
const canStillThrust = (cfg: FlightConfig, s: FlightState) =>
  cfg.stages.some(
    (st, i) => i >= s.stage && st.thrust > 0 && (s.fuel[i] ?? 0) > 0,
  );

/** Wrap an angle to (−π, π]. */
export const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

const densityAt = (alt: number) =>
  SEA_LEVEL_DENSITY * Math.exp(-Math.max(0, alt) / SCALE_HEIGHT);

/** Speed of sound, m/s: falls with temperature up to the tropopause, then holds. */
const soundSpeedAt = (alt: number) =>
  alt >= 11_000 ? 295 : 340 - (45 * Math.max(0, alt)) / 11_000;

/** Dynamic pressure ½ρv², Pa. */
export const dynamicPressure = (s: FlightState) =>
  0.5 * densityAt(s.alt) * (s.vx * s.vx + s.vy * s.vy);

/** Seconds for a canopy to fill at this speed: faster air fills it faster. */
const fillTime = (speed: number) =>
  Math.min(
    CHUTE_FILL_MAX,
    Math.max(
      CHUTE_FILL_MIN,
      (CHUTE_FILL_N * CHUTE_DIAMETER) / Math.max(1, speed),
    ),
  );

/** Peak load on one canopy if it started opening (reefed) right now, N. */
const reefedShock = (s: FlightState) =>
  CHUTE_CX * dynamicPressure(s) * REEF_FRACTION * CHUTE_CDA;

/** Fastest speed a reefed canopy survives opening at this altitude, m/s. */
const safeChuteSpeed = (alt: number) =>
  Math.sqrt(
    (2 * CHUTE_MAX_LOAD) /
      (CHUTE_CX * REEF_FRACTION * CHUTE_CDA * densityAt(alt)),
  );

// Player actions --------------------------------------------------------------

/** Drop the spent bottom stage. The next engine lights straight away. */
export function separate(cfg: FlightConfig, prev: FlightState): FlightState {
  if (prev.phase !== "flying" || prev.stage >= cfg.stages.length - 1)
    return prev;
  const dropped = cfg.stages[prev.stage];
  const s = { ...prev, stage: prev.stage + 1 };
  // The rocket's base is now the next stage's bottom: lift alt so it stays put.
  s.alt += (dropped.heightPx - SEAM) / DRAWING_PX_PER_M;
  const next = activeStage(cfg, s);
  s.engineOn = next.thrust > 0 && activeFuel(s) > 0;
  if (s.engineOn && s.throttle === 0) s.throttle = 1;
  // Parachutes on the dropped stage fall away with it.
  if (remaining(cfg, s).chutes === 0) {
    s.chuteState = "packed";
    s.chute = 0;
    s.chuteTear = null;
  }
  return s;
}

/** Pull the parachute. Physics decides whether it opens, waits or tears. */
export function deployChute(cfg: FlightConfig, prev: FlightState): FlightState {
  if (
    prev.phase !== "flying" ||
    !prev.airborne ||
    prev.chuteState !== "packed" ||
    remaining(cfg, prev).chutes === 0
  )
    return prev;
  const speed = Math.hypot(prev.vx, prev.vy);
  if (isBurning(cfg, prev)) {
    return {
      ...prev,
      chuteState: "torn",
      chuteTear: { cause: "burn", speed },
    };
  }
  if (densityAt(prev.alt) < CHUTE_MIN_DENSITY) {
    return { ...prev, chuteState: "armed", chute: 0, chuteTimer: 0 };
  }
  // Line stretch: the snatch as the canopy catches air sets its peak load,
  // so the speed at the moment you pull decides whether it survives.
  if (reefedShock(prev) > CHUTE_MAX_LOAD) {
    return { ...prev, chuteState: "torn", chuteTear: { cause: "fast", speed } };
  }
  return { ...prev, chuteState: "reefed", chute: 0, chuteTimer: 0 };
}

export type ChuteAdviceKind =
  | "none"
  | "waiting"
  | "burning"
  | "too-thin"
  | "too-fast"
  | "ok"
  | "armed"
  | "deployed"
  | "torn";

export interface ChuteAdvice {
  kind: ChuteAdviceKind;
  /** Speed now, m/s */
  speed: number;
  /** Fastest speed the canopy survives opening at this height, m/s */
  safeSpeed: number;
}

/** Would pulling the parachute right now work? For the console. */
export function chuteAdvice(cfg: FlightConfig, s: FlightState): ChuteAdvice {
  const speed = Math.hypot(s.vx, s.vy);
  const safeSpeed = safeChuteSpeed(s.alt);
  const kind: ChuteAdviceKind =
    remaining(cfg, s).chutes === 0
      ? "none"
      : s.chuteState === "torn"
        ? "torn"
        : s.chuteState === "armed"
          ? "armed"
          : s.chuteState !== "packed"
            ? "deployed"
            : s.phase !== "flying" || !s.airborne
              ? "waiting"
              : isBurning(cfg, s)
                ? "burning"
                : densityAt(s.alt) < CHUTE_MIN_DENSITY
                  ? "too-thin"
                  : reefedShock(s) > CHUTE_MAX_LOAD
                    ? "too-fast"
                    : "ok";
  return { kind, speed, safeSpeed };
}

// Integration -------------------------------------------------------------

/** Advance the parachute by `dt`: arm, fill, disreef, or tear. */
function stepChute(cfg: FlightConfig, s: FlightState, dt: number) {
  const speed = Math.hypot(s.vx, s.vy);
  if (s.chuteState === "armed") {
    // Barometric trigger: open once the air is thick enough and the shock survivable.
    if (
      densityAt(s.alt) >= CHUTE_MIN_DENSITY &&
      reefedShock(s) <= CHUTE_MAX_LOAD
    ) {
      s.chuteState = "reefed";
      s.chute = 0;
      s.chuteTimer = 0;
    }
    return;
  }
  if (s.chuteState !== "reefed" && s.chuteState !== "open") return;

  if (isBurning(cfg, s)) {
    s.chuteState = "torn";
    s.chuteTear = { cause: "burn", speed };
    return;
  }

  const target = s.chuteState === "reefed" ? REEF_FRACTION : 1;
  const filling = s.chute < target;
  if (filling) {
    s.chute = Math.min(target, s.chute + dt / fillTime(speed));
  } else if (s.chuteState === "reefed") {
    s.chuteTimer += dt;
    if (s.chuteTimer >= REEF_TIME) s.chuteState = "open";
  }

  const load =
    (filling ? CHUTE_CX : 1) * dynamicPressure(s) * s.chute * CHUTE_CDA;
  if (load > CHUTE_MAX_LOAD) {
    s.chuteState = "torn";
    s.chuteTear = { cause: "fast", speed };
  }
}

/** Advance the flight by `dt` seconds. `steer` is −1 (left), 0, or 1 (right). */
export function step(
  prev: FlightState,
  cfg: FlightConfig,
  steer: -1 | 0 | 1,
  dt: number,
): FlightState {
  if (TERMINAL.has(prev.phase)) return prev;
  const s = { ...prev, fuel: [...prev.fuel] };

  if (s.phase === "countdown") {
    s.countdown = Math.max(0, s.countdown - dt);
    // Light the engines once, a beat before release, at full power if it was zeroed.
    if (prev.countdown > IGNITION_AT && s.countdown <= IGNITION_AT) {
      s.engineOn = true;
      if (s.throttle === 0) s.throttle = 1;
    }
    if (s.countdown === 0) s.phase = "flying";
  }
  const clamped = s.phase === "pad" || s.phase === "countdown";
  if (s.phase === "flying") s.t += dt;

  const left = remaining(cfg, s);

  // Engines: only the active stage burns, from its own tanks.
  const burning = isBurning(cfg, s);
  const thrust = burning ? activeStage(cfg, s).thrust * 1000 * s.throttle : 0;
  if (burning) {
    s.fuel[s.stage] = Math.max(0, activeFuel(s) - (thrust / (ISP * G0)) * dt);
  }
  if (activeFuel(s) === 0) s.engineOn = false;
  const mass = massOf(cfg, s);

  // Steering only bites once off the ground, and only while the jets have air.
  if (s.airborne && steer !== 0 && s.air > 0) {
    const rate =
      (left.hasFins ? FIN_TURN_RATE : TURN_RATE) *
      (left.hasCapsule ? 1 : NO_CAPSULE_TURN);
    const use = Math.min(1, s.air / (RCS_USE * dt));
    s.heading = wrapAngle(s.heading + steer * rate * dt * use);
    s.air = Math.max(0, s.air - RCS_USE * dt);
  }

  stepChute(cfg, s, dt);
  const chuteOut = s.chuteState === "reefed" || s.chuteState === "open";

  // Without fins nothing keeps the nose into the wind: it wobbles, and any
  // lean keeps growing until the player steers against it.
  if (s.airborne && !left.hasFins && !chuteOut) {
    const q = Math.min(1, dynamicPressure(s) / WOBBLE_Q);
    const aero =
      (burning ? Math.max(WOBBLE_BURN_FLOOR, q) : q) *
      (left.hasNose ? 1 : BLUNT_WOBBLE_MULT);
    const noise = Math.sin(2.3 * s.t) + 0.6 * Math.sin(3.9 * s.t + 1.3);
    s.heading = wrapAngle(
      s.heading + (WOBBLE_RATE * noise + UNSTABLE_K * s.heading) * aero * dt,
    );
  }
  if (burning && s.airborne) {
    s.maxTilt = Math.max(s.maxTilt, Math.abs(s.heading));
  }
  // A canopy swings the rocket upright beneath it.
  if (chuteOut) {
    s.heading -= s.heading * Math.min(1, dt * 1.5 * Math.sqrt(s.chute));
  }

  let fx = Math.sin(s.heading) * thrust;
  let fy = Math.cos(s.heading) * thrust - mass * G0;

  // Drag opposes motion; capped so it can stop the rocket but never reverse it in one step.
  const speed = Math.hypot(s.vx, s.vy);
  if (speed > 0) {
    const cda =
      BODY_CDA * (left.hasNose ? 1 : BLUNT_DRAG_MULT) +
      (chuteOut ? s.chute * CHUTE_CDA * left.chutes : 0);
    const drag = Math.min(
      0.5 * densityAt(s.alt) * speed * speed * cda,
      (mass * speed) / dt,
    );
    fx -= (drag * s.vx) / speed;
    fy -= (drag * s.vy) / speed;
  }

  // Clamps hold everything; otherwise the ground pushes back until thrust beats weight.
  if (clamped) {
    fx = 0;
    fy = 0;
  } else if (!s.airborne) {
    fx = 0;
    fy = Math.max(0, fy);
  }

  s.ax = fx / mass;
  s.ay = fy / mass;
  s.vx += s.ax * dt;
  s.vy += s.ay * dt;
  s.x += s.vx * dt;
  s.alt += s.vy * dt;

  if (!s.airborne && s.alt > LIFTOFF_ALT) s.airborne = true;

  if (s.airborne && s.alt <= 0) {
    // Touchdown: gentle and upright lands, anything else breaks.
    s.impactSpeed = Math.hypot(s.vx, s.vy);
    const safe = left.hasLegs ? LEGS_SAFE_LANDING : SAFE_LANDING;
    s.crashReason =
      s.impactSpeed > safe
        ? "speed"
        : Math.abs(wrapAngle(s.heading)) > MAX_LANDING_TILT
          ? "tilt"
          : null;
    s.phase = s.crashReason ? "crashed" : "landed";
    s.alt = 0;
    s.vx = s.vy = s.ax = s.ay = 0;
    s.engineOn = false;
  } else if (!s.airborne) {
    s.alt = 0;
  }

  s.maxAlt = Math.max(s.maxAlt, s.alt);
  s.maxSpeed = Math.max(s.maxSpeed, Math.hypot(s.vx, s.vy));

  // Air pressing harder than the airframe can take tears it apart.
  if (s.airborne && !TERMINAL.has(s.phase)) {
    const q = dynamicPressure(s);
    s.maxQ = Math.max(s.maxQ, q);
    if (q > MAX_Q_LIMIT) {
      s.phase = "crashed";
      s.crashReason = "breakup";
      s.impactSpeed = Math.hypot(s.vx, s.vy);
      s.vx = s.vy = s.ax = s.ay = 0;
      s.engineOn = false;
      return s;
    }
  }

  if (s.alt >= SPACE_ALT) s.phase = "space";
  else if (s.phase === "flying" && !s.airborne && !canStillThrust(cfg, s)) {
    s.phase = "grounded";
    s.engineOn = false;
  }

  return s;
}

// Airflow, for drawing -------------------------------------------------------

export interface Airflow {
  /** Dynamic pressure, Pa */
  q: number;
  mach: number;
  /** kg/m³ */
  density: number;
  speed: number;
  /** Direction the rocket moves, radians from straight up; positive = right. */
  travel: number;
  /** Heating on the leading face, 0–1 */
  heat: number;
  /** Strength of the vapor cone around Mach 1, 0–1 */
  vapor: number;
}

export function airflow(s: FlightState): Airflow {
  const speed = Math.hypot(s.vx, s.vy);
  const density = densityAt(s.alt);
  const mach = speed / soundSpeedAt(s.alt);
  const near = Math.max(0, 1 - Math.abs(mach - 1) / 0.12);
  return {
    q: dynamicPressure(s),
    mach,
    density,
    speed,
    travel: Math.atan2(s.vx, s.vy),
    heat: Math.min(1, (Math.sqrt(density) * speed ** 3) / HEAT_FULL),
    vapor:
      density >= VAPOR_MIN_DENSITY
        ? near * Math.min(1, (density - VAPOR_MIN_DENSITY) / 0.2 + 0.4)
        : 0,
  };
}

// Crash debrief ---------------------------------------------------------------

export interface CrashTip {
  /** What the rocket lacked. */
  missing: string;
  /** What adding it would have done. */
  fix: string;
}

/** Which missing parts made this crash worse, most relevant first. */
export function crashAdvice(cfg: FlightConfig, s: FlightState): CrashTip[] {
  if (s.phase !== "crashed") return [];
  const had = remaining(cfg, initialFlight(cfg));
  if (s.crashReason === "breakup") {
    const kq = Math.round(s.maxQ / 1000);
    const out: CrashTip[] = [
      {
        missing: "Too much power in thick air",
        fix: `Air pressure hit ${kq} kPa. Throttle down around Max Q (the thick lower air), then back up once it eases.`,
      },
    ];
    if (!had.hasNose)
      out.push({
        missing: "No nose cone",
        fix: "A pointed top slips through the air; a blunt one takes the full push.",
      });
    return out;
  }
  const tilt = s.crashReason === "tilt";
  const deg = Math.round((s.maxTilt * 180) / Math.PI);
  const tips: { tip: CrashTip; rank: number }[] = [];
  const add = (rank: number, missing: string, fix: string) =>
    tips.push({ tip: { missing, fix }, rank });

  if (!had.hasFins) {
    add(
      tilt || s.maxTilt > BAD_WOBBLE ? 0 : 3,
      "No fins",
      deg > 90
        ? "It tumbled right over. Fins near the bottom keep it pointing straight."
        : deg > 0
          ? `It wobbled up to ${deg}°. Fins near the bottom keep it pointing straight.`
          : "Fins near the bottom keep it pointing straight.",
    );
  }
  if (!tilt && had.chutes === 0) {
    add(
      1,
      "No parachute",
      "Put one on top of the capsule to float down gently.",
    );
  }
  if (!had.hasLegs) {
    add(
      2,
      "No legs",
      tilt
        ? "Legs give it a wide stance so it lands upright."
        : `Legs survive touchdowns up to ${LEGS_SAFE_LANDING} m/s instead of ${SAFE_LANDING}.`,
    );
  }
  if (!had.hasNose) {
    add(4, "No nose cone", "A blunt top drags, so it loses height and speed.");
  }
  if (!had.hasCapsule) {
    add(5, "No capsule", "Steering is sluggish without one to guide it.");
  }
  return tips
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3)
    .map((t) => t.tip);
}
