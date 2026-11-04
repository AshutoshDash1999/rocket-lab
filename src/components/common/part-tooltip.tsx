"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PartDef } from "@/lib/rocket/parts";

const GAP = 12;
const MARGIN = 8;

/**
 * Why/when card for a catalog part. Portalled to <body> with fixed positioning
 * so the scrolling sidebar and the card's hover lift can't clip or offset it.
 * Sits to the right of the anchor, or above it when there's no room (mobile).
 */
export function PartTooltip({
  id,
  part,
  summary,
  anchor,
}: {
  id: string;
  part: PartDef;
  summary: string;
  anchor: HTMLElement;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    const tip = ref.current?.getBoundingClientRect();
    if (!tip) return;
    const a = anchor.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const clampY = (y: number) =>
      Math.max(MARGIN, Math.min(y, vh - tip.height - MARGIN));
    const clampX = (x: number) =>
      Math.max(MARGIN, Math.min(x, vw - tip.width - MARGIN));

    if (a.right + GAP + tip.width + MARGIN <= vw) {
      setPos({
        left: a.right + GAP,
        top: clampY(a.top + a.height / 2 - tip.height / 2),
      });
    } else {
      const above = a.top - GAP - tip.height;
      setPos({
        left: clampX(a.left + a.width / 2 - tip.width / 2),
        top: above >= MARGIN ? above : clampY(a.bottom + GAP),
      });
    }
  }, [anchor]);

  return createPortal(
    <div
      ref={ref}
      id={id}
      role="tooltip"
      style={pos ?? { left: 0, top: 0, visibility: "hidden" }}
      className="pointer-events-none fixed z-[60] w-72 max-w-[calc(100vw-16px)] rounded-[8px] border-[2.5px] border-pen bg-paper-light px-3.5 py-3 text-pen shadow-[4px_4px_0_var(--pen)]"
    >
      <p className="font-display text-lg font-semibold leading-tight">
        {part.name}
      </p>
      <dl className="mt-1.5 space-y-1.5 text-sm leading-snug">
        <div>
          <dt className="font-hand text-lg font-bold leading-none">Why</dt>
          <dd className="text-pen/80">{part.role}</dd>
        </div>
        <div>
          <dt className="font-hand text-lg font-bold leading-none">When</dt>
          <dd className="text-pen/80">{part.useWhen}</dd>
        </div>
      </dl>
      <p className="mt-2 border-t-2 border-dashed border-pen/25 pt-1.5 text-xs text-pen/65 tabular-nums">
        {summary}
      </p>
    </div>,
    document.body,
  );
}
