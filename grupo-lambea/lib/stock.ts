import 'server-only'
import { revalidateTag } from 'next/cache'
import { sql } from '@/lib/db'

/**
 * ─── CONTROL DE STOCK ────────────────────────────────────────────────────────
 * El stock vive en `product_variants.stock` (por formato). Reglas:
 *  - Se DESCUENTA solo cuando el pago se confirma y se crea el pedido
 *    (convertPendingToOrder). Nunca al añadir al carrito.
 *  - Se RESTAURA si el pedido se cancela o se reembolsa, una sola vez
 *    (flag `orders.stock_restaurado` para que sea idempotente).
 *  - La validación anti-sobreventa está en createCheckoutSession (no se llega
 *    a Stripe si no hay stock suficiente).
 * Productos sin variante (stock NULL en priceCart) no llevan control.
 */

type StockItem = { productId: number; formato: string; cantidad: number }

/**
 * Refresca la caché de variantes (`getProductVariants`) de los productos tocados.
 * Tolerante al contexto: desde el webhook de Stripe o una Server Action funciona;
 * si el stock cambia durante un render (fallback de /pedido-confirmado),
 * revalidateTag lanza y se ignora — la caché expira sola en horas.
 */
function refreshVariantsCache(productIds: number[]): void {
  try {
    // 'max' = stale-while-revalidate: la ficha se refresca en la siguiente visita.
    for (const id of new Set(productIds)) revalidateTag(`variants-${id}`, 'max')
  } catch {
    // En render no se puede revalidar; el anti-sobreventa real está en checkout.
  }
}

/** Resta stock de las variantes compradas. Nunca baja de 0. */
export async function decrementStockForItems(items: StockItem[]): Promise<void> {
  for (const it of items) {
    await sql`
      UPDATE product_variants
      SET stock = GREATEST(stock - ${it.cantidad}, 0)
      WHERE product_id = ${it.productId} AND formato = ${it.formato}
    `
  }
  refreshVariantsCache(items.map((it) => it.productId))
}

/**
 * Devuelve el stock de las líneas de un pedido cancelado/reembolsado.
 * Idempotente: solo actúa si `stock_restaurado=false`, y lo deja a true.
 */
export async function restoreStockForOrder(orderId: number): Promise<void> {
  const [o] = await sql`SELECT stock_restaurado FROM orders WHERE id = ${orderId} LIMIT 1`
  if (!o || o.stock_restaurado) return
  const items = await sql`
    SELECT product_id, formato, cantidad FROM order_items WHERE order_id = ${orderId}
  `
  for (const it of items) {
    await sql`
      UPDATE product_variants
      SET stock = stock + ${Number(it.cantidad)}
      WHERE product_id = ${it.product_id} AND formato = ${it.formato}
    `
  }
  await sql`UPDATE orders SET stock_restaurado = true WHERE id = ${orderId}`
  refreshVariantsCache(items.map((it) => Number(it.product_id)))
}
