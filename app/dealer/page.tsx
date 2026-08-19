import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import { getKpisForRole } from "@/lib/selectors";

export default function DealerPage() {
  return (
    <RoleGate role="dealer">
      <DashboardShell title="My Vehicles">
        <KpiStrip items={getKpisForRole("dealer")} />
      </DashboardShell>
    </RoleGate>
  );
}
