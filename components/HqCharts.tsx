"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Vehicle } from "@/lib/types";
import { getAvgDwellByStage, getPipelineFunnel } from "@/lib/selectors";

const ROLE_HUE = "var(--role-hue)";
const AMBER = "#D97706";
const GRID = "#e2e4e9";
const TICK = { fontSize: 11, fill: "#5b6472" };
const TOOLTIP_STYLE = { fontSize: 12, borderRadius: 8, borderColor: GRID };

export default function HqCharts({ vehicles }: { vehicles: Vehicle[] }) {
  const funnel = getPipelineFunnel(vehicles);
  const dwell = getAvgDwellByStage(vehicles);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Funnel by Stage
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={TICK} />
              <YAxis type="category" dataKey="label" width={112} tick={TICK} />
              <Tooltip cursor={{ fill: "rgba(11,36,71,0.06)" }} contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" name="Vehicles" fill={ROLE_HUE} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Avg Time on Each Leg (hours)
        </h3>
        <div className="h-56">
          {dwell.length === 0 ? (
            <p className="flex h-full items-center justify-center text-center text-xs text-ink-muted">
              Nothing has moved through a full leg yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dwell} margin={{ top: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="leg" tick={{ ...TICK, fontSize: 10 }} interval={0} angle={-12} dy={6} />
                <YAxis allowDecimals={false} tick={TICK} />
                <Tooltip cursor={{ fill: "rgba(217,119,6,0.08)" }} contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="avgHours" name="Avg hours" fill={AMBER} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
