import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BlueprintPreview } from "@/components/common/blueprint-preview";
import { partSize } from "@/components/common/part-shape";
import { RelativeTime } from "@/components/common/relative-time";
import { RocketStats } from "@/components/common/rocket-stats";
import { toonButton } from "@/components/common/toon-button";
import { getBlueprint } from "@/lib/blueprints";
import { analyzeStack } from "@/lib/rocket/stack";
import { computeRocketStats } from "@/lib/rocket/stats";
import { requireOnboarded } from "@/lib/users";
import { ShareActions } from "./_components/share-actions";

export const metadata: Metadata = {
  title: "Shared blueprint · Rocket Lab",
};

async function SharedBlueprint({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, requireOnboarded()]);
  const blueprint = await getBlueprint(id);
  if (!blueprint) notFound();

  const info = analyzeStack(blueprint.parts, partSize);
  const stats = computeRocketStats(info.chain.map((p) => p.partId));
  const isOwner = blueprint.owner_id === user.user_id;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 md:py-10">
      <div className="overflow-hidden rounded-[14px] border-[3px] border-pen bg-paper-light shadow-[6px_6px_0_var(--pen)]">
        <BlueprintPreview
          parts={blueprint.parts}
          className="h-[min(56vh,460px)] border-b-[3px] border-pen"
        />
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <div>
            <h1 className="font-display text-3xl font-semibold leading-tight text-pen">
              {blueprint.name}
            </h1>
            <p className="mt-0.5 text-sm text-pen/65">
              {isOwner ? "Your blueprint" : `by @${blueprint.owner_username}`} ·
              updated <RelativeTime iso={blueprint.updated_at} />
            </p>
          </div>
          <RocketStats stats={stats} info={info} />
          <ShareActions
            id={blueprint.id}
            chain={info.chain}
            isOwner={isOwner}
          />
        </div>
      </div>
    </div>
  );
}

export default function SharedBlueprintPage({ params }: PageProps<"/b/[id]">) {
  return (
    <main className="paper min-h-dvh flex-1">
      <header className="flex items-center gap-3 border-b-[3px] border-pen px-4 py-3 md:px-6">
        <Link
          href="/blueprints"
          className={`${toonButton} bg-paper-light px-3 sm:px-4`}
        >
          ←<span className="hidden sm:inline">Your blueprints</span>
        </Link>
        <p className="font-hand text-2xl leading-none text-pen/70">
          a blueprint someone shared
        </p>
      </header>
      <Suspense
        fallback={
          <p className="grid min-h-[60vh] place-items-center font-hand text-3xl text-pen/60">
            Unrolling the blueprint…
          </p>
        }
      >
        <SharedBlueprint params={params} />
      </Suspense>
    </main>
  );
}
