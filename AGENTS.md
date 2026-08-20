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
- **No real integrations, with one exception.** The tracking screens draw
  OpenStreetMap tiles through Leaflet — the only runtime network call in the build,
  keyless and read-only. Everything else still renders from static mock data. The
  bank is still a status source, not a connected party: it raises its funding
  confirmation *onto the shared record*, and DhanFlow never sends anything to it.
- **Invoices are raised in-app, but only from a verified order.** The manufacturer
  turns a verified dealer order into dummy invoice(s) plus their documents in client
  state (`raiseInvoiceForOrder`). Nothing is persisted and no real invoice format is
  claimed.
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
  not-found.tsx                  — unknown URL → back to the session's home
  hq/ plant/ ro/ dealer/ bank/ lsp/page.tsx   — one dashboard per role (+ sub-pages)
  dealer/tracking, lsp/tracking  — live tracking screen (map + timeline)
  hq/orders, dealer/orders       — ERP: dealer books, manufacturer verifies (ATP) and invoices
  hq/compliance, dealer/compliance — document alerts + the end-of-run report
  bank/documents                 — the bank raises its confirmation onto the shared record
  vehicle/[vin]/page.tsx         — shared VIN detail, content role-scoped
components/
  DashboardShell, PersonaBar, Sidebar, KpiStrip, PipelineBoard, VehicleCard,
  JourneyRail, ExceptionList, CheckRail, DocCompare, NotesThread, RoleGate,
  StatusChip, Chatbot, ChatSnippet, TrackingBoard, TrackingMap (Leaflet/OSM),
  OrderCard, OrderBookingForm, AtpPanel, DocumentList, ComplianceAlerts,
  ComplianceReportView, HqCharts
lib/
  types.ts       — Vehicle/Stage/CheckStatus/Role/Trip types
  mockData.ts    — the 14 hardcoded vehicles + 2 trips (single source of truth for data)
  selectors.ts   — getVehiclesForRole() and all role-scoping logic, including
                    orders, documents and compliance scoping
  erp.ts         — available-to-promise: stock vs build slot vs promised date
  compliance.ts  — the document rulebook (R01–R10) and the report builder
  chatContent.ts — the canned per-persona chatbot scripts
  roleTheme.ts   — role hues mirrored from CSS, for the per-persona favicon
  auth.tsx       — AuthContext (role, login/logout, sessionStorage)
  store.tsx      — VehicleStoreContext (client-state mutations: funding, gate pass,
                    milestones, notes) seeded from mockData.ts
```

## Working conventions

- Build in the staged order from `plan.md` §10 (scaffold → types/data/selectors →
  auth/login/RoleGate → shared layout → board/card/exceptions → vehicle detail →
  interactions → charts/polish). Commit after each stage — small, reviewable diffs,
  not one mega-commit.
- Role scoping covers **orders and documents too**: `getOrdersForRole`,
  `getDocumentsForRole` and `getAlertsForRole` are the choke points. A document is
  visible only when the role raised it or was shared on it *and* the car is already
  in that role's vehicle scope — a `sharedWith` entry can never widen a data window.
  Rules that assert a missing document only fire for parties entitled to hold it.
- Role scoping bugs are the most damaging kind of bug in this codebase: verify with
  the checklist in `plan.md` §11 (e.g. Dealer sees exactly its own cars, `/hq` while
  logged in as `dealer` redirects away) before considering a stage done.
- Visual language ("The Control Tower", build plan v3): light working surfaces on
  a `#F6F8FB` canvas, ink navy `#0B2447` reserved for the frame (persona bar, login,
  chatbot header). Green `#16A34A` = CLEAR, red `#DC2626` = STUCK, amber `#D97706` =
  pending/substitution. No gradients, no glassmorphism, no dark mode.
- Role hues are deliberately desaturated — identity should be recognisable, never
  loud. Saturation belongs to status (green / amber / red), which has to win the eye.
- Each persona owns a **role hue**, set as `--role-hue` / `--role-tint` by the
  `data-role` attribute on the app shell and consumed through the `role` /
  `role-tint` Tailwind colours. Never hardcode a persona colour in a component.
- Fonts: Fraunces (display) for page titles and KPI numbers only, Inter for all UI,
  IBM Plex Mono (`.font-mono-vin`) for every identifier, amount and timestamp.
- `JourneyRail` is the signature element: same grammar in `mini` / `compact` / `full`.
  Polish it hardest; keep everything around it disciplined.
- Keep `npm run build` and `npm run lint` clean before each commit.
