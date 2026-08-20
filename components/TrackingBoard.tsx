"use client";

import { useState } from "react";
import Link from "next/link";
import { Truck } from "lucide-react";
import { useVehicleStore } from "@/lib/store";
import { getTripVehicles, getTripsForRole } from "@/lib/selectors";
import { formatDateTime } from "@/lib/format";
import type { Role, Trip } from "@/lib/types";
import TrackingMap from "./TrackingMap";
import StatusChip from "./StatusChip";

function TripRow({
  trip,
  cars,
  selected,
  onSelect,
}: {
  trip: Trip;
  cars: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const delayed = trip.status === "DELAYED";
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        className={`flex w-full flex-col gap-1.5 border-l-4 px-4 py-3 text-left transition-colors ${
          selected
            ? "border-l-[color:var(--role-hue)] bg-role-tint/60"
            : "border-l-transparent hover:bg-canvas"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono-vin text-sm font-semibold text-ink">{trip.truckNo}</span>
          <StatusChip tone={delayed ? "pending" : "clear"}>
            {delayed ? `+${trip.daysLate}d` : "ON TIME"}
          </StatusChip>
        </div>
        <p className="text-xs text-ink-muted">
          {trip.origin} → {trip.destination}
        </p>
        <p className="text-xs text-ink-muted">
          {cars} car{cars === 1 ? "" : "s"} aboard · ETA{" "}
          <span className="font-mono-vin text-ink">{trip.etaDate}</span>
          <span className={delayed ? "text-pending" : "text-ink-muted"}>
            {" "}
            vs promise <span className="font-mono-vin">{trip.promiseDate}</span>
          </span>
        </p>
      </button>
    </li>
  );
}

/** Trip list + animated route map + milestone timeline (build plan v3 §1.3). */
export default function TrackingBoard({ role }: { role: Role }) {
  const { vehicles } = useVehicleStore();
  const trips = getTripsForRole(vehicles, role);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (trips.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
        <p className="text-sm text-ink-muted">No cars of yours are on the road right now.</p>
        <Link
          href={`/${role}`}
          className="mt-2 inline-block text-sm font-medium text-role hover:underline"
        >
          Back to your dashboard
        </Link>
      </div>
    );
  }

  const trip = trips.find((t) => t.id === selectedId) ?? trips[0];
  const cars = getTripVehicles(vehicles, role, trip);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <section
        aria-label="Trips"
        className="self-start overflow-hidden rounded-xl border border-border bg-surface shadow-card"
      >
        <h2 className="border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Trips in progress
        </h2>
        <ul className="divide-y divide-border">
          {trips.map((t) => (
            <TripRow
              key={t.id}
              trip={t}
              cars={getTripVehicles(vehicles, role, t).length}
              selected={t.id === trip.id}
              onSelect={() => setSelectedId(t.id)}
            />
          ))}
        </ul>
      </section>

      <section aria-label="Route" className="flex flex-col gap-4">
        <TrackingMap trip={trip} />

        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">
              <span className="font-mono-vin">{trip.truckNo}</span> · {trip.origin} →{" "}
              {trip.destination}
            </h3>
            <span className="text-xs text-ink-muted">{trip.carrier}</span>
          </div>

          <ol className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-0">
            {trip.milestones.map((m, i) => (
              <li key={m.label} className="flex min-w-0 flex-1 items-start gap-3 sm:block">
                <div className="flex items-center sm:mb-2">
                  <span
                    aria-hidden="true"
                    className={`hidden h-0.5 flex-1 sm:block ${
                      i === 0 ? "opacity-0" : m.reached ? "bg-role" : "bg-border"
                    }`}
                  />
                  <span
                    className={`h-3 w-3 shrink-0 rounded-full ${
                      m.reached
                        ? trip.status === "DELAYED" && i === 1
                          ? "bg-pending"
                          : "bg-role"
                        : "border border-border bg-surface"
                    }`}
                  />
                  <span
                    aria-hidden="true"
                    className={`hidden h-0.5 flex-1 sm:block ${
                      i === trip.milestones.length - 1 ? "opacity-0" : "bg-border"
                    }`}
                  />
                </div>
                <div className="min-w-0 sm:pr-3">
                  <p
                    className={`truncate text-xs font-medium ${
                      m.reached ? "text-ink" : "text-ink-muted"
                    }`}
                    title={m.label}
                  >
                    {m.label}
                  </p>
                  <p className="font-mono-vin text-[11px] text-ink-muted">
                    {m.at ? formatDateTime(m.at) : "—"}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-4 border-t border-border pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Cars aboard
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {cars.map((v) => (
                <li key={v.vin}>
                  <Link
                    href={`/vehicle/${v.vin}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-canvas px-3 text-xs font-medium text-ink transition-colors hover:border-role/40 hover:bg-role-tint"
                  >
                    <Truck className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
                    {v.model} {v.variant}
                    <span className="font-mono-vin text-ink-muted">•••{v.chassisShort}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
