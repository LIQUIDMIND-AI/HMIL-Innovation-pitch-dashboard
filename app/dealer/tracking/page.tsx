"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import TrackingBoard from "@/components/TrackingBoard";

function DealerTracking() {
  return (
    <DashboardShell
      title="Live tracking"
      caption="Where every car of yours is on the road right now."
    >
      <TrackingBoard role="dealer" />
    </DashboardShell>
  );
}

export default function DealerTrackingPage() {
  return (
    <RoleGate role="dealer">
      <DealerTracking />
    </RoleGate>
  );
}
