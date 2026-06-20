import { sql } from './db'
import type { Product } from './products'

// Aplica las traducciones de product_translations a productos ya cargados (que
// vienen en español, la base). Se llama en la PÁGINA (dinámica por idioma), no
// dentro de las funciones cacheadas de lib/products.ts. Fallback a es por campo:
// si una traducción está vacía, se conserva el español.
//
// No traduce `familia`/`nombre` (nombres de marca/producto) ni precios/imágenes.

type Row = {
  product_id: number
  descripcion_corta: string | null
  descripcion_larga: string | null
  instrucciones_uso: string | null
  usos: string[] | null
  caracteristicas: string[] | null
  seo_title: string | null
  seo_description: string | null
}

const pick = <T,>(t: T | null | undefined, base: T): T =>
  t == null || (typeof t === 'string' && t.trim() === '') ? base : t

const pickArr = (t: string[] | null | undefined, base: string[]): string[] =>
  t && t.length > 0 ? t : base

export async function localizeProducts(products: Product[], locale: string): Promise<Product[]> {
  if (!products.length || !locale || locale === 'es') return products
  let rows: Row[] = []
  try {
    const ids = products.map((p) => p.id)
    rows = (await sql`
      SELECT product_id, descripcion_corta, descripcion_larga, instrucciones_uso,
             usos, caracteristicas, seo_title, seo_description
      FROM product_translations
      WHERE locale = ${locale} AND product_id = ANY(${ids})
    `) as Row[]
  } catch {
    return products // tabla aún no migrada → es base
  }
  const byId = new Map(rows.map((r) => [r.product_id, r]))
  return products.map((p) => {
    const tr = byId.get(p.id)
    if (!tr) return p
    return {
      ...p,
      descripcion_corta: pick(tr.descripcion_corta, p.descripcion_corta),
      descripcion_larga: pick(tr.descripcion_larga, p.descripcion_larga),
      instrucciones_uso: pick(tr.instrucciones_uso, p.instrucciones_uso),
      usos: pickArr(tr.usos, p.usos),
      caracteristicas: pickArr(tr.caracteristicas, p.caracteristicas),
      seo_title: pick(tr.seo_title, p.seo_title),
      seo_description: pick(tr.seo_description, p.seo_description),
    }
  })
}

export async function localizeProduct<T extends Product | null>(product: T, locale: string): Promise<T> {
  if (!product) return product
  const [out] = await localizeProducts([product], locale)
  return out as T
}
