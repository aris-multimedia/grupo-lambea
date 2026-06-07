# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Next.js version warning

This project uses **Next.js 16.2.6** — APIs, conventions, and file structure differ from training data. Before writing any code, read the relevant guide in `node_modules/next/dist/docs/`. Notably: route protection lives in **`proxy.ts`** (not `middleware.ts`), and caching uses the **`'use cache'`** directive + `cacheLife`/`cacheTag` (not `unstable_cache`).

## Commands

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build
npm run lint    # ESLint
npm start       # production server
npx tsc --noEmit   # typecheck (no test suite configured)
```

**Dev server gotchas:**
- The repo has two `package-lock.json` files (`Grupolambea/` and `Grupolambea/web/`), so Next.js prints a "multiple lockfiles / inferred workspace root" warning. Harmless; the app root is `web/`.
- A separate **HIPICLAM** project lives alongside this one and is often running on port 3000. This app typically lands on **3001/3002**. Confirm the port from the `next dev` output before testing.

## Architecture

**Stack:** Next.js 16 App Router · React 19 · Tailwind CSS v4 · TypeScript · Neon (PostgreSQL, `@neondatabase/serverless`) · Zod · jose + bcryptjs · `@vercel/blob` + `sharp` (media uploads) · lucide-react.

### Data flow — Neon DB is the single source of truth

All product, order, review and settings data comes from **Neon Postgres** via the `sql` tagged-template from `lib/db.ts`. Access patterns:

- `lib/products.ts` — every product read (`getProduct`, `getAllProducts`, `getByAplicacion`, `getFeatured`, `getRelated`, `getProductVariants`, `getProductReviews`, `getReviewStats`, `getTopReviews`). All wrapped in `'use cache'` + `cacheLife('hours')`.
- `lib/settings.ts` — `getSettings()` (cached, `cacheTag(SETTINGS_TAG)`, public) vs `getSettingsRaw()` (uncached, admin form). Falls back to `DEFAULTS` if the `site_settings` table is missing.
- `lib/admin-stats.ts` — `getDashboardStats()` fires ~15 parallel queries; never cached.

**DECIMAL-as-string gotcha:** Neon returns `DECIMAL` columns as JS strings. `lib/products.ts` has a central `coerce()` helper that `Number()`s `precio_desde`/`precio_hasta`/`valoracion`/`num_valoraciones`, so product objects are safe. **Any new raw `sql\`\`` query elsewhere must coerce DECIMALs itself** or arithmetic silently breaks.

**Static files that are NOT runtime data (reference/seed only):**
- `data/productos.json` — legacy WooCommerce scrape. **Not read by the app.** Reference only.
- `lib/seed-reviews.json` — real WooCommerce reviews, seeded into `product_reviews`.
- `lib/schema.sql` + `lib/schema-variants.sql` — DDL + one-time seeding (products, product_variants, product_images, product_documents, product_reviews, orders, order_items, media, site_settings).

### Settings system (admin-editable CMS)

`lib/settings-schema.ts` is a pure module (no DB): a single `FIELDS` array drives everything (labels, help text, 4 groups: `contacto` / `envio` / `promo` / `empresa`), with a `DEFAULTS` object and `toNested()` to hydrate the nested `SiteSettings` shape from the flat `site_settings` key-value table. `phoneDigits()` normalizes phone numbers for `tel:+...` links — use it everywhere a phone link is rendered. Saving goes through `updateSettings` (Server Action), which upserts each field and invalidates `SETTINGS_TAG` so the public site reflects edits.

### Auth & admin

Admin-only JWT auth in `lib/session.ts` (jose HS256, 8h TTL, `admin_session` httpOnly cookie; `server-only` import guard). `proxy.ts` (matcher `/admin/:path*`) decrypts the cookie and redirects unauthenticated requests to `/admin/login?from=…`; only `/admin/login` bypasses the gate. Credentials are env-based (`ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH`, bcrypt-compared in `app/actions/auth.ts`).

Env vars required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`. (`GEMINI_API_KEY` is also present.)

### Cart, promo & checkout

- Cart is **client-only**: `CartProvider` (React context + `localStorage`). Keys: `lambea-cart`, `lambea-cookie-consent`. Item uniqueness key is `` `${slug}|${aplicacion}|${formato}` ``.
- **3×2 promo** is pure math in `lib/cart.ts` (`freeUnitsFor`/`discountForFamilia`: `floor(units/3)` free per family, cheapest units free). The **identical logic is re-run server-side** in `app/actions/orders.ts`.
- **Checkout never trusts browser prices.** Prices are re-queried from the DB (`priceCart` in `lib/checkout.ts`); items with no valid DB price are dropped. Order number format `YYYYMMDD-XXXX`.

### Pago (Stripe), ciclo de vida del pedido y facturación (Verifactu)

**Diseño completo en `docs/sistema-pedidos-facturacion.md`.** Resumen:
- **Pago con Stripe Checkout.** El pedido **NO se crea hasta pagar**: `createCheckoutSession` (`app/actions/orders.ts`) valida precios, guarda los datos en la tabla **`pending_checkouts`** y crea la Stripe Session. Al pagar, `confirmOrderBySession`/`convertPendingToOrder` (`lib/checkout.ts`) crea el pedido (idempotente). Webhook en `app/api/stripe/webhook`. Promo 3×2 = cupón Stripe. Claves en env (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`).
- **Estados del pedido** (`VALID_ESTADOS`): `nuevo → confirmado → enviado → entregado → completado` (+ `cancelado`/`reembolsado`). `applyStatusChange` sella `enviado_at`/`entregado_at`.
- **Facturación separada del pago (preparado para Verifactu).** La factura **solo se emite cuando `estado='completado'`** (entregado y aceptado), nunca al pagar. Campos `factura_solicitada`/`factura_estado`/`factura_numero`/`factura_url` en `orders`. Lógica + gating en **`lib/invoicing.ts`** (`canIssueInvoice`, `issueInvoiceForOrder`). El proveedor de facturación es **enchufable**: hoy `PendingProvider` (no emite); para integrar una herramienta Verifactu real, implementar un `InvoiceProvider` y devolverlo en `getInvoiceProvider()` según `INVOICING_PROVIDER`. Al completar un pedido se intenta emitir sola.
- `createOrder` (antiguo, sin Stripe) queda **sin uso**; lo reemplaza `createCheckoutSession`.

### SEO (migrated from WooCommerce — handle with care)

- `app/tienda/[slug]/page.tsx` `generateMetadata` preserves the old Yoast `seo_title`/`seo_description` (DB columns) **verbatim**, with a canonical URL and Product JSON-LD (incl. `aggregateRating` + up to 8 real reviews). Don't replace these with generic fallbacks.
- `next.config.ts` holds **~85 permanent 301 redirects** from old `/producto/*` and `/categoria-producto/*` URLs to the new `/tienda/*` routes — preserves link equity. `images.remotePatterns` allows `grupolambea.com` because **product images are still served from the old WordPress site** (not local).
- `/buscar` is `robots: { index: false }` to avoid thin-content dilution.

### Server Components & client islands

Server Components by default; `'use client'` only for interactivity. Key client islands: `ProductViewer` + `ProductTabs` (product page), `CartProvider`, `SiteHeader`, `BeforeAfterSlider`, `CookieBanner`, and the admin `*Client` components (`ProductListClient`, `PedidosListClient`, `AjustesForm`, `MediaGallery`).

`new Date()` in a `'use client'` component needs a `<Suspense>` boundary above it; in a Server Component it needs dynamic data read first (e.g. `cookies()`) or `'use cache'`. When in doubt, wrap the client component in `<Suspense fallback={null}>`.

### Before/after sliders

`app/tienda/[slug]/page.tsx` decides whether to show a comparison by checking, with `existsSync`, that both `public/assets/before-after/before/<slug>.png` and `.../after/<slug>.png` exist. Add a matching pair to enable the slider for a product. `components/BeforeAfterSlider.tsx` is pointer + keyboard driven (`role="slider"`).

### Styling

Tailwind CSS v4 with design tokens as CSS custom properties in `app/globals.css` (`--blue #1E92D8`, `--blue-deep #0E5784`, `--warning #E8A93C` for the 3×2 accent, radii `--r-sm…--r-xl`, fonts Lora + Inter). **Tailwind v4 shorthand `rounded-(--r-md)` / `text-(--ink)` is valid** (CSS-variable shorthand) — do not "fix" it to `[var(--…)]`. ESLint may warn the bracket form is non-canonical; those are warnings, not errors.

## Route structure

| Path | Notes |
|------|-------|
| `/` | Home — Server Component (hero, featured, before/after, reviews) |
| `/tienda` | Redirects to `/tienda/nautico` |
| `/tienda/nautico` · `/caravaning` · `/industrial` | Category pages via `CategoryPageLayout` |
| `/tienda/[slug]` | Product detail (SSG via `generateStaticParams`); client islands `ProductViewer` + `ProductTabs`; reviews section anchored at `#opiniones` |
| `/buscar?q=` | Search results (noindex) |
| `/carrito` · `/checkout` · `/pedido-confirmado` | Cart → order (`createOrder`) → confirmation |
| `/contacto` · `/nosotros` | Contact form + about |
| `/aviso-legal` · `/politica-privacidad` · `/cookies` · `/condiciones-contratacion` | Legal (noindex) |
| `/admin` | Dashboard (KPIs, content-health warnings, recent orders) |
| `/admin/productos` · `/productos/[slug]` · `/productos/nuevo` | Product CRUD |
| `/admin/pedidos` · `/pedidos/[id]` | Orders + status updates |
| `/admin/media` | Media library (Vercel Blob uploads via `/api/admin/upload`) |
| `/admin/ajustes` | Site settings form |
| `/admin/login` | Only unauthenticated `/admin` route |

Server Actions live in `app/actions/` (`auth.ts`, `orders.ts`, `products.ts`, `settings.ts`).

## Business context

Grupo Lambea (TECNICLAM 2016 S.L.) — family cleaning-products maker since 1952, Tarragona. ~40 active products across náutico / caravaning / industrial, most sold in multiple formats (variants). Active **3×2 promo** on everything (amber `#E8A93C`). Free shipping Península; Baleares surcharge; bestsellers DESOXILAM and INYECLAM DIESEL. Toxicology emergency line `915 620 420` must appear on product pages.
