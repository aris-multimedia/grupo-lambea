import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { sql } from '@/lib/db'
import { geneiEstadoToOrderEstado } from '@/lib/shipping'

/**
 * Webhook de GENEI (campo `notificationUrl` del envío). GENEI hace POST aquí en
 * cada cambio de estado del envío. Actualiza `genei_estado`/`genei_tracking` y,
 * cuando el envío se entrega (estado 3), avanza el pedido a 'entregado'.
 *
 * SEGURIDAD: endpoint público → se valida un secreto compartido
 * (GENEI_WEBHOOK_TOKEN) que viaja en `?token=` de la URL que damos a GENEI.
 * Comparación en tiempo constante. Sin token válido → 401.
 */
// Nota: NO usar `export const dynamic = 'force-dynamic'` — es incompatible con
// cacheComponents (Next 16) y rompe el build. Este handler lee la request
// (token + body), así que ya es dinámico por defecto; no hace falta forzarlo.

function validToken(provided: string | null): boolean {
  const expected = process.env.GENEI_WEBHOOK_TOKEN
  if (!expected || !provided) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  if (!validToken(url.searchParams.get('token'))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let payload: { status?: unknown; data?: Record<string, unknown> } | null = null
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 })
  }

  const data = (payload?.data ?? {}) as Record<string, unknown>
  const codigoExterno =
    (data.codigo_envio_externo as string | undefined) ?? url.searchParams.get('pedido') ?? null
  const shipmentCode = (data.codigo_envio as string | undefined) ?? null
  const estado = data.estado != null ? Number(data.estado) : null
  const tracking = data.codigo_seguimiento ? String(data.codigo_seguimiento) : null

  try {
    // Localiza el pedido por NUESTRO nº de pedido (codigo_envio_externo) o por el
    // código de envío de GENEI. Si no casa, respondemos 200 (que GENEI no reintente).
    let order: { id: number } | undefined
    if (codigoExterno) {
      ;[order] = (await sql`SELECT id FROM orders WHERE numero_pedido = ${codigoExterno} LIMIT 1`) as {
        id: number
      }[]
    }
    if (!order && shipmentCode) {
      ;[order] = (await sql`SELECT id FROM orders WHERE genei_shipment_id = ${shipmentCode} LIMIT 1`) as {
        id: number
      }[]
    }
    if (!order) return NextResponse.json({ ok: true, matched: false })

    await sql`
      UPDATE orders SET
        genei_estado   = COALESCE(${estado}, genei_estado),
        genei_tracking = COALESCE(${tracking}, genei_tracking),
        updated_at     = now()
      WHERE id = ${order.id}
    `

    // Entregado en GENEI (3) → avanzamos el pedido (sin pisar estados finales).
    if (estado != null && geneiEstadoToOrderEstado(estado) === 'entregado') {
      await sql`
        UPDATE orders
        SET estado = 'entregado', entregado_at = COALESCE(entregado_at, now()), updated_at = now()
        WHERE id = ${order.id} AND estado NOT IN ('entregado', 'completado', 'cancelado', 'reembolsado')
      `
    }

    return NextResponse.json({ ok: true, matched: true })
  } catch (e) {
    // Observabilidad: registramos el fallo (sin datos sensibles) pero devolvemos
    // 200 para que GENEI no reintente en bucle un error nuestro de DB.
    console.error('[genei-webhook] error procesando', {
      pedido: codigoExterno, shipmentCode, estado,
      message: e instanceof Error ? e.message : 'unknown',
    })
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
