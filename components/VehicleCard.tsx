import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import { getVehicleTone } from "@/lib/selectors";
import StatusChip from "./StatusChip";

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function VehicleCard({
  vehicle,
  showDealer = true,
}: {
  vehicle: Vehicle;
  showDealer?: boolean;
}) {
  const tone = getVehicleTone(vehicle);
  const chipLabel = tone === "clear" ? "CLEAR" : tone === "pending" ? "SUBSTITUTION" : "STUCK";

  return (
    <Link
      href={`/vehicle/${vehicle.vin}`}
      className="flex flex-col gap-1.5 rounded-md border border-border bg-canvas px-2.5 py-2 text-left transition-colors hover:border-navy/40 hover:bg-navy-light/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-ink">
          {vehicle.model} {vehicle.variant}
        </span>
        <StatusChip tone={tone} className="shrink-0">
          {chipLabel}
        </StatusChip>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-ink-muted">
        <span className="font-mono-vin">•••{vehicle.chassisShort}</span>
        <span className="tabular-nums">{formatINR(vehicle.invoice.amount + vehicle.invoice.gst)}</span>
      </div>
      {showDealer && (
        <span className="truncate text-[11px] text-ink-muted">{vehicle.dealerName}</span>
      )}
      {vehicle.stuckReason && (
        <p
          className={`flex items-start gap-1 text-[11px] leading-snug ${
            tone === "pending" ? "text-pending" : "text-stuck"
          }`}
        >
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="line-clamp-2">{vehicle.stuckReason}</span>
        </p>
      )}
    </Link>
  );
}
