import type { Metadata } from "next";
import { LaunchControl } from "./_components/launch-control";

export const metadata: Metadata = {
  title: "Launch · Rocket Lab",
};

export default function LaunchPage() {
  return (
    <main className="flex-1">
      <LaunchControl />
    </main>
  );
}
