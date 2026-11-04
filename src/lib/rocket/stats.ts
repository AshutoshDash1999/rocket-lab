import { PARTS, type PartId } from "./parts";

export interface PartTotals {
  /** Mass with empty tanks, kg */
  dryMass: number;
  /** Fuel carried, kg */
  fuelMass: number;
  /** Combined thrust of all engines, kN */
  thrust: number;
}

export interface RocketStats extends PartTotals {
  /** Wet mass (dry + fuel), kg */
  totalMass: number;
  /** Thrust-to-weight ratio at liftoff. Above 1 means the rocket can leave the pad. */
  twr: number;
}

/** Standard gravity, m/s² */
export const G0 = 9.81;
/** Engine efficiency (specific impulse), s. Higher = more push per kg of fuel. */
export const ISP = 280;

export function sumParts(parts: readonly PartId[]): PartTotals {
  let dryMass = 0;
  let fuelMass = 0;
  let thrust = 0;
  for (const id of parts) {
    const part = PARTS[id];
    dryMass += part.dryMass;
    fuelMass += part.fuelMass;
    thrust += part.thrust;
  }
  return { dryMass, fuelMass, thrust };
}

export function computeRocketStats(parts: readonly PartId[]): RocketStats {
  const totals = sumParts(parts);
  const totalMass = totals.dryMass + totals.fuelMass;
  const twr = totalMass > 0 ? (totals.thrust * 1000) / (totalMass * G0) : 0;
  return { ...totals, totalMass, twr };
}
