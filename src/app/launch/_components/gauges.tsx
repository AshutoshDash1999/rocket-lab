import { SPACE_ALT } from "@/lib/rocket/flight";

/** Hand-drawn gauges: ink outlines, flat fills, matching the part drawings. */

const PEN = "#1b1b29";
const ink = {
  stroke: PEN,
  strokeWidth: 3,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

/** Fuel tank that drains; turns red and wobbles when nearly empty. */
export function FuelTank({ fraction }: { fraction: number }) {
  const f = Math.min(1, Math.max(0, fraction));
  const low = f < 0.15;
  const inner = { x: 10, y: 12, w: 40, h: 76 };
  const level = inner.h * f;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 100"
      width={42}
      height={70}
      className={low && f > 0 ? "rl-wobble" : ""}
    >
      <g {...ink}>
        <rect x="6" y="8" width="48" height="84" rx="9" fill="#fffdf7" />
        <rect x="22" y="2" width="16" height="8" rx="2" fill="#a3a9bd" />
      </g>
      <clipPath id="fuel-clip">
        <rect {...inner} width={inner.w} height={inner.h} rx="6" />
      </clipPath>
      <rect
        x={inner.x}
        y={inner.y + inner.h - level}
        width={inner.w}
        height={level}
        clipPath="url(#fuel-clip)"
        fill={low ? "#ff4a3d" : "#ffd23f"}
        className="transition-[y,height] duration-200"
      />
      <rect
        x="15"
        y="16"
        width="6"
        height="66"
        rx="3"
        fill="#fff"
        opacity={0.6}
      />
      <path
        d="M40 31 H50 M40 50 H50 M40 69 H50"
        stroke={PEN}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <rect x="6" y="8" width="48" height="84" rx="9" fill="none" {...ink} />
    </svg>
  );
}

/** Speedometer-style dial for engine power, 0–100 %. */
export function PowerDial({ power, lit }: { power: number; lit: boolean }) {
  const p = Math.min(1, Math.max(0, power));
  const angle = -90 + p * 180;
  const ticks = Array.from({ length: 11 }, (_, i) => -90 + i * 18);
  return (
    <svg aria-hidden="true" viewBox="0 0 120 72" width={84} height={50}>
      <g {...ink}>
        <path d="M8 64 A52 52 0 0 1 112 64 Z" fill="#fffdf7" />
      </g>
      {/* Red zone: the top 20 % of power. */}
      <path
        d="M102.1 33.4 A52 52 0 0 1 112 64 L96 64 A36 36 0 0 0 89.1 42.8 Z"
        fill="#ff4a3d"
      />
      <path d="M8 64 A52 52 0 0 1 112 64 Z" fill="none" {...ink} />
      {ticks.map((a) => (
        <line
          key={a}
          x1="60"
          y1="18"
          x2="60"
          y2={a % 90 === 0 ? 26 : 23}
          stroke={PEN}
          strokeWidth={2.5}
          strokeLinecap="round"
          transform={`rotate(${a} 60 64)`}
        />
      ))}
      <g
        style={{
          transform: `rotate(${angle}deg)`,
          transformOrigin: "60px 64px",
        }}
        className="transition-transform duration-150 motion-reduce:transition-none"
      >
        <path
          d="M57 64 L60 20 L63 64 Z"
          fill={PEN}
          stroke={PEN}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </g>
      <circle
        cx="60"
        cy="64"
        r="7"
        fill={lit ? "#ffd23f" : "#a3a9bd"}
        {...ink}
      />
    </svg>
  );
}

/** Log-scale altitude strip from the ground to space, with current and max markers. */
export function AltitudeMeter({
  alt,
  maxAlt,
}: {
  alt: number;
  maxAlt: number;
}) {
  const top = 10;
  const bottom = 150;
  const y = (a: number) =>
    bottom -
    (Math.log10(1 + Math.max(0, a)) / Math.log10(1 + SPACE_ALT)) *
      (bottom - top);
  const marks = [
    { a: 0, label: "0" },
    { a: 100, label: "100 m" },
    { a: 1_000, label: "1 km" },
    { a: 10_000, label: "10 km" },
    { a: SPACE_ALT, label: "space" },
  ];
  return (
    <svg aria-hidden="true" viewBox="0 0 92 160" width={74} height={128}>
      <g {...ink}>
        <rect
          x="8"
          y={top - 4}
          width="18"
          height={bottom - top + 8}
          rx="9"
          fill="#c4e8ff"
        />
        <rect x="8" y={top - 4} width="18" height="22" rx="9" fill="#23356f" />
      </g>
      {marks.map((m) => (
        <g key={m.a}>
          <line
            x1="26"
            x2="34"
            y1={y(m.a)}
            y2={y(m.a)}
            stroke={PEN}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <text
            x="38"
            y={y(m.a) + 5}
            fontFamily="var(--font-hand)"
            fontSize="16"
            fontWeight="700"
            fill={PEN}
          >
            {m.label}
          </text>
        </g>
      ))}
      <line
        x1="4"
        x2="30"
        y1={y(maxAlt)}
        y2={y(maxAlt)}
        stroke="#ff4a3d"
        strokeWidth={3}
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      <path
        d={`M2 ${y(alt) - 7} L14 ${y(alt)} L2 ${y(alt) + 7} Z`}
        fill="#ffd23f"
        {...ink}
        strokeWidth={2.5}
      />
    </svg>
  );
}

/** Dial with a tiny rocket pointing where the nose points. */
export function Compass({ heading }: { heading: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" width={52} height={52}>
      <circle cx="32" cy="32" r="28" fill="#fffdf7" {...ink} />
      {[0, 90, 180, 270].map((a) => (
        <line
          key={a}
          x1="32"
          y1="6"
          x2="32"
          y2="11"
          stroke={PEN}
          strokeWidth={2.5}
          strokeLinecap="round"
          transform={`rotate(${a} 32 32)`}
        />
      ))}
      <g transform={`rotate(${(heading * 180) / Math.PI} 32 32)`}>
        <path
          d="M32 12 C38 18 39 30 38 42 H26 C25 30 26 18 32 12 Z"
          fill="#fffdf7"
          {...ink}
          strokeWidth={2.5}
        />
        <path
          d="M32 12 C35 15 36.5 18 37 21 H27 C27.5 18 29 15 32 12 Z"
          fill="#ff4a3d"
          stroke="none"
        />
        <path
          d="M26 36 L21 46 L26 44 Z M38 36 L43 46 L38 44 Z"
          fill="#ff4a3d"
          {...ink}
          strokeWidth={2}
        />
        <circle
          cx="32"
          cy="28"
          r="3.5"
          fill="#2f7cf6"
          {...ink}
          strokeWidth={2}
        />
      </g>
    </svg>
  );
}

/** Compressed-air bottle for the steering jets, with a pressure needle. */
export function AirTank({ fraction }: { fraction: number }) {
  const f = Math.min(1, Math.max(0, fraction));
  const low = f < 0.15;
  // Needle sweeps from empty (left) to full (right) over the top of the dial.
  const angle = -120 + f * 240;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 44 64"
      width={30}
      height={44}
      className={low && f > 0 ? "rl-wobble" : ""}
    >
      <g {...ink}>
        <rect x="8" y="22" width="28" height="38" rx="12" fill="#c4e8ff" />
        <rect x="18" y="16" width="8" height="7" rx="2" fill="#a3a9bd" />
        <circle cx="22" cy="12" r="10" fill="#fffdf7" />
      </g>
      <path
        d="M14.9 19.1 A10 10 0 0 1 12 12"
        stroke="#ff4a3d"
        strokeWidth={3}
        fill="none"
      />
      <line
        x1="22"
        y1="12"
        x2="22"
        y2="5"
        stroke={PEN}
        strokeWidth={2.5}
        strokeLinecap="round"
        transform={`rotate(${angle} 22 12)`}
        className="transition-transform duration-150 motion-reduce:transition-none"
      />
      <circle cx="22" cy="12" r="2" fill={PEN} />
      <rect
        x="12"
        y={58 - 30 * f}
        width="20"
        height={30 * f}
        rx="6"
        fill={low ? "#ff4a3d" : "#2f7cf6"}
        opacity={0.55}
      />
      <circle cx="22" cy="12" r="10" fill="none" {...ink} />
    </svg>
  );
}

/** Air-pressure bar: fills toward the airframe's limit, red past the warning line. */
export function PressureBar({
  q,
  limit,
  warn,
}: {
  q: number;
  limit: number;
  /** Warning line as a fraction of the limit. */
  warn: number;
}) {
  const f = Math.min(1, Math.max(0, q / limit));
  const x0 = 4;
  const w = 112;
  return (
    <svg aria-hidden="true" viewBox="0 0 120 20" width="100%" height={18}>
      <rect x={x0} y="4" width={w} height="12" rx="6" fill="#fffdf7" />
      <rect
        x={x0 + w * warn}
        y="4"
        width={w * (1 - warn)}
        height="12"
        fill="#ffb3a8"
      />
      <rect
        x={x0}
        y="4"
        width={w * f}
        height="12"
        rx="6"
        fill={f >= warn ? "#ff4a3d" : "#ffd23f"}
      />
      <rect x={x0} y="4" width={w} height="12" rx="6" fill="none" {...ink} />
      <line
        x1={x0 + w * warn}
        x2={x0 + w * warn}
        y1="2"
        y2="18"
        stroke={PEN}
        strokeWidth={2}
        strokeDasharray="3 2"
      />
    </svg>
  );
}
