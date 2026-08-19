export default async function VehiclePage({
  params,
}: {
  params: Promise<{ vin: string }>;
}) {
  const { vin } = await params;
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-lg text-ink-muted">hello vehicle {vin}</p>
    </main>
  );
}
