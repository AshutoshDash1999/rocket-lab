"use client";

import { useFormStatus } from "react-dom";
import { toonButton } from "@/components/common/toon-button";
import { createBlueprint } from "../actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${toonButton} bg-toon-yellow sm:px-5`}
    >
      <span aria-hidden>+</span>
      {pending ? "Drafting…" : "New rocket"}
    </button>
  );
}

export function NewRocketButton() {
  return (
    <form action={createBlueprint}>
      <Submit />
    </form>
  );
}
