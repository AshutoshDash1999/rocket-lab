import type { Metadata } from "next";
import { OnboardedGate } from "@/components/common/onboarded-gate";
import { RocketBuilder } from "./_components/rocket-builder";

export const metadata: Metadata = {
  title: "Build · Rocket Lab",
};

export default function BuildPage() {
  return (
    <main className="flex-1">
      <OnboardedGate />
      <RocketBuilder />
    </main>
  );
}
