/**
 * 2D flight model: one rigid body under thrust, gravity, drag and ground
 * contact, integrated at a fixed timestep. Pure functions, no React.
 * All tuning values live at the top — adjust through playtesting.
 */
import type { PartId } from "./parts";
import { computeRocketStats, G0 } from "./stats";

/** Fixed physics timestep, s. */
export const DT = 1 / 60;
/** Engine efficiency (specific impulse), s. Higher = more push per kg of fuel. */
export const ISP = 280;
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
/** Extra drag area of one fully open parachute, m². */
const CHUTE_CDA = 1200;
/** Parachutes open automatically below this altitude while falling, m. */
const CHUTE_DEPLOY_ALT = 3000;
/** Seconds for a parachute to open fully (opening gradually spares the rocket a jolt). */
const CHUTE_OPEN_TIME = 2.5;

const rad = (deg: number) => (deg * Math.PI) / 180;
/** Steering rate without and with fins, rad/s. */
const TURN_RATE = rad(30);
const FIN_TURN_RATE = rad(50);
/** Fastest survivable touchdown, m/s. Legs absorb more. */
const SAFE_LANDING = 8;
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

export type CrashReason = "speed" | "tilt";

export interface FlightConfig {
  /** Mass with empty tanks, kg */
  dryMass: number;
  /** Fuel at liftoff, kg */
  fuelMass: number;
  /** Combined full-throttle thrust, kN */
  thrust: number;
  chutes: number;
  hasLegs: boolean;
  hasFins: boolean;
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
  /** Fuel left, kg */
  fuel: number;
  /** Engine power, 0–1 */
  throttle: number;
  engineOn: boolean;
  /** Has left the ground since release */
  airborne: boolean;
  /** Parachute open fraction, 0 = packed, 1 = fully open */
  chute: number;
  maxAlt: number;
  maxSpeed: number;
  /** Speed at touchdown, m/s */
  impactSpeed: number;
  crashReason: CrashReason | null;
}

export const TERMINAL: ReadonlySet<FlightPhase> = new Set([
  "landed",
  "crashed",
  "space",
  "grounded",
]);

export function flightConfig(ids: readonly PartId[]): FlightConfig {
  const { dryMass, fuelMass, thrust } = computeRocketStats(ids);
  return {
    dryMass,
    fuelMass,
    thrust,
    chutes: ids.filter((id) => id === "parachute").length,
    hasLegs: ids.includes("legs"),
    hasFins: ids.includes("fins"),
  };
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
    fuel: cfg.fuelMass,
    throttle: 1,
    engineOn: false,
    airborne: false,
    chute: 0,
    maxAlt: 0,
    maxSpeed: 0,
    impactSpeed: 0,
    crashReason: null,
  };
}

export const massOf = (cfg: FlightConfig, s: FlightState) =>
  cfg.dryMass + s.fuel;

/** Thrust-to-weight ratio at the given throttle with the fuel left. Above 1 lifts off. */
export const twrOf = (
  cfg: FlightConfig,
  s: FlightState,
  throttle = s.throttle,
) => (cfg.thrust * 1000 * throttle) / (massOf(cfg, s) * G0);

export const isBurning = (s: FlightState) =>
  s.engineOn && s.fuel > 0 && s.throttle > 0;

export const thrustNow = (cfg: FlightConfig, s: FlightState) =>
  isBurning(s) ? cfg.thrust * s.throttle : 0;

/** Wrap an angle to (−π, π]. */
export const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/** Advance the flight by `dt` seconds. `steer` is −1 (left), 0, or 1 (right). */
export function step(
  prev: FlightState,
  cfg: FlightConfig,
  steer: -1 | 0 | 1,
  dt: number,
): FlightState {
  if (TERMINAL.has(prev.phase)) return prev;
  const s = { ...prev };

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

  // Engines: thrust along the nose, fuel burns at thrust / exhaust velocity.
  const burning = isBurning(s);
  const thrust = burning ? cfg.thrust * 1000 * s.throttle : 0;
  if (burning) s.fuel = Math.max(0, s.fuel - (thrust / (ISP * G0)) * dt);
  if (s.fuel === 0) s.engineOn = false;
  const mass = cfg.dryMass + s.fuel;

  // Steering only bites once off the ground.
  if (s.airborne) {
    s.heading = wrapAngle(
      s.heading + steer * (cfg.hasFins ? FIN_TURN_RATE : TURN_RATE) * dt,
    );
  }

  // Parachutes open on the way down and swing the rocket upright beneath them.
  if (
    cfg.chutes > 0 &&
    s.airborne &&
    (s.chute > 0 || (s.vy < 0 && s.alt < CHUTE_DEPLOY_ALT))
  ) {
    s.chute = Math.min(1, s.chute + dt / CHUTE_OPEN_TIME);
    s.heading -= s.heading * Math.min(1, dt * 1.5 * s.chute);
  }

  let fx = Math.sin(s.heading) * thrust;
  let fy = Math.cos(s.heading) * thrust - mass * G0;

  // Drag opposes motion; capped so it can stop the rocket but never reverse it in one step.
  const speed = Math.hypot(s.vx, s.vy);
  if (speed > 0) {
    const rho =
      SEA_LEVEL_DENSITY * Math.exp(-Math.max(0, s.alt) / SCALE_HEIGHT);
    const cda = BODY_CDA + s.chute * CHUTE_CDA * cfg.chutes;
    const drag = Math.min(0.5 * rho * speed * speed * cda, (mass * speed) / dt);
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
    const safe = cfg.hasLegs ? LEGS_SAFE_LANDING : SAFE_LANDING;
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

  if (s.alt >= SPACE_ALT) s.phase = "space";
  else if (
    s.phase === "flying" &&
    !s.airborne &&
    (s.fuel === 0 || cfg.thrust === 0)
  ) {
    s.phase = "grounded";
    s.engineOn = false;
  }

  return s;
}
