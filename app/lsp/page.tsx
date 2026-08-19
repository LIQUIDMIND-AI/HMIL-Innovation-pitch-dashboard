import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import { getKpisForRole } from "@/lib/selectors";

export default function LspPage() {
  return (
    <RoleGate role="lsp">
      <DashboardShell title="Trip Board">
        <KpiStrip items={getKpisForRole("lsp")} />
      </DashboardShell>
    </RoleGate>
  );
}
