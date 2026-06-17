import 'server-only'
import { sql } from '@/lib/db'

/**
 * ─── FACTURACIÓN (preparado para Verifactu) ──────────────────────────────────
 *
 * Regla de negocio clave: la factura NO se emite al pagar. Solo se puede emitir
 * cuando el pedido está realmente ENTREGADO Y ACEPTADO por el cliente (estado
 * 'completado'). Así evitamos facturar pedidos que se cancelan, no se envían o
 * se devuelven, y el problema fiscal de justificar a Hacienda una factura de
 * algo que al final no se entregó.
 *
 * El proveedor de facturación es enchufable: hoy es un placeholder ("pendiente")
 * y cuando se elija la herramienta Verifactu (Quaderno, fiskaly, Verifacti,
 * B2Brouter, o la solución del Kit Digital con API) se implementa un
 * InvoiceProvider real en getInvoiceProvider() sin tocar el resto del sistema.
 */

// Estados de pedido en los que se permite emitir la factura.
export const ESTADOS_FACTURABLES = ['completado'] as const

// Estados del campo factura_estado: 'no' (no solicitada) | 'pendiente'
// (solicitada, esperando a que el pedido sea facturable) | 'emitida' | 'error'.
export type FacturaEstado = 'no' | 'pendiente' | 'emitida' | 'error'

export type OrderInvoiceInfo = {
  id: number
  numero_pedido: string
  estado: string
  factura_solicitada: boolean
  factura_estado: string
  factura_numero: string | null
  total: number
  cliente_nombre: string
  cliente_email: string
  facturacion_empresa: string | null
  facturacion_nif: string | null
  facturacion_dir: string | null
  facturacion_ciudad: string | null
  facturacion_cp: string | null
}

/** ¿Se puede emitir ya la factura de este pedido? */
export function canIssueInvoice(o: {
  factura_solicitada: boolean
  estado: string
  factura_estado: string
}): boolean {
  return (
    o.factura_solicitada &&
    o.factura_estado !== 'emitida' &&
    (ESTADOS_FACTURABLES as readonly string[]).includes(o.estado)
  )
}

// ─── Proveedor de facturación (interfaz lista para Verifactu) ─────────────────
export interface InvoiceProvider {
  readonly name: string
  /** Emite la factura conforme (Verifactu) y devuelve número legal + PDF. */
  issue(order: OrderInvoiceInfo): Promise<{ numero: string; url?: string }>
}

/** Placeholder mientras no se integre una herramienta Verifactu real. */
class PendingProvider implements InvoiceProvider {
  readonly name = 'pendiente'
  async issue(): Promise<{ numero: string; url?: string }> {
    throw new Error('Verifactu no configurado')
  }
}

/**
 * Devuelve el proveedor de facturación activo.
 * TODO Verifactu: según process.env.INVOICING_PROVIDER, devolver el proveedor
 * real, p.ej.:
 *   case 'quaderno':  return new QuadernoProvider(process.env.QUADERNO_API_KEY!)
 *   case 'verifacti': return new VerifactiProvider(process.env.VERIFACTI_API_KEY!)
 *   case 'fiskaly':   return new FiskalyProvider(...)
 * Cada uno implementa InvoiceProvider.issue() llamando a su API (encadenado +
 * QR + envío a la AEAT) y devolviendo el número de factura legal y el PDF.
 */
export function getInvoiceProvider(): InvoiceProvider {
  // const which = process.env.INVOICING_PROVIDER
  return new PendingProvider()
}

/**
 * Intenta emitir la factura de un pedido SI cumple el gating (solicitada +
 * pedido 'completado'). Idempotente. Se llama manualmente desde el admin o
 * automáticamente cuando el pedido pasa a 'completado'.
 *
 * Mientras no haya proveedor Verifactu real, deja la factura como 'pendiente'
 * (no marca error): el gestor la emite a mano y, cuando se enchufe Verifactu,
 * se emitirá sola.
 */
export async function issueInvoiceForOrder(
  orderId: number,
): Promise<{ ok: boolean; numero?: string; error?: string; pendiente?: boolean }> {
  const [o] = await sql`
    SELECT id, numero_pedido, estado, factura_solicitada, factura_estado, factura_numero, total,
           cliente_nombre, cliente_email, facturacion_empresa, facturacion_nif,
           facturacion_dir, facturacion_ciudad, facturacion_cp
    FROM orders WHERE id = ${orderId} LIMIT 1
  `
  if (!o) return { ok: false, error: 'Pedido no encontrado' }

  const order = o as OrderInvoiceInfo
  if (order.factura_estado === 'emitida') {
    return { ok: true, numero: order.factura_numero ?? undefined }
  }
  if (!canIssueInvoice(order)) {
    return {
      ok: false,
      error: 'Todavía no se puede emitir la factura: debe estar solicitada y el pedido en estado "completado".',
    }
  }

  const provider = getInvoiceProvider()
  if (provider.name === 'pendiente') {
    // Verifactu aún no integrado → la factura queda pendiente de emitir a mano.
    return {
      ok: false,
      pendiente: true,
      error: 'La emisión automática (Verifactu) aún no está configurada. La factura queda pendiente.',
    }
  }

  try {
    const result = await provider.issue(order)
    await sql`
      UPDATE orders
      SET factura_estado='emitida', factura_numero=${result.numero},
          factura_url=${result.url ?? null}, factura_emitida_at=now()
      WHERE id=${orderId}
    `
    return { ok: true, numero: result.numero }
  } catch (e) {
    await sql`UPDATE orders SET factura_estado='error' WHERE id=${orderId}`
    return { ok: false, error: e instanceof Error ? e.message : 'Error al emitir la factura' }
  }
}
