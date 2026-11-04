"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PartTooltip } from "@/components/common/part-tooltip";
import type { PartDef } from "@/lib/rocket/parts";
import { PartShape } from "./part-shape";

const fmt = (n: number) => n.toLocaleString("en-US");

/** Hover dwell before the why/when tooltip appears. */
const TOOLTIP_DELAY = 350;

export function PartCard({
  part,
  dragging,
  onPress,
  onAdd,
}: {
  part: PartDef;
  /** A drag is in progress somewhere: tooltips stay out of the way. */
  dragging: boolean;
  /** Pointer down on the card: may become a drag onto the canvas. */
  onPress: (e: React.PointerEvent<HTMLElement>) => void;
  onAdd: () => void;
}) {
  const tooltipId = useId();
  const cardRef = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState(false);

  const summary = [
    `${fmt(part.dryMass)} kg`,
    part.fuelMass > 0 && `+${fmt(part.fuelMass)} kg fuel`,
    part.thrust > 0 && `${fmt(part.thrust)} kN`,
  ]
    .filter(Boolean)
    .join(" · ");

  const show = (delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };

  // Close on any scroll (the anchor moves) or Escape; clear the timer on unmount.
  useEffect(() => {
    if (!open) return;
    const close = () => {
      clearTimeout(timer.current);
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("scroll", close, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <article
      ref={cardRef}
      aria-describedby={open ? tooltipId : undefined}
      onPointerEnter={(e) => e.pointerType === "mouse" && show(TOOLTIP_DELAY)}
      onPointerLeave={hide}
      onFocus={(e) =>
        e.currentTarget.matches(":has(:focus-visible), :focus-visible") &&
        show(0)
      }
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) hide();
      }}
      onPointerDown={(e) => {
        hide();
        if ((e.target as Element).closest("button")) return;
        // On touch the card scrolls the list; only the thumbnail grabs.
        if (
          e.pointerType !== "mouse" &&
          !(e.target as Element).closest("[data-grip]")
        )
          return;
        onPress(e);
      }}
      className="flex cursor-grab touch-pan-y items-center gap-3 rounded-[8px] border-[2.5px] border-pen bg-paper-light p-2 pr-2.5 shadow-[3px_3px_0_var(--pen)] outline-offset-4 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[4px_5px_0_var(--pen)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div
        data-grip
        className="graph-paper grid size-16 shrink-0 touch-none place-items-center rounded-[4px] border-2 border-pen/80 p-1.5"
      >
        <PartShape partId={part.id} fit />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-display text-lg font-semibold leading-tight text-pen">
          {part.name}
        </h4>
        <p className="mt-0.5 text-sm leading-snug text-pen/70 tabular-nums">
          {summary}
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        aria-label={`Add ${part.name} to rocket`}
        className="grid size-9 shrink-0 place-items-center rounded-full border-[2.5px] border-pen bg-toon-yellow font-display text-2xl leading-none font-semibold text-pen shadow-[2px_2px_0_var(--pen)] transition-[transform,box-shadow] duration-100 hover:-translate-y-px active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        +
      </button>
      {open && !dragging && cardRef.current && (
        <PartTooltip
          id={tooltipId}
          part={part}
          summary={summary}
          anchor={cardRef.current}
        />
      )}
    </article>
  );
}
