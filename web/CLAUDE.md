# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Next.js version warning

This project uses **Next.js 16** — APIs, conventions, and file structure differ from training data. Before writing any code, read the relevant guide in `node_modules/next/dist/docs/`.

## Commands

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build
npm run lint    # ESLint
npm start       # production server
```

No test suite configured yet.

## Architecture

**Stack:** Next.js 16 App Router · React 19 · Tailwind CSS v4 · TypeScript · Neon (PostgreSQL) · Zod · jose + bcryptjs

### Data sources

Product data lives in two places:
- `data/productos.json` — static catalog (18 families, formats, pricing, image paths). Used for the public storefront.
- Neon DB via `lib/db.ts` — orders, admin-editable product overrides. Access via `sql` tag from `@neondatabase/serverless`. **DECIMAL columns come back as strings** — always parse with `parseFloat`.

### Auth

Admin-only JWT auth via `lib/session.ts` (jose HS256, 8h TTL, `admin_session` cookie). Uses `server-only` to prevent accidental client import. Route protection in `proxy.ts` (Next.js 16 uses `proxy.ts` instead of `middleware.ts`).

Env vars required: `DATABASE_URL`, `NEXTAUTH_SECRET`.

### Key patterns

- Server Components by default; add `'use client'` only where interactivity is required.
- `new Date()` in a `'use client'` component requires a `<Suspense>` boundary above it. `new Date()` in a Server Component requires reading dynamic data first (e.g. `cookies()`) or using `'use cache'`. When in doubt, wrap the client component in `<Suspense fallback={null}>`.
- Server Actions live in `app/actions/` (`auth.ts`, `orders.ts`, `products.ts`).
- Cart state is client-side only via `CartProvider` (React context + localStorage).

### Route structure

| Path | Notes |
|------|-------|
| `/` | Home — Server Component |
| `/tienda` | Product listing |
| `/tienda/[slug]` | Product detail; `AddToCartSection.tsx` is the client island |
| `/carrito` | Cart page |
| `/checkout` | Order form + Server Action |
| `/pedido-confirmado` | Post-order confirmation |
| `/contacto` | Contact form |
| `/admin/*` | Protected by proxy.ts; login at `/admin/login` |
