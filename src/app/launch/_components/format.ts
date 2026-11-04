const int = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const one = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** Altitude: metres below 10 km, kilometres above. */
export const fmtAlt = (m: number) =>
  m < 10_000
    ? { value: int.format(Math.max(0, m)), unit: "m" }
    : { value: one.format(m / 1000), unit: "km" };

export const fmtInt = (n: number) => int.format(Math.round(n) || 0);
export const fmtOne = (n: number) => one.format(n || 0);

/** Heading in whole degrees, right positive. */
export const fmtDeg = (rad: number) => `${fmtInt((rad * 180) / Math.PI)}°`;

/** Mission clock: T+mm:ss. */
export const fmtClock = (t: number) => {
  const s = Math.floor(t);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
