"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import OrderCard from "@/components/OrderCard";
import StatusChip from "@/components/StatusChip";
import { useVehicleStore } from "@/lib/store";
import { AVAILABLE_LINES, getOrdersForRole } from "@/lib/selectors";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";

const QUEUE_ORDER: OrderStatus[] = ["SUBMITTED", "VERIFIED", "INVOICED", "REJECTED"];

function HqOrders() {
  const { orders } = useVehicleStore();
  const all = getOrdersForRole(orders, "hq");
  const sorted = [...all].sort(
    (a, b) => QUEUE_ORDER.indexOf(a.status) - QUEUE_ORDER.indexOf(b.status)
  );
  const awaiting = all.filter((o) => o.status === "SUBMITTED").length;

  return (
    <DashboardShell
      title="Order book"
      caption="Dealer bookings, checked against what the plant can build and ship — then invoiced onto the shared record."
    >
      <section
        aria-labelledby="capacity"
        className="rounded-xl border border-border bg-surface p-5 shadow-card"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="capacity" className="text-sm font-semibold text-ink">
            Line availability today
          </h2>
          <span className="text-xs text-ink-muted">
            {awaiting} order{awaiting === 1 ? "" : "s"} awaiting your verification
          </span>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-ink-muted">
                <th scope="col" className="px-3 py-2 font-medium">Line</th>
                <th scope="col" className="px-3 py-2 font-medium">Colours</th>
                <th scope="col" className="px-3 py-2 font-medium tabular-nums">Ready to transport</th>
                <th scope="col" className="px-3 py-2 font-medium tabular-nums">Next build slot</th>
                <th scope="col" className="px-3 py-2 font-medium tabular-nums">Slot capacity</th>
              </tr>
            </thead>
            <tbody>
              {AVAILABLE_LINES.map((line) => (
                <tr key={`${line.model}-${line.variant}`} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 text-ink">
                    {line.model} {line.variant}
                  </td>
                  <td className="px-3 py-2 text-xs text-ink-muted">{line.colours.join(", ")}</td>
                  <td className="px-3 py-2">
                    <StatusChip tone={line.readyToTransport > 0 ? "clear" : "pending"}>
                      {line.readyToTransport}
                    </StatusChip>
                  </td>
                  <td className="font-mono-vin px-3 py-2 tabular-nums text-ink">
                    +{line.buildSlotDays}d
                  </td>
                  <td className="font-mono-vin px-3 py-2 tabular-nums text-ink">
                    {line.buildSlotCapacity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="queue">
        <h2 id="queue" className="mb-2 text-sm font-semibold text-ink">
          Dealer orders
        </h2>
        <ul className="flex flex-col gap-3">
          {sorted.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-muted">
          Statuses: {QUEUE_ORDER.map((s) => ORDER_STATUS_LABELS[s]).join(" · ")}
        </p>
      </section>
    </DashboardShell>
  );
}

export default function HqOrdersPage() {
  return (
    <RoleGate role="hq">
      <HqOrders />
    </RoleGate>
  );
}
