import Link from "next/link";
import { AlertTriangle, Truck } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import { getVehicleTone } from "@/lib/selectors";
import { formatINR } from "@/lib/format";
import StatusChip from "./StatusChip";
import JourneyRail from "./JourneyRail";

export default function VehicleCard({
  vehicle,
  showDealer = true,
  showLsp = false,
}: {
  vehicle: Vehicle;
  showDealer?: boolean;
  showLsp?: boolean;
}) {
  const tone = getVehicleTone(vehicle);
  const chipLabel = tone === "clear" ? "CLEAR" : tone === "pending" ? "SUBSTITUTION" : "STUCK";

  return (
    <Link
      href={`/vehicle/${vehicle.vin}`}
      className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-left shadow-card transition-colors hover:border-role/40 hover:bg-role-tint/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold text-ink">
          {vehicle.model} {vehicle.variant}
        </span>
        <StatusChip tone={tone} className="shrink-0">
          {chipLabel}
        </StatusChip>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-mono-vin text-ink-muted">•••{vehicle.chassisShort}</span>
        <span className="font-mono-vin text-ink">
          {formatINR(vehicle.invoice.amount + vehicle.invoice.gst)}
        </span>
      </div>

      <div className="pt-2">
        <JourneyRail vehicle={vehicle} size="compact" />
      </div>

      {showDealer && (
        <span className="truncate text-[11px] text-ink-muted">{vehicle.dealerName}</span>
      )}
      {showLsp && vehicle.lsp && (
        <p
          className={`flex items-start gap-1 text-[11px] leading-snug ${
            vehicle.lsp.lastMilestone.toLowerCase().includes("delayed")
              ? "text-pending"
              : "text-ink-muted"
          }`}
        >
          <Truck className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="line-clamp-2">
            {vehicle.lsp.route} · ETA {vehicle.lsp.etaDays}d · {vehicle.lsp.lastMilestone}
          </span>
        </p>
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
