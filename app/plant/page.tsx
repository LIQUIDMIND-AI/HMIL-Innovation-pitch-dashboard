import RoleGate from "@/components/RoleGate";

export default function PlantPage() {
  return (
    <RoleGate role="plant">
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-ink-muted">hello plant</p>
      </main>
    </RoleGate>
  );
}
