import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getBlueprint } from "@/lib/blueprints";
import { requireOnboarded } from "@/lib/users";
import { RocketBuilder } from "../_components/rocket-builder";

export const metadata: Metadata = {
  title: "Build · Rocket Lab",
};

async function Builder({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, requireOnboarded()]);
  const blueprint = await getBlueprint(id);
  if (!blueprint) notFound();
  // Someone else's blueprint opens read-only on its share page.
  if (blueprint.owner_id !== user.user_id) redirect(`/b/${id}`);

  return (
    <RocketBuilder
      key={blueprint.id}
      blueprint={{
        id: blueprint.id,
        name: blueprint.name,
        parts: blueprint.parts,
      }}
    />
  );
}

export default function BuildPage({ params }: PageProps<"/build/[id]">) {
  return (
    <main className="flex-1">
      <Suspense
        fallback={
          <div className="paper grid h-dvh place-items-center font-hand text-3xl text-pen/60">
            Unrolling the blueprint…
          </div>
        }
      >
        <Builder params={params} />
      </Suspense>
    </main>
  );
}
