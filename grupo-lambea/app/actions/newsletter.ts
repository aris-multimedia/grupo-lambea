'use server'

import { sql } from '@/lib/db'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type NewsletterResult = { ok: true } | { ok: false; reason: 'invalid' | 'error' }

/**
 * Alta de suscriptor al newsletter. SOLO se llama cuando el usuario ha dado
 * consentimiento explícito (checkbox marcado). Guarda email + origen + fecha;
 * dedupe por email (ON CONFLICT). De aquí se exportan/sincronizan los contactos
 * a la herramienta de email marketing que se elija (Resend Audiences, Brevo…).
 */
export async function subscribeToNewsletter(email: string, source = 'web'): Promise<NewsletterResult> {
  const clean = (email || '').trim().toLowerCase()
  if (!clean || clean.length > 200 || !EMAIL_RE.test(clean)) {
    return { ok: false, reason: 'invalid' }
  }
  try {
    await sql`
      INSERT INTO newsletter_subscribers (email, consent, source)
      VALUES (${clean}, true, ${source})
      ON CONFLICT (email) DO NOTHING
    `
    return { ok: true }
  } catch {
    return { ok: false, reason: 'error' }
  }
}
