'use server'

import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/db'
import { SEO_SUGGESTIONS } from '@/lib/seo-suggestions'

// Feedback del cliente sobre las sugerencias SEO mostradas en /seo-inventario.
// Tabla temporal: cuando se cierre la revisión del SEO se puede borrar junto con
// la página. El estado se persiste en Neon para que el cliente y Adrià vean lo
// mismo al abrir la misma URL.

export type SeoEstado = 'pendiente' | 'aprobado' | 'rechazado'
const ESTADOS: SeoEstado[] = ['pendiente', 'aprobado', 'rechazado']

async function ensureTable() {
  await sql`CREATE TABLE IF NOT EXISTS seo_review (
    slug        TEXT PRIMARY KEY,
    estado      TEXT NOT NULL DEFAULT 'pendiente',
    comentario  TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )`
}

/** Guarda la decisión (aprobado/rechazado/pendiente) y el comentario de un producto. */
export async function saveSeoReview(slug: string, estado: SeoEstado, comentario: string) {
  // Solo aceptamos slugs que existen en las sugerencias y estados válidos.
  if (!SEO_SUGGESTIONS[slug]) return { ok: false, error: 'slug desconocido' }
  if (!ESTADOS.includes(estado)) return { ok: false, error: 'estado inválido' }
  const texto = comentario.trim().slice(0, 2000) || null

  await ensureTable()
  await sql`
    INSERT INTO seo_review (slug, estado, comentario, updated_at)
    VALUES (${slug}, ${estado}, ${texto}, now())
    ON CONFLICT (slug) DO UPDATE
      SET estado = EXCLUDED.estado, comentario = EXCLUDED.comentario, updated_at = now()
  `
  revalidatePath('/seo-inventario')
  return { ok: true }
}
