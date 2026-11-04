"use client";

import { massOf, twrOf } from "@/lib/rocket/flight";
import { G0 } from "@/lib/rocket/stats";
import { useFlightStore } from "@/lib/rocket/store/flight-store";
import { layerAt } from "./atmosphere";
import { fmtAlt, fmtDeg, fmtInt, fmtOne } from "./format";
import { AltitudeMeter, Compass, FuelTank } from "./gauges";
import { Big, Card, LABEL, Row } from "./panel";

/** Altitude now, best so far, and a log strip from ground to space. */
export function AltitudePanel({ className = "" }: { className?: string }) {
  const s = useFlightStore((st) => st.state);
  const alt = fmtAlt(s.alt);
  const maxAlt = fmtAlt(s.maxAlt);
  return (
    <Card title="Altitude" className={className}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <Big value={alt.value} unit={alt.unit} />
          <p className="font-hand text-xl leading-none text-toon-red">
            max {maxAlt.value} {maxAlt.unit}
          </p>
          <p className="mt-1 font-display text-sm font-semibold text-pen/70">
            {layerAt(s.alt).name}
          </p>
        </div>
        <AltitudeMeter alt={s.alt} maxAlt={s.maxAlt} />
      </div>
    </Card>
  );
}

/** Speed, vertical rate, acceleration and heading. */
export function MotionPanel({ className = "" }: { className?: string }) {
  const s = useFlightStore((st) => st.state);
  const speed = Math.hypot(s.vx, s.vy);
  const accel = Math.hypot(s.ax, s.ay);
  return (
    <Card title="Velocity" className={className}>
      <Big value={fmtInt(speed)} unit="m/s" />
      <p className="font-hand text-lg leading-none text-pen/70">
        {s.vy >= 0 ? "↑" : "↓"} {fmtInt(Math.abs(s.vy))} up/down
      </p>
      <dl className="mt-2 border-t-2 border-dashed border-pen/20 pt-2">
        <Row label="Acceleration">{fmtOne(accel)} m/s²</Row>
        <Row label="G-force">{fmtOne(accel / G0)} g</Row>
      </dl>
      <div className="mt-2 flex items-center justify-between border-t-2 border-dashed border-pen/20 pt-2">
        <div>
          <p className={LABEL}>Heading</p>
          <p className="font-display text-xl font-semibold text-pen tabular-nums">
            {fmtDeg(s.heading)}
          </p>
        </div>
        <Compass heading={s.heading} />
      </div>
    </Card>
  );
}

/** Fuel, mass and the go / no-go thrust check. */
export function VehiclePanel({ className = "" }: { className?: string }) {
  const cfg = useFlightStore((st) => st.cfg);
  const s = useFlightStore((st) => st.state);
  const fuelFrac = cfg.fuelMass > 0 ? s.fuel / cfg.fuelMass : 0;
  const twr = twrOf(cfg, s);
  const twrBadge =
    cfg.thrust === 0
      ? { text: "No engine", className: "bg-paper-light" }
      : twr > 1
        ? { text: `Go · ${twr.toFixed(2)}`, className: "bg-toon-green" }
        : { text: `No go · ${twr.toFixed(2)}`, className: "bg-[#ffb3a8]" };

  return (
    <Card title="Fuel left" className={className}>
      <div className="mt-1 flex items-center gap-3">
        <FuelTank fraction={fuelFrac} />
        <div>
          <Big value={fmtInt(s.fuel)} unit="kg" />
          <p
            className={`font-hand text-xl leading-none ${
              fuelFrac < 0.15 ? "text-toon-red" : "text-pen/70"
            }`}
          >
            {cfg.fuelMass > 0 ? `${fmtInt(fuelFrac * 100)}% left` : "no tanks!"}
          </p>
        </div>
      </div>
      <dl className="mt-2 border-t-2 border-dashed border-pen/20 pt-2">
        <Row label="Mass">{fmtInt(massOf(cfg, s))} kg</Row>
        <Row label="Thrust / weight">
          <span
            className={`inline-block rounded-[6px] border-2 border-pen px-2 text-sm ${twrBadge.className}`}
          >
            {twrBadge.text}
          </span>
        </Row>
      </dl>
    </Card>
  );
}
