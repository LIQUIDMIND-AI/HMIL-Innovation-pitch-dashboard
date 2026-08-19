import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import { getKpisForRole } from "@/lib/selectors";

export default function RoPage() {
  return (
    <RoleGate role="ro">
      <DashboardShell title="Regional Office — Chandigarh">
        <KpiStrip items={getKpisForRole("ro")} />
      </DashboardShell>
    </RoleGate>
  );
}
