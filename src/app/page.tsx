import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PartShape } from "@/components/common/part-shape";
import { safeNext } from "@/lib/next-path";
import { getAppUser, getSessionUser } from "@/lib/users";
import { GoogleSignInButton } from "./_components/google-sign-in-button";
import { LaunchScene } from "./_components/launch-scene";

/** Signed-in visitors skip the login card. */
async function RedirectIfSignedIn({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const user = await getSessionUser();
  if (!user) return null;
  const [appUser, { next }] = await Promise.all([
    getAppUser(user.id),
    searchParams,
  ]);
  const target = safeNext(next);
  redirect(appUser ? target : `/onboarding?next=${encodeURIComponent(target)}`);
}

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="relative isolate flex min-h-dvh flex-1 flex-col overflow-hidden">
      <Suspense fallback={null}>
        <RedirectIfSignedIn searchParams={searchParams} />
      </Suspense>

      {/* Card first in the DOM so it gets focus before the background rocket. */}
      <div className="pointer-events-none relative z-10 flex flex-1 items-start justify-center px-4 pt-[13vh] pb-[calc(clamp(96px,20vh,180px)+120px)] md:items-center md:pt-0 md:pb-[8vh]">
        <div className="pointer-events-auto flex w-full max-w-sm flex-col items-center gap-6 rounded-[14px] border-[3px] border-pen bg-paper-light px-6 py-9 shadow-[6px_6px_0_var(--pen)]">
          <div className="size-16 -rotate-6">
            <PartShape partId="capsule" fit />
          </div>
          <div className="text-center">
            <h1 className="font-display text-4xl font-semibold text-pen">
              Rocket Lab
            </h1>
            <p className="mt-1 font-hand text-2xl text-pen/70">
              build it, launch it, crash it, try again
            </p>
          </div>
          <GoogleSignInButton />
          <p className="text-center text-xs text-pen/55">
            New here? Signing in creates your account.
          </p>
        </div>
      </div>

      <LaunchScene />
    </main>
  );
}
