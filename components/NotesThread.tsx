import type { Note } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export default function NotesThread({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return <p className="text-sm text-ink-muted">No notes on this vehicle yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {notes.map((note, i) => (
        <li key={i} className="rounded-md border border-border bg-surface p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-ink">{note.author}</span>
            <span className="rounded-full bg-navy-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy">
              {note.role}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink">{note.text}</p>
          <p className="mt-1 text-xs text-ink-muted">{formatDateTime(note.at)}</p>
        </li>
      ))}
    </ul>
  );
}
