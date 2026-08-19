import type { Stage, Vehicle } from "@/lib/types";
import VehicleCard from "./VehicleCard";

/** The six legs of the pipeline (plan.md §6) — FUNDING_PENDING/FUNDING_RECEIVED collapse into one "Funding" column. */
const PIPELINE_COLUMNS: { key: string; label: string; stages: Stage[] }[] = [
  { key: "invoiced", label: "Invoiced", stages: ["INVOICED"] },
  { key: "allocation", label: "Allocation Matched", stages: ["ALLOCATION_MATCHED"] },
  { key: "funding", label: "Funding", stages: ["FUNDING_PENDING", "FUNDING_RECEIVED"] },
  { key: "gateout", label: "Gate-out", stages: ["GATE_OUT"] },
  { key: "transit", label: "In Transit", stages: ["IN_TRANSIT"] },
  { key: "delivered", label: "Delivered", stages: ["DELIVERED"] },
];

export default function PipelineBoard({
  vehicles,
  showDealer = true,
}: {
  vehicles: Vehicle[];
  showDealer?: boolean;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {PIPELINE_COLUMNS.map((col) => {
        const items = vehicles.filter((v) => col.stages.includes(v.stage));
        return (
          <div
            key={col.key}
            className="flex min-w-[210px] flex-1 flex-col rounded-lg border border-border bg-surface"
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <h3 className="text-xs font-semibold text-ink">{col.label}</h3>
              <span className="text-xs font-medium tabular-nums text-ink-muted">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2 p-2">
              {items.length === 0 ? (
                <p className="px-1 py-6 text-center text-xs text-ink-muted">No vehicles</p>
              ) : (
                items.map((v) => (
                  <VehicleCard key={v.vin} vehicle={v} showDealer={showDealer} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
