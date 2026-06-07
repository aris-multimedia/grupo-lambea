import { sql } from '@/lib/db';
import { Info } from 'lucide-react';
import { PedidosListClient, type PedidoRow } from './PedidosListClient';
import { PageHeader } from '../_components/layout';

export default async function AdminPedidos() {
  const rows = await sql`
    SELECT o.id, o.numero_pedido, o.cliente_nombre, o.cliente_email,
           o.total, o.estado, o.created_at,
           COUNT(oi.id) as num_items
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;

  const pedidos: PedidoRow[] = (rows as Record<string, unknown>[]).map((p) => ({
    id: Number(p.id),
    numero_pedido: String(p.numero_pedido),
    cliente_nombre: String(p.cliente_nombre),
    cliente_email: String(p.cliente_email),
    num_items: Number(p.num_items),
    total: Number(p.total),
    estado: String(p.estado),
    created_at: new Date(String(p.created_at)).toISOString(),
  }));

  return (
    <div>
      <PageHeader
        title={`Pedidos (${pedidos.length})`}
        subtitle="Seguimiento de las ventas de tu tienda. Haz clic en una fila para ver el detalle."
      />

      {/* Aviso: integraciones pendientes */}
      <div className="mb-5 flex items-start gap-2.5 rounded-(--r-md) border border-[#cfe6f7] bg-(--blue-soft) px-4 py-3 text-[13px] text-blue-deep">
        <Info size={16} className="shrink-0 mt-0.5" />
        <p>
          El cobro online (Stripe) y el envío automático (GNI) aún no están conectados. Por ahora los
          pedidos se gestionan manualmente desde aquí.
        </p>
      </div>

      <PedidosListClient pedidos={pedidos} />
    </div>
  );
}
