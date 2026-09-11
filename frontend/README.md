# DocuAI — Frontend

The user interface for an AI-powered document processing and retrieval platform:
upload PDFs, photos and scans, watch them travel an OCR → classification →
extraction → validation → embeddings pipeline, then find and question them in
plain language.

**This package is the frontend only.** No backend exists yet: every service call
resolves against an in-memory mock layer that mirrors the shape of the future
FastAPI API.

## Stack

React 19 · Vite 7 · TypeScript (strict) · Tailwind CSS v4 · Radix primitives
(shadcn-style components) · React Router 7 · Recharts · Lucide.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev          # http://localhost:5173
```

Sign in with any valid-looking email and a password of six or more characters —
authentication is mocked.

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then produce `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Types only |
| `npm run lint` | ESLint over the whole package |

## Connecting the real backend

Two environment variables control it — nothing else in the codebase knows a host:

```dotenv
VITE_API_URL=http://localhost:8000/api
VITE_USE_MOCK_API=false
```

Every module in `src/api/` has the same shape:

```ts
async list(params) {
  if (!config.useMockApi) return http.get<Paginated<Document>>("/documents", { params });
  // …mock implementation
}
```

Flipping `VITE_USE_MOCK_API` to `false` routes the identical calls through
`src/api/client.ts` over HTTP. No component changes, because no component ever
calls `fetch` or holds mock data.

### Endpoints the frontend is written against

```
POST   /auth/login            POST   /auth/register        POST /auth/forgot-password
GET    /auth/me               POST   /auth/logout          PUT  /auth/me
GET    /documents             GET    /documents/:id        PUT  /documents/:id
DELETE /documents/:id         POST   /documents/upload     POST /documents/:id/reprocess
POST   /documents/move        POST   /documents/bulk-delete
GET    /documents/facets      GET    /documents/:id/file
POST   /search
GET    /chat/conversations    POST   /chat                 GET  /chat/tools
GET    /chat/conversations/:id/messages
GET    /categories            POST   /categories           PUT  /categories/:id
DELETE /categories/:id
GET    /processing            GET    /processing/stats     GET  /processing/events
POST   /processing/:id/retry  POST   /processing/:id/cancel
GET    /settings              PUT    /settings             GET  /settings/sessions
GET    /dashboard/overview    GET    /notifications
```

## Structure

```
src/
  api/           service layer — one module per resource, mock ⇄ HTTP behind one flag
  components/
    ui/          Radix-based primitives (button, dialog, select, …)
    common/      cross-cutting pieces (empty/error/loading states, pagination, badges)
    layout/      app shell: sidebar, header, auth layout, navigation config
    dashboard/ documents/ upload/ processing/ search/ chat/ categories/ settings/
  data/          realistic mock dataset (documents, categories, jobs, chat, settings)
  hooks/         useAsync, useDocuments, useChat, useDebouncedValue, useMediaQuery
  lib/           config (env), utilities (formatting, cn)
  pages/         one file per route, lazily loaded
  providers/     auth and settings context
  routes/        router and route guards
  types/         the domain model
```

## Design

A dark, technical surface built on a warm near-black (`#100C08` family) with a
restrained burgundy accent (`#95122C`). Tokens live in `src/index.css` under
`@theme`; components reference semantic names (`surface`, `border`,
`primary`, `muted-foreground`) rather than raw hex.

The chart palette is stepped for the dark surface and validated for
colour-vision-deficiency separation and 3:1 contrast; charts always carry a
legend and direct labels so identity is never colour-alone.

Every page ships loading, empty, error and success states. Tables become cards
below `md`, filters move into a drawer, and the sidebar becomes a drawer.

## Known limitations (backend not built yet)

- **No real files.** Documents are metadata records; the viewer shows a
  placeholder page and download is a toast. `GET /documents/:id/file` is where a
  signed URL will come from, and the viewer surface is where PDF.js will mount.
- **No OCR, classification, extraction, embeddings or LLM.** Pipeline progress,
  extracted fields, confidences and assistant answers are fabricated by
  `src/api/` and `src/data/`.
- **Search is not semantic.** `src/api/search.ts` approximates query
  interpretation with regular expressions and scores results lexically; the real
  implementation is pgvector similarity plus an LLM query planner.
- **MCP is represented, not implemented.** The AI tools panel describes the tool
  surface the backend will expose; the frontend never executes a tool.
- **Authentication is a mock.** Tokens are fabricated strings in
  `localStorage`/`sessionStorage`. Do not mistake it for a security boundary.
- **Mutations live in memory.** Uploads, deletes and renames persist only until
  the tab reloads.
