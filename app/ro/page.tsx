import RoleGate from "@/components/RoleGate";

export default function RoPage() {
  return (
    <RoleGate role="ro">
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-ink-muted">hello ro</p>
      </main>
    </RoleGate>
  );
}
