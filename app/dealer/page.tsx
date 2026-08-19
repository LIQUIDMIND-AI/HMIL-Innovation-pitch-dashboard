import RoleGate from "@/components/RoleGate";

export default function DealerPage() {
  return (
    <RoleGate role="dealer">
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-ink-muted">hello dealer</p>
      </main>
    </RoleGate>
  );
}
