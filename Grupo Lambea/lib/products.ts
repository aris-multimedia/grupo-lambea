import { cacheLife } from 'next/cache';
import { sql } from './db';

export interface Product {
  id: number;
  slug: string;
  familia: string;
  nombre: string;
  descripcion_corta: string | null;
  descripcion_larga: string | null;
  aplicaciones: string[];
  precio_desde: number | null;
  precio_hasta: number | null;
  formatos: string[];
  valoracion: number | null;
  num_valoraciones: number | null;
  codigo_toxicologia: string | null;
  instrucciones_uso: string | null;
  usos: string[];
  caracteristicas: string[];
  imagen: string | null;
  bestseller: boolean;
  publicado: boolean;
  promo_3x2: boolean;
  wc_id: number | null;
  seo_title: string | null;
  seo_description: string | null;
  ficha_tecnica_url?: string | null;
  hoja_seguridad_url?: string | null;
}

/**
 * Devuelve la URL de imagen solo si es servible por next/image:
 * host remoto configurado en next.config (grupolambea.com) o ruta local (/…).
 * Cualquier otra cosa (URL corrupta, host no permitido) → null, para que el
 * componente use su imagen de respaldo en vez de romper el render.
 */
function safeImage(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const url = value.trim();
  if (!url) return null;
  if (url.startsWith('/')) return url;                          // ruta local
  if (url.startsWith('https://grupolambea.com/')) return url;   // host permitido
  return null;
}

// Neon returns DECIMAL columns as strings — coerce to numbers
function coerce(row: Record<string, unknown>): Product {
  return {
    ...row,
    imagen:          safeImage(row.imagen),
    precio_desde:    row.precio_desde    != null ? Number(row.precio_desde)    : null,
    precio_hasta:    row.precio_hasta    != null ? Number(row.precio_hasta)    : null,
    valoracion:      row.valoracion      != null ? Number(row.valoracion)      : null,
    num_valoraciones:row.num_valoraciones!= null ? Number(row.num_valoraciones): null,
  } as Product;
}

export async function getAllProducts(): Promise<Product[]> {
  'use cache';
  cacheLife('hours');
  const rows = await sql`
    SELECT p.*,
      (SELECT url FROM product_documents
       WHERE product_id = p.id AND tipo = 'ficha_tecnica' AND idioma = 'es' LIMIT 1) AS ficha_tecnica_url,
      (SELECT url FROM product_documents
       WHERE product_id = p.id AND tipo = 'hoja_seguridad' AND idioma = 'es' LIMIT 1) AS hoja_seguridad_url
    FROM products p
    WHERE p.publicado = true
    ORDER BY p.familia, p.aplicaciones[1]
  `;
  return (rows as Record<string, unknown>[]).map(coerce);
}

export async function getProduct(slug: string): Promise<Product | null> {
  'use cache';
  cacheLife('hours');
  const rows = await sql`
    SELECT p.*,
      (SELECT url FROM product_documents
       WHERE product_id = p.id AND tipo = 'ficha_tecnica' AND idioma = 'es' LIMIT 1) AS ficha_tecnica_url,
      (SELECT url FROM product_documents
       WHERE product_id = p.id AND tipo = 'hoja_seguridad' AND idioma = 'es' LIMIT 1) AS hoja_seguridad_url
    FROM products p
    WHERE p.slug = ${slug} AND p.publicado = true
    LIMIT 1
  `;
  return rows[0] ? coerce(rows[0] as Record<string, unknown>) : null;
}

export async function getByAplicacion(aplicacion: string): Promise<Product[]> {
  'use cache';
  cacheLife('hours');
  const rows = await sql`
    SELECT * FROM products
    WHERE ${aplicacion} = ANY(aplicaciones) AND publicado = true
    ORDER BY bestseller DESC, familia
  `;
  return (rows as Record<string, unknown>[]).map(coerce);
}

export async function getFeatured(): Promise<Product[]> {
  'use cache';
  cacheLife('hours');
  const priority = ['DESOXILAM', 'INYECLAM DIESEL', 'MOTORLAM', 'FOSSLAM', 'TAPILAM', 'MANZALAM'];
  // DISTINCT ON (familia) garantiza un producto por familia ANTES de limitar,
  // así devolvemos hasta 6 familias distintas (la home corta a 4) en vez de
  // colapsar varias variantes de la misma familia.
  const rows = await sql`
    SELECT DISTINCT ON (familia) *
    FROM products
    WHERE familia = ANY(${priority}) AND publicado = true
    ORDER BY familia, bestseller DESC, id
  `;
  const products = (rows as Record<string, unknown>[]).map(coerce);
  const map = new Map(products.map(p => [p.familia, p]));
  return priority.map(f => map.get(f)).filter(Boolean) as Product[];
}

export async function getRelated(currentSlug: string, aplicaciones: string[]): Promise<Product[]> {
  'use cache';
  cacheLife('hours');
  const rows = await sql`
    SELECT id, slug, familia, nombre, descripcion_corta, imagen,
           precio_desde, precio_hasta, aplicaciones, bestseller,
           publicado, promo_3x2, formatos, valoracion, num_valoraciones,
           codigo_toxicologia, instrucciones_uso, usos, caracteristicas,
           wc_id, descripcion_larga
    FROM products
    WHERE slug != ${currentSlug} AND publicado = true
    ORDER BY
      CASE WHEN aplicaciones && ${aplicaciones} THEN 0 ELSE 1 END,
      bestseller DESC,
      familia
    LIMIT 4
  `;
  return (rows as Record<string, unknown>[]).map(coerce);
}

export async function getStaticSlugs(): Promise<{ slug: string }[]> {
  'use cache';
  cacheLife('days');
  const rows = await sql`SELECT slug FROM products WHERE publicado = true`;
  return rows as { slug: string }[];
}

export interface ProductVariant {
  id: number;
  formato: string;
  precio: number;
  imagen_url: string | null;
  orden: number;
}

export async function getProductVariants(productId: number): Promise<ProductVariant[]> {
  'use cache';
  cacheLife('hours');
  const rows = await sql`
    SELECT id, formato, precio, imagen_url, orden
    FROM product_variants
    WHERE product_id = ${productId}
    ORDER BY orden
  `;
  return (rows as Record<string, unknown>[]).map(r => ({
    id: Number(r.id),
    formato: String(r.formato),
    precio: Number(r.precio),
    imagen_url: safeImage(r.imagen_url),
    orden: Number(r.orden),
  }));
}

// ── RESEÑAS REALES (migradas de grupolambea.com / WooCommerce) ──────────────
export interface ProductReview {
  id: number;
  author: string;
  rating: number;
  texto: string | null;
  fecha_texto: string | null;
  fecha_iso: string | null;
}

/** Reseñas de una ficha: primero las que tienen texto, más recientes arriba. */
export async function getProductReviews(productId: number): Promise<ProductReview[]> {
  'use cache';
  cacheLife('hours');
  const rows = await sql`
    SELECT id, author, rating, texto, fecha_texto, fecha_iso
    FROM product_reviews
    WHERE product_id = ${productId}
    ORDER BY (texto IS NULL OR texto = '') ASC, fecha_iso DESC NULLS LAST, id
  `;
  return (rows as Record<string, unknown>[]).map(r => ({
    id: Number(r.id),
    author: String(r.author),
    rating: Number(r.rating),
    texto: r.texto ? String(r.texto) : null,
    fecha_texto: r.fecha_texto ? String(r.fecha_texto) : null,
    fecha_iso: r.fecha_iso ? String(r.fecha_iso) : null,
  }));
}

export interface ReviewStats { avg: number; count: number }

/** Estadística global real de reseñas (para la home). */
export async function getReviewStats(): Promise<ReviewStats> {
  'use cache';
  cacheLife('hours');
  // Solo cuenta reseñas de productos publicados (igual que getTopReviews),
  // para que la estadística de la home no incluya productos descatalogados.
  const rows = await sql`
    SELECT ROUND(AVG(r.rating)::numeric, 1) AS avg, COUNT(*)::int AS count
    FROM product_reviews r
    JOIN products p ON p.id = r.product_id
    WHERE p.publicado = true`;
  const row = rows[0] as { avg: string | null; count: number } | undefined;
  return { avg: row?.avg ? Number(row.avg) : 0, count: row?.count ?? 0 };
}

export interface TopReview {
  author: string;
  rating: number;
  texto: string;
  familia: string;
  aplicacion: string;
  slug: string;
}

/** Mejores reseñas reales (una por familia, con texto sustancioso) para testimonios de la home. */
export async function getTopReviews(limit = 3): Promise<TopReview[]> {
  'use cache';
  cacheLife('hours');
  const rows = await sql`
    SELECT DISTINCT ON (p.familia)
      r.author, r.rating, r.texto, p.familia, p.slug, p.aplicaciones[1] AS aplicacion
    FROM product_reviews r
    JOIN products p ON p.id = r.product_id
    WHERE p.publicado = true AND r.texto IS NOT NULL
      AND length(r.texto) >= 50 AND r.rating = 5
    ORDER BY p.familia, length(r.texto) DESC
  `;
  const mapped = (rows as Record<string, unknown>[]).map(r => ({
    author: String(r.author),
    rating: Number(r.rating),
    texto: String(r.texto),
    familia: String(r.familia),
    aplicacion: String(r.aplicacion ?? ''),
    slug: String(r.slug),
  }));
  mapped.sort((a, b) => b.texto.length - a.texto.length);
  return mapped.slice(0, limit);
}
