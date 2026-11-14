"use client";

import { useEffect, useState } from "react";

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function timeAgo(iso: string, now: number) {
  const secs = (new Date(iso).getTime() - now) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(secs) >= size)
      return rtf.format(Math.round(secs / size), unit);
  }
  return "just now";
}

/** "5 minutes ago", re-ticking every minute. The server render may differ by a tick. */
export function RelativeTime({ iso }: { iso: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  return (
    <time
      dateTime={iso}
      title={new Date(iso).toLocaleString()}
      suppressHydrationWarning
    >
      {timeAgo(iso, now)}
    </time>
  );
}
