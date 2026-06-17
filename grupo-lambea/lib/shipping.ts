import 'server-only'
import { sql } from '@/lib/db'

/**
 * ─── ENVÍOS (preparado para GENEI.es) ────────────────────────────────────────
 * GENEI necesita, como mínimo: remitente (settings.empresa), destinatario
 * (datos del pedido) y PESO del paquete. El peso por formato vive en
 * `product_variants.peso_gramos` (hoy ESTIMADO desde el formato: ml/g 1:1,
 * L/kg ×1000, +8% envase +60 g; sustituir por pesos reales del cliente).
 *
 * TODO GENEI (cuando el cliente entregue API key + documentación):
 *  1. Implementar createGeneiShipment(orderId): POST a la API de GENEI con
 *     origen + destino + peso (getOrderWeightGrams) → guardar
 *     `orders.genei_shipment_id` y `orders.tracking_url`.
 *  2. Llamarlo desde el admin (botón "Generar envío") o al pasar a 'confirmado'.
 *  3. El email de "pedido enviado" (lib/email.ts) ya incluye tracking_url si existe.
 *  4. Clave en env: GENEI_API_KEY (ver .env.example). Nunca hardcodear.
 */

export function geneiConfigured(): boolean {
  return Boolean(process.env.GENEI_API_KEY)
}

/** Estimación de peso en gramos desde el texto del formato ("500 ml", "1 L"…). */
export function estimateWeightFromFormato(formato: string): number | null {
  const m = String(formato).match(/(\d+(?:[.,]\d+)?)\s*(ml|l|kg|g)\b/i)
  if (!m) return null
  const val = parseFloat(m[1].replace(',', '.'))
  const unit = m[2].toLowerCase()
  const base = unit === 'l' || unit === 'kg' ? val * 1000 : val
  return Math.round((base * 1.08 + 60) / 10) * 10
}

/**
 * Peso total estimado del pedido en gramos: suma peso_gramos × cantidad de cada
 * línea; si una variante no tiene peso, lo estima del formato; último recurso 500 g.
 */
export async function getOrderWeightGrams(orderId: number): Promise<number> {
  const rows = await sql`
    SELECT oi.cantidad, oi.formato, v.peso_gramos
    FROM order_items oi
    LEFT JOIN product_variants v
      ON v.product_id = oi.product_id AND v.formato = oi.formato
    WHERE oi.order_id = ${orderId}
  `
  let total = 0
  for (const r of rows) {
    const unit = r.peso_gramos != null
      ? Number(r.peso_gramos)
      : estimateWeightFromFormato(String(r.formato ?? '')) ?? 500
    total += unit * Number(r.cantidad)
  }
  return total
}
