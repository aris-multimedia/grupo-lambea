import 'server-only'
import { sql } from '@/lib/db'
import { stripe, stripeConfigured } from '@/lib/stripe'

// Parámetros del cheque regalo (editables por entorno; valores por defecto
// sensatos a confirmar por el cliente: 10 % de descuento, válido 60 días).
const GIFT_PCT = Math.max(1, Math.min(100, Number(process.env.GIFT_COUPON_PCT) || 10))
const GIFT_DAYS = Math.max(1, Number(process.env.GIFT_COUPON_DAYS) || 60)

// Sin caracteres ambiguos (I/O/0/1/L) para que sea fácil de teclear.
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function randomCode(): string {
  let s = ''
  for (let i = 0; i < 8; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  return `LAMBEA${GIFT_PCT}-${s}`
}

export type IssuedCoupon = { codigo: string; pct: number; expira: string | null }

/**
 * Emite un cheque regalo de UN SOLO USO para el cliente tras un pedido pagado:
 *  1) crea un cupón porcentual en Stripe y un Promotion Code único
 *     (`max_redemptions: 1`, con caducidad),
 *  2) lo registra en la tabla `coupons` (si existe en la DB),
 *  3) devuelve el código para enviarlo por email.
 *
 * Best-effort: si Stripe no está configurado o la tabla aún no está migrada,
 * devuelve null sin romper el flujo del pedido. Nunca lanza.
 *
 * El canje se valida en el propio Stripe Checkout (hay que activar
 * `allow_promotion_codes` en la sesión, cosa que ya hace orders.ts cuando no
 * hay otra promo aplicada).
 */
export async function issuePostOrderCoupon(opts: {
  orderId: number
  email: string
}): Promise<IssuedCoupon | null> {
  if (!stripeConfigured()) return null

  const pct = GIFT_PCT
  const code = randomCode()
  const expMs = Date.now() + GIFT_DAYS * 24 * 60 * 60 * 1000
  const expiraEpoch = Math.floor(expMs / 1000)
  const expiraIso = new Date(expMs).toISOString()
  const expiraHuman = new Date(expMs).toLocaleDateString('es-ES')

  try {
    const coupon = await stripe.coupons.create({
      percent_off: pct,
      duration: 'once',
      name: `Cheque regalo ${pct}%`,
    })
    const promo = await stripe.promotionCodes.create({
      promotion: { type: 'coupon', coupon: coupon.id },
      code,
      max_redemptions: 1,
      expires_at: expiraEpoch,
    })

    // Registro local (auditoría). Si la tabla `coupons` no existe todavía, se
    // ignora: el cupón ya es válido en Stripe igualmente.
    try {
      await sql`
        INSERT INTO coupons (codigo, descuento_pct, order_id, email, stripe_coupon_id, stripe_promotion_code_id, expira_at)
        VALUES (${code}, ${pct}, ${opts.orderId}, ${opts.email}, ${coupon.id}, ${promo.id}, ${expiraIso})
      `
    } catch {
      // tabla aún no migrada — no pasa nada
    }

    return { codigo: code, pct, expira: expiraHuman }
  } catch {
    return null
  }
}
