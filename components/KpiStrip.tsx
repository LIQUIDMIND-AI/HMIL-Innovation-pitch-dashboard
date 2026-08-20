import type { KpiItem } from "@/lib/selectors";

const TONE_TEXT: Record<NonNullable<KpiItem["tone"]>, string> = {
  clear: "text-clear",
  stuck: "text-stuck",
  pending: "text-pending",
  neutral: "text-ink",
};

/** KPI numbers are the one place besides page titles where the display serif appears. */
export default function KpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="relative overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-card"
        >
          <span className="absolute inset-x-0 top-0 h-1 bg-role" aria-hidden="true" />
          <dt className="text-xs font-medium text-ink-muted">{item.label}</dt>
          <dd
            className={`font-display mt-1.5 text-[40px] leading-none tabular-nums ${
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
