import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import { getKpisForRole } from "@/lib/selectors";

export default function HqPage() {
  return (
    <RoleGate role="hq">
      <DashboardShell title="HQ Overview">
        <KpiStrip items={getKpisForRole("hq")} />
      </DashboardShell>
    </RoleGate>
  );
}
