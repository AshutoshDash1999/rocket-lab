/**
 * Which parts may be stacked directly on top of which. Every part is drawn at
 * the same width, so fit is decided by role, not diameter.
 */
import { PARTS, type PartId } from "./parts";

const TANKS = ["tank-small", "tank-large", "tank-jumbo"] as const;
const LIQUID_ENGINES = [
  "engine-small",
  "engine-large",
  "engine-heavy",
] as const;

/**
 * For each part, the parts allowed directly beneath it. A part nothing lists
 * here can have nothing on top of it (nose cones, fairings, the escape tower).
 * Tune through playtesting.
 */
export const FITS_BELOW: Record<PartId, readonly PartId[]> = {
  "escape-tower": ["capsule"],
  "nose-cone": [...TANKS, "decoupler", "srb"],
  fairing: [...TANKS, "decoupler"],
  parachute: ["capsule"],
  capsule: [...TANKS, "decoupler"],
  "tank-small": [...TANKS, ...LIQUID_ENGINES, "decoupler"],
  "tank-large": [...TANKS, ...LIQUID_ENGINES, "decoupler"],
  "tank-jumbo": [...TANKS, ...LIQUID_ENGINES, "decoupler"],
  "engine-small": ["decoupler", "fins", "legs"],
  "engine-large": ["decoupler", "fins", "legs"],
  "engine-heavy": ["decoupler", "fins", "legs"],
  srb: ["decoupler", "fins", "legs"],
  decoupler: ["interstage", ...TANKS, "srb"],
  interstage: [...TANKS, "srb"],
  fins: ["legs"],
  legs: [],
};

/** True when `upper` may sit directly on top of `lower`. */
export const canStack = (upper: PartId, lower: PartId) =>
  FITS_BELOW[upper].includes(lower);

const isEngine = (id: PartId) => PARTS[id].category === "engine";
const lc = (id: PartId) => PARTS[id].name.toLowerCase();

/** Why `upper` can't sit on `lower`, in plain words; null when it fits. */
export function fitReason(upper: PartId, lower: PartId): string | null {
  if (canStack(upper, lower)) return null;
  const onTopOfLower = (Object.keys(FITS_BELOW) as PartId[]).some((id) =>
    canStack(id, lower),
  );
  if (!onTopOfLower) return `Nothing can sit on top of the ${lc(lower)}.`;
  if (lower === "capsule")
    return "Only an escape tower or parachute goes on top of a capsule.";
  if (upper === "parachute")
    return "The parachute packs into the top of a capsule.";
  if (LIQUID_ENGINES.includes(lower as (typeof LIQUID_ENGINES)[number]))
    return "Engines need a fuel tank right above them.";
  if (lower === "srb")
    return "Boosters carry their own fuel. Cap one with a nose cone or decoupler.";
  if (lower === "interstage")
    return "An interstage hangs right under a decoupler.";
  if (lower === "legs" || lower === "fins")
    return `${PARTS[lower].name.replace(" (pair)", "")} go under an engine.`;
  if (upper === "legs") return "Legs go at the very bottom.";
  if (upper === "fins") return "Only legs go under fins.";
  if (isEngine(upper))
    return "Only a decoupler, fins or legs go under an engine.";
  return `The ${lc(upper)} can't go on top of the ${lc(lower)}.`;
}
