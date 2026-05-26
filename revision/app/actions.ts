'use server'

import { saveFeedback, type Estado } from '@/lib/feedback'

const ESTADOS_VALIDOS: Estado[] = ['aprobado', 'mejorar', 'rehacer']

function validateClientToken(token: string): boolean {
  const expected = process.env.CLIENT_TOKEN
  if (!expected) throw new Error('CLIENT_TOKEN no configurado')
  return token === expected
}

interface SaveInput {
  token: string
  slug: string
  estado: Estado | null
  comentario: string
}

export async function saveFeedbackAction(input: SaveInput): Promise<{ ok: boolean; error?: string }> {
  if (!validateClientToken(input.token)) {
    return { ok: false, error: 'Token inválido' }
  }
  if (!input.slug || typeof input.slug !== 'string' || input.slug.length > 100) {
    return { ok: false, error: 'Slug inválido' }
  }
  if (input.estado !== null && !ESTADOS_VALIDOS.includes(input.estado)) {
    return { ok: false, error: 'Estado inválido' }
  }
  const comentario = input.comentario.slice(0, 2000).trim() || null
  try {
    await saveFeedback(input.slug, input.estado, comentario)
    return { ok: true }
  } catch (err) {
    console.error('saveFeedback error', err)
    return { ok: false, error: 'Error al guardar' }
  }
}
