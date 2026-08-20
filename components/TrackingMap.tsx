"use client";

import type { Trip } from "@/lib/types";

/**
 * India, drawn as a coarse polygon of real coastline/border points projected
 * equirectangularly (x = lon, y = lat) into the map viewBox — the same
 * projection the city anchors and route paths use, so everything lines up.
 * No tiles, no network.
 */
const INDIA_OUTLINE =
  "M119,63 L161,81 L188,98 L196,123 L217,154 L259,176 L315,187 L329,201 L339,210 " +
  "L371,193 L406,192 L427,166 L447,183 L434,197 L416,206 L406,228 L391,243 L379,270 " +
  "L357,273 L329,274 L301,277 L273,301 L235,340 L207,357 L206,389 L200,434 L178,453 " +
  "L168,465 L154,445 L143,411 L130,383 L112,354 L104,311 L99,277 L94,264 L57,266 " +
  "L48,246 L63,236 L71,214 L98,187 L112,165 L127,137 L140,123 L119,95 Z";

/**
 * The animated route map (build plan v3 §1.3). The truck marker runs the trip's
 * own SVG path on a slow loop; milestone dots light up as they are passed.
 * Everything is inline — zero external tiles, zero network.
 */
export default function TrackingMap({ trip }: { trip: Trip }) {
  const delayed = trip.status === "DELAYED";
  const strokeColor = delayed ? "var(--color-pending)" : "var(--role-hue)";

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <svg
        viewBox="30 45 440 440"
        role="img"
        aria-label={`Route map: ${trip.origin} to ${trip.destination}, ${
          delayed ? `${trip.daysLate} days late` : "on schedule"
        }`}
        className="mx-auto h-auto w-full max-w-[520px]"
      >
        <path d={INDIA_OUTLINE} fill="var(--color-canvas)" stroke="var(--color-border)" strokeWidth="2" />

        {/* Full route, then the travelled portion drawn over it. */}
        <path
          d={trip.path}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="6 8"
        />
        <path
          d={trip.path}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - trip.progress}
        />

        {trip.milestones.map((m) => (
          <g key={m.label}>
            <circle
              cx={m.cx}
              cy={m.cy}
              r="6"
              fill={m.reached ? strokeColor : "var(--color-surface)"}
              stroke={m.reached ? "var(--color-surface)" : "var(--color-border)"}
              strokeWidth="2.5"
            />
            <text
              x={m.cx + 12}
              y={m.cy + 4}
              className="font-mono-vin"
              fill="var(--color-ink-muted)"
              fontSize="11"
            >
              {m.label.split(" — ").pop()?.split(",")[0]}
            </text>
          </g>
        ))}

        <g
          className="animate-truck"
          style={
            {
              "--trip-path": `path("${trip.path}")`,
              "--trip-end": `${Math.round(trip.progress * 100)}%`,
              "--trip-duration": delayed ? "28s" : "24s",
            } as React.CSSProperties
          }
        >
          <circle r="11" fill={strokeColor} stroke="var(--color-surface)" strokeWidth="3" />
          <g
            transform="translate(-6,-6) scale(0.5)"
            fill="none"
            stroke="var(--color-surface)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
            <path d="M15 18H9" />
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
            <circle cx="17" cy="18" r="2" />
            <circle cx="7" cy="18" r="2" />
          </g>
        </g>
      </svg>

      <p className="mt-3 text-center text-xs text-ink-muted">
        Live signals via ULIP / transporter feed (simulated in demo)
      </p>
    </div>
  );
}
