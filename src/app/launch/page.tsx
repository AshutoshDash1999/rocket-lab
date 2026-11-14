import type { Metadata } from "next";
import { OnboardedGate } from "@/components/common/onboarded-gate";
import { LaunchControl } from "./_components/launch-control";

export const metadata: Metadata = {
  title: "Launch · Rocket Lab",
};

export default function LaunchPage() {
  return (
    <main className="flex-1">
      <OnboardedGate />
      <LaunchControl />
    </main>
  );
}
