import { sql } from '@/lib/db';
import Link from 'next/link';

export default async function AdminPedidos() {
  const pedidos = await sql`
    SELECT o.*, COUNT(oi.id) as num_items
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;

  const ESTADO: Record<string, { label: string; color: string; bg: string }> = {
    nuevo:      { label: 'Nuevo',      color: '#1d4ed8', bg: '#eff6ff' },
    confirmado: { label: 'Confirmado', color: '#065f46', bg: '#ecfdf5' },
    enviado:    { label: 'Enviado',    color: '#92400e', bg: '#fffbeb' },
    cancelado:  { label: 'Cancelado',  color: '#991b1b', bg: '#fef2f2' },
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-[#1a1f2a]">
          Pedidos <span className="text-[#9ca3af] font-normal text-[16px]">({pedidos.length})</span>
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
        {pedidos.length === 0 ? (
          <div className="px-6 py-16 text-center text-[14px] text-[#9ca3af]">
            Aún no hay pedidos
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[#6b7280] bg-[#f9fafb] border-b border-[#e5e7eb]">
                <th className="px-5 py-3 font-medium">Pedido</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Artículos</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p: Record<string, unknown>) => {
                const estado = String(p.estado);
                const badge = ESTADO[estado] ?? { label: estado, color: '#374151', bg: '#f3f4f6' };
                return (
                  <tr key={String(p.id)} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb]">
                    <td className="px-5 py-3 font-mono font-semibold text-[#1E92D8]">
                      #{String(p.numero_pedido)}
                    </td>
                    <td className="px-5 py-3 font-medium text-[#1a1f2a]">{String(p.cliente_nombre)}</td>
                    <td className="px-5 py-3 text-[#6b7280]">{String(p.cliente_email)}</td>
                    <td className="px-5 py-3 text-center">{String(p.num_items)}</td>
                    <td className="px-5 py-3 font-bold text-[#1a1f2a]">{Number(p.total).toFixed(2)} €</td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ color: badge.color, background: badge.bg }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#9ca3af]">
                      {new Date(String(p.created_at)).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/pedidos/${String(p.id)}`}
                        className="text-[#1E92D8] hover:underline text-[12px] font-medium no-underline"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
