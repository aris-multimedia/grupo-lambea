import { sql } from '@/lib/db';
import { Package, ShoppingCart, Euro, Clock } from 'lucide-react';

export default async function AdminDashboard() {
  const [{ count: totalProductos }] = await sql`SELECT COUNT(*) as count FROM products WHERE publicado = true`;
  const [{ count: totalPedidos }] = await sql`SELECT COUNT(*) as count FROM orders`;
  const [{ total: ventasTotal }] = await sql`SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE estado != 'cancelado'`;
  const pedidosRecientes = await sql`
    SELECT * FROM orders ORDER BY created_at DESC LIMIT 5
  `;

  const stats = [
    { label: 'Productos publicados', value: totalProductos, icon: <Package size={20} /> },
    { label: 'Pedidos totales', value: totalPedidos, icon: <ShoppingCart size={20} /> },
    { label: 'Ventas totales', value: `${Number(ventasTotal).toFixed(2)} €`, icon: <Euro size={20} /> },
  ];

  return (
    <div className="p-8">
      <h1 className="text-[22px] font-semibold text-[#1a1f2a] mb-6">Inicio</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] text-[#6b7280] font-medium">{s.label}</span>
              <span style={{ color: '#1E92D8' }}>{s.icon}</span>
            </div>
            <div className="text-[28px] font-bold text-[#1a1f2a]">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb]">
        <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center gap-2">
          <Clock size={15} className="text-[#9ca3af]" />
          <span className="text-[14px] font-semibold text-[#1a1f2a]">Últimos pedidos</span>
        </div>
        {pedidosRecientes.length === 0 ? (
          <div className="px-6 py-10 text-center text-[13px] text-[#9ca3af]">
            Aún no hay pedidos
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[#6b7280] border-b border-[#e5e7eb]">
                <th className="px-6 py-3 font-medium">Pedido</th>
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pedidosRecientes.map((p: Record<string, unknown>) => (
                <tr key={String(p.id)} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb]">
                  <td className="px-6 py-3 font-mono text-[#1E92D8]">#{String(p.numero_pedido)}</td>
                  <td className="px-6 py-3">{String(p.cliente_nombre)}</td>
                  <td className="px-6 py-3 font-semibold">{Number(p.total).toFixed(2)} €</td>
                  <td className="px-6 py-3"><EstadoBadge estado={String(p.estado)} /></td>
                  <td className="px-6 py-3 text-[#9ca3af]">
                    {new Date(String(p.created_at)).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    nuevo:      { label: 'Nuevo',      color: '#1d4ed8', bg: '#eff6ff' },
    confirmado: { label: 'Confirmado', color: '#065f46', bg: '#ecfdf5' },
    enviado:    { label: 'Enviado',    color: '#92400e', bg: '#fffbeb' },
    cancelado:  { label: 'Cancelado',  color: '#991b1b', bg: '#fef2f2' },
  };
  const s = map[estado] ?? { label: estado, color: '#374151', bg: '#f3f4f6' };
  return (
    <span
      className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
      style={{ color: s.color, background: s.bg }}
    >
      {s.label}
    </span>
  );
}
