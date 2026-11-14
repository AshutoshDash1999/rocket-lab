"use client";

import { useState } from "react";
import { toonButton } from "@/components/common/toon-button";
import { authClient } from "@/lib/auth/client";

export function SignOutButton({ className = "" }: { className?: string }) {
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await authClient.signOut();
        window.location.assign("/");
      }}
      className={`${toonButton} bg-paper-light ${className}`}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
