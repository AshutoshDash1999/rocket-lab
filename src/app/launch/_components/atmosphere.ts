/**
 * Layers of the atmosphere and the sky colour at any altitude.
 * Boundaries are rounded textbook values; the Kármán line (SPACE_ALT) ends the flight.
 */
import { SPACE_ALT } from "@/lib/rocket/flight";

export type LayerId =
  | "troposphere"
  | "stratosphere"
  | "mesosphere"
  | "thermosphere";

export interface AtmosphereLayer {
  id: LayerId;
  name: string;
  /** Lower boundary, m */
  from: number;
  /** One-line fact shown when the rocket enters the layer. */
  blurb: string;
}

export const LAYERS: readonly AtmosphereLayer[] = [
  {
    id: "troposphere",
    name: "Troposphere",
    from: 0,
    blurb: "Clouds, weather and airliners live down here.",
  },
  {
    id: "stratosphere",
    name: "Stratosphere",
    from: 12_000,
    blurb: "Calm, dry air. The ozone layer soaks up sunburn rays.",
  },
  {
    id: "mesosphere",
    name: "Mesosphere",
    from: 50_000,
    blurb: "Coldest layer. Shooting stars burn up here.",
  },
  {
    id: "thermosphere",
    name: "Thermosphere",
    from: 80_000,
    blurb: "Air is almost gone. Auroras glow up here.",
  },
];

export function layerAt(alt: number): AtmosphereLayer {
  for (let i = LAYERS.length - 1; i > 0; i--) {
    if (alt >= LAYERS[i].from) return LAYERS[i];
  }
  return LAYERS[0];
}

type RGB = [number, number, number];

/** Sky colour stops by altitude (m): overhead colour and the glow near the horizon. */
const SKY: { alt: number; top: RGB; low: RGB }[] = [
  { alt: 0, top: [104, 196, 255], low: [206, 239, 255] },
  { alt: 4_000, top: [84, 172, 245], low: [176, 226, 255] },
  // Tropopause: the blue deepens as the air thins.
  { alt: 12_000, top: [48, 112, 212], low: [128, 192, 246] },
  { alt: 30_000, top: [30, 52, 132], low: [86, 140, 222] },
  // Stratopause: indigo with a violet haze below.
  { alt: 50_000, top: [22, 24, 76], low: [72, 86, 178] },
  { alt: 80_000, top: [12, 10, 38], low: [52, 38, 120] },
  { alt: SPACE_ALT, top: [6, 6, 18], low: [20, 26, 70] },
];

const mix = (a: RGB, b: RGB, t: number) =>
  `rgb(${a.map((c, k) => Math.round(c + (b[k] - c) * t)).join(" ")})`;

/** Vertical sky gradient for the given altitude. */
export function skyAt(alt: number) {
  let i = SKY.findIndex((s) => s.alt > alt);
  if (i === -1) i = SKY.length - 1;
  if (i === 0) i = 1;
  const a = SKY[i - 1];
  const b = SKY[i];
  const t = Math.min(1, Math.max(0, (alt - a.alt) / (b.alt - a.alt)));
  return `linear-gradient(to bottom, ${mix(a.top, b.top, t)} 0%, ${mix(a.top, b.top, t)} 25%, ${mix(a.low, b.low, t)} 100%)`;
}

/**
 * 0 below `inStart`, ramps to 1 by `inEnd`, holds, ramps back to 0 from
 * `outStart` to `outEnd`. Used to fade scenery in and out with altitude.
 */
export function band(
  alt: number,
  inStart: number,
  inEnd: number,
  outStart = Number.POSITIVE_INFINITY,
  outEnd = Number.POSITIVE_INFINITY,
) {
  const up = Math.min(1, Math.max(0, (alt - inStart) / (inEnd - inStart)));
  const down =
    outEnd === Number.POSITIVE_INFINITY
      ? 1
      : Math.min(1, Math.max(0, (outEnd - alt) / (outEnd - outStart)));
  return Math.min(up, down);
}
