"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Send, Sparkles, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { CHAT_FALLBACK, CHAT_SCRIPTS, type ChatQa, type ChatSnippet as Snippet } from "@/lib/chatContent";
import ChatSnippet from "./ChatSnippet";

interface Message {
  id: number;
  from: "user" | "bot";
  text: string;
  snippet?: Snippet;
}

/** Fixed, not random — the presenter rehearses against the same beat every time. */
const TYPING_MS = 750;

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

/** Loose match so a lightly reworded question still finds its scripted answer. */
function matchQa(script: ChatQa[], input: string): ChatQa | undefined {
  const q = normalize(input);
  if (!q) return undefined;
  const exact = script.find((item) => normalize(item.q) === q);
  if (exact) return exact;
  return script.find((item) => {
    const words = normalize(item.q)
      .split(" ")
      .filter((w) => w.length > 3);
    const hits = words.filter((w) => q.includes(w)).length;
    return words.length > 0 && hits / words.length >= 0.6;
  });
}

/**
 * "Ask DhanFlow" — a scripted assistant over the shared record (build plan v3 §1.2).
 * No model calls: hardcoded Q→A pairs per persona, a typing beat, suggested
 * chips so nothing has to be typed live, and rich snippets that deep-link
 * into the same role-scoped data the dashboards read.
 */
export default function Chatbot({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { persona } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const script = useMemo(() => (persona ? CHAT_SCRIPTS[persona.role] : []), [persona]);

  const ask = useCallback(
    (question: string) => {
      const match = matchQa(script, question);
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, from: "user", text: question },
      ]);
      setInput("");
      setTyping(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: nextId.current++,
            from: "bot",
            text: match ? match.a : CHAT_FALLBACK,
            snippet: match?.snippet,
          },
        ]);
      }, TYPING_MS);
    },
    [script]
  );

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    inputRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, typing]);

  if (!persona || !open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) ask(trimmed);
  }

  const unasked = script.filter(
    (item) => !messages.some((m) => m.from === "user" && normalize(m.text) === normalize(item.q))
  );

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Ask DhanFlow">
      <button
        type="button"
        aria-label="Close chat"
        className="absolute inset-0 bg-navy/40"
        onClick={onClose}
      />
      <aside className="animate-slide-over absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col border-l border-border bg-canvas shadow-xl">
        <header className="shrink-0 bg-navy px-4 py-3.5 text-white">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <h2 className="font-display text-lg leading-none">Ask DhanFlow</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium bg-role">
            answering as: {persona.label} view
          </span>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="rounded-xl border border-border bg-surface p-3 text-sm text-ink shadow-card">
            <p>
              {persona.name.split(" ")[0]}, ask me anything this shared record knows about your
              cars.
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              I only see what {persona.label} is allowed to see.
            </p>
          </div>

          <ul className="mt-4 flex flex-col gap-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className={m.from === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    m.from === "user"
                      ? "bg-role text-white"
                      : "border border-border bg-surface text-ink shadow-card"
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  {m.snippet && <ChatSnippet snippet={m.snippet} onNavigate={onClose} />}
                </div>
              </li>
            ))}
            {typing && (
              <li className="flex justify-start" aria-live="polite">
                <div className="flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-3 shadow-card">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{ animationDelay: `${i * 160}ms` }}
                      className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-ink-muted"
                    />
                  ))}
                  <span className="sr-only">DhanFlow is typing</span>
                </div>
              </li>
            )}
          </ul>
          <div ref={endRef} />
        </div>

        {unasked.length > 0 && (
          <div className="shrink-0 border-t border-border bg-surface px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
              Suggested
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {unasked.slice(0, 3).map((item) => (
                <button
                  key={item.q}
                  type="button"
                  onClick={() => ask(item.q)}
                  className="rounded-lg border border-border bg-canvas px-2.5 py-2 text-left text-xs font-medium text-ink transition-colors hover:border-role/40 hover:bg-role-tint"
                >
                  {item.q}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex shrink-0 items-center gap-2 border-t border-border bg-surface px-4 py-3"
        >
          <label htmlFor="chat-input" className="sr-only">
            Ask a question
          </label>
          <input
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a chassis, a trip, a dealer…"
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-canvas px-3 text-sm text-ink outline-none focus:border-role"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white bg-role disabled:opacity-40"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </aside>
    </div>
  );
}
