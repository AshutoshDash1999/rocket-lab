/**
 * Rocket part catalog. All tuning values live here — adjust through playtesting.
 * Units: mass in kg, thrust in kN.
 */

export type PartCategory =
  | "command"
  | "nose"
  | "tank"
  | "engine"
  | "structural"
  | "utility";

export type PartId =
  | "capsule"
  | "tank-small"
  | "tank-large"
  | "engine-small"
  | "engine-large"
  | "decoupler"
  | "fins"
  | "legs"
  | "parachute"
  | "nose-cone"
  | "fairing"
  | "escape-tower"
  | "tank-jumbo"
  | "engine-heavy"
  | "srb"
  | "interstage";

export interface PartDef {
  id: PartId;
  name: string;
  category: PartCategory;
  /** Mass without fuel, kg */
  dryMass: number;
  /** Fuel carried, kg */
  fuelMass: number;
  /** Thrust, kN */
  thrust: number;
  /** Why the part exists: what it does for the rocket. */
  role: string;
  /** When to reach for it. */
  useWhen: string;
}

export const PARTS = {
  capsule: {
    id: "capsule",
    name: "Capsule",
    category: "command",
    dryMass: 800,
    fuelMass: 0,
    thrust: 0,
    role: "Carries the crew and steers the rocket. Every crewed flight needs one.",
    useWhen:
      "At the very top of the stack, under an escape tower or nose cone if you add one.",
  },
  "tank-small": {
    id: "tank-small",
    name: "Small tank",
    category: "tank",
    dryMass: 200,
    fuelMass: 1000,
    thrust: 0,
    role: "Holds fuel for the engines below it. Light, so it is easy to lift.",
    useWhen:
      "On small rockets or upper stages where weight matters more than burn time.",
  },
  "tank-large": {
    id: "tank-large",
    name: "Large tank",
    category: "tank",
    dryMass: 400,
    fuelMass: 2500,
    thrust: 0,
    role: "Holds a lot of fuel in one piece, so engines burn longer.",
    useWhen: "As the main fuel store of a first or second stage.",
  },
  "engine-small": {
    id: "engine-small",
    name: "Small engine",
    category: "engine",
    dryMass: 300,
    fuelMass: 0,
    thrust: 40,
    role: "Gives modest thrust while staying light.",
    useWhen:
      "On upper stages or light rockets, where a big engine would be dead weight.",
  },
  "engine-large": {
    id: "engine-large",
    name: "Large engine",
    category: "engine",
    dryMass: 500,
    fuelMass: 0,
    thrust: 120,
    role: "Strong, all-round main engine.",
    useWhen: "At the bottom of a stage that needs to lift a full tank or two.",
  },
  decoupler: {
    id: "decoupler",
    name: "Decoupler",
    category: "structural",
    dryMass: 100,
    fuelMass: 0,
    thrust: 0,
    role: "Splits the rocket into stages so empty parts can be dropped.",
    useWhen: "Between a spent lower stage and the stage above it.",
  },
  fins: {
    id: "fins",
    name: "Fins (pair)",
    category: "structural",
    dryMass: 50,
    fuelMass: 0,
    thrust: 0,
    role: "Keep the rocket pointing straight, like the feathers on an arrow.",
    useWhen:
      "Near the bottom of tall rockets that would otherwise wobble or tumble.",
  },
  legs: {
    id: "legs",
    name: "Legs (pair)",
    category: "utility",
    dryMass: 100,
    fuelMass: 0,
    thrust: 0,
    role: "Let the rocket stand upright and land without tipping over.",
    useWhen:
      "At the base of a stage you want to land, or to stand the rocket on the pad.",
  },
  parachute: {
    id: "parachute",
    name: "Parachute",
    category: "utility",
    dryMass: 100,
    fuelMass: 0,
    thrust: 0,
    role: "Slows a falling capsule so it touches down gently.",
    useWhen:
      "On top of or right below the capsule, for any flight that comes home.",
  },
  "nose-cone": {
    id: "nose-cone",
    name: "Nose cone",
    category: "nose",
    dryMass: 80,
    fuelMass: 0,
    thrust: 0,
    role: "Gives a pointed top that cuts through the air, reducing drag.",
    useWhen: "To cap an uncrewed rocket or a side booster that has no capsule.",
  },
  fairing: {
    id: "fairing",
    name: "Payload fairing",
    category: "nose",
    dryMass: 250,
    fuelMass: 0,
    thrust: 0,
    role: "A shell that shields a satellite or cargo from air and heat.",
    useWhen: "On top of a payload you want to put into orbit.",
  },
  /** Abort motor fires only in an emergency, so it adds no liftoff thrust. */
  "escape-tower": {
    id: "escape-tower",
    name: "Launch escape tower",
    category: "command",
    dryMass: 400,
    fuelMass: 0,
    thrust: 0,
    role: "Pulls the capsule clear if something goes wrong at launch. Adds no lift-off thrust.",
    useWhen:
      "On top of the capsule for crewed flights, where safety comes first.",
  },
  "tank-jumbo": {
    id: "tank-jumbo",
    name: "Jumbo tank",
    category: "tank",
    dryMass: 800,
    fuelMass: 5000,
    thrust: 0,
    role: "Very large fuel store for long, heavy burns.",
    useWhen:
      "On big first stages paired with a heavy engine. Too heavy for small engines.",
  },
  "engine-heavy": {
    id: "engine-heavy",
    name: "Heavy engine cluster",
    category: "engine",
    dryMass: 900,
    fuelMass: 0,
    thrust: 260,
    role: "A cluster of engines with huge thrust, and huge weight.",
    useWhen: "Under jumbo tanks on heavy-lift first stages.",
  },
  /** Solid motor: carries its own propellant. */
  srb: {
    id: "srb",
    name: "Solid rocket booster",
    category: "engine",
    dryMass: 1000,
    fuelMass: 3000,
    thrust: 250,
    role: "Solid booster with its own fuel. Lots of cheap thrust, but it can't be throttled or stopped.",
    useWhen: "As a first-stage kick to get a heavy rocket off the pad.",
  },
  interstage: {
    id: "interstage",
    name: "Interstage",
    category: "structural",
    dryMass: 150,
    fuelMass: 0,
    thrust: 0,
    role: "A hollow adapter that joins stages and protects the engine of the stage above.",
    useWhen:
      "Between stages, often paired with a decoupler, to fit an upper engine inside.",
  },
} as const satisfies Record<PartId, PartDef>;

export const PART_LIST: readonly PartDef[] = Object.values(PARTS);

export const CATEGORY_LABELS: Record<PartCategory, string> = {
  command: "Command",
  nose: "Nose & payload",
  tank: "Fuel tanks",
  engine: "Engines",
  structural: "Structural",
  utility: "Utility",
};
