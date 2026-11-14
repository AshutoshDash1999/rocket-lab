import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getAppUser, getSessionUser } from "@/lib/users";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = {
  title: "Welcome · Rocket Lab",
};

async function Onboarding() {
  const user = await getSessionUser();
  if (!user) redirect("/");
  if (await getAppUser(user.id)) redirect("/build");

  return (
    <>
      <p className="-mt-2 text-center text-sm text-pen/70">
        Signed in as <span className="font-semibold">{user.email}</span>
      </p>
      <OnboardingForm />
    </>
  );
}

export default function OnboardingPage() {
  return (
    <main className="paper flex flex-1 items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-[14px] border-[3px] border-pen bg-paper-light px-6 py-10 shadow-[6px_6px_0_var(--pen)]">
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold text-pen">
            Welcome aboard
          </h1>
          <p className="mt-1 font-hand text-2xl text-pen/70">
            a few details before liftoff
          </p>
        </div>
        <Suspense fallback={<p className="text-sm text-pen/60">Loading…</p>}>
          <Onboarding />
        </Suspense>
      </div>
    </main>
  );
}
