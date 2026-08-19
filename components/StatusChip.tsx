import type { CheckStatus, ChipTone } from "@/lib/types";

const TONE_CLASSES: Record<ChipTone, string> = {
  clear: "bg-clear-bg text-clear border-clear/20",
  stuck: "bg-stuck-bg text-stuck border-stuck/20",
  pending: "bg-pending-bg text-pending border-pending/20",
  neutral: "bg-navy-light text-navy border-navy/10",
};

export function toneForCheckStatus(status: CheckStatus): ChipTone {
  if (status === "CLEAR") return "clear";
  if (status === "MISMATCH") return "stuck";
  return "pending";
}

export default function StatusChip({
  tone,
  children,
  className = "",
}: {
  tone: ChipTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
