import Link from "next/link";
import { PartShape } from "@/components/common/part-shape";
import { RocketStats } from "@/components/common/rocket-stats";
import { toonButton } from "@/components/common/toon-button";
import type { StackInfo } from "@/lib/rocket/stack";
import type { RocketStats as Stats } from "@/lib/rocket/stats";

export function TopBar({
  stats,
  info,
  onLaunch,
  onClear,
}: {
  stats: Stats;
  info: StackInfo;
  /** Hand the rocket over to the launch pad (runs before navigating). */
  onLaunch: () => void;
  onClear: () => void;
}) {
  const empty = info.chain.length === 0;
  const nothingPlaced = empty && info.loose.length === 0;
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
        <RocketStats stats={stats} info={info} />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onClear}
          disabled={nothingPlaced}
          className={`${toonButton} bg-paper-light`}
        >
          Clear
        </button>
        {empty ? (
          <button
            type="button"
            disabled
            className={`${toonButton} bg-toon-red sm:px-5`}
          >
            Launch
          </button>
        ) : (
          <Link
            href="/launch"
            onClick={onLaunch}
            className={`${toonButton} bg-toon-red sm:px-5`}
          >
            Launch
          </Link>
        )}
      </div>
    </header>
  );
}
