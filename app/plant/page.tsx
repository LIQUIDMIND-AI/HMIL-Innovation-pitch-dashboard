import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import { getKpisForRole } from "@/lib/selectors";

export default function PlantPage() {
  return (
    <RoleGate role="plant">
      <DashboardShell title="Plant Dispatch Desk">
        <KpiStrip items={getKpisForRole("plant")} />
      </DashboardShell>
    </RoleGate>
  );
}
