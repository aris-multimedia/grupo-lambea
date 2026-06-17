import 'server-only'

type OrderEmailData = { numero: string; nombre: string; email: string; total: number }
type ShippedEmailData = { numero: string; nombre: string; email: string; trackingUrl?: string | null }

/** POST a la API de Resend; null si Resend no está configurado. Nunca lanza. */
async function sendViaResend(payload: Record<string, unknown>): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL
  if (!apiKey || !from) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, ...payload }),
    })
  } catch {
    // Silencioso: un fallo de email nunca debe romper el flujo del pedido.
  }
}

/**
 * Envía el email de confirmación de pedido vía Resend. La clave SIEMPRE desde
 * entorno. Si Resend no está configurado (sin RESEND_API_KEY / CONTACT_FROM_EMAIL)
 * hace un no-op silencioso: en cuanto se configure, los emails saldrán solos.
 * Nunca lanza: un fallo de email no debe romper la creación del pedido.
 */
export async function sendOrderConfirmationEmail(o: OrderEmailData): Promise<void> {
  if (!o.email) return
  const total = o.total.toFixed(2).replace('.', ',')
  await sendViaResend({
    to: o.email,
    subject: `Pedido confirmado · ${o.numero} — Grupo Lambea`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;color:#1A1F2A">
      <h2 style="color:#0E5784">¡Gracias por tu pedido, ${o.nombre}!</h2>
      <p>Hemos recibido tu pago correctamente.</p>
      <p><strong>Número de pedido:</strong> ${o.numero}<br>
      <strong>Total:</strong> ${total} €</p>
      <p>Te avisaremos cuando tu pedido se envíe. Si tienes cualquier duda, responde a este email.</p>
      <p style="color:#6B7480">— Grupo Lambea</p>
    </div>`,
  })
}

/** Aviso "tu pedido va de camino", con enlace de seguimiento si GENEI lo dio. */
export async function sendOrderShippedEmail(o: ShippedEmailData): Promise<void> {
  if (!o.email) return
  await sendViaResend({
    to: o.email,
    subject: `Tu pedido ${o.numero} va de camino — Grupo Lambea`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;color:#1A1F2A">
      <h2 style="color:#0E5784">¡Tu pedido está en marcha, ${o.nombre}!</h2>
      <p>Acabamos de entregar tu pedido <strong>${o.numero}</strong> a la agencia de transporte.</p>
      ${o.trackingUrl ? `<p><a href="${o.trackingUrl}" style="color:#1E92D8">Seguir el envío en tiempo real →</a></p>` : ''}
      <p>Si tienes cualquier duda, responde a este email.</p>
      <p style="color:#6B7480">— Grupo Lambea</p>
    </div>`,
  })
}

/** Acuse de recibo del formulario de contacto (feedback inmediato al visitante). */
export async function sendContactAckEmail(o: { nombre: string; email: string }): Promise<void> {
  if (!o.email) return
  await sendViaResend({
    to: o.email,
    subject: 'Hemos recibido tu mensaje — Grupo Lambea',
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;color:#1A1F2A">
      <h2 style="color:#0E5784">Gracias por escribirnos, ${o.nombre}</h2>
      <p>Hemos recibido tu mensaje y te responderemos en menos de 24 horas laborables.</p>
      <p style="color:#6B7480">— Grupo Lambea</p>
    </div>`,
  })
}
