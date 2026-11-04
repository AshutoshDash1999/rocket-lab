import type { CSSProperties } from "react";
import { Puff } from "./scenery";

/** Spiky star polygon, `n` points between radii r1 (outer) and r2 (inner). */
function star(n: number, r1: number, r2: number, cx: number, cy: number) {
  return Array.from({ length: n * 2 }, (_, i) => {
    const r = i % 2 ? r2 : r1 * (0.86 + ((i * 37) % 10) / 70);
    const a = (Math.PI * i) / n - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

/**
 * Cartoon explosion at the impact point: a "KABOOM!" burst that pops in,
 * smoke puffs rising behind it. Positioned by its bottom-centre.
 */
export function CrashBurst({ scale }: { scale: number }) {
  const size = Math.max(180, 420 * scale);
  return (
    <div aria-hidden className="pointer-events-none absolute">
      {[-1.1, -0.55, 0, 0.55, 1.1].map((d, i) => (
        <Puff
          key={d}
          size={size * 0.4}
          tone="#bcb8c6"
          className="rl-smoke"
          style={
            {
              left: d * size * 0.35 - size * 0.2,
              top: -size * 0.5,
              "--dx": `${d * 40}px`,
              animationDelay: `${180 + i * 90}ms`,
            } as CSSProperties
          }
        />
      ))}
      <svg
        aria-hidden="true"
        viewBox="0 0 300 260"
        width={size}
        height={size * 0.87}
        className="rl-burst absolute"
        style={{ left: -size / 2, top: -size * 0.8 }}
      >
        <g stroke="#1b1b29" strokeWidth={5} strokeLinejoin="round">
          <polygon points={star(14, 140, 88, 150, 130)} fill="#ff4a3d" />
          <polygon points={star(12, 104, 66, 150, 132)} fill="#ffd23f" />
        </g>
        <text
          x="150"
          y="148"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize="50"
          fontWeight="700"
          fill="#fffdf7"
          stroke="#1b1b29"
          strokeWidth={9}
          paintOrder="stroke"
          transform="rotate(-8 150 140)"
        >
          KABOOM!
        </text>
      </svg>
    </div>
  );
}
