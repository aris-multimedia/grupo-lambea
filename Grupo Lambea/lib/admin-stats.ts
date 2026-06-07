import { sql } from './db';

export interface DashboardStats {
  // KPIs (cambian con la actividad real)
  ventasMes: number;
  ventasMesAnterior: number;
  trendVentas: number | null;
  pedidosNuevos: number;
  ticketMedio: number;
  ventasTotales: number;
  pedidosTotales: number;
  pedidosPorEstado: Record<string, number>;
  // Top vendidos
  topProductos: { nombre: string; slug: string | null; unidades: number; ingresos: number }[];
}

const n = (v: unknown) => (v != null ? Number(v) : 0);

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    ventasMesRow,
    ventasMesAntRow,
    nuevosRow,
    ticketRow,
    totalesRow,
    estadoRows,
    topProductos,
  ] = await Promise.all([
    sql`SELECT COALESCE(SUM(total),0) AS v FROM orders
        WHERE estado <> 'cancelado' AND created_at >= date_trunc('month', NOW())`,
    sql`SELECT COALESCE(SUM(total),0) AS v FROM orders
        WHERE estado <> 'cancelado'
          AND created_at >= date_trunc('month', NOW()) - INTERVAL '1 month'
          AND created_at <  date_trunc('month', NOW())`,
    sql`SELECT COUNT(*) AS c FROM orders WHERE estado = 'nuevo'`,
    sql`SELECT COALESCE(AVG(total),0) AS v FROM orders WHERE estado <> 'cancelado'`,
    sql`SELECT COALESCE(SUM(total),0) AS v, COUNT(*) AS c FROM orders WHERE estado <> 'cancelado'`,
    sql`SELECT estado, COUNT(*) AS c FROM orders GROUP BY estado`,
    sql`SELECT oi.nombre_producto AS nombre, p.slug AS slug,
               SUM(oi.cantidad) AS unidades,
               SUM(oi.cantidad * oi.precio_unitario) AS ingresos
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        GROUP BY oi.nombre_producto, p.slug
        ORDER BY unidades DESC
        LIMIT 5`,
  ]);

  const ventasMes = n(ventasMesRow[0]?.v);
  const ventasMesAnterior = n(ventasMesAntRow[0]?.v);
  const trendVentas =
    ventasMesAnterior > 0 ? ((ventasMes - ventasMesAnterior) / ventasMesAnterior) * 100 : null;

  const pedidosPorEstado: Record<string, number> = {};
  for (const r of estadoRows as Record<string, unknown>[]) {
    pedidosPorEstado[String(r.estado)] = n(r.c);
  }

  return {
    ventasMes,
    ventasMesAnterior,
    trendVentas,
    pedidosNuevos: n(nuevosRow[0]?.c),
    ticketMedio: n(ticketRow[0]?.v),
    ventasTotales: n(totalesRow[0]?.v),
    pedidosTotales: n(totalesRow[0]?.c),
    pedidosPorEstado,
    topProductos: (topProductos as Record<string, unknown>[]).map((r) => ({
      nombre: String(r.nombre),
      slug: r.slug ? String(r.slug) : null,
      unidades: n(r.unidades),
      ingresos: n(r.ingresos),
    })),
  };
}
