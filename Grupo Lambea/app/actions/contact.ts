'use server'

import { z } from 'zod'

// Validación del formulario de contacto. Email vía regex para no depender de la
// API de zod (que cambió entre v3/v4); honeypot anti-spam en `empresa_web`.
const ContactSchema = z.object({
  nombre: z.string().trim().min(2, 'Indica tu nombre.').max(120),
  email: z
    .string()
    .trim()
    .max(200)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email no válido.'),
  telefono: z.string().trim().max(40).optional(),
  asunto: z.string().trim().min(1, 'Selecciona un asunto.').max(60),
  mensaje: z.string().trim().min(10, 'El mensaje es demasiado corto.').max(4000),
})

export type ContactResult =
  | { ok: true }
  | { ok: false; reason: 'validation' | 'no-config' | 'error'; message?: string }

const ASUNTO_LABEL: Record<string, string> = {
  consulta: 'Consulta sobre un producto',
  pedido: 'Consulta sobre un pedido',
  presupuesto: 'Solicitar presupuesto',
  distribucion: 'Información distribución',
  otro: 'Otro',
}

export async function sendContactMessage(formData: FormData): Promise<ContactResult> {
  // Honeypot: si el campo oculto trae contenido, es un bot → descartar silenciosamente.
  if (String(formData.get('empresa_web') ?? '').trim()) {
    return { ok: true }
  }
  // Consentimiento RGPD obligatorio.
  if (formData.get('consentimiento') !== 'on') {
    return { ok: false, reason: 'validation', message: 'Debes aceptar la política de privacidad.' }
  }

  const parsed = ContactSchema.safeParse({
    nombre: formData.get('nombre'),
    email: formData.get('email'),
    telefono: formData.get('telefono') ?? '',
    asunto: formData.get('asunto'),
    mensaje: formData.get('mensaje'),
  })
  if (!parsed.success) {
    return { ok: false, reason: 'validation', message: parsed.error.issues[0]?.message }
  }

  // Credenciales SIEMPRE desde el entorno (nunca hardcodeadas).
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL // p.ej. "Grupo Lambea <web@grupolambea.com>"
  const to = process.env.CONTACT_TO_EMAIL || 'francisco@grupolambea.com'

  // Resend aún no está configurado (falta API key o dirección remitente con dominio
  // verificado). Devolvemos 'no-config' para que el formulario ofrezca el contacto
  // directo en vez de fingir un envío que no ocurre.
  if (!apiKey || !from) {
    return { ok: false, reason: 'no-config' }
  }

  const { nombre, email, telefono, asunto, mensaje } = parsed.data
  const asuntoLabel = ASUNTO_LABEL[asunto] ?? asunto

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: email,
        subject: `[Web] ${asuntoLabel} — ${nombre}`,
        text: [
          `Asunto: ${asuntoLabel}`,
          `Nombre: ${nombre}`,
          `Email: ${email}`,
          `Teléfono: ${telefono || '—'}`,
          '',
          mensaje,
        ].join('\n'),
      }),
    })
    if (!res.ok) return { ok: false, reason: 'error' }
    return { ok: true }
  } catch {
    return { ok: false, reason: 'error' }
  }
}
