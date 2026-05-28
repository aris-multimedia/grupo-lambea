# Grupo Lambea — Next.js 15 Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js 15 App Router site for Grupo Lambea that replicates the static HTML prototype with a product listing (`/tienda`), product detail pages (`/tienda/[slug]`), and a cart page (`/carrito`) with 3x2 promo logic, all passing `npm run build`.

**Architecture:** Static-first Next.js 15 app with App Router — all pages are Server Components using `generateStaticParams` for product detail routes. Product data is read directly from `data/productos.json` at build time via a lib helper. Cart state lives in `localStorage` via a `'use client'` context provider.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Lucide React, `next/font` (Lora + Inter), `next/image`.

---

## File Map

```
web/                                 ← new Next.js app (sibling to demo/)
├── app/
│   ├── layout.tsx                   ← root layout: fonts, CartProvider, SiteHeader, SiteFooter
│   ├── page.tsx                     ← home: hero, promo banner, featured products, categories
│   ├── tienda/
│   │   ├── page.tsx                 ← product listing grid with category filter
│   │   └── [slug]/
│   │       └── page.tsx             ← product detail + add-to-cart
│   └── carrito/
│       └── page.tsx                 ← cart with 3x2 promo logic
├── components/
│   ├── SiteHeader.tsx               ← sticky nav + cart icon (client)
│   ├── SiteFooter.tsx               ← footer links + contact
│   ├── ProductCard.tsx              ← card used in /tienda and home featured
│   ├── AddToCartButton.tsx          ← 'use client' button for product detail
│   ├── CartProvider.tsx             ← 'use client' context + localStorage
│   └── PromoBar.tsx                 ← amber 3x2 promo banner (server component)
├── lib/
│   ├── products.ts                  ← reads productos.json, generates slugs, exports typed helpers
│   └── cart.ts                      ← pure cart math: 3x2 discount, totals
├── types/
│   └── product.ts                   ← TypeScript interfaces for Familia, CartItem
├── public/
│   └── (symlink or copy assets from ../assets/)
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Task 1: Scaffold Next.js 15 App

**Files:**
- Create: `web/` (entire Next.js project)
- Modify: `/Users/adria/Projects/Grupolambea/vercel.json`

- [ ] **Step 1: Run create-next-app**

Run from `/Users/adria/Projects/Grupolambea/`:
```bash
npx create-next-app@latest web \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*" \
  --no-turbopack
```
Answer all interactive prompts with defaults if any remain.

Expected: `web/` directory created with `app/`, `components/`, `public/`, `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`.

- [ ] **Step 2: Verify it builds clean**

```bash
cd /Users/adria/Projects/Grupolambea/web && npm run build
```
Expected: Build succeeds with no errors (default Next.js starter).

- [ ] **Step 3: Update vercel.json to point at the new app**

Replace `/Users/adria/Projects/Grupolambea/vercel.json` contents with:
```json
{
  "outputDirectory": "demo",
  "builds": [
    { "src": "web/package.json", "use": "@vercel/next" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "web/$1" }
  ]
}
```
Note: For now `demo/` still deploys. We'll switch once the Next.js build is solid (Task 11).

- [ ] **Step 4: Commit**

```bash
cd /Users/adria/Projects/Grupolambea && git add web/ vercel.json && git commit -m "feat: scaffold Next.js 15 app in web/"
```

---

## Task 2: Types and Product Data Helper

**Files:**
- Create: `web/types/product.ts`
- Create: `web/lib/products.ts`

- [ ] **Step 1: Create product types**

Create `/Users/adria/Projects/Grupolambea/web/types/product.ts`:
```ts
export type Aplicacion = 'nautico' | 'caravaning' | 'industrial';

export interface FamiliaProducto {
  familia: string;
  descripcion_corta: string;
  descripcion_larga?: string;
  usos?: string[];
  aplicaciones: Aplicacion[];
  formatos?: string[];
  precio_desde: number;
  precio_hasta?: number;
  valoracion?: number | null;
  num_valoraciones?: number;
  codigo_toxicologia?: string;
  caracteristicas?: string[];
  instrucciones_uso?: string;
  urls: {
    nautico?: string;
    caravaning?: string;
    generico?: string;
  };
  // Derived fields added by lib/products.ts
  slug?: string;
  imagen?: string;
}

export interface CartItem {
  slug: string;
  familia: string;
  aplicacion: Aplicacion | 'generico';
  formato: string;
  precio: number;
  imagen: string;
  cantidad: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'cantidad'>) => void;
  removeItem: (slug: string, aplicacion: string, formato: string) => void;
  updateQty: (slug: string, aplicacion: string, formato: string, delta: number) => void;
  clearCart: () => void;
}
```

- [ ] **Step 2: Create products lib**

Create `/Users/adria/Projects/Grupolambea/web/lib/products.ts`:
```ts
import data from '../../data/productos.json';
import type { FamiliaProducto } from '@/types/product';

// Map familia name → image filename in /assets/productos/
const IMAGE_MAP: Record<string, string> = {
  DESOXILAM: '/assets/productos/desoxilam.jpg',
  'INYECLAM DIESEL': '/assets/productos/inyeclam-diesel.jpg',
  'INYECLAM GASOLINA': '/assets/productos/inyeclam-gasolina.jpg',
  MOTORLAM: '/assets/productos/motorlam-nautico.jpg',
  FOSSLAM: '/assets/productos/fosslam.jpg',
  TAPILAM: '/assets/productos/tapilam-caravaning.jpg',
  'PASTA ROSA SUPERBRILLO': '/assets/productos/pasta-pulir.jpg',
  'PASTA VERDE SUPERBRILLO': '/assets/productos/pasta-pulir.jpg',
  'PULIMENTO SUPERBRILLO': '/assets/productos/pasta-pulir.jpg',
};
const DEFAULT_IMAGE = '/assets/productos/prod-nautico-01.jpg';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9-]/g, '');
}

const raw = (data as { familias_producto: FamiliaProducto[] }).familias_producto;

export const products: FamiliaProducto[] = raw.map((p) => ({
  ...p,
  slug: toSlug(p.familia),
  imagen: IMAGE_MAP[p.familia] ?? DEFAULT_IMAGE,
}));

export function getProduct(slug: string): FamiliaProducto | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeatured(): FamiliaProducto[] {
  // Bestsellers first, then products with ratings
  const priority = ['DESOXILAM', 'INYECLAM DIESEL', 'MOTORLAM', 'FOSSLAM', 'TAPILAM', 'MANZALAM'];
  return priority
    .map((name) => products.find((p) => p.familia === name))
    .filter(Boolean) as FamiliaProducto[];
}

export function getByAplicacion(aplicacion: string): FamiliaProducto[] {
  return products.filter((p) => p.aplicaciones.includes(aplicacion as 'nautico'));
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/adria/Projects/Grupolambea/web && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/adria/Projects/Grupolambea && git add web/types/ web/lib/products.ts && git commit -m "feat: product types and data helper lib"
```

---

## Task 3: Cart Logic (Pure Functions)

**Files:**
- Create: `web/lib/cart.ts`

- [ ] **Step 1: Create cart math helpers**

Create `/Users/adria/Projects/Grupolambea/web/lib/cart.ts`:
```ts
import type { CartItem } from '@/types/product';

/** Returns total units for a given familia slug across all items */
export function unitsForFamilia(items: CartItem[], slug: string): number {
  return items
    .filter((i) => i.slug === slug)
    .reduce((sum, i) => sum + i.cantidad, 0);
}

/** How many free units does this familia earn under 3x2? (floor(n/3)) */
export function freeUnitsFor(items: CartItem[], slug: string): number {
  return Math.floor(unitsForFamilia(items, slug) / 3);
}

/**
 * Total discount for a single familia.
 * We give away the cheapest unit(s) for free.
 */
export function discountForFamilia(items: CartItem[], slug: string): number {
  const familiaItems = items.filter((i) => i.slug === slug);
  const freeCount = freeUnitsFor(items, slug);
  if (freeCount === 0) return 0;

  // Flatten units sorted cheapest first
  const units: number[] = [];
  for (const item of familiaItems) {
    for (let i = 0; i < item.cantidad; i++) {
      units.push(item.precio);
    }
  }
  units.sort((a, b) => a - b);
  return units.slice(0, freeCount).reduce((s, p) => s + p, 0);
}

export function subtotal(items: CartItem[]): number {
  return items.reduce((s, i) => s + i.precio * i.cantidad, 0);
}

export function totalDiscount(items: CartItem[]): number {
  const slugs = [...new Set(items.map((i) => i.slug))];
  return slugs.reduce((s, slug) => s + discountForFamilia(items, slug), 0);
}

export function total(items: CartItem[]): number {
  return subtotal(items) - totalDiscount(items);
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/adria/Projects/Grupolambea/web && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/adria/Projects/Grupolambea && git add web/lib/cart.ts && git commit -m "feat: 3x2 cart math helpers"
```

---

## Task 4: Design Tokens, Fonts, and Global CSS

**Files:**
- Modify: `web/app/globals.css`
- Modify: `web/tailwind.config.ts`

- [ ] **Step 1: Copy assets into web/public**

The Next.js app needs images under `public/`. Create a symlink so it resolves to the existing assets folder:
```bash
mkdir -p /Users/adria/Projects/Grupolambea/web/public
cp -r /Users/adria/Projects/Grupolambea/assets /Users/adria/Projects/Grupolambea/web/public/assets
cp -r /Users/adria/Projects/Grupolambea/demo/logo-grupolambea-nuevo.png /Users/adria/Projects/Grupolambea/web/public/logo.png
```

- [ ] **Step 2: Update globals.css with design tokens**

Replace the entire contents of `/Users/adria/Projects/Grupolambea/web/app/globals.css` with:
```css
@import "tailwindcss";

:root {
  --blue: #1E92D8;
  --blue-dark: #1370A8;
  --blue-deep: #0E5784;
  --blue-soft: #EAF4FB;
  --ink: #1A1F2A;
  --ink-700: #3A4250;
  --ink-500: #6B7480;
  --line: rgba(26, 31, 42, 0.08);
  --line-soft: rgba(26, 31, 42, 0.04);
  --bg: #FFFFFF;
  --bg-soft: #F7F9FB;
  --warning: #E8A93C;
  --success: #4A7C59;
  --r-sm: 8px;
  --r-md: 14px;
  --r-lg: 20px;
  --r-xl: 28px;
  --r-pill: 100px;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--ink);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
img { max-width: 100%; display: block; }
h1, h2, h3, h4 { letter-spacing: -0.01em; }
:focus-visible { outline: 3px solid var(--blue); outline-offset: 3px; border-radius: 3px; }
```

- [ ] **Step 3: Extend Tailwind config with brand colors**

Replace `/Users/adria/Projects/Grupolambea/web/tailwind.config.ts` with:
```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          DEFAULT: '#1E92D8',
          dark: '#1370A8',
          deep: '#0E5784',
          soft: '#EAF4FB',
        },
        ink: {
          DEFAULT: '#1A1F2A',
          700: '#3A4250',
          500: '#6B7480',
        },
        warning: '#E8A93C',
        success: '#4A7C59',
        bg: {
          DEFAULT: '#FFFFFF',
          soft: '#F7F9FB',
        },
      },
      fontFamily: {
        heading: ['var(--font-lora)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '20px',
        xl: '28px',
        pill: '100px',
      },
    },
  },
};
export default config;
```

- [ ] **Step 4: Verify build still works**

```bash
cd /Users/adria/Projects/Grupolambea/web && npm run build
```
Expected: Build passes.

- [ ] **Step 5: Commit**

```bash
cd /Users/adria/Projects/Grupolambea && git add web/app/globals.css web/tailwind.config.ts web/public/ && git commit -m "feat: design tokens, Tailwind config, copy assets to public"
```

---

## Task 5: Root Layout (Fonts + Header + Footer)

**Files:**
- Create: `web/components/SiteHeader.tsx`
- Create: `web/components/SiteFooter.tsx`
- Create: `web/components/CartProvider.tsx`
- Modify: `web/app/layout.tsx`

- [ ] **Step 1: Create CartProvider**

Create `/Users/adria/Projects/Grupolambea/web/components/CartProvider.tsx`:
```tsx
'use client';

import { createContext, useContext, useEffect, useReducer } from 'react';
import type { CartItem, CartState } from '@/types/product';

type Action =
  | { type: 'ADD'; item: Omit<CartItem, 'cantidad'> }
  | { type: 'REMOVE'; slug: string; aplicacion: string; formato: string }
  | { type: 'UPDATE_QTY'; slug: string; aplicacion: string; formato: string; delta: number }
  | { type: 'CLEAR' }
  | { type: 'LOAD'; items: CartItem[] };

function cartKey(slug: string, aplicacion: string, formato: string) {
  return `${slug}|${aplicacion}|${formato}`;
}

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'LOAD':
      return action.items;
    case 'ADD': {
      const key = cartKey(action.item.slug, action.item.aplicacion, action.item.formato);
      const existing = state.find(
        (i) => cartKey(i.slug, i.aplicacion, i.formato) === key
      );
      if (existing) {
        return state.map((i) =>
          cartKey(i.slug, i.aplicacion, i.formato) === key
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...state, { ...action.item, cantidad: 1 }];
    }
    case 'REMOVE':
      return state.filter(
        (i) => cartKey(i.slug, i.aplicacion, i.formato) !== cartKey(action.slug, action.aplicacion, action.formato)
      );
    case 'UPDATE_QTY': {
      const key = cartKey(action.slug, action.aplicacion, action.formato);
      return state
        .map((i) =>
          cartKey(i.slug, i.aplicacion, i.formato) === key
            ? { ...i, cantidad: Math.max(0, i.cantidad + action.delta) }
            : i
        )
        .filter((i) => i.cantidad > 0);
    }
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

const CartContext = createContext<CartState>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  clearCart: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lambea-cart');
      if (saved) dispatch({ type: 'LOAD', items: JSON.parse(saved) });
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('lambea-cart', JSON.stringify(items));
  }, [items]);

  const value: CartState = {
    items,
    addItem: (item) => dispatch({ type: 'ADD', item }),
    removeItem: (slug, aplicacion, formato) =>
      dispatch({ type: 'REMOVE', slug, aplicacion, formato }),
    updateQty: (slug, aplicacion, formato, delta) =>
      dispatch({ type: 'UPDATE_QTY', slug, aplicacion, formato, delta }),
    clearCart: () => dispatch({ type: 'CLEAR' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
```

- [ ] **Step 2: Create SiteHeader**

Create `/Users/adria/Projects/Grupolambea/web/components/SiteHeader.tsx`:
```tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Phone, Mail, Package } from 'lucide-react';
import { useCart } from './CartProvider';
import { total } from '@/lib/cart';

export function SiteHeader() {
  const { items } = useCart();
  const itemCount = items.reduce((s, i) => s + i.cantidad, 0);
  const cartTotal = total(items);

  return (
    <>
      {/* Top bar */}
      <div className="bg-[var(--blue-deep)] text-white text-[13px] py-[9px]">
        <div className="max-w-[1320px] mx-auto px-8 flex justify-between items-center gap-6">
          <div className="flex gap-5 items-center">
            <a href="tel:+34637916345" className="flex items-center gap-1.5 opacity-90 hover:opacity-100 no-underline text-white">
              <Phone size={13} strokeWidth={2.2} />
              637 916 345
            </a>
            <a href="mailto:francisco@grupolambea.com" className="flex items-center gap-1.5 opacity-90 hover:opacity-100 no-underline text-white">
              <Mail size={13} strokeWidth={2.2} />
              francisco@grupolambea.com
            </a>
          </div>
          <div className="flex-1 text-center">
            <Link href="/tienda" className="text-white/88 no-underline text-[12px] tracking-wide">
              <strong className="text-[#B3DEF2]">OFERTA 3×2</strong> — ¡Compra 3 unidades de cualquier producto y te regalamos 1!
            </Link>
          </div>
          <div className="flex gap-5 items-center">
            <span className="flex items-center gap-1.5 opacity-90 text-white">
              <Package size={13} strokeWidth={2.2} />
              Envío gratis Peninsula
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-white/96 backdrop-blur-[12px] border-b border-[var(--line)] sticky top-0 z-50">
        <div className="max-w-[1320px] mx-auto px-8 py-[18px] flex items-center justify-between gap-8">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <Image src="/logo.png" alt="Grupo Lambea" width={160} height={56} className="h-14 w-auto" priority />
          </Link>

          <nav className="flex items-center gap-0">
            {[
              ['Inicio', '/'],
              ['Tienda', '/tienda'],
              ['Náutico', '/tienda?cat=nautico'],
              ['Caravaning', '/tienda?cat=caravaning'],
              ['Industrial', '/tienda?cat=industrial'],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-[var(--ink-700)] no-underline text-[14px] font-semibold px-[18px] py-3 transition-colors hover:text-[var(--blue)] rounded-sm"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/carrito"
              className="flex items-center gap-2 bg-[var(--blue)] text-white no-underline px-5 py-2.5 rounded-pill font-semibold text-[14px] transition-colors hover:bg-[var(--blue-dark)]"
            >
              <ShoppingCart size={16} />
              Cesta
              {itemCount > 0 && (
                <span className="bg-white/25 px-2 py-0.5 rounded-pill text-[12px] font-bold">
                  {itemCount}
                </span>
              )}
              {cartTotal > 0 && (
                <span className="text-[13px] opacity-90">{cartTotal.toFixed(2)} €</span>
              )}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
```

- [ ] **Step 3: Create SiteFooter**

Create `/Users/adria/Projects/Grupolambea/web/components/SiteFooter.tsx`:
```tsx
import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="bg-[var(--blue-deep)] text-white mt-20">
      <div className="max-w-[1320px] mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <h3 className="font-heading text-2xl font-semibold mb-3">Grupo Lambea</h3>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            Empresa familiar fundada en 1952. Fabricamos productos de limpieza y mantenimiento profesional para náutica, caravaning e industria.
          </p>
          <p className="text-white/50 text-xs mt-4">© {new Date().getFullYear()} Grupo Lambea. Todos los derechos reservados.</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-widest text-white/60 mb-4">Tienda</h4>
          <ul className="space-y-2 text-sm">
            {[
              ['Todos los productos', '/tienda'],
              ['Náutico', '/tienda?cat=nautico'],
              ['Caravaning', '/tienda?cat=caravaning'],
              ['Industrial', '/tienda?cat=industrial'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-white/70 hover:text-white no-underline transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-widest text-white/60 mb-4">Contacto</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>WhatsApp: <a href="tel:+34637916345" className="text-white hover:text-white/80">+34 637 916 345</a></li>
            <li><a href="mailto:francisco@grupolambea.com" className="text-white hover:text-white/80">francisco@grupolambea.com</a></li>
            <li>Calle Caserna 48, Sant Jaume d&apos;Enveja</li>
            <li>43877 Tarragona</li>
            <li className="pt-2 text-white/50 text-xs">Urgencias toxicológicas: 915 620 420</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Update root layout**

Replace `/Users/adria/Projects/Grupolambea/web/app/layout.tsx` with:
```tsx
import type { Metadata } from 'next';
import { Lora, Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Grupo Lambea — Productos profesionales de limpieza y mantenimiento',
  description:
    'Empresa familiar fundada en 1952. Productos de limpieza especializados para náutica, caravaning e industria. 3×2 en todo el catálogo.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${lora.variable}`}>
      <body className="font-body">
        <CartProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Build**

```bash
cd /Users/adria/Projects/Grupolambea/web && npm run build
```
Expected: Build passes (Lucide might need to be installed — if it errors with "Cannot find module 'lucide-react'", run `npm install lucide-react` first).

Install if needed:
```bash
cd /Users/adria/Projects/Grupolambea/web && npm install lucide-react
```

- [ ] **Step 6: Commit**

```bash
cd /Users/adria/Projects/Grupolambea && git add web/ && git commit -m "feat: root layout with fonts, CartProvider, SiteHeader, SiteFooter"
```

---

## Task 6: ProductCard Component

**Files:**
- Create: `web/components/ProductCard.tsx`

- [ ] **Step 1: Create ProductCard**

Create `/Users/adria/Projects/Grupolambea/web/components/ProductCard.tsx`:
```tsx
import Link from 'next/link';
import Image from 'next/image';
import { Star, Tag } from 'lucide-react';
import type { FamiliaProducto } from '@/types/product';

interface Props {
  product: FamiliaProducto;
}

const APP_LABELS: Record<string, string> = {
  nautico: 'Náutico',
  caravaning: 'Caravaning',
  industrial: 'Industrial',
};

export function ProductCard({ product }: Props) {
  const { slug, familia, descripcion_corta, imagen, precio_desde, precio_hasta, aplicaciones, valoracion } = product;

  return (
    <Link
      href={`/tienda/${slug}`}
      className="group block bg-white rounded-xl border border-[var(--line)] overflow-hidden no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-[var(--blue-soft)]"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-[var(--bg-soft)] overflow-hidden">
        <Image
          src={imagen ?? '/assets/productos/prod-nautico-01.jpg'}
          alt={familia}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* 3x2 badge */}
        <span className="absolute top-3 left-3 bg-[var(--warning)] text-[var(--ink)] text-[10px] font-extrabold tracking-wide px-2.5 py-1 rounded-pill uppercase">
          3×2
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Aplicaciones */}
        <div className="flex gap-1.5 flex-wrap mb-2">
          {aplicaciones.slice(0, 3).map((a) => (
            <span
              key={a}
              className="text-[11px] font-semibold uppercase tracking-wide text-[var(--blue)] bg-[var(--blue-soft)] px-2 py-0.5 rounded-sm"
            >
              {APP_LABELS[a] ?? a}
            </span>
          ))}
        </div>

        <h3 className="font-heading font-medium text-[17px] text-[var(--ink)] mb-1 leading-tight">
          {familia}
        </h3>
        <p className="text-[var(--ink-500)] text-[13px] leading-snug line-clamp-2 mb-3">
          {descripcion_corta}
        </p>

        {/* Rating */}
        {valoracion && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={13} fill="#E8A93C" className="text-[var(--warning)]" />
            <span className="text-[13px] font-semibold text-[var(--ink)]">{valoracion.toFixed(1)}</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-auto">
          <span className="text-[20px] font-bold text-[var(--ink)]">
            {precio_desde > 0 ? `${precio_desde.toFixed(2)} €` : 'Consultar'}
          </span>
          {precio_hasta && precio_hasta !== precio_desde && (
            <span className="text-[13px] text-[var(--ink-500)]">— {precio_hasta.toFixed(2)} €</span>
          )}
        </div>
        <p className="text-[11px] text-[var(--ink-500)] mt-0.5 flex items-center gap-1">
          <Tag size={11} />
          Precio con IVA incluido
        </p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/adria/Projects/Grupolambea/web && npm run build
```
Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
cd /Users/adria/Projects/Grupolambea && git add web/components/ProductCard.tsx && git commit -m "feat: ProductCard component"
```

---

## Task 7: Home Page

**Files:**
- Modify: `web/app/page.tsx`
- Create: `web/components/PromoBar.tsx`

- [ ] **Step 1: Create PromoBar**

Create `/Users/adria/Projects/Grupolambea/web/components/PromoBar.tsx`:
```tsx
import Link from 'next/link';
import { Tag, Truck } from 'lucide-react';

export function PromoBar() {
  return (
    <div className="bg-[var(--warning)] text-[var(--ink)]">
      <div className="max-w-[1320px] mx-auto px-8 py-3 flex flex-wrap items-center justify-center gap-6 text-[14px] font-semibold">
        <span className="flex items-center gap-2">
          <Tag size={16} strokeWidth={2.2} />
          <strong>OFERTA 3×2 EN TODO EL CATÁLOGO</strong> — Compra 3 unidades y la más barata es gratis
        </span>
        <span className="flex items-center gap-2">
          <Truck size={16} strokeWidth={2.2} />
          Envío gratuito Peninsula
        </span>
        <Link
          href="/tienda"
          className="ml-2 bg-[var(--ink)] text-white no-underline px-4 py-1.5 rounded-pill text-[13px] font-bold hover:bg-[var(--ink-700)] transition-colors"
        >
          Ver todos los productos →
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace home page**

Replace `/Users/adria/Projects/Grupolambea/web/app/page.tsx` with:
```tsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Award, Droplets, Wrench } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { PromoBar } from '@/components/PromoBar';
import { getFeatured } from '@/lib/products';

export default function HomePage() {
  const featured = getFeatured();

  return (
    <>
      <PromoBar />

      {/* Hero */}
      <section className="relative bg-[var(--blue-deep)] text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/hero/foto-hero-autolam1.webp"
            alt="Productos náuticos Grupo Lambea"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
        <div className="relative max-w-[1320px] mx-auto px-8 py-28 flex flex-col gap-6 max-w-2xl">
          <span className="text-[var(--warning)] text-[12px] font-bold uppercase tracking-[0.2em]">
            Desde 1952 — Empresa familiar
          </span>
          <h1 className="font-heading text-5xl font-semibold leading-tight">
            Limpieza profesional para mar, tierra y fábrica
          </h1>
          <p className="text-white/80 text-lg max-w-lg">
            Productos fabricados en España para embarcaciones, caravanas y la industria. Fórmulas concentradas con décadas de mejora continua.
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <Link
              href="/tienda"
              className="no-underline bg-[var(--warning)] text-[var(--ink)] px-7 py-3.5 rounded-pill font-bold text-[15px] hover:brightness-105 transition-all flex items-center gap-2"
            >
              Ver catálogo completo
              <ArrowRight size={16} />
            </Link>
            <a
              href="https://wa.me/34637916345"
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline bg-white/10 border border-white/25 text-white px-7 py-3.5 rounded-pill font-semibold text-[15px] hover:bg-white/20 transition-all"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Category cards */}
      <section className="max-w-[1320px] mx-auto px-8 py-16">
        <h2 className="font-heading text-3xl text-[var(--ink)] mb-8 text-center">Nuestras líneas de producto</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Droplets size={32} className="text-[var(--blue)]" />,
              label: 'Náutico',
              desc: 'Para embarcaciones deportivas y mega yates. Gelcoat, desoxidantes, limpiadores de fibra.',
              href: '/tienda?cat=nautico',
              img: '/assets/categorias/foto-productos-barco.jpg',
            },
            {
              icon: <Award size={32} className="text-[var(--blue)]" />,
              label: 'Caravaning',
              desc: 'Cuidado completo para autocaravanas, caravanas y furgonetas camper.',
              href: '/tienda?cat=caravaning',
              img: '/assets/hero/foto-caravanas.jpg',
            },
            {
              icon: <Wrench size={32} className="text-[var(--blue)]" />,
              label: 'Industrial',
              desc: 'Soluciones de alto rendimiento para taller, fábrica y uso profesional intensivo.',
              href: '/tienda?cat=industrial',
              img: '/assets/hero/foto-empresa-mesa.jpg',
            },
          ].map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="group relative rounded-xl overflow-hidden no-underline h-52 flex items-end"
            >
              <Image src={cat.img} alt={cat.label} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="relative p-6 text-white">
                <p className="text-[12px] font-bold uppercase tracking-widest text-white/70 mb-1">Línea</p>
                <h3 className="font-heading text-2xl font-semibold">{cat.label}</h3>
                <p className="text-sm text-white/75 mt-1 line-clamp-2">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-[var(--bg-soft)] py-16">
        <div className="max-w-[1320px] mx-auto px-8">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-heading text-3xl text-[var(--ink)]">Más vendidos</h2>
            <Link href="/tienda" className="text-[var(--blue)] font-semibold text-[14px] no-underline hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Heritage band */}
      <section className="max-w-[1320px] mx-auto px-8 py-16 flex flex-col md:flex-row items-center gap-12">
        <div className="md:flex-1">
          <span className="text-[var(--blue)] text-[12px] font-bold uppercase tracking-[0.2em]">Desde 1952</span>
          <h2 className="font-heading text-4xl text-[var(--ink)] mt-2 mb-4">Una empresa familiar con historia</h2>
          <p className="text-[var(--ink-500)] leading-relaxed">
            Fundada por el Abuelo Lambea, la empresa nació en el sector metalúrgico español y evolucionó hacia la fabricación de embarcaciones deportivas y mega yates. Esta experiencia directa con los productos de limpieza nos llevó a fabricar nuestras propias fórmulas — más eficaces, más seguras y a mejor precio que las importadas.
          </p>
          <p className="text-[var(--ink-500)] leading-relaxed mt-3">
            Hoy, Francisco Lambea dirige una empresa con presencia en toda España, exportando el conocimiento de décadas a cada botella.
          </p>
        </div>
        <div className="md:flex-1 relative h-72 md:h-96 rounded-xl overflow-hidden w-full">
          <Image
            src="/assets/empresa/foto-empresa-mesa.jpg"
            alt="Grupo Lambea — empresa familiar"
            fill
            className="object-cover"
          />
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 3: Check image paths exist**

```bash
ls /Users/adria/Projects/Grupolambea/web/public/assets/hero/ 2>/dev/null || echo "missing"
ls /Users/adria/Projects/Grupolambea/web/public/assets/empresa/ 2>/dev/null || echo "missing empresa"
ls /Users/adria/Projects/Grupolambea/web/public/assets/categorias/ 2>/dev/null || echo "missing categorias"
```

If any `ls` returns "missing", the copy step from Task 4 didn't include those subdirs. Run:
```bash
cp -r /Users/adria/Projects/Grupolambea/demo/foto-hero-autolam1.webp /Users/adria/Projects/Grupolambea/web/public/assets/hero/ 2>/dev/null || true
cp -r /Users/adria/Projects/Grupolambea/demo/foto-empresa-mesa.jpg /Users/adria/Projects/Grupolambea/web/public/assets/empresa/ 2>/dev/null || true
cp -r /Users/adria/Projects/Grupolambea/demo/foto-productos-barco.jpg /Users/adria/Projects/Grupolambea/web/public/assets/categorias/ 2>/dev/null || true
cp -r /Users/adria/Projects/Grupolambea/demo/foto-caravanas.jpg /Users/adria/Projects/Grupolambea/web/public/assets/hero/ 2>/dev/null || true
```

Note: The `assets/` folder was copied from the repo root in Task 4. The demo/ images need explicit copying if they're missing.

- [ ] **Step 4: Add missing images to next.config.ts for unoptimized local images**

If `next/image` complains about domains, update `/Users/adria/Projects/Grupolambea/web/next.config.ts`:
```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
```
(All images should be local `/public/` paths so no remote config is needed.)

- [ ] **Step 5: Build**

```bash
cd /Users/adria/Projects/Grupolambea/web && npm run build
```
Expected: Build passes.

- [ ] **Step 6: Commit**

```bash
cd /Users/adria/Projects/Grupolambea && git add web/ && git commit -m "feat: home page with hero, categories, featured products"
```

---

## Task 8: Product Listing Page (/tienda)

**Files:**
- Create: `web/app/tienda/page.tsx`

- [ ] **Step 1: Create tienda page**

Create `/Users/adria/Projects/Grupolambea/web/app/tienda/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { ProductCard } from '@/components/ProductCard';
import { products, getByAplicacion } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Tienda — Grupo Lambea',
  description: 'Catálogo completo de productos de limpieza profesional. Náutico, caravaning e industrial. Oferta 3×2 en todo el catálogo.',
};

const CATS = [
  { id: '', label: 'Todos' },
  { id: 'nautico', label: 'Náutico' },
  { id: 'caravaning', label: 'Caravaning' },
  { id: 'industrial', label: 'Industrial' },
];

interface Props {
  searchParams: Promise<{ cat?: string }>;
}

export default async function TiendaPage({ searchParams }: Props) {
  const { cat } = await searchParams;
  const list = cat ? getByAplicacion(cat) : products;

  return (
    <div className="max-w-[1320px] mx-auto px-8 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-4xl text-[var(--ink)] mb-2">Catálogo de productos</h1>
        <p className="text-[var(--ink-500)]">
          {list.length} productos — <span className="text-[var(--warning)] font-semibold">3×2 en toda la tienda</span>
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {CATS.map((c) => {
          const active = (cat ?? '') === c.id;
          return (
            <a
              key={c.id}
              href={c.id ? `/tienda?cat=${c.id}` : '/tienda'}
              className={`no-underline px-5 py-2 rounded-pill text-[14px] font-semibold transition-colors ${
                active
                  ? 'bg-[var(--blue)] text-white'
                  : 'bg-[var(--bg-soft)] text-[var(--ink-700)] hover:bg-[var(--blue-soft)] hover:text-[var(--blue)]'
              }`}
            >
              {c.label}
            </a>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {list.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>

      {list.length === 0 && (
        <div className="text-center py-24 text-[var(--ink-500)]">
          No hay productos en esta categoría.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build**

```bash
cd /Users/adria/Projects/Grupolambea/web && npm run build
```
Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
cd /Users/adria/Projects/Grupolambea && git add web/app/tienda/page.tsx && git commit -m "feat: /tienda product listing page with category filter"
```

---

## Task 9: Product Detail Page (/tienda/[slug])

**Files:**
- Create: `web/app/tienda/[slug]/page.tsx`
- Create: `web/components/AddToCartButton.tsx`

- [ ] **Step 1: Create AddToCartButton**

Create `/Users/adria/Projects/Grupolambea/web/components/AddToCartButton.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from './CartProvider';
import type { FamiliaProducto, Aplicacion } from '@/types/product';

interface Props {
  product: FamiliaProducto;
}

const APP_LABELS: Record<string, string> = {
  nautico: 'Náutico',
  caravaning: 'Caravaning',
  industrial: 'Industrial',
  generico: 'Genérico',
};

export function AddToCartButton({ product }: Props) {
  const { addItem } = useCart();
  const [selectedApp, setSelectedApp] = useState<Aplicacion | 'generico'>(
    product.aplicaciones[0] ?? 'generico'
  );
  const [selectedFormato, setSelectedFormato] = useState(product.formatos?.[0] ?? '');
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      slug: product.slug!,
      familia: product.familia,
      aplicacion: selectedApp,
      formato: selectedFormato,
      precio: product.precio_desde,
      imagen: product.imagen!,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Aplicacion selector */}
      {product.aplicaciones.length > 1 && (
        <div>
          <label className="block text-[13px] font-semibold text-[var(--ink-700)] mb-2">Variante</label>
          <div className="flex gap-2 flex-wrap">
            {product.aplicaciones.map((a) => (
              <button
                key={a}
                onClick={() => setSelectedApp(a)}
                className={`px-4 py-2 rounded-pill text-[13px] font-semibold transition-colors ${
                  selectedApp === a
                    ? 'bg-[var(--blue)] text-white'
                    : 'bg-[var(--bg-soft)] text-[var(--ink-700)] border border-[var(--line)] hover:border-[var(--blue)]'
                }`}
              >
                {APP_LABELS[a]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Format selector */}
      {product.formatos && product.formatos.length > 1 && (
        <div>
          <label className="block text-[13px] font-semibold text-[var(--ink-700)] mb-2">Formato</label>
          <div className="flex gap-2 flex-wrap">
            {product.formatos.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFormato(f)}
                className={`px-4 py-2 rounded-pill text-[13px] font-semibold transition-colors ${
                  selectedFormato === f
                    ? 'bg-[var(--blue)] text-white'
                    : 'bg-[var(--bg-soft)] text-[var(--ink-700)] border border-[var(--line)] hover:border-[var(--blue)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add to cart */}
      <button
        onClick={handleAdd}
        className={`flex items-center justify-center gap-2 px-8 py-4 rounded-pill font-bold text-[15px] transition-all ${
          added
            ? 'bg-[var(--success)] text-white'
            : 'bg-[var(--blue)] text-white hover:bg-[var(--blue-dark)]'
        }`}
      >
        {added ? <Check size={18} /> : <ShoppingCart size={18} />}
        {added ? '¡Añadido!' : 'Añadir a la cesta'}
      </button>

      <p className="text-[12px] text-[var(--ink-500)] text-center">
        🏷 <strong className="text-[var(--warning)]">3×2</strong> activo — compra 3 y la más barata es gratis
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create product detail page**

Create `/Users/adria/Projects/Grupolambea/web/app/tienda/[slug]/page.tsx`:
```tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, CheckCircle, ChevronRight, AlertTriangle } from 'lucide-react';
import { getProduct, products } from '@/lib/products';
import { AddToCartButton } from '@/components/AddToCartButton';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products
    .filter((p) => p.slug)
    .map((p) => ({ slug: p.slug! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: 'Producto no encontrado' };
  return {
    title: `${product.familia} — Grupo Lambea`,
    description: product.descripcion_corta,
  };
}

const APP_LABELS: Record<string, string> = {
  nautico: 'Náutico',
  caravaning: 'Caravaning',
  industrial: 'Industrial',
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <div className="max-w-[1320px] mx-auto px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] text-[var(--ink-500)] mb-8">
        <Link href="/" className="hover:text-[var(--ink)] no-underline">Inicio</Link>
        <ChevronRight size={13} />
        <Link href="/tienda" className="hover:text-[var(--ink)] no-underline">Tienda</Link>
        <ChevronRight size={13} />
        <span className="text-[var(--ink)] font-medium">{product.familia}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-[var(--bg-soft)]">
          <Image
            src={product.imagen ?? '/assets/productos/prod-nautico-01.jpg'}
            alt={product.familia}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <span className="absolute top-4 left-4 bg-[var(--warning)] text-[var(--ink)] text-[11px] font-extrabold tracking-wide px-3 py-1.5 rounded-pill uppercase">
            3×2 Activo
          </span>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Aplicaciones */}
          <div className="flex gap-2 flex-wrap">
            {product.aplicaciones.map((a) => (
              <span key={a} className="text-[11px] font-bold uppercase tracking-widest text-[var(--blue)] bg-[var(--blue-soft)] px-3 py-1 rounded-sm">
                {APP_LABELS[a] ?? a}
              </span>
            ))}
          </div>

          <h1 className="font-heading text-4xl text-[var(--ink)] leading-tight">{product.familia}</h1>

          {/* Rating */}
          {product.valoracion && (
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  fill={s <= Math.round(product.valoracion!) ? '#E8A93C' : 'transparent'}
                  className={s <= Math.round(product.valoracion!) ? 'text-[var(--warning)]' : 'text-[var(--line)]'}
                />
              ))}
              <span className="text-[14px] font-semibold text-[var(--ink)]">{product.valoracion.toFixed(1)}</span>
              {product.num_valoraciones && (
                <span className="text-[13px] text-[var(--ink-500)]">({product.num_valoraciones} valoraciones)</span>
              )}
            </div>
          )}

          <p className="text-[var(--ink-500)] leading-relaxed">
            {product.descripcion_larga ?? product.descripcion_corta}
          </p>

          {/* Price */}
          <div className="bg-[var(--bg-soft)] rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-[13px] text-[var(--ink-500)] mb-1">Precio desde</p>
              <p className="text-3xl font-bold text-[var(--ink)]">
                {product.precio_desde > 0 ? `${product.precio_desde.toFixed(2)} €` : 'Consultar'}
              </p>
              <p className="text-[12px] text-[var(--ink-500)] mt-0.5">IVA incluido · Envío gratis Peninsula</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-[var(--ink-700)] font-semibold uppercase tracking-wide">Con 3×2</p>
              {product.precio_desde > 0 && (
                <p className="text-[20px] font-bold text-[var(--success)]">
                  {((product.precio_desde * 2) / 3).toFixed(2)} € /ud
                </p>
              )}
            </div>
          </div>

          <AddToCartButton product={product} />

          {/* Características */}
          {product.caracteristicas && product.caracteristicas.length > 0 && (
            <ul className="flex flex-col gap-2 mt-2">
              {product.caracteristicas.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-[14px] text-[var(--ink-700)]">
                  <CheckCircle size={16} className="text-[var(--success)] flex-shrink-0 mt-0.5" />
                  {c}
                </li>
              ))}
            </ul>
          )}

          {/* Usos */}
          {product.usos && product.usos.length > 0 && (
            <div>
              <h3 className="font-semibold text-[14px] text-[var(--ink)] mb-2">Usos principales</h3>
              <div className="flex flex-wrap gap-2">
                {product.usos.map((u, i) => (
                  <span key={i} className="bg-[var(--bg-soft)] text-[var(--ink-700)] text-[13px] px-3 py-1 rounded-sm border border-[var(--line)]">
                    {u}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Toxicología */}
          {product.codigo_toxicologia && (
            <div className="flex items-start gap-2 text-[13px] text-[var(--ink-500)] border border-[var(--line)] rounded-md p-3 bg-[var(--bg-soft)]">
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5 text-[var(--warning)]" />
              <span>
                Código toxicología: <strong>{product.codigo_toxicologia}</strong> · Urgencias: <a href="tel:915620420" className="text-[var(--blue)] no-underline hover:underline">915 620 420</a>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build**

```bash
cd /Users/adria/Projects/Grupolambea/web && npm run build
```
Expected: Build passes with all product slugs generated as static pages.

- [ ] **Step 4: Commit**

```bash
cd /Users/adria/Projects/Grupolambea && git add web/ && git commit -m "feat: product detail page /tienda/[slug] with AddToCartButton"
```

---

## Task 10: Cart Page (/carrito)

**Files:**
- Create: `web/app/carrito/page.tsx`
- Create: `web/components/CartPageClient.tsx`

The cart page must be a Server Component wrapper around a Client Component because it uses `useCart()` (client-side state).

- [ ] **Step 1: Create CartPageClient**

Create `/Users/adria/Projects/Grupolambea/web/components/CartPageClient.tsx`:
```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, Gift } from 'lucide-react';
import { useCart } from './CartProvider';
import {
  subtotal,
  totalDiscount,
  total,
  freeUnitsFor,
  unitsForFamilia,
} from '@/lib/cart';

export function CartPageClient() {
  const { items, updateQty, removeItem, clearCart } = useCart();
  const slugs = [...new Set(items.map((i) => i.slug))];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-5 text-center">
        <div className="w-20 h-20 bg-[var(--bg-soft)] rounded-full flex items-center justify-center text-[var(--ink-500)]">
          <ShoppingBag size={34} />
        </div>
        <h2 className="font-heading text-3xl text-[var(--ink)]">Tu cesta está vacía</h2>
        <p className="text-[var(--ink-500)] max-w-sm">
          Añade productos para ver la oferta 3×2 en acción.
        </p>
        <Link
          href="/tienda"
          className="no-underline bg-[var(--blue)] text-white px-7 py-3.5 rounded-pill font-bold hover:bg-[var(--blue-dark)] transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  const sub = subtotal(items);
  const disc = totalDiscount(items);
  const tot = total(items);

  return (
    <div className="max-w-[1320px] mx-auto px-8 py-12">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="font-heading text-4xl text-[var(--ink)]">
          Tu cesta{' '}
          <span className="text-[16px] font-normal text-[var(--ink-500)] font-body">
            {items.reduce((s, i) => s + i.cantidad, 0)} artículos
          </span>
        </h1>
        <button
          onClick={clearCart}
          className="text-[13px] text-[var(--ink-500)] hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <Trash2 size={14} /> Vaciar cesta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Items */}
        <div className="flex flex-col gap-4">
          {slugs.map((slug) => {
            const slugItems = items.filter((i) => i.slug === slug);
            const units = unitsForFamilia(items, slug);
            const freeUnits = freeUnitsFor(items, slug);
            const promoActive = freeUnits > 0;

            return (
              <div
                key={slug}
                className={`bg-white rounded-[22px] overflow-hidden border-2 transition-colors ${
                  promoActive ? 'border-[rgba(232,169,60,0.45)]' : 'border-[var(--line)]'
                }`}
              >
                {slugItems.map((item) => (
                  <div
                    key={`${item.slug}-${item.aplicacion}-${item.formato}`}
                    className="grid grid-cols-[90px_1fr_auto_auto] gap-5 items-center px-6 py-5"
                  >
                    <div className="w-[90px] h-[90px] rounded-md overflow-hidden bg-[var(--bg-soft)] border border-[var(--line)] flex-shrink-0">
                      <Image src={item.imagen} alt={item.familia} width={90} height={90} className="w-full h-full object-cover" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-heading text-[17px] font-medium text-[var(--ink)] mb-0.5">{item.familia}</h3>
                      <p className="text-[13px] text-[var(--ink-500)]">
                        {item.aplicacion !== 'generico' ? `${item.aplicacion} · ` : ''}{item.formato}
                      </p>
                      <p className="text-[13px] text-[var(--ink-700)] font-medium mt-1">{item.precio.toFixed(2)} € /ud</p>
                    </div>

                    {/* Qty */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-1 border border-[var(--line)] rounded-pill">
                        <button
                          onClick={() => updateQty(item.slug, item.aplicacion, item.formato, -1)}
                          className="w-8 h-8 flex items-center justify-center text-[var(--ink-500)] hover:text-[var(--ink)] rounded-full"
                          aria-label="Decrementar"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-7 text-center text-[15px] font-semibold text-[var(--ink)]">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => updateQty(item.slug, item.aplicacion, item.formato, +1)}
                          className="w-8 h-8 flex items-center justify-center text-[var(--ink-500)] hover:text-[var(--ink)] rounded-full"
                          aria-label="Incrementar"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal + remove */}
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[17px] font-bold text-[var(--ink)]">
                        {(item.precio * item.cantidad).toFixed(2)} €
                      </span>
                      <button
                        onClick={() => removeItem(item.slug, item.aplicacion, item.formato)}
                        className="text-[var(--ink-500)] hover:text-red-500 transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Promo status strip */}
                <div className={`px-6 py-2.5 text-[13px] font-medium flex items-center gap-2 ${
                  promoActive
                    ? 'bg-[rgba(232,169,60,0.08)] border-t border-[rgba(232,169,60,0.18)] text-[#7a5200]'
                    : 'bg-[var(--bg-soft)] border-t border-[var(--line)] text-[var(--ink-500)]'
                }`}>
                  {promoActive ? (
                    <>
                      <Gift size={14} className="text-[var(--warning)]" />
                      <span>¡3×2 activo! {freeUnits} {freeUnits === 1 ? 'unidad gratis' : 'unidades gratis'} ({units} en cesta)</span>
                      <span className="ml-auto font-bold text-[var(--warning)] bg-[var(--warning)] text-[var(--ink)] text-[10px] px-2 py-0.5 rounded-pill uppercase font-extrabold">
                        3×2
                      </span>
                    </>
                  ) : (
                    <>
                      <span>{units}/3 unidades</span>
                      <div className="flex gap-1 ml-1">
                        {[1, 2, 3].map((n) => (
                          <span
                            key={n}
                            className={`w-2 h-2 rounded-full ${n <= units ? 'bg-[var(--blue)]' : 'bg-[var(--line)]'}`}
                          />
                        ))}
                      </div>
                      <span className="ml-1 text-[var(--blue)]">— añade {3 - (units % 3)} más para el 3×2</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="bg-white border-2 border-[rgba(232,169,60,0.4)] rounded-[22px] p-6 sticky top-24">
          <h2 className="font-heading text-xl text-[var(--ink)] mb-5">Resumen del pedido</h2>
          <div className="flex flex-col gap-3 text-[14px]">
            <div className="flex justify-between text-[var(--ink-700)]">
              <span>Subtotal</span>
              <span>{sub.toFixed(2)} €</span>
            </div>
            {disc > 0 && (
              <div className="flex justify-between text-[var(--success)] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Gift size={14} />
                  Descuento 3×2
                </span>
                <span>-{disc.toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between text-[var(--ink-700)]">
              <span>Envío</span>
              <span className="text-[var(--success)] font-semibold">Gratis</span>
            </div>
            <div className="border-t border-[var(--line)] pt-3 flex justify-between text-[var(--ink)] font-bold text-[18px]">
              <span>Total</span>
              <span>{tot.toFixed(2)} €</span>
            </div>
          </div>

          <a
            href={`https://wa.me/34637916345?text=${encodeURIComponent(`Hola Francisco, quiero hacer un pedido:\n\n${items.map((i) => `• ${i.cantidad}x ${i.familia} (${i.aplicacion}) ${i.formato} — ${(i.precio * i.cantidad).toFixed(2)}€`).join('\n')}\n\nTotal (con 3×2): ${tot.toFixed(2)}€`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-center gap-2 w-full bg-[#25D366] text-white no-underline py-4 rounded-pill font-bold text-[15px] hover:brightness-105 transition-all"
          >
            Pedir por WhatsApp
          </a>
          <p className="text-[12px] text-[var(--ink-500)] text-center mt-3">
            Precios con IVA · Envío gratis Peninsula · Baleares aprox. 4€
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create cart page (Server Component wrapper)**

Create `/Users/adria/Projects/Grupolambea/web/app/carrito/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { CartPageClient } from '@/components/CartPageClient';

export const metadata: Metadata = {
  title: 'Tu cesta — Grupo Lambea',
};

export default function CarritoPage() {
  return <CartPageClient />;
}
```

- [ ] **Step 3: Build**

```bash
cd /Users/adria/Projects/Grupolambea/web && npm run build
```
Expected: Build passes.

- [ ] **Step 4: Commit**

```bash
cd /Users/adria/Projects/Grupolambea && git add web/ && git commit -m "feat: /carrito page with 3x2 promo logic and WhatsApp checkout"
```

---

## Task 11: Final Build Cleanup

**Goal:** Fix any remaining TypeScript errors, ESLint warnings, or missing assets that block `npm run build`.

- [ ] **Step 1: Check for TypeScript errors**

```bash
cd /Users/adria/Projects/Grupolambea/web && npx tsc --noEmit 2>&1 | head -50
```

- [ ] **Step 2: Check for ESLint errors**

```bash
cd /Users/adria/Projects/Grupolambea/web && npm run lint 2>&1 | head -50
```

- [ ] **Step 3: Run full build and capture output**

```bash
cd /Users/adria/Projects/Grupolambea/web && npm run build 2>&1 | tail -30
```

- [ ] **Step 4: Fix any image warnings**

If `next/image` warns about missing `sizes` or unoptimized images: all images in this project are local so no domain config is needed. If there are warnings about specific sizes, add the `sizes` prop to the offending `<Image>` components.

If build errors about missing image files: run
```bash
ls /Users/adria/Projects/Grupolambea/web/public/assets/
```
And re-run the copy command from Task 4 Step 1 for any missing subdirectory.

- [ ] **Step 5: Fix any "use client" boundary issues**

If build errors mention "async client component" or "cannot use hooks in server component", check:
- `CartPageClient.tsx` has `'use client'` at top ✓
- `CartProvider.tsx` has `'use client'` at top ✓
- `AddToCartButton.tsx` has `'use client'` at top ✓
- `SiteHeader.tsx` has `'use client'` at top ✓

None of the `app/*/page.tsx` files use hooks — they're server components.

- [ ] **Step 6: Confirm clean build**

```bash
cd /Users/adria/Projects/Grupolambea/web && npm run build
```
Expected output ends with:
```
✓ Compiled successfully
Route (app)           Size     First Load JS
...
```

- [ ] **Step 7: Update vercel.json to deploy Next.js app**

Replace `/Users/adria/Projects/Grupolambea/vercel.json` with:
```json
{
  "buildCommand": "cd web && npm run build",
  "outputDirectory": "web/.next",
  "installCommand": "cd web && npm install",
  "framework": "nextjs",
  "rootDirectory": "web"
}
```

- [ ] **Step 8: Commit**

```bash
cd /Users/adria/Projects/Grupolambea && git add web/ vercel.json && git commit -m "feat: complete Next.js rebuild — all pages passing build"
```

---

## Common Gotchas

1. **`import data from '../../data/productos.json'`** — TypeScript needs `"resolveJsonModule": true` in `tsconfig.json`. The default Next.js tsconfig already has this, but verify:
   ```json
   { "compilerOptions": { "resolveJsonModule": true } }
   ```

2. **Image paths** — All images must live under `web/public/`. The `src` prop of `next/image` is relative to `public/`, so `src="/assets/productos/desoxilam.jpg"` maps to `web/public/assets/productos/desoxilam.jpg`.

3. **`searchParams` is async in Next.js 15** — The `TiendaPage` component correctly `await`s `searchParams`. Do not destructure it synchronously.

4. **Lucide tree-shaking** — Import icons individually (`import { ShoppingCart } from 'lucide-react'`), not as namespace imports. This is done correctly throughout the plan.

5. **`'use client'` components cannot be async** — All async work (data fetching) stays in server components (`page.tsx`). Client components receive data via props.
