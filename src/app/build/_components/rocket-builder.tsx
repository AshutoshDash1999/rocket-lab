"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  type Box,
  type Camera,
  fitCamera,
  type PlacedPart,
  type Point,
  SEAM,
  screenToWorld,
  snapPosition,
  stackColumn,
  ZOOM_STEP,
  zoomAt,
} from "@/lib/rocket/canvas";
import type { PartId } from "@/lib/rocket/parts";
import { computeRocketStats } from "@/lib/rocket/stats";
import { BlueprintCanvas, type LaunchPhase } from "./blueprint-canvas";
import { PartShape, partSize } from "@/components/common/part-shape";
import { PartsCatalog } from "./parts-catalog";
import { TopBar } from "./top-bar";

const STARTER: PartId[] = ["capsule", "tank-large", "engine-large", "legs"];

/** Pointer travel (px) before a press turns into a drag, so clicks stay clicks. */
const DRAG_THRESHOLD = 4;

type DragSource =
  | { kind: "catalog"; partId: PartId }
  | { kind: "canvas"; uid: string; partId: PartId };

interface Drag {
  source: DragSource;
  /** Pointer offset inside the part's drawing, world units. */
  grab: Point;
  pointer: Point;
  /** Snapped landing spot in world units, when over the canvas. */
  landing: (Box & { stacked: boolean }) | null;
  overSidebar: boolean;
}

interface Press {
  source: DragSource;
  grab: Point;
  start: Point;
}

interface Pan {
  start: Point;
  from: Camera;
}

/** Keys typed into these shouldn't pan or zoom the canvas. */
const isTextField = (t: EventTarget | null) =>
  t instanceof HTMLElement &&
  (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

const inside = (r: DOMRect | undefined, p: Point) =>
  !!r && p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;

const boxOf = (p: PlacedPart): Box => ({
  x: p.x,
  y: p.y,
  ...partSize(p.partId),
});

export function RocketBuilder() {
  const [parts, setParts] = useState<PlacedPart[]>([]);
  const [launch, setLaunch] = useState<LaunchPhase>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [drag, setDragState] = useState<Drag | null>(null);
  const [camera, setCameraState] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  const [panning, setPanning] = useState<"ready" | "active" | null>(null);

  const canvasRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const partsRef = useRef(parts);
  const dragRef = useRef<Drag | null>(null);
  const pressRef = useRef<Press | null>(null);
  const cameraRef = useRef(camera);
  const panRef = useRef<Pan | null>(null);
  const spaceRef = useRef(false);
  const nextId = useRef(0);

  useEffect(() => {
    partsRef.current = parts;
  }, [parts]);

  const stats = computeRocketStats(parts.map((p) => p.partId));
  const busy = launch !== "idle";

  /** Any edit to the rocket clears the last launch verdict. */
  const edit = (fn: (ps: PlacedPart[]) => PlacedPart[]) => {
    setParts(fn);
    setMessage(null);
  };
  const removePart = (uid: string) =>
    edit((ps) => ps.filter((p) => p.uid !== uid));

  const canvasBounds = () => {
    const r = canvasRef.current?.getBoundingClientRect();
    return r ? { w: r.width, h: r.height } : null;
  };

  /** Camera lives in state for rendering and in a ref for the window handlers. */
  const setCamera = (next: Camera | ((c: Camera) => Camera)) => {
    const c = typeof next === "function" ? next(cameraRef.current) : next;
    cameraRef.current = c;
    setCameraState(c);
  };

  /** Zoom by `factor` around the viewport centre (buttons and keys). */
  const zoomBy = (factor: number) => {
    const b = canvasBounds();
    if (!b) return;
    setCamera((c) => zoomAt(c, { x: b.w / 2, y: b.h / 2 }, c.zoom * factor));
  };
  const zoomReset = () => zoomBy(1 / cameraRef.current.zoom);
  const zoomFit = () => {
    const b = canvasBounds();
    if (b) setCamera(fitCamera(partsRef.current.map(boxOf), b));
  };

  const startPan = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    e.preventDefault();
    pressRef.current = null;
    panRef.current = {
      start: { x: e.clientX, y: e.clientY },
      from: cameraRef.current,
    };
    setPanning("active");
  };

  // Starter rocket, centred and resting near the bottom of the canvas.
  useLayoutEffect(() => {
    const b = canvasBounds();
    if (b) setParts(stackColumn(STARTER, b.w / 2, b.h - 40, partSize));
  }, []);

  // Pointer-driven drag: catalog → canvas adds, canvas → canvas moves,
  // canvas → sidebar removes. No drag-and-drop library needed.
  // biome-ignore lint/correctness/useExhaustiveDependencies: handlers read refs and stable setters; bind once
  useEffect(() => {
    const setDrag = (d: Drag | null) => {
      dragRef.current = d;
      setDragState(d);
    };

    const track = (source: DragSource, grab: Point, pointer: Point): Drag => {
      const canvas = canvasRef.current?.getBoundingClientRect();
      const sidebar = sidebarRef.current?.getBoundingClientRect();
      let landing: Drag["landing"] = null;
      if (canvas && inside(canvas, pointer)) {
        const size = partSize(source.partId);
        const world = screenToWorld(
          { x: pointer.x - canvas.left, y: pointer.y - canvas.top },
          cameraRef.current,
        );
        const raw = { x: world.x - grab.x, y: world.y - grab.y };
        const others = partsRef.current
          .filter((p) => source.kind !== "canvas" || p.uid !== source.uid)
          .map(boxOf);
        landing = { ...snapPosition(raw, size, others), ...size };
      }
      return {
        source,
        grab,
        pointer,
        landing,
        overSidebar: !landing && inside(sidebar, pointer),
      };
    };

    const onMove = (e: PointerEvent) => {
      const pointer = { x: e.clientX, y: e.clientY };
      const pan = panRef.current;
      if (pan) {
        setCamera({
          ...pan.from,
          x: pan.from.x + pointer.x - pan.start.x,
          y: pan.from.y + pointer.y - pan.start.y,
        });
        return;
      }
      const press = pressRef.current;
      if (press) {
        const moved = Math.hypot(
          pointer.x - press.start.x,
          pointer.y - press.start.y,
        );
        if (moved < DRAG_THRESHOLD) return;
        pressRef.current = null;
        setDrag(track(press.source, press.grab, pointer));
        return;
      }
      const d = dragRef.current;
      if (d) setDrag(track(d.source, d.grab, pointer));
    };

    const endPan = () => {
      if (!panRef.current) return false;
      panRef.current = null;
      setPanning(spaceRef.current ? "ready" : null);
      return true;
    };

    const onUp = () => {
      if (endPan()) return;
      pressRef.current = null;
      const d = dragRef.current;
      if (!d) return;
      setDrag(null);
      const { source, landing } = d;
      if (landing) {
        const { x, y } = landing;
        if (source.kind === "catalog") {
          const uid = `part-${nextId.current++}`;
          setParts((ps) => [...ps, { uid, partId: source.partId, x, y }]);
        } else {
          // Re-append so the moved part draws on top.
          setParts((ps) => {
            const item = ps.find((p) => p.uid === source.uid);
            if (!item) return ps;
            return [...ps.filter((p) => p !== item), { ...item, x, y }];
          });
        }
        setMessage(null);
      } else if (d.overSidebar && source.kind === "canvas") {
        setParts((ps) => ps.filter((p) => p.uid !== source.uid));
        setMessage(null);
      }
    };

    const onCancel = () => {
      endPan();
      pressRef.current = null;
      setDrag(null);
    };

    // Space held = hand tool (Figma-style); + / − / 0 / 1 zoom.
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTextField(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === "Space") {
        // Space still activates focused buttons.
        if (e.target instanceof HTMLButtonElement) return;
        e.preventDefault();
        if (!spaceRef.current) {
          spaceRef.current = true;
          if (!panRef.current) setPanning("ready");
        }
        return;
      }
      const keys: Record<string, () => void> = {
        "+": () => zoomBy(ZOOM_STEP),
        "=": () => zoomBy(ZOOM_STEP),
        "-": () => zoomBy(1 / ZOOM_STEP),
        _: () => zoomBy(1 / ZOOM_STEP),
        "0": zoomReset,
        "1": zoomFit,
      };
      if (keys[e.key]) {
        e.preventDefault();
        keys[e.key]();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      spaceRef.current = false;
      if (!panRef.current) setPanning(null);
    };
    const onBlur = () => {
      spaceRef.current = false;
      if (!panRef.current) setPanning(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  // Wheel pans; pinch (ctrl+wheel) or ⌘/ctrl+wheel zooms at the pointer.
  // Non-passive so the page itself never scrolls or browser-zooms.
  // biome-ignore lint/correctness/useExhaustiveDependencies: handlers read refs and stable setters; bind once
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      // Line-mode wheels (Firefox) report in lines, not px.
      const unit = e.deltaMode === 1 ? 16 : 1;
      const dx = e.deltaX * unit;
      const dy = e.deltaY * unit;
      if (e.ctrlKey || e.metaKey) {
        const focus = { x: e.clientX - r.left, y: e.clientY - r.top };
        setCamera((c) => zoomAt(c, focus, c.zoom * Math.exp(-dy * 0.01)));
      } else {
        setCamera((c) => ({ ...c, x: c.x - dx, y: c.y - dy }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const press = (e: React.PointerEvent, source: DragSource, grab: Point) => {
    if (e.button !== 0 || busy) return;
    pressRef.current = { source, grab, start: { x: e.clientX, y: e.clientY } };
  };

  /** + button: hang the part under the lowest part, or centre it in view on an empty canvas. */
  const addPart = (partId: PartId) => {
    const bounds = canvasBounds();
    if (!bounds) return;
    const size = partSize(partId);
    const uid = `part-${nextId.current++}`;
    const centre = screenToWorld(
      { x: bounds.w / 2, y: bounds.h / 2 },
      cameraRef.current,
    );
    edit((ps) => {
      const lowest = ps
        .map(boxOf)
        .reduce<Box | null>(
          (lo, b) => (!lo || b.y + b.h > lo.y + lo.h ? b : lo),
          null,
        );
      const spot = lowest
        ? {
            x: lowest.x + lowest.w / 2 - size.w / 2,
            y: lowest.y + lowest.h - SEAM,
          }
        : { x: centre.x - size.w / 2, y: centre.y - size.h / 2 };
      return [...ps, { uid, partId, ...spot }];
    });
  };

  const nudge = (uid: string, dx: number, dy: number) =>
    edit((ps) =>
      ps.map((p) => (p.uid === uid ? { ...p, x: p.x + dx, y: p.y + dy } : p)),
    );

  const handleLaunch = () => {
    if (stats.twr > 1) {
      setLaunch("flying");
      setMessage("3… 2… 1… liftoff!");
    } else {
      setLaunch("fizzle");
      setMessage(
        stats.thrust === 0
          ? "No engine, no liftoff. Add one to the rocket."
          : `Too heavy! Thrust/weight is ${stats.twr.toFixed(2)}, needs more than 1.`,
      );
    }
  };

  const handleLaunchEnd = () => {
    if (launch === "flying") {
      setLaunch("returning");
      setMessage("Clean flight! Rolled out a fresh one.");
    } else {
      setLaunch("idle");
    }
  };

  return (
    <div
      className={`flex h-dvh flex-col overflow-hidden bg-paper select-none ${drag ? "cursor-grabbing" : ""}`}
    >
      <TopBar
        stats={stats}
        partCount={parts.length}
        busy={busy}
        onLaunch={handleLaunch}
        onClear={() => edit(() => [])}
      />
      <div className="flex min-h-0 flex-1 flex-col-reverse md:grid md:grid-cols-[300px_minmax(0,1fr)]">
        <PartsCatalog
          ref={sidebarRef}
          scrapping={!!drag?.overSidebar && drag.source.kind === "canvas"}
          dragging={!!drag}
          onPress={(e, partId) =>
            press(
              e,
              { kind: "catalog", partId },
              { x: partSize(partId).w / 2, y: partSize(partId).h / 2 },
            )
          }
          onAdd={addPart}
        />
        <BlueprintCanvas
          ref={canvasRef}
          camera={camera}
          panning={panning}
          parts={parts}
          draggingUid={drag?.source.kind === "canvas" ? drag.source.uid : null}
          landing={drag?.landing ?? null}
          launch={launch}
          message={message}
          onLaunchEnd={handleLaunchEnd}
          onPressCanvas={startPan}
          onPressPart={(e, item) => {
            // Hand tool or middle button pans even when starting on a part.
            if (spaceRef.current || e.button === 1) return startPan(e);
            const r = e.currentTarget.getBoundingClientRect();
            const { zoom } = cameraRef.current;
            press(
              e,
              { kind: "canvas", uid: item.uid, partId: item.partId },
              { x: (e.clientX - r.left) / zoom, y: (e.clientY - r.top) / zoom },
            );
          }}
          onNudge={nudge}
          onRemove={removePart}
          onZoomIn={() => zoomBy(ZOOM_STEP)}
          onZoomOut={() => zoomBy(1 / ZOOM_STEP)}
          onZoomReset={zoomReset}
          onZoomFit={zoomFit}
        />
      </div>

      {drag && (
        <div
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-50 origin-top-left opacity-90"
          style={{
            transform: `translate(${drag.pointer.x - drag.grab.x * camera.zoom}px, ${drag.pointer.y - drag.grab.y * camera.zoom}px) scale(${camera.zoom}) rotate(2deg)`,
          }}
        >
          <PartShape partId={drag.source.partId} />
        </div>
      )}
    </div>
  );
}
