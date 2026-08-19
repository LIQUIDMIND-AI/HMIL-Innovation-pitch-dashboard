import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import { getKpisForRole } from "@/lib/selectors";

export default function BankPage() {
  return (
    <RoleGate role="bank">
      <DashboardShell title="Funding Requests">
        <KpiStrip items={getKpisForRole("bank")} />
      </DashboardShell>
    </RoleGate>
  );
}
