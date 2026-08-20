"use client";

import Link from "next/link";
import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import HqCharts from "@/components/HqCharts";
import ExceptionList from "@/components/ExceptionList";
import ComplianceAlerts from "@/components/ComplianceAlerts";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole, getAlertsForRole, getKpisFromVehicles, getOrdersForRole } from "@/lib/selectors";

function HqDashboard() {
  const { vehicles: allVehicles, documents, orders } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "hq");
  const findings = getAlertsForRole(allVehicles, documents, "hq");
  const awaiting = getOrdersForRole(orders, "hq").filter((o) => o.status === "SUBMITTED").length;

  return (
    <DashboardShell title="National overview">
      <KpiStrip items={getKpisFromVehicles(vehicles, "hq")} />

      <section aria-labelledby="exceptions-heading">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 id="exceptions-heading" className="text-sm font-semibold text-ink">
            Needs attention
          </h2>
          <Link href="/hq/exceptions" className="text-xs font-medium text-role hover:underline">
            Open the exception queue →
          </Link>
        </div>
        <ExceptionList vehicles={vehicles} />
      </section>

      <section aria-labelledby="doc-alerts-heading">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 id="doc-alerts-heading" className="text-sm font-semibold text-ink">
            Document alerts
          </h2>
          <Link href="/hq/compliance" className="text-xs font-medium text-role hover:underline">
            Open the compliance report →
          </Link>
        </div>
        <ComplianceAlerts findings={findings} limit={4} />
      </section>

      <section aria-labelledby="orders-heading">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 id="orders-heading" className="text-sm font-semibold text-ink">
            Order book
          </h2>
          <Link href="/hq/orders" className="text-xs font-medium text-role hover:underline">
            Verify dealer orders →
          </Link>
        </div>
        <p className="rounded-xl border border-border bg-surface p-5 text-sm text-ink shadow-card">
          <span className="font-mono-vin text-ink">{awaiting}</span> dealer order
          {awaiting === 1 ? "" : "s"} waiting on an availability check — each one answered against
          what the plant can ship today and what it can build next.
        </p>
      </section>

      <section aria-labelledby="analytics-heading">
        <h2 id="analytics-heading" className="mb-2 text-sm font-semibold text-ink">
          Analytics
        </h2>
        <HqCharts vehicles={vehicles} />
      </section>
    </DashboardShell>
  );
}

export default function HqPage() {
  return (
    <RoleGate role="hq">
      <HqDashboard />
    </RoleGate>
  );
}
