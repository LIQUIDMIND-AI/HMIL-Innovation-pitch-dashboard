# DhanFlow — HMIL Innovation Pitch Dashboard

A frontend-only demo simulating **DhanFlow**, an invoice-to-delivery visibility
platform for Hyundai Motor India (HMIL). Six roles — HMIL Sales Logistics HQ,
Plant/Dispatch, Regional Office, Dealer, Bank, and LSP/Transporter — log in with
demo credentials and see the same shared vehicle records through role-scoped
dashboards.

No backend, no database, no real auth — everything is static mock data plus
client-side React state.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll land on `/login`. Demo credentials for all six
personas are shown on the login screen itself.

## Project docs

See [`AGENTS.md`](./AGENTS.md) for the architecture, file map, and build
conventions this codebase follows.
