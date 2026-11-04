import { PARTS, type PartId } from "./parts";

export interface RocketStats {
  /** Wet mass (dry + fuel), kg */
  totalMass: number;
  /** Mass with empty tanks, kg */
  dryMass: number;
  /** Fuel carried, kg */
  fuelMass: number;
  /** Combined thrust of all engines, kN */
  thrust: number;
  /** Thrust-to-weight ratio at liftoff. Above 1 means the rocket can leave the pad. */
  twr: number;
}

/** Standard gravity, m/s² */
export const G0 = 9.81;

export function computeRocketStats(parts: readonly PartId[]): RocketStats {
  let dryMass = 0;
  let fuelMass = 0;
  let thrust = 0;
  for (const id of parts) {
    const part = PARTS[id];
    dryMass += part.dryMass;
    fuelMass += part.fuelMass;
    thrust += part.thrust;
  }
  const totalMass = dryMass + fuelMass;
  const twr = totalMass > 0 ? (thrust * 1000) / (totalMass * G0) : 0;
  return { totalMass, dryMass, fuelMass, thrust, twr };
}
