import 'server-only'

type OrderEmailData = { numero: string; nombre: string; email: string; total: number }
type ShippedEmailData = { numero: string; nombre: string; email: string; trackingUrl?: string | null }
type AdminOrderData = {
  numero: string
  nombre: string
  email: string
  telefono: string | null
  total: number
  direccion: string
  ciudad: string
  cp: string
  items: { nombre: string; formato: string; cantidad: number; precio: number }[]
}
type GiftCouponData = { nombre: string; email: string; codigo: string; pct: number; expira: string | null }

/** Escapa valores libres del cliente (nombre, dirección…) antes de meterlos en el HTML. */
function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

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

/**
 * Aviso de NUEVO PEDIDO al dueño/empresa, para gestionarlo con inmediatez.
 * Se envía a ORDER_NOTIFY_EMAIL (o, en su defecto, CONTACT_TO_EMAIL). No-op si
 * no hay destinatario configurado. Nunca lanza.
 *
 * NOTA: el cliente pidió además un "aviso telefónico" (SMS/WhatsApp). Eso
 * requiere una cuenta de proveedor (Twilio/Meta) y queda pendiente; este email
 * es el aviso inmediato que no necesita cuentas nuevas (reutiliza Resend).
 */
export async function sendNewOrderAdminEmail(o: AdminOrderData): Promise<void> {
  const to = process.env.ORDER_NOTIFY_EMAIL || process.env.CONTACT_TO_EMAIL
  if (!to) return
  const total = o.total.toFixed(2).replace('.', ',')
  const filas = o.items
    .map(
      (i) =>
        `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee">${i.cantidad}×</td>
         <td style="padding:4px 8px;border-bottom:1px solid #eee">${esc(i.nombre)}${i.formato ? ' · ' + esc(i.formato) : ''}</td>
         <td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:right">${(i.precio * i.cantidad).toFixed(2).replace('.', ',')} €</td></tr>`,
    )
    .join('')
  await sendViaResend({
    to,
    subject: `🛒 Nuevo pedido ${o.numero} · ${total} € — Grupo Lambea`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;color:#1A1F2A">
      <h2 style="color:#0E5784">Nuevo pedido recibido</h2>
      <p><strong>Pedido:</strong> ${esc(o.numero)}<br>
      <strong>Total:</strong> ${total} €</p>
      <h3 style="color:#0E5784;margin-bottom:4px">Cliente</h3>
      <p>${esc(o.nombre)}<br>
      ${esc(o.email)}${o.telefono ? ' · ' + esc(o.telefono) : ''}<br>
      ${esc(o.direccion)}, ${esc(o.cp)} ${esc(o.ciudad)}</p>
      <h3 style="color:#0E5784;margin-bottom:4px">Artículos</h3>
      <table style="border-collapse:collapse;width:100%;font-size:14px">${filas}</table>
      <p style="margin-top:16px"><a href="${process.env.NEXTAUTH_URL ?? ''}/admin/pedidos" style="color:#1E92D8">Abrir el panel de pedidos →</a></p>
      <p style="color:#6B7480">— Grupo Lambea</p>
    </div>`,
  })
}

/**
 * Cheque regalo (código de descuento) al cliente tras realizar un pedido.
 * El código se genera y registra en lib/coupons.ts; aquí solo se notifica.
 * No-op si no hay email. Nunca lanza.
 */
export async function sendGiftCouponEmail(o: GiftCouponData): Promise<void> {
  if (!o.email) return
  await sendViaResend({
    to: o.email,
    subject: `🎁 Tu cheque regalo del ${o.pct}% — Grupo Lambea`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;color:#1A1F2A">
      <h2 style="color:#0E5784">¡Gracias por tu compra, ${esc(o.nombre)}!</h2>
      <p>Como agradecimiento, aquí tienes un <strong>${o.pct}% de descuento</strong> para tu próximo pedido:</p>
      <p style="text-align:center;margin:24px 0">
        <span style="display:inline-block;border:2px dashed #E8A93C;background:#fffbf0;color:#1A1F2A;font-size:22px;font-weight:bold;letter-spacing:2px;padding:14px 28px;border-radius:10px">${esc(o.codigo)}</span>
      </p>
      <p style="font-size:13px;color:#6B7480">Introduce este código en la cesta al pagar. Es de un solo uso${o.expira ? ` y válido hasta el ${o.expira}` : ''}.</p>
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
