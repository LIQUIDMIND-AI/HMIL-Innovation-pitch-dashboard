"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import OrderBookingForm from "@/components/OrderBookingForm";
import OrderCard from "@/components/OrderCard";
import { useVehicleStore } from "@/lib/store";
import { getOrdersForRole } from "@/lib/selectors";

function DealerOrders() {
  const { orders } = useVehicleStore();
  const mine = getOrdersForRole(orders, "dealer");

  return (
    <DashboardShell
      title="My orders"
      caption="Book cars against the live production plan and watch the manufacturer's answer land here."
    >
      <OrderBookingForm />

      <section aria-labelledby="order-book">
        <h2 id="order-book" className="mb-2 text-sm font-semibold text-ink">
          Order book
        </h2>
        {mine.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-ink-muted">
            Nothing booked yet — use the form above to send your first order.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {mine.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </ul>
        )}
      </section>
    </DashboardShell>
  );
}

export default function DealerOrdersPage() {
  return (
    <RoleGate role="dealer">
      <DealerOrders />
    </RoleGate>
  );
}
