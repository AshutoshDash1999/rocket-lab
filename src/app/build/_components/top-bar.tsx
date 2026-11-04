import { RocketStats } from "@/components/common/rocket-stats";
import type { RocketStats as Stats } from "@/lib/rocket/stats";
import { PartShape } from "@/components/common/part-shape";
import { toonButton } from "@/components/common/toon-button";

export function TopBar({
  stats,
  partCount,
  busy,
  onLaunch,
  onClear,
}: {
  stats: Stats;
  partCount: number;
  busy: boolean;
  onLaunch: () => void;
  onClear: () => void;
}) {
  return (
    <header className="paper relative z-10 flex flex-wrap items-center gap-x-8 gap-y-2 border-b-[3px] border-pen px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <div className="hidden size-10 shrink-0 sm:block">
          <PartShape partId="capsule" fit />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold leading-none text-pen sm:text-2xl">
            Build your rocket
          </h1>
          <p className="hidden font-hand text-lg leading-none text-pen/70 sm:block">
            stack it, check it, light it
          </p>
        </div>
      </div>

      <div className="order-last w-full min-w-0 lg:order-none lg:w-auto lg:flex-1">
        <RocketStats stats={stats} partCount={partCount} />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onClear}
          disabled={partCount === 0 || busy}
          className={`${toonButton} bg-paper-light`}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onLaunch}
          disabled={partCount === 0 || busy}
          className={`${toonButton} bg-toon-red sm:px-5`}
        >
          Launch
        </button>
      </div>
    </header>
  );
}
