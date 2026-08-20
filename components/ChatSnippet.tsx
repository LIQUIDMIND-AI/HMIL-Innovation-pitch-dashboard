"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Clock, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useVehicleStore } from "@/lib/store";
import { findVehicleForRole, getVehicleTone } from "@/lib/selectors";
import type { ChatSnippet as Snippet } from "@/lib/chatContent";
import type { CheckStatus, VehicleChecks } from "@/lib/types";
import JourneyRail from "./JourneyRail";
import StatusChip from "./StatusChip";

const CHECK_LABELS: Record<keyof VehicleChecks, string> = {
  chassisMatch: "Chassis",
  variantColourMatch: "Variant & colour",
  priceMatch: "Price",
  taxTotalsMatch: "Tax totals",
  dispatchDocsPresent: "Dispatch papers",
};

function CheckMark({ status }: { status: CheckStatus }) {
  if (status === "CLEAR") return <Check className="h-3.5 w-3.5 text-clear" aria-hidden="true" />;
  if (status === "MISMATCH") return <X className="h-3.5 w-3.5 text-stuck" aria-hidden="true" />;
  return <Clock className="h-3.5 w-3.5 text-pending" aria-hidden="true" />;
}

/**
 * The rich half of an answer — a mini status card, a mini checklist, or a
 * deep link. Vehicle lookups go through findVehicleForRole, so an out-of-scope
 * VIN simply renders nothing rather than leaking across roles.
 */
export default function ChatSnippet({
  snippet,
  onNavigate,
}: {
  snippet: Snippet;
  onNavigate?: () => void;
}) {
  const { role } = useAuth();
  const { vehicles } = useVehicleStore();

  if (snippet.kind === "link") {
    return (
      <Link
        href={snippet.href}
        onClick={onNavigate}
        className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-role hover:bg-role-tint"
      >
        {snippet.label}
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    );
  }

  if (!role) return null;
  const vehicle = findVehicleForRole(vehicles, role, snippet.vin);
  if (!vehicle) return null;

  const tone = getVehicleTone(vehicle);
  const chipLabel = tone === "clear" ? "CLEAR" : tone === "pending" ? "SUBSTITUTION" : "STUCK";

  return (
    <Link
      href={`/vehicle/${vehicle.vin}`}
      onClick={onNavigate}
      className="mt-2 block rounded-xl border border-border bg-surface p-3 shadow-card transition-colors hover:border-role/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold text-ink">
          {vehicle.model} {vehicle.variant}
        </span>
        <StatusChip tone={tone} className="shrink-0">
          {chipLabel}
        </StatusChip>
      </div>
      <p className="font-mono-vin mt-0.5 text-xs text-ink-muted">
        •••{vehicle.chassisShort} · {vehicle.colour}
      </p>

      {snippet.kind === "vehicle" ? (
        <div className="mt-3 pt-1">
          <JourneyRail vehicle={vehicle} size="mini" />
        </div>
      ) : (
        <ul className="mt-2.5 flex flex-col gap-1">
          {(Object.keys(CHECK_LABELS) as (keyof VehicleChecks)[]).map((key) => (
            <li key={key} className="flex items-center gap-1.5 text-xs text-ink">
              <CheckMark status={vehicle.checks[key]} />
              {CHECK_LABELS[key]}
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}
