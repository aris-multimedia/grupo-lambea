import 'server-only'
import { sql } from './db'

export type Estado = 'aprobado' | 'mejorar' | 'rehacer'

export interface Feedback {
  slug: string
  estado: Estado | null
  comentario: string | null
  updated_at: Date
}

export async function getAllFeedback(): Promise<Map<string, Feedback>> {
  const rows = await sql`
    SELECT slug, estado, comentario, updated_at
    FROM image_feedback_v3
  ` as Array<Record<string, unknown>>
  const map = new Map<string, Feedback>()
  for (const r of rows) {
    map.set(String(r.slug), {
      slug: String(r.slug),
      estado: r.estado ? (r.estado as Estado) : null,
      comentario: r.comentario ? String(r.comentario) : null,
      updated_at: new Date(String(r.updated_at)),
    })
  }
  return map
}

export async function saveFeedback(
  slug: string,
  estado: Estado | null,
  comentario: string | null,
): Promise<void> {
  await sql`
    INSERT INTO image_feedback_v3 (slug, estado, comentario, updated_at)
    VALUES (${slug}, ${estado}, ${comentario}, NOW())
    ON CONFLICT (slug)
    DO UPDATE SET
      estado = EXCLUDED.estado,
      comentario = EXCLUDED.comentario,
      updated_at = NOW()
  `
}
