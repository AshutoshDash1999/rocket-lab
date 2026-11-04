import type { ReactNode } from "react";
import type { PartId } from "@/lib/rocket/parts";

/**
 * Cartoon part drawings: deep ink outlines over flat fills. Every part is drawn
 * on a 160-unit-wide canvas with the rocket body spanning x 22–138, so parts
 * line up when stacked.
 */

const PEN = "#1b1b29";
const C = {
  white: "#fffdf7",
  shade: "#dcd8e8",
  red: "#ff4a3d",
  blue: "#2f7cf6",
  blueDark: "#1c4fb8",
  glass: "#c4e8ff",
  yellow: "#ffd23f",
  gray: "#a3a9bd",
  orange: "#ff8a1f",
  steel: "#c9ced9",
};
const WIDTH = 160;

interface Art {
  height: number;
  body: ReactNode;
}

const ART: Record<PartId | "flame", Art> = {
  capsule: {
    height: 112,
    body: (
      <>
        <path
          d="M22 109 C22 62 48 24 80 5 C112 24 138 62 138 109 Z"
          fill={C.white}
        />
        <path
          d="M32 105 C32 72 46 46 62 28 C52 48 46 74 47 105 Z"
          fill={C.shade}
          stroke="none"
        />
        <path
          d="M80 5 C95 14 108 28 118 44 C106 39.5 93 37.5 80 37.5 C67 37.5 54 39.5 42 44 C52 28 65 14 80 5 Z"
          fill={C.red}
        />
        <path
          d="M70 16 C64 21 59 27 55 33"
          stroke={C.white}
          strokeWidth={3}
          fill="none"
        />
        <circle cx="80" cy="76" r="20" fill={C.blue} />
        <circle cx="80" cy="76" r="12.5" fill={C.glass} />
        <path
          d="M73 75 L81 67 M76 83 L88 71"
          stroke={C.white}
          strokeWidth={3}
          fill="none"
        />
      </>
    ),
  },
  "tank-small": {
    height: 66,
    body: (
      <>
        <rect x="22" y="3" width="116" height="60" rx="5" fill={C.white} />
        <rect
          x="30"
          y="9"
          width="11"
          height="48"
          rx="5"
          fill={C.shade}
          stroke="none"
        />
        <rect
          x="23.75"
          y="24"
          width="112.5"
          height="18"
          fill={C.red}
          stroke="none"
        />
        <path d="M22 24 H138 M22 42 H138" fill="none" />
        {[52, 80, 108].map((x) => (
          <g key={x} fill={PEN} stroke="none">
            <circle cx={x} cy="13" r="2.2" />
            <circle cx={x} cy="53" r="2.2" />
          </g>
        ))}
      </>
    ),
  },
  "tank-large": {
    height: 134,
    body: (
      <>
        <rect x="22" y="3" width="116" height="128" rx="6" fill={C.white} />
        <rect
          x="30"
          y="10"
          width="11"
          height="114"
          rx="5"
          fill={C.shade}
          stroke="none"
        />
        <rect
          x="23.75"
          y="16"
          width="112.5"
          height="14"
          fill={C.yellow}
          stroke="none"
        />
        <rect
          x="23.75"
          y="104"
          width="112.5"
          height="14"
          fill={C.yellow}
          stroke="none"
        />
        <path
          d="M22 16 H138 M22 30 H138 M22 104 H138 M22 118 H138"
          fill="none"
        />
        {/* fuel gauge window */}
        <rect x="60" y="44" width="40" height="46" rx="6" fill={C.glass} />
        <path
          d="M62 68 q4.5 -4 9 0 t9 0 t9 0 t9 0 V86 a3 3 0 0 1 -3 3 H65 a3 3 0 0 1 -3 -3 Z"
          fill={C.blue}
          stroke="none"
        />
        <path
          d="M62 68 q4.5 -4 9 0 t9 0 t9 0 t9 0"
          fill="none"
          strokeWidth={2.5}
        />
        <rect x="60" y="44" width="40" height="46" rx="6" fill="none" />
        <path d="M67 51 L73 47" stroke={C.white} strokeWidth={3} fill="none" />
      </>
    ),
  },
  "engine-small": {
    height: 54,
    body: (
      <>
        <rect x="54" y="3" width="52" height="12" rx="2" fill={C.gray} />
        <path d="M60 15 H100 L116 46 H44 Z" fill={C.blue} />
        <path d="M65 21 L56 40" stroke={C.glass} strokeWidth={3} fill="none" />
        <rect x="38" y="44" width="84" height="8" rx="4" fill={C.blueDark} />
      </>
    ),
  },
  "engine-large": {
    height: 70,
    body: (
      <>
        <rect x="42" y="3" width="76" height="14" rx="3" fill={C.gray} />
        <path
          d="M50 17 H110 C113 36 122 52 136 62 H24 C38 52 47 36 50 17 Z"
          fill={C.blue}
        />
        <path
          d="M58 24 C56 37 51 48 42 56"
          stroke={C.glass}
          strokeWidth={3}
          fill="none"
        />
        <rect x="18" y="59" width="124" height="9" rx="4.5" fill={C.blueDark} />
      </>
    ),
  },
  decoupler: {
    height: 22,
    body: (
      <>
        <rect x="18" y="3" width="124" height="16" rx="3" fill={C.yellow} />
        {[24, 44, 64, 84, 104, 124].map((x) => (
          <path
            key={x}
            d={`M${x} 17.25 h8 l10 -12.5 h-8 Z`}
            fill={PEN}
            stroke="none"
          />
        ))}
        <rect x="18" y="3" width="124" height="16" rx="3" fill="none" />
      </>
    ),
  },
  fins: {
    height: 74,
    body: (
      <>
        <path d="M22 12 C8 24 3 46 4 72 L22 62 Z" fill={C.red} />
        <path d="M138 12 C152 24 157 46 156 72 L138 62 Z" fill={C.red} />
        <rect x="22" y="3" width="116" height="68" fill={C.white} />
        <rect
          x="30"
          y="6"
          width="11"
          height="62"
          rx="5"
          fill={C.shade}
          stroke="none"
        />
        <rect x="71" y="16" width="18" height="56" rx="9" fill={C.red} />
        <path d="M76 23 V42" stroke={C.white} strokeWidth={3} fill="none" />
      </>
    ),
  },
  legs: {
    height: 62,
    body: (
      <>
        <path d="M40 30 H120" fill="none" />
        <rect x="40" y="3" width="80" height="9" rx="3" fill={C.gray} />
        <path d="M46 10 L56 10 L32 50 L22 50 Z" fill={C.red} />
        <path d="M114 10 L104 10 L128 50 L138 50 Z" fill={C.red} />
        <rect x="10" y="50" width="38" height="9" rx="4.5" fill={C.gray} />
        <rect x="112" y="50" width="38" height="9" rx="4.5" fill={C.gray} />
      </>
    ),
  },
  /**
   * Chute canister on the capsule's apex. Its collar hangs below the box and
   * follows the capsule's cone (the capsule curve, shifted by height − SEAM),
   * so it must draw above the part beneath it: see `overlapsBelow`.
   */
  parachute: {
    height: 28,
    body: (
      <>
        <path
          d="M65 39 H95 C99 43 103 47 106.6 51 Q80 56.5 53.4 51 C57 47 61 43 65 39 Z"
          fill={C.gray}
        />
        <path
          d="M64 40 V24 C64 13 71 7 80 7 C89 7 96 13 96 24 V40 Z"
          fill={C.red}
        />
        <path
          d="M80 7 C76 12 75 20 75 40 H85 C85 20 84 12 80 7 Z"
          fill={C.white}
        />
        <rect x="72" y="2" width="16" height="6" rx="3" fill={C.gray} />
        <g stroke="none" fill={PEN}>
          <circle cx="68" cy="47" r="1.8" />
          <circle cx="80" cy="48.5" r="1.8" />
          <circle cx="92" cy="47" r="1.8" />
        </g>
      </>
    ),
  },
  "nose-cone": {
    height: 140,
    body: (
      <>
        <path
          d="M22 137 C22 80 56 30 80 4 C104 30 138 80 138 137 Z"
          fill={C.white}
        />
        <path
          d="M32 133 C32 98 42 72 56 50 C50 74 46 100 47 133 Z"
          fill={C.shade}
          stroke="none"
        />
        <path
          d="M80 4 C92 18 104 32 111 46 C101 43 91 42 80 42 C69 42 59 43 49 46 C56 32 68 18 80 4 Z"
          fill={C.red}
        />
        <path
          d="M74 16 C69 23 65 30 62 37"
          stroke={C.white}
          strokeWidth={3}
          fill="none"
        />
        <rect
          x="23.75"
          y="108"
          width="112.5"
          height="10"
          fill={C.red}
          stroke="none"
        />
        <path d="M22.6 108 H137.4 M22.3 118 H137.7" fill="none" />
      </>
    ),
  },
  fairing: {
    height: 150,
    body: (
      <>
        <path
          d="M22 147 V70 C22 32 48 6 80 4 C112 6 138 32 138 70 V147 Z"
          fill={C.white}
        />
        <path
          d="M32 128 V72 C32 46 44 26 60 15 C50 31 44 50 44 72 V128 Z"
          fill={C.shade}
          stroke="none"
        />
        <rect
          x="23.75"
          y="88"
          width="112.5"
          height="12"
          fill={C.blue}
          stroke="none"
        />
        <path d="M22 88 H138 M22 100 H138" fill="none" />
        <path
          d="M80 9 V130"
          strokeWidth={2.5}
          strokeDasharray="8 7"
          fill="none"
        />
        <rect x="22" y="130" width="116" height="17" rx="2" fill={C.gray} />
      </>
    ),
  },
  "escape-tower": {
    height: 110,
    body: (
      <>
        <path d="M68 40 L62 50 H72 Z M92 40 L98 50 H88 Z" fill={C.gray} />
        <path
          d="M70 40 V18 C70 10 75 5 80 3 C85 5 90 10 90 18 V40 Z"
          fill={C.red}
        />
        <path d="M75 14 V30" stroke={C.white} strokeWidth={2.5} fill="none" />
        <path
          d="M66 48 H94 L114 98 H46 Z M66 48 L104 73 M94 48 L56 73 M56 73 H104 M56 73 L114 98 M104 73 L46 98"
          strokeWidth={2.5}
          fill="none"
        />
        <rect x="62" y="38" width="36" height="10" rx="2" fill={C.gray} />
        <rect x="40" y="96" width="80" height="11" rx="3" fill={C.gray} />
      </>
    ),
  },
  "tank-jumbo": {
    height: 200,
    body: (
      <>
        <rect x="22" y="3" width="116" height="194" rx="6" fill={C.white} />
        <rect
          x="30"
          y="10"
          width="11"
          height="180"
          rx="5"
          fill={C.shade}
          stroke="none"
        />
        <rect
          x="23.75"
          y="16"
          width="112.5"
          height="14"
          fill={C.orange}
          stroke="none"
        />
        <rect
          x="23.75"
          y="170"
          width="112.5"
          height="14"
          fill={C.orange}
          stroke="none"
        />
        <path
          d="M22 16 H138 M22 30 H138 M22 170 H138 M22 184 H138"
          fill="none"
        />
        {[52, 80, 108].map((x) => (
          <g key={x} fill={PEN} stroke="none">
            <circle cx={x} cy="42" r="2.2" />
            <circle cx={x} cy="158" r="2.2" />
          </g>
        ))}
        <rect x="58" y="62" width="44" height="76" rx="6" fill={C.glass} />
        <path
          d="M60 94 q5 -4 10 0 t10 0 t10 0 t10 0 V133 a3 3 0 0 1 -3 3 H63 a3 3 0 0 1 -3 -3 Z"
          fill={C.blue}
          stroke="none"
        />
        <path
          d="M60 94 q5 -4 10 0 t10 0 t10 0 t10 0"
          fill="none"
          strokeWidth={2.5}
        />
        <rect x="58" y="62" width="44" height="76" rx="6" fill="none" />
        <path d="M65 71 L72 66" stroke={C.white} strokeWidth={3} fill="none" />
      </>
    ),
  },
  "engine-heavy": {
    height: 80,
    body: (
      <>
        {[44, 116, 80].map((cx) => (
          <g key={cx}>
            <path
              d={`M${cx - 10} 18 H${cx + 10} L${cx + 16} 66 H${cx - 16} Z`}
              fill={C.blue}
            />
            <path
              d={`M${cx - 5} 24 L${cx - 9} 58`}
              stroke={C.glass}
              strokeWidth={3}
              fill="none"
            />
            <rect
              x={cx - 18}
              y="64"
              width="36"
              height="9"
              rx="4.5"
              fill={C.blueDark}
            />
          </g>
        ))}
        <rect x="22" y="3" width="116" height="15" rx="3" fill={C.gray} />
      </>
    ),
  },
  srb: {
    height: 170,
    body: (
      <>
        <path d="M62 149 H98 L108 167 H52 Z" fill={C.gray} />
        <rect x="34" y="3" width="92" height="146" rx="4" fill={C.white} />
        <rect
          x="41"
          y="38"
          width="10"
          height="104"
          rx="5"
          fill={C.shade}
          stroke="none"
        />
        {Array.from({ length: 8 }, (_, i) => (
          <rect
            key={i}
            x={35.75 + i * 11.06}
            y={i % 2 === 0 ? 18 : 26}
            width="11.06"
            height="8"
            fill={PEN}
            stroke="none"
          />
        ))}
        <path
          d="M34 18 H126 M34 34 H126 M34 72 H126 M34 108 H126"
          fill="none"
        />
        {[58, 80, 102].map((x) => (
          <circle key={x} cx={x} cy="90" r="2.2" fill={PEN} stroke="none" />
        ))}
      </>
    ),
  },
  interstage: {
    height: 40,
    body: (
      <>
        <rect x="22" y="3" width="116" height="34" rx="2" fill={C.steel} />
        <path
          d={[34, 46, 58, 70, 82, 94, 106, 118, 130]
            .map((x) => `M${x - 2} 10 V30`)
            .join(" ")}
          strokeWidth={2.5}
          fill="none"
        />
        <path d="M22 10 H138 M22 30 H138" strokeWidth={2.5} fill="none" />
      </>
    ),
  },
  flame: {
    height: 100,
    body: (
      <>
        <path
          d="M50 2 C44 36 62 62 80 98 C98 62 116 36 110 2 Z"
          fill={C.orange}
        />
        <path
          d="M62 2 C60 26 70 44 80 68 C90 44 100 26 98 2 Z"
          fill={C.yellow}
        />
        <path d="M72 2 C72 16 76 26 80 38 C84 26 88 16 88 2 Z" fill={C.white} />
      </>
    ),
  },
};

function Drawing({ art, fit }: { art: Art; fit: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${WIDTH} ${art.height}`}
      width={fit ? undefined : WIDTH}
      height={fit ? undefined : art.height}
      className={
        fit ? "h-full w-full overflow-visible" : "block overflow-visible"
      }
    >
      <g
        stroke={PEN}
        strokeWidth={3.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {art.body}
      </g>
    </svg>
  );
}

/** A part at stack size (160px wide), or scaled to its box with `fit`. */
export function PartShape({
  partId,
  fit = false,
}: {
  partId: PartId;
  fit?: boolean;
}) {
  return <Drawing art={ART[partId]} fit={fit} />;
}

export function FlameShape() {
  return <Drawing art={ART.flame} fit={false} />;
}

export const PART_WIDTH = WIDTH;

/** Parts whose art wraps over the top of the part below, so they draw above it. */
export const overlapsBelow = (partId: PartId) => partId === "parachute";

/** Where a deployed canopy's lines meet the parachute part, px from its top. */
export const CHUTE_ANCHOR_Y = 3;

/** Drawn size of a part on the canvas, px. */
export const partSize = (partId: PartId) => ({
  w: WIDTH,
  h: ART[partId].height,
});
