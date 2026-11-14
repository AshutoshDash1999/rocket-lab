"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { saveToCollection } from "@/app/blueprints/actions";
import { toonButton } from "@/components/common/toon-button";
import type { PlacedPart } from "@/lib/rocket/canvas";
import { useRocketStore } from "@/lib/rocket/store/rocket-store";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${toonButton} bg-toon-yellow`}
    >
      {pending ? "Saving…" : "Save to my collection"}
    </button>
  );
}

export function ShareActions({
  id,
  chain,
  isOwner,
}: {
  id: string;
  /** The joined rocket column, top → bottom: what flies. */
  chain: PlacedPart[];
  isOwner: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {isOwner ? (
        <Link href={`/build/${id}`} className={`${toonButton} bg-paper-light`}>
          Edit blueprint
        </Link>
      ) : (
        <form action={saveToCollection.bind(null, id)}>
          <SaveButton />
        </form>
      )}
      {chain.length === 0 ? (
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
          onClick={() => useRocketStore.getState().setParts(chain, `/b/${id}`)}
          className={`${toonButton} bg-toon-red sm:px-5`}
        >
          Launch
        </Link>
      )}
    </div>
  );
}
