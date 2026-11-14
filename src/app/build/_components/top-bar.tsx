import Link from "next/link";
import { PartShape } from "@/components/common/part-shape";
import { RocketStats } from "@/components/common/rocket-stats";
import { toonButton } from "@/components/common/toon-button";
import type { StackInfo } from "@/lib/rocket/stack";
import type { RocketStats as Stats } from "@/lib/rocket/stats";
import { ShareButton } from "./share-button";

export type SaveStatus = "saved" | "saving" | "error";

const SAVE_LABEL: Record<SaveStatus, string> = {
  saved: "all changes saved",
  saving: "saving…",
  error: "couldn't save, retrying",
};

export function TopBar({
  blueprintId,
  name,
  saveStatus,
  stats,
  info,
  onLaunch,
  onClear,
}: {
  blueprintId: string;
  name: string;
  saveStatus: SaveStatus;
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
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/blueprints"
          aria-label="Back to your blueprints"
          className={`${toonButton} bg-paper-light px-3`}
        >
          ←
        </Link>
        <div className="hidden size-10 shrink-0 sm:block">
          <PartShape partId="capsule" fit />
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-xl font-semibold leading-none text-pen sm:text-2xl">
            {name}
          </h1>
          <p
            aria-live="polite"
            className={`font-hand text-lg leading-none ${saveStatus === "error" ? "text-toon-red" : "text-pen/70"}`}
          >
            {SAVE_LABEL[saveStatus]}
          </p>
        </div>
      </div>

      <div className="order-last w-full min-w-0 lg:order-none lg:w-auto lg:flex-1">
        <RocketStats stats={stats} info={info} />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ShareButton blueprintId={blueprintId} />
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
