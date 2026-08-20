"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import TrackingBoard from "@/components/TrackingBoard";

function LspTracking() {
  return (
    <DashboardShell
      title="Live tracking"
      caption="Where every truck you are carrying is right now."
    >
      <TrackingBoard role="lsp" />
    </DashboardShell>
  );
}

export default function LspTrackingPage() {
  return (
    <RoleGate role="lsp">
      <LspTracking />
    </RoleGate>
  );
}
