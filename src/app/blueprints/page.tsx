import type { Metadata } from "next";
import { Suspense } from "react";
import { PartShape } from "@/components/common/part-shape";
import { SignOutButton } from "@/components/common/sign-out-button";
import { listBlueprints } from "@/lib/blueprints";
import { requireOnboarded } from "@/lib/users";
import { BlueprintCard } from "./_components/blueprint-card";
import { NewRocketButton } from "./_components/new-rocket-button";

export const metadata: Metadata = {
  title: "Your blueprints · Rocket Lab",
};

async function BlueprintList() {
  const user = await requireOnboarded();
  const blueprints = await listBlueprints(user.user_id);

  if (blueprints.length === 0) {
    return (
      <div className="mx-auto mt-10 flex max-w-sm flex-col items-center gap-4 rounded-[14px] border-[3px] border-pen bg-paper-light px-6 py-9 text-center shadow-[6px_6px_0_var(--pen)]">
        <div className="size-16 -rotate-6">
          <PartShape partId="capsule" fit />
        </div>
        <h2 className="font-display text-3xl font-semibold text-pen">
          No rockets yet
        </h2>
        <p className="font-hand text-2xl leading-tight text-pen/70">
          start a blueprint and stack your first rocket
        </p>
        <NewRocketButton />
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5 sm:gap-6">
      {blueprints.map((b) => (
        <li key={b.id}>
          <BlueprintCard blueprint={b} />
        </li>
      ))}
    </ul>
  );
}

function ListSkeleton() {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5 sm:gap-6">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="h-[268px] animate-pulse rounded-[12px] border-[3px] border-pen/25 bg-paper-light/60"
        />
      ))}
    </ul>
  );
}

export default function BlueprintsPage() {
  return (
    <main className="paper min-h-dvh flex-1">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b-[3px] border-pen px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="hidden size-10 shrink-0 sm:block">
            <PartShape partId="capsule" fit />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold leading-none text-pen sm:text-2xl">
              Your blueprints
            </h1>
            <p className="hidden font-hand text-lg leading-none text-pen/70 sm:block">
              every rocket you've drawn up
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <SignOutButton />
          <NewRocketButton />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <Suspense fallback={<ListSkeleton />}>
          <BlueprintList />
        </Suspense>
      </div>
    </main>
  );
}
