"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Trip } from "@/lib/types";

type LatLng = [number, number];

/** Cumulative straight-line lengths along the corridor, for interpolation. */
function cumulative(route: LatLng[]): number[] {
  const out = [0];
  for (let i = 1; i < route.length; i += 1) {
    const [aLat, aLng] = route[i - 1];
    const [bLat, bLng] = route[i];
    out.push(out[i - 1] + Math.hypot(bLat - aLat, bLng - aLng));
  }
  return out;
}

/** The point a given fraction (0–1) along the corridor. */
function pointAt(route: LatLng[], cum: number[], fraction: number): LatLng {
  const target = cum[cum.length - 1] * Math.min(Math.max(fraction, 0), 1);
  for (let i = 1; i < cum.length; i += 1) {
    if (cum[i] >= target) {
      const span = cum[i] - cum[i - 1] || 1;
      const t = (target - cum[i - 1]) / span;
      const [aLat, aLng] = route[i - 1];
      const [bLat, bLng] = route[i];
      return [aLat + (bLat - aLat) * t, aLng + (bLng - aLng) * t];
    }
  }
  return route[route.length - 1];
}

function sliceTo(route: LatLng[], cum: number[], fraction: number): LatLng[] {
  const head = pointAt(route, cum, fraction);
  const total = cum[cum.length - 1];
  const kept = route.filter((_, i) => cum[i] <= total * fraction);
  return [...kept, head];
}

const TRUCK_GLYPH = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`;

/**
 * The route map, drawn on OpenStreetMap tiles via Leaflet. The corridor is the
 * seeded NH-44 waypoint chain; the truck marker crawls it on a slow loop and
 * milestone pins light up as they are passed. Tiles come from the public OSM
 * servers — the one place this build reaches the network at runtime.
 */
export default function TrackingMap({ trip }: { trip: Trip }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const L = (await import("leaflet")).default;
      if (disposed || !containerRef.current) return;

      const styles = getComputedStyle(container);
      const roleHue = styles.getPropertyValue("--role-hue").trim() || "#33607f";
      const delayed = trip.status === "DELAYED";
      const live = delayed ? "#d97706" : roleHue;

      const route = trip.route as LatLng[];
      const cum = cumulative(route);

      const map = L.map(container, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Whole corridor, then the travelled portion drawn over it.
      L.polyline(route, {
        color: "#94a3b8",
        weight: 3,
        opacity: 0.6,
        dashArray: "6 8",
      }).addTo(map);

      const travelled = L.polyline(sliceTo(route, cum, trip.progress), {
        color: live,
        weight: 5,
        opacity: 0.9,
      }).addTo(map);

      for (const milestone of trip.milestones) {
        L.circleMarker([milestone.lat, milestone.lng], {
          radius: 6,
          color: "#ffffff",
          weight: 2,
          fillColor: milestone.reached ? live : "#cbd5e1",
          fillOpacity: 1,
        })
          .addTo(map)
          .bindTooltip(
            `${milestone.label}${milestone.at ? ` · ${milestone.at.slice(8, 10)}/${milestone.at.slice(5, 7)}` : " · pending"}`,
            { direction: "top" }
          );
      }

      const truck = L.marker(pointAt(route, cum, trip.progress), {
        icon: L.divIcon({
          className: "",
          html: `<span style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:${live};box-shadow:0 0 0 3px #fff, 0 1px 3px rgb(11 36 71 / 0.35)">${TRUCK_GLYPH}</span>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
        interactive: false,
      }).addTo(map);

      truck.bindTooltip(`${trip.truckNo} · ${trip.origin} → ${trip.destination}`);

      map.fitBounds(L.latLngBounds(route), { padding: [18, 18], maxZoom: 7 });

      // A slow crawl over the travelled leg — paused entirely for reduced motion.
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let timer: ReturnType<typeof setInterval> | undefined;
      if (!reduced) {
        const steps = 120;
        let step = 0;
        timer = setInterval(() => {
          step = (step + 1) % steps;
          const eased = (step / steps) * trip.progress;
          truck.setLatLng(pointAt(route, cum, eased));
          travelled.setLatLngs(sliceTo(route, cum, eased));
        }, 220);
      }

      cleanup = () => {
        if (timer) clearInterval(timer);
        map.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [trip]);

  return (
    <div className="relative isolate z-0 overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div
        ref={containerRef}
        role="application"
        aria-label={`Route map: ${trip.origin} to ${trip.destination}, ${
          trip.status === "DELAYED" ? `${trip.daysLate} days late` : "on schedule"
        }`}
        className="h-[300px] w-full sm:h-[420px]"
      />
      <p className="border-t border-border px-4 py-2.5 text-center text-xs text-ink-muted">
        Live signals via ULIP / transporter feed (simulated in demo) · base map ©
        OpenStreetMap contributors
      </p>
    </div>
  );
}
