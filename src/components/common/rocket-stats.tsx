import { type StackInfo, stackWarnings, stageStats } from "@/lib/rocket/stack";
import type { RocketStats as Stats } from "@/lib/rocket/stats";

const fmt = (n: number) => n.toLocaleString("en-US");

const LABEL =
  "text-[11px] font-extrabold uppercase tracking-[0.08em] text-pen/60";

const twrTone = (thrust: number, twr: number) =>
  thrust === 0 ? "bg-paper-light" : twr > 1 ? "bg-toon-green" : "bg-[#ffb3a8]";

/** Compact inline readout for the builder top bar. */
export function RocketStats({
  stats,
  info,
}: {
  stats: Stats;
  info: StackInfo;
}) {
  const { stages } = info;
  const perStage = stageStats(stages);
  const warnings = stackWarnings(info);
  const first = stages[0];
  const firstTwr = perStage[0]?.twr ?? 0;

  const tiles = [
    { label: "Parts", value: fmt(info.chain.length), unit: "" },
    { label: "Mass", value: fmt(stats.totalMass), unit: "kg" },
    { label: "Fuel", value: fmt(stats.fuelMass), unit: "kg" },
    { label: "Stages", value: fmt(stages.length), unit: "" },
  ];

  const verdict = !first
    ? { text: "No rocket", className: "bg-paper-light" }
    : first.thrust === 0
      ? { text: "No engine", className: "bg-paper-light" }
      : firstTwr > 1
        ? { text: `Go · ${firstTwr.toFixed(2)}`, className: "bg-toon-green" }
        : { text: `No go · ${firstTwr.toFixed(2)}`, className: "bg-[#ffb3a8]" };

  return (
    <div className="min-w-0">
      <dl className="flex items-center gap-5 overflow-x-auto">
        {tiles.map((tile) => (
          <div key={tile.label} className="shrink-0">
            <dt className={LABEL}>{tile.label}</dt>
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
          <dt className={LABEL}>Liftoff thrust / weight</dt>
          <dd
            className={`mt-0.5 inline-block -rotate-1 rounded-[6px] border-2 border-pen px-2 font-display text-base font-semibold text-pen tabular-nums ${verdict.className}`}
          >
            {verdict.text}
          </dd>
        </div>
        {stages.length > 1 && (
          <div className="shrink-0">
            <dt className={LABEL}>Each stage (fires bottom first)</dt>
            <dd className="mt-0.5 flex gap-1.5">
              {stages.map((st, i) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: stages have no id; order is their identity
                  key={i}
                  title={`Stage ${i + 1}: ${fmt(st.thrust)} kN, ${fmt(st.fuelMass)} kg fuel${
                    perStage[i].burnTime > 0
                      ? `, burns ${Math.round(perStage[i].burnTime)} s`
                      : ""
                  }`}
                  className={`inline-block rounded-[6px] border-2 border-pen px-1.5 font-sans text-xs font-bold text-pen tabular-nums ${twrTone(st.thrust, perStage[i].twr)}`}
                >
                  {i + 1}:{" "}
                  {st.thrust === 0 ? "coast" : perStage[i].twr.toFixed(2)}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
      {warnings.length > 0 && (
        <output className="mt-1 block truncate font-hand text-lg leading-none text-toon-red">
          ⚠ {warnings.join(" · ")}
        </output>
      )}
    </div>
  );
}
