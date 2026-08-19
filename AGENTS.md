<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# DhanFlow Demo — Agent Guide

DhanFlow is a **frontend-only demo** simulating an invoice-to-delivery visibility
platform for Hyundai Motor India (HMIL). It is built for a panel-interview pitch:
it must look polished, load instantly, and never crash. There is no backend.

The full product/build spec this codebase implements lives in `plan.md` at the repo
root (source: an internal Slack build-plan doc). Read it before making structural
changes — this file is a working summary, `plan.md` is the source of truth for intent.

**`plan.md` contains a pasted Slack transcript with what looks like a live AWS
credential pair. Never commit that file, never read its env-var block into any
tool call, and flag it again if you see it re-appear anywhere.**

## Hard constraints — do not violate

- **Frontend only.** No API routes, no server actions that persist data, no database,
  no external services. Every screen renders from static mock data + client state.
- **Mock auth only.** Login = picking one of 6 hardcoded demo accounts, stored in
  React context + `sessionStorage`. No password hashing, no JWT, no NextAuth.
- **Role isolation is the product**, not a UI nicety. Every data read for every role
  must go through `getVehiclesForRole()` in `lib/selectors.ts`. Pages and components
  never import `lib/mockData.ts` directly — that's the one rule most likely to be
  violated by a careless edit, and it silently breaks the RBAC story of the demo.
- **No real integrations.** Bank is a status field, not a connected party. Never build
  anything that "sends documents to a bank."
- **No invoice creation.** DhanFlow reads HMIL's invoice; it never writes one.
- **Deterministic demo.** No `Math.random()` / `Date.now()` / `new Date()` at runtime
  for anything that affects rendered output — the presenter rehearses against fixed
  screens. All "seeded" values are hardcoded in `lib/mockData.ts`.
- Must run with `npm install && npm run dev` on a clean machine, no env vars.

## Tech stack

Next.js (App Router) + TypeScript, Tailwind CSS v4 (tokens in `app/globals.css`
via `@theme inline`, no `tailwind.config.js`), hand-rolled components + `lucide-react`
icons, `recharts` for the two optional HQ charts only, React Context for state
(no Redux/Zustand), Inter via `next/font/google`.

## File map

```
app/
  layout.tsx, globals.css        — root shell, design tokens
  login/page.tsx                 — persona picker + credential form
  hq/ plant/ ro/ dealer/ bank/ lsp/page.tsx   — one dashboard per role
  vehicle/[vin]/page.tsx         — shared VIN detail, content role-scoped
components/
  Sidebar, TopBar, KpiStrip, PipelineBoard, VehicleCard,
  ExceptionList, CheckRail, DocCompare, NotesThread, RoleGate, StatusChip
lib/
  types.ts       — Vehicle/Stage/CheckStatus/Role types
  mockData.ts    — the 14 hardcoded vehicles (single source of truth for data)
  selectors.ts   — getVehiclesForRole() and all role-scoping logic
  auth.tsx       — AuthContext (role, login/logout, sessionStorage)
  store.tsx      — VehicleStoreContext (client-state mutations: funding, gate pass,
                    milestones, notes) seeded from mockData.ts
```

## Working conventions

- Build in the staged order from `plan.md` §10 (scaffold → types/data/selectors →
  auth/login/RoleGate → shared layout → board/card/exceptions → vehicle detail →
  interactions → charts/polish). Commit after each stage — small, reviewable diffs,
  not one mega-commit.
- Role scoping bugs are the most damaging kind of bug in this codebase: verify with
  the checklist in `plan.md` §11 (e.g. Dealer sees exactly its own cars, `/hq` while
  logged in as `dealer` redirects away) before considering a stage done.
- Visual language: white/very light grey canvas, navy `#0B2447` primary, green
  `#16A34A` = CLEAR, red `#DC2626` = STUCK, amber `#D97706` = pending/substitution.
  No gradients, no glassmorphism, no dark mode. Monospace for VIN/chassis, tabular
  numerals for amounts/timers.
- Keep `npm run build` and `npm run lint` clean before each commit.
