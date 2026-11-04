/**
 * Turns parts placed on the canvas into a rocket: which parts are joined into
 * one column, which are loose, and how decouplers split it into stages.
 * Joins are read from positions, so the saved PlacedPart format never changes.
 */
import { type PlacedPart, SEAM, type Size } from "./canvas";
import { canStack } from "./fit";
import type { PartId } from "./parts";
import { G0, ISP, type PartTotals, sumParts } from "./stats";

/** Position slack (px) when deciding whether two parts touch. */
const TOUCH = 1;

export interface Stage extends PartTotals {
  /** Top → bottom. */
  parts: PlacedPart[];
  chutes: number;
  hasLegs: boolean;
  hasFins: boolean;
  /** Drawn height of the stage, px. */
  heightPx: number;
}

export interface StackInfo {
  /** The rocket: one connected column, top → bottom. */
  chain: PlacedPart[];
  /** Parts not joined to the rocket. They stay on the pad. */
  loose: PlacedPart[];
  /** Parts that touch but don't fit together, as [upper uid, lower uid]. */
  badJoints: [string, string][];
  /** Bottom stage first: it fires first. */
  stages: Stage[];
}

export function makeStage(parts: PlacedPart[], sizeOf: (id: PartId) => Size) {
  const ids = parts.map((p) => p.partId);
  const heights = ids.map((id) => sizeOf(id).h);
  return {
    parts,
    ...sumParts(ids),
    chutes: ids.filter((id) => id === "parachute").length,
    hasLegs: ids.includes("legs"),
    hasFins: ids.includes("fins"),
    heightPx:
      heights.reduce((a, h) => a + h, 0) - SEAM * Math.max(0, ids.length - 1),
  } satisfies Stage;
}

/** Split a top → bottom column into stages, bottom first, cutting above each decoupler. */
export function splitStages(
  chain: readonly PlacedPart[],
  sizeOf: (id: PartId) => Size,
): Stage[] {
  const groups: PlacedPart[][] = [];
  let current: PlacedPart[] = [];
  for (let i = chain.length - 1; i >= 0; i--) {
    const p = chain[i];
    current.unshift(p);
    // The decoupler drops with the stage below it.
    if (p.partId === "decoupler" && i > 0) {
      groups.push(current);
      current = [];
    }
  }
  if (current.length > 0) groups.push(current);
  return groups.map((g) => makeStage(g, sizeOf));
}

/** How far (px) a saved part may sit from its stacking spot and still be re-seated. */
const SETTLE_SLACK = 20;

/**
 * Re-seat parts that sit almost, but not exactly, on a part they fit onto,
 * e.g. a rocket saved before a part's drawing changed height. Works bottom
 * up so a whole column follows the part it rests on.
 */
export function settleStack(
  parts: readonly PlacedPart[],
  sizeOf: (id: PartId) => Size,
): PlacedPart[] {
  const out = parts.map((p) => ({ ...p }));
  const seated = new Set<string>();
  const bottomUp = [...out].sort(
    (a, b) => b.y + sizeOf(b.partId).h - (a.y + sizeOf(a.partId).h),
  );
  for (const lower of bottomUp) {
    const ls = sizeOf(lower.partId);
    const lcx = lower.x + ls.w / 2;
    let best: { p: PlacedPart; gap: number } | null = null;
    for (const upper of out) {
      if (upper === lower || seated.has(upper.uid)) continue;
      if (!canStack(upper.partId, lower.partId)) continue;
      const us = sizeOf(upper.partId);
      if (Math.abs(upper.x + us.w / 2 - lcx) > TOUCH) continue;
      const gap = Math.abs(lower.y - (upper.y + us.h - SEAM));
      if (gap <= SETTLE_SLACK && (!best || gap < best.gap)) {
        best = { p: upper, gap };
      }
    }
    if (best) {
      best.p.y = lower.y - sizeOf(best.p.partId).h + SEAM;
      seated.add(best.p.uid);
    }
  }
  return out;
}

export function analyzeStack(
  parts: readonly PlacedPart[],
  sizeOf: (id: PartId) => Size,
): StackInfo {
  const below = new Map<string, PlacedPart>();
  const above = new Map<string, PlacedPart>();
  const badJoints: [string, string][] = [];

  for (const u of parts) {
    const us = sizeOf(u.partId);
    for (const l of parts) {
      if (l === u || below.has(u.uid) || above.has(l.uid)) continue;
      const ls = sizeOf(l.partId);
      const centred = Math.abs(u.x + us.w / 2 - (l.x + ls.w / 2)) <= TOUCH;
      const touching = Math.abs(l.y - (u.y + us.h - SEAM)) <= TOUCH;
      if (!centred || !touching) continue;
      if (canStack(u.partId, l.partId)) {
        below.set(u.uid, l);
        above.set(l.uid, u);
      } else {
        badJoints.push([u.uid, l.uid]);
      }
    }
  }

  // Walk each column from its top part down.
  const columns: PlacedPart[][] = [];
  for (const top of parts) {
    if (above.has(top.uid)) continue;
    const col: PlacedPart[] = [];
    for (let p: PlacedPart | undefined = top; p; p = below.get(p.uid)) {
      col.push(p);
    }
    columns.push(col);
  }

  // The rocket is the column with the capsule; failing that, the tallest one.
  const score = (c: PlacedPart[]) =>
    (c.some((p) => p.partId === "capsule") ? 1000 : 0) + c.length;
  const chain = columns.reduce<PlacedPart[]>(
    (best, c) => (score(c) > score(best) ? c : best),
    [],
  );
  const inChain = new Set(chain.map((p) => p.uid));

  return {
    chain,
    loose: parts.filter((p) => !inChain.has(p.uid)),
    badJoints,
    stages: splitStages(chain, sizeOf),
  };
}

export interface StageStats {
  /** Thrust-to-weight with every stage above still attached and full. */
  twr: number;
  /** Seconds of burn at full power. */
  burnTime: number;
}

export function stageStats(stages: readonly Stage[]): StageStats[] {
  return stages.map((st, i) => {
    const mass = stages
      .slice(i)
      .reduce((m, s) => m + s.dryMass + s.fuelMass, 0);
    const flow = (st.thrust * 1000) / (ISP * G0);
    return {
      twr: mass > 0 ? (st.thrust * 1000) / (mass * G0) : 0,
      burnTime: flow > 0 ? st.fuelMass / flow : 0,
    };
  });
}

/** Short build warnings, most important first. */
export function stackWarnings(info: StackInfo): string[] {
  const out: string[] = [];
  const n = info.loose.length;
  if (n > 0) out.push(`${n} part${n === 1 ? "" : "s"} not attached`);
  if (info.badJoints.length > 0) out.push("Some parts don't fit together");
  const stats = stageStats(info.stages);
  info.stages.forEach((st, i) => {
    const last = i === info.stages.length - 1;
    if (st.thrust === 0 && !last) out.push(`Stage ${i + 1} has no engine`);
  });
  if (info.stages.length > 0 && info.stages[0].thrust > 0 && stats[0].twr <= 1)
    out.push(`Stage 1 can't lift off (TWR ${stats[0].twr.toFixed(2)})`);
  return out;
}
