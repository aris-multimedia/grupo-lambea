import 'server-only'

type OrderEmailData = { numero: string; nombre: string; email: string; total: number }

/**
 * Envía el email de confirmación de pedido vía Resend. La clave SIEMPRE desde
 * entorno. Si Resend no está configurado (sin RESEND_API_KEY / CONTACT_FROM_EMAIL)
 * hace un no-op silencioso: en cuanto se configure, los emails saldrán solos.
 * Nunca lanza: un fallo de email no debe romper la creación del pedido.
 */
export async function sendOrderConfirmationEmail(o: OrderEmailData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL
  if (!apiKey || !from || !o.email) return

  const total = o.total.toFixed(2).replace('.', ',')
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
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
      }),
    })
  } catch {
    // Silencioso: no romper el pedido por un fallo de email.
  }
}
