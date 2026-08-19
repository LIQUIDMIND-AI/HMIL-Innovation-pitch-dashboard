import type { KpiItem } from "@/lib/selectors";

const TONE_TEXT: Record<NonNullable<KpiItem["tone"]>, string> = {
  clear: "text-clear",
  stuck: "text-stuck",
  pending: "text-pending",
  neutral: "text-ink",
};

export default function KpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-medium text-ink-muted">{item.label}</dt>
          <dd
            className={`mt-1 text-2xl font-semibold tabular-nums ${
              TONE_TEXT[item.tone ?? "neutral"]
            }`}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
