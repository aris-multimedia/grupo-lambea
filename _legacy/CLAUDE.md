# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **redesign project for [grupolambea.com](https://grupolambea.com)** — a Spanish family cleaning products company founded in 1952. The repo contains:
- A static HTML/CSS prototype in `demo/` (currently deployed to Vercel)
- A complete product catalog database in `catalogo-productos/`
- Structured product data in `data/productos.json`
- Analysis and proposal documents in `docs/`

## Running the Site

No build step. The `demo/` folder is served directly by Vercel (`vercel.json` → `outputDirectory: "demo"`).

To preview locally, open `demo/index.html` in a browser or run any static file server:
```
npx serve demo
```

## Architecture

### `demo/` — Static Prototype
Static HTML/CSS/JS files. Key files:
- `index.html` — Home page
- `grupo-lambea-home_final.html` — Latest home iteration
- `grupo-lambea-producto_final.html` — Latest product detail page
- `carrito.html` — Cart with 3x2 promo logic

Design tokens defined in CSS custom properties at the top of each HTML file:
- Blues: `--blue: #1E92D8`, `--blue-dark: #1370A8`, `--blue-deep: #0E5784`
- Amber accent: `--warning: #E8A93C` (used for 3x2 promo badge and cart border)
- Typography: Lora (headings) + Inter (body)
- Icons: Lucide (via `unpkg.com/lucide`)

### `data/productos.json` — Source of Truth
Structured product data: 18 product families, pricing, formats, URLs, toxicology codes, and multi-category variants. This is the canonical reference for all product information.

### `catalogo-productos/` — Product Catalog (Markdown)
51 product fiches organized in 5 folders:

| Folder | Category | Products |
|--------|----------|----------|
| `01-limpieza-barcos/` | Náutico | 18 |
| `02-limpieza-caravanas/` | Caravaning | 15 |
| `03-industriales/` | Industrial | 15 |
| `04-anticaidas-hipica/` | Hípica | 1 |
| `05-discos-abrasivos/` | Abrasivos | 2 |

Each product folder has `ficha-producto.md` (full spec, pricing, images, safety) and `imagenes/` (downloaded product images). PDF fichas técnicas download to each product folder as `ficha-tecnica.pdf`.

**Key product logic:** Most products exist in 3 variants (náutico / caravaning / industrial) with separate URLs but shared formulas. Cross-references use relative paths (`../../02-limpieza-caravanas/...`).

### `assets/` — Media
Organized by type: `logo/`, `hero/`, `productos/`, `categorias/`, `empresa/`, `hipica/`, `fondos/`, `promo/`.

## Business Context

- **Active promo:** 3x2 on everything — must be visually prominent (amber badge `#E8A93C`)
- **Pricing:** All prices include IVA. Shipping: free Peninsula, €4 Baleares
- **Contact:** WhatsApp +34 637 916 345 / francisco@grupolambea.com
- **Toxicology emergencies:** 915 620 420 (required on product pages)
- **Bestsellers:** DESOXILAM and INYECLAM DIESEL

## Proposed Next.js Rebuild (Phase 2)

Per `docs/analisis-propuesta.md`, the planned stack is:
- **Next.js 15** (App Router) + **Tailwind CSS** + **shadcn/ui**
- **Sanity.io** as CMS (client manages products via visual interface)
- **Vercel** for deployment
- URL structure: `/tienda/[slug]` (clean slugs, not WooCommerce's 150-char URLs)
- Schema markup (Product JSON-LD) for Google rich results
