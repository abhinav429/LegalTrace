# LegalTrace

**LegalTrace** is a retrieval-augmented generation (RAG) application for legal-style documents. Ingest text or PDFs with structured metadata, run filtered semantic search backed by **pgvector**, and chat with answers **grounded in retrieved chunks**—including citations, confidence, and an informational disclaimer.

Ship a production build to [Vercel](https://vercel.com) or run it locally. Built with Next.js 15, PostgreSQL + pgvector, Prisma, the Vercel AI SDK, and OpenAI embeddings and chat.

---

## Features

- **Unified workspace** — Ingest, Sources, search, and chat at `/workspace` (Sources lists each ingest and can remove all chunks for that ingest).
- **Legal metadata** — Model document type (statute, case law, regulation), jurisdiction, court, year, act, section, citation, and source URL. Metadata drives ingest defaults and search filters.
- **Text and PDF ingestion** — Paste text or upload text-based PDFs (size and page limits enforced; image-only PDFs surface a clear error until OCR is added).
- **Semantic vector search** — Cosine similarity using OpenAI `text-embedding-3-small` embeddings stored in Postgres.
- **Structured chat answers** — Retrieval-aware prompts with sections for the answer, authorities cited, confidence, and a not-legal-advice disclaimer.

---

## Project structure

```
src/
├── app/
│   ├── (chat)/workspace/    # Main app UI
│   ├── api/
│   │   ├── chat/            # RAG chat
│   │   ├── ingest/          # JSON text ingest
│   │   ├── ingest/pdf/      # Multipart PDF ingest
│   │   ├── knowledge/       # List / delete sources by ingestion id
│   │   ├── search/          # Semantic + metadata filters
│   │   └── healthcheck/
│   ├── page.tsx             # Landing
│   └── layout.tsx
├── components/tabs/          # Ingest, sources, search, chat
├── lib/
│   ├── db/                   # pg + VectorDB
│   ├── legal-metadata.ts
│   └── pdf-extract.ts
prisma/                       # Schema & migrations
```

---

## Prerequisites

- **Node.js** 18.18+ (see `engines` in `package.json`).
- **PostgreSQL** with the **pgvector** extension (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), or Vercel Postgres).
- **OpenAI API key** (or an OpenAI-compatible endpoint via `OPENAI_BASE_URL`).

---

## Local setup

1. **Clone and install**

   ```bash
   git clone <your-repo-url>
   cd <project-folder>
   npm install --legacy-peer-deps
   ```

2. **Environment**

   ```bash
   cp .env.example .env
   ```

   Fill in at least:

   | Variable | Purpose |
   |----------|---------|
   | `POSTGRES_URL` / `DATABASE_URL` | Same Postgres connection string (used by Prisma and the app). |
   | `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, `PGDATABASE` | Same database, for the `pg` pool used in vector queries. |
   | `OPENAI_API_KEY` | Embeddings and chat. |

   Optional:

   - `NEXT_PUBLIC_APP_URL` — e.g. `http://localhost:3000` locally, or your production URL on Vercel (correct Open Graph / canonical URLs).
   - `OPENAI_BASE_URL` — compatible API base if not using OpenAI directly.

   Never commit real secrets: keep `.env` local only (see `.gitignore`).

3. **Database**

   Ensure pgvector is enabled (often `CREATE EXTENSION vector;` once). Apply Prisma migrations:

   ```bash
   npx prisma migrate deploy
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). The workspace lives at **`/workspace`**.

   The default dev server uses the stable Webpack compiler. For faster rebuilds you can use `npm run dev:turbo` (Turbopack); if you see missing `.next` manifest errors—common on iCloud-synced folders—stop the server, delete the `.next` directory, and run `npm run dev` again.

   If the UI looks completely unstyled (plain HTML), the compiled CSS likely failed to load: run **`rm -rf .next`**, reinstall if needed, then **`npm run dev`** again. The app also ships **inline shell CSS** in the root layout so the landing shell stays readable even when a CSS chunk 404s (you should still fix the underlying cache/deploy issue).

---

## Deploying on Vercel

1. Import the Git repository in [Vercel](https://vercel.com/new).
2. **Environment variables** — Mirror `.env.example` (database, `OPENAI_API_KEY`, and optionally `NEXT_PUBLIC_APP_URL` for your production domain).
3. **Build** — Default `npm run build`. Set **Install Command** to `npm install --legacy-peer-deps` if dependency resolution fails.
4. **Database** — Use hosted Postgres with pgvector; run `npx prisma migrate deploy` against production when you first connect.
5. **PDF ingestion** — Server-side extraction uses `pdf-parse`; `next.config.ts` lists `pdf-parse` / `pdfjs-dist` under `serverExternalPackages` for stable server bundles.
