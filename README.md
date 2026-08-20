# DhanFlow — HMIL Innovation Pitch Dashboard

A frontend-only demo simulating **DhanFlow**, an invoice-to-delivery visibility
platform for Hyundai Motor India (HMIL). Five roles — HMIL Sales Logistics HQ,
Plant/Dispatch, Regional Office, Dealer and LSP/Transporter — log in with demo
credentials and see the same shared vehicle records, the same documents and the
same service levels through role-scoped dashboards.

It covers two flows and nothing else: the **goods flow** (dealer order →
availability check → invoice → document verification → dispatch papers →
gate-out → transit → delivery) and the **document flow** (price circular,
allocation advice, tax invoice, e-way bill, delivery challan, proof of delivery),
cross-checked by a rulebook that raises alerts and produces a compliance report.
There is no money leg: no bank, no funding, no payments.

No backend, no database, no real auth — everything is static mock data plus
client-side React state. The only runtime network call is OpenStreetMap tiles on
the tracking screens.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll land on `/login`. Demo credentials for all five
personas are shown on the login screen itself.

## Smoke test

```bash
npm run test:e2e
```

Runs the Playwright suite in `tests/` — every persona's screens, the ERP order
flow, the plant's verify → papers → gate-pass sequence, the document rulebook,
the SLA report, tracking and the assistant. It starts its own dev server on port
3100 and fails on any console error.

## Project docs

See [`AGENTS.md`](./AGENTS.md) for the architecture, file map, and build
conventions this codebase follows.
