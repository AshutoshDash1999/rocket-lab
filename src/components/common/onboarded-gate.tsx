import { Suspense } from "react";
import { requireOnboarded } from "@/lib/users";

async function Check() {
  await requireOnboarded();
  return null;
}

/** Redirects signed-out or not-yet-onboarded visitors. Renders nothing. */
export function OnboardedGate() {
  return (
    <Suspense fallback={null}>
      <Check />
    </Suspense>
  );
}
