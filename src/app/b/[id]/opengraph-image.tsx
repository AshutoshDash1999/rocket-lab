import { ImageResponse } from "next/og";
import { blueprintLayout } from "@/components/common/blueprint-preview";
import { partArt } from "@/components/common/part-shape";
import { getBlueprint } from "@/lib/blueprints";

export const alt = "Rocket blueprint";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GRID = [
  "linear-gradient(rgba(255,255,255,0.26) 1.5px, transparent 1.5px)",
  "linear-gradient(90deg, rgba(255,255,255,0.26) 1.5px, transparent 1.5px)",
  "linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
  "linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px)",
].join(",");

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const blueprint = await getBlueprint(id);
  const parts = blueprint?.parts ?? [];
  const layout = parts.length > 0 ? blueprintLayout(parts) : null;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1f57a4",
        backgroundImage: GRID,
        backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
      }}
    >
      {layout ? (
        <svg
          aria-hidden="true"
          width={1100}
          height={570}
          viewBox={`${layout.x} ${layout.y} ${layout.w} ${layout.h}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {layout.ordered.map((p) => (
            <g key={p.uid} transform={`translate(${p.x} ${p.y})`}>
              {partArt(p.partId)}
            </g>
          ))}
        </svg>
      ) : (
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 48 }}>
          Rocket Lab
        </div>
      )}
    </div>,
    size,
  );
}
