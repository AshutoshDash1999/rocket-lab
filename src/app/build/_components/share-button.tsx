"use client";

import { useEffect, useState } from "react";
import { toonButton } from "@/components/common/toon-button";
import { copyShareLink } from "@/lib/share-link";

/** Copies the blueprint's share link and briefly confirms it. */
export function ShareButton({ blueprintId }: { blueprintId: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => setCopied(await copyShareLink(blueprintId))}
      aria-label="Share blueprint: copy link"
      className={`${toonButton} bg-paper-light`}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {copied ? (
          <path d="M5 12.5l4.5 4.5L19 7" />
        ) : (
          <>
            <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
            <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
          </>
        )}
      </svg>
      <span className="hidden sm:inline" aria-live="polite">
        {copied ? "Link copied!" : "Share"}
      </span>
    </button>
  );
}
