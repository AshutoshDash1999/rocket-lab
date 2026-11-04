import type { RocketStats as Stats } from "@/lib/rocket/stats";

const fmt = (n: number) => n.toLocaleString("en-US");

/** Compact inline readout for the builder top bar. */
export function RocketStats({
  stats,
  partCount,
}: {
  stats: Stats;
  partCount: number;
}) {
  const tiles = [
    { label: "Parts", value: fmt(partCount), unit: "" },
    { label: "Mass", value: fmt(stats.totalMass), unit: "kg" },
    { label: "Fuel", value: fmt(stats.fuelMass), unit: "kg" },
    { label: "Thrust", value: fmt(stats.thrust), unit: "kN" },
  ];

  const verdict =
    stats.thrust === 0
      ? { text: "No engine", className: "bg-paper-light" }
      : stats.twr > 1
        ? { text: `Go · ${stats.twr.toFixed(2)}`, className: "bg-toon-green" }
        : {
            text: `No go · ${stats.twr.toFixed(2)}`,
            className: "bg-[#ffb3a8]",
          };

  return (
    <dl className="flex items-center gap-5 overflow-x-auto">
      {tiles.map((tile) => (
        <div key={tile.label} className="shrink-0">
          <dt className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-pen/60">
            {tile.label}
          </dt>
          <dd className="font-display text-xl font-semibold leading-tight text-pen tabular-nums">
            {tile.value}
            {tile.unit && (
              <span className="ml-1 font-sans text-sm font-bold text-pen/60">
                {tile.unit}
              </span>
            )}
          </dd>
        </div>
      ))}
      <div className="shrink-0">
        <dt className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-pen/60">
          Thrust / weight
        </dt>
        <dd
          className={`mt-0.5 inline-block -rotate-1 rounded-[6px] border-2 border-pen px-2 font-display text-base font-semibold text-pen tabular-nums ${verdict.className}`}
        >
          {verdict.text}
        </dd>
      </div>
    </dl>
  );
}
