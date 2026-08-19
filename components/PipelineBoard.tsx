import type { Vehicle } from "@/lib/types";
import { PIPELINE_COLUMNS } from "@/lib/selectors";
import VehicleCard from "./VehicleCard";

export default function PipelineBoard({
  vehicles,
  showDealer = true,
  showLsp = false,
}: {
  vehicles: Vehicle[];
  showDealer?: boolean;
  showLsp?: boolean;
}) {
  return (
    <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
      {PIPELINE_COLUMNS.map((col) => {
        const items = vehicles.filter((v) => col.stages.includes(v.stage));
        return (
          <div
            key={col.key}
            className="flex min-w-[210px] flex-1 shrink-0 snap-start flex-col rounded-lg border border-border bg-surface"
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
                  <VehicleCard key={v.vin} vehicle={v} showDealer={showDealer} showLsp={showLsp} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
