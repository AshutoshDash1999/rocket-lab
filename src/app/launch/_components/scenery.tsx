import type { CSSProperties } from "react";

/** Ink-outlined cartoon art for the flight scene. Sizes are drawing px. */

const PEN = "#1b1b29";
const ink = {
  stroke: PEN,
  strokeWidth: 3.5,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

export function Cloud({ variant }: { variant: number }) {
  const puffs = [
    "M20 62 C2 62 2 38 22 38 C22 16 52 10 62 28 C70 6 108 8 110 34 C132 26 150 44 138 62 Z",
    "M18 56 C0 56 4 32 26 34 C30 12 64 12 70 30 C88 16 116 26 112 44 C130 44 132 58 118 58 Z",
    "M24 58 C6 58 8 36 28 38 C36 20 60 22 64 34 C76 22 96 30 94 44 C108 44 110 58 98 58 Z",
  ];
  return (
    <svg aria-hidden="true" viewBox="0 0 150 70" width={150} height={70}>
      <path d={puffs[variant % puffs.length]} fill="#fffdf7" {...ink} />
      <path
        d="M30 52 H96"
        fill="none"
        stroke="#dcd8e8"
        strokeWidth={6}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Pad platform with a lattice tower on the right, base at the bottom edge. */
export function LaunchPad({
  width,
  towerHeight,
}: {
  width: number;
  towerHeight: number;
}) {
  const w = width + 200;
  const h = towerHeight + 30;
  const tx = w - 60;
  const rungs = Math.max(2, Math.floor(towerHeight / 36));
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className="overflow-visible"
    >
      <g {...ink}>
        <rect x={tx} y={8} width={34} height={h - 30} fill="#ff4a3d" />
        <path
          d={Array.from({ length: rungs }, (_, i) => {
            const y = 8 + ((h - 38) / rungs) * i;
            const y2 = 8 + ((h - 38) / rungs) * (i + 1);
            return `M${tx} ${y} L${tx + 34} ${y2} M${tx + 34} ${y} L${tx} ${y2}`;
          }).join(" ")}
          fill="none"
          strokeWidth={2.5}
        />
        <rect x={tx - 6} y={2} width={46} height={10} rx={3} fill="#ffd23f" />
        <rect
          x={10}
          y={h - 26}
          width={w - 20}
          height={20}
          rx={4}
          fill="#a3a9bd"
        />
        <path
          d={`M30 ${h - 16} H${w - 30}`}
          fill="none"
          strokeDasharray="10 12"
          strokeWidth={3}
        />
        <rect x={0} y={h - 8} width={w} height={8} rx={3} fill="#6b7086" />
      </g>
    </svg>
  );
}

/** Striped canopy with shroud lines meeting at the bottom centre. */
export function ParachuteShape() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 190"
      width={240}
      height={190}
      className="overflow-visible"
    >
      <g {...ink}>
        <path
          d="M14 70 L120 186 M66 74 L120 186 M174 74 L120 186 M226 70 L120 186"
          fill="none"
          strokeWidth={2.5}
        />
        <path
          d="M10 72 C10 -16 230 -16 230 72 C210 60 190 60 174 74 C158 60 136 60 120 74 C104 60 82 60 66 74 C50 60 30 60 10 72 Z"
          fill="#fffdf7"
        />
        <path
          d="M66 74 C70 30 94 6 120 4 C102 18 96 44 96 64 C88 60 76 62 66 74 Z"
          fill="#ff4a3d"
        />
        <path
          d="M174 74 C170 30 146 6 120 4 C138 18 144 44 144 64 C152 60 164 62 174 74 Z"
          fill="#ff4a3d"
        />
      </g>
    </svg>
  );
}

/** One round ink-outlined puff, used for smoke, dust and steam. */
export function Puff({
  size,
  tone = "#e9e6f0",
  className = "",
  style,
}: {
  size: number;
  tone?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 60"
      width={size}
      height={size}
      className={`absolute ${className}`}
      style={style}
    >
      <path
        d="M14 46 C2 44 4 26 16 26 C16 10 40 6 44 22 C58 20 60 44 46 46 Z"
        fill={tone}
        {...ink}
        strokeWidth={3}
      />
    </svg>
  );
}

/** Billowing exhaust cloud at the pad while engines burn on (or near) the ground. */
export function PadSmoke({ scale }: { scale: number }) {
  const puffs = [-1.4, -0.9, -0.45, 0, 0.45, 0.9, 1.4];
  return (
    <div aria-hidden className="pointer-events-none absolute">
      {puffs.map((d, i) => (
        <Puff
          key={d}
          size={(70 + (i % 3) * 22) * scale}
          className="rl-billow"
          style={
            {
              left: -40 * scale,
              top: -60 * scale,
              "--dx": `${d * 150 * scale}px`,
              animationDelay: `${i * 140}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** One-shot dust kicked sideways at touchdown. */
export function Dust({ scale }: { scale: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute">
      {[-1, -0.6, 0.6, 1].map((d) => (
        <Puff
          key={d}
          size={60 * scale}
          tone="#e8d9b5"
          className="rl-dust"
          style={
            {
              left: -30 * scale,
              top: -48 * scale,
              "--dx": `${d * 160 * scale}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
