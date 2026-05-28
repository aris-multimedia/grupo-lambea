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
  ficha_tecnica_url?: string | null;
  hoja_seguridad_url?: string | null;
}

// Neon returns DECIMAL columns as strings — coerce to numbers
function coerce(row: Record<string, unknown>): Product {
  return {
    ...row,
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
  const rows = await sql`
    SELECT * FROM products
    WHERE familia = ANY(${priority}) AND publicado = true
    ORDER BY bestseller DESC
    LIMIT 6
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
    imagen_url: r.imagen_url ? String(r.imagen_url) : null,
    orden: Number(r.orden),
  }));
}
