import type { ReactNode } from "react";

/** Small caps label used on every readout. */
export const LABEL =
  "text-[11px] font-extrabold uppercase tracking-[0.08em] text-pen/60";

/** Flat paper card: ink outline, hard offset shadow, no tilt. */
export const CARD =
  "rounded-[8px] border-[3px] border-pen bg-paper-light shadow-[3px_3px_0_var(--pen)]";

/** A titled readout card. */
export function Card({
  title,
  meta,
  className = "",
  children,
}: {
  title: string;
  meta?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className={`${CARD} p-3 ${className}`}>
      <header className="flex items-center justify-between gap-2">
        <h2 className={LABEL}>{title}</h2>
        {meta && <span className={LABEL}>{meta}</span>}
      </header>
      {children}
    </section>
  );
}

/** Big number with a small unit. */
export function Big({
  value,
  unit,
  tone = "text-pen",
}: {
  value: string;
  unit?: string;
  tone?: string;
}) {
  return (
    <p
      className={`font-display text-3xl font-semibold leading-tight tabular-nums ${tone}`}
    >
      {value}
      {unit && (
        <span className="ml-1 font-sans text-sm font-bold text-pen/60">
          {unit}
        </span>
      )}
    </p>
  );
}

/** Label / value line inside a <dl>. */
export function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <dt className={LABEL}>{label}</dt>
      <dd className="font-display text-base font-semibold text-pen tabular-nums">
        {children}
      </dd>
    </div>
  );
}
