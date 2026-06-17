import 'server-only'
import { sql } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { getSettings } from '@/lib/settings'
import { promoDiscount } from '@/lib/promotions'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { decrementStockForItems, restoreStockForOrder } from '@/lib/stock'
import type { CartItem } from '@/types/product'

export type PricedItem = {
  slug: string
  familia: string
  formato: string
  cantidad: number
  precio: number
  nombre: string
  productId: number
  /** Stock disponible de la variante; null = producto sin control de stock. */
  stock: number | null
}

export type PendingPayload = {
  numeroPedido: string
  total: number
  nombre: string
  email: string
  telefono: string | null
  direccion: string
  ciudad: string
  cp: string
  notas: string | null
  tipo_cliente: string
  facturacion_empresa: string | null
  facturacion_nif: string | null
  facturacion_dir: string | null
  facturacion_ciudad: string | null
  facturacion_cp: string | null
  factura_solicitada: boolean
  items: { productId: number; cantidad: number; precio: number; nombre: string; formato: string }[]
}

/**
 * Revalida cada línea del carrito contra la DB (NUNCA se confía en el precio del
 * navegador) y calcula el total con la promo activa.
 */
export async function priceCart(
  rawItems: CartItem[],
): Promise<{ items: PricedItem[]; subtotal: number; discount: number; total: number } | null> {
  const items: PricedItem[] = []
  for (const it of rawItems) {
    const cantidad = Math.max(1, Math.floor(Number(it.cantidad) || 1))
    const [product] = await sql`
      SELECT id, nombre, familia, precio_desde FROM products WHERE slug = ${it.slug} AND publicado = true LIMIT 1
    `
    if (!product) continue
    const [variant] = await sql`
      SELECT precio, stock FROM product_variants WHERE product_id = ${product.id} AND formato = ${it.formato} LIMIT 1
    `
    const precio = variant ? Number(variant.precio) : Number(product.precio_desde ?? 0)
    if (!(precio > 0)) continue
    items.push({
      slug: String(it.slug),
      familia: String(it.familia ?? product.familia),
      formato: String(it.formato ?? ''),
      cantidad,
      precio,
      nombre: String(product.nombre ?? product.familia),
      productId: Number(product.id),
      stock: variant ? Number(variant.stock ?? 0) : null,
    })
  }
  if (items.length === 0) return null
  const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const { promo } = await getSettings()
  const discount = promoDiscount(items as unknown as CartItem[], promo)
  const total = Number((subtotal - discount).toFixed(2))
  return { items, subtotal, discount, total }
}

/**
 * Crea el pedido real (+ líneas) a partir de un `pending_checkouts` ya PAGADO.
 * Idempotente: si ya se convirtió, devuelve el número sin duplicar.
 */
export async function convertPendingToOrder(
  pendingId: string,
  paymentIntentId?: string | null,
): Promise<string | null> {
  const [pending] = await sql`SELECT id, order_id, payload FROM pending_checkouts WHERE id = ${pendingId} LIMIT 1`
  if (!pending) return null
  const p = pending.payload as PendingPayload
  if (pending.order_id) return p.numeroPedido // ya convertido

  try {
    const [order] = await sql`
      INSERT INTO orders (
        numero_pedido, cliente_nombre, cliente_email, cliente_telefono,
        cliente_direccion, cliente_ciudad, cliente_cp, total, notas,
        tipo_cliente, facturacion_empresa, facturacion_nif,
        facturacion_dir, facturacion_ciudad, facturacion_cp, estado,
        factura_solicitada, factura_estado, stripe_payment_intent
      ) VALUES (
        ${p.numeroPedido}, ${p.nombre}, ${p.email}, ${p.telefono},
        ${p.direccion}, ${p.ciudad}, ${p.cp}, ${p.total}, ${p.notas},
        ${p.tipo_cliente}, ${p.facturacion_empresa}, ${p.facturacion_nif},
        ${p.facturacion_dir}, ${p.facturacion_ciudad}, ${p.facturacion_cp}, 'nuevo',
        ${p.factura_solicitada}, ${p.factura_solicitada ? 'pendiente' : 'no'}, ${paymentIntentId ?? null}
      )
      RETURNING id
    `
    for (const item of p.items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario, nombre_producto, formato)
        VALUES (${order.id}, ${item.productId}, ${item.cantidad}, ${item.precio}, ${item.nombre}, ${item.formato})
      `
    }
    await sql`UPDATE pending_checkouts SET order_id = ${order.id} WHERE id = ${pendingId}`
    // Descontar stock de lo vendido (solo aquí: con el pago ya confirmado).
    await decrementStockForItems(p.items).catch(() => {})
    // Email de confirmación al cliente (no-op si Resend no está configurado).
    await sendOrderConfirmationEmail({ numero: p.numeroPedido, nombre: p.nombre, email: p.email, total: Number(p.total) })
  } catch {
    // Carrera (otra confirmación ya lo creó; numero_pedido es UNIQUE) → no pasa nada.
  }
  return p.numeroPedido
}

/**
 * Comprueba con Stripe si la sesión está pagada y, si lo está, crea el pedido.
 * Lo llama la página de confirmación (funciona en local sin webhook).
 */
export async function confirmOrderBySession(
  sessionId: string,
): Promise<{ paid: boolean; numeroPedido?: string }> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status === 'paid') {
      const pendingId = session.metadata?.pending_id
      const pi = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null
      const numeroPedido = pendingId ? await convertPendingToOrder(pendingId, pi) : null
      return { paid: true, numeroPedido: numeroPedido ?? undefined }
    }
    return { paid: false }
  } catch {
    return { paid: false }
  }
}

/** Marca un pedido como reembolsado a partir del payment_intent de Stripe (webhook). */
export async function markRefundedByPaymentIntent(paymentIntentId: string): Promise<void> {
  const [o] = await sql`SELECT id FROM orders WHERE stripe_payment_intent = ${paymentIntentId} LIMIT 1`
  if (!o) return
  await sql`UPDATE orders SET estado = 'reembolsado' WHERE id = ${o.id} AND estado <> 'reembolsado'`
  // El género vuelve al almacén → restaurar stock (idempotente).
  await restoreStockForOrder(Number(o.id)).catch(() => {})
}
