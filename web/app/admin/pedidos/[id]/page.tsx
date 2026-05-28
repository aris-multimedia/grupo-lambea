import { sql } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, User, MapPin, FileText } from 'lucide-react';
import { updateOrderStatus } from '@/app/actions/orders';

const ESTADOS = {
  nuevo:      { label: 'Nuevo',      color: '#1d4ed8', bg: '#eff6ff' },
  confirmado: { label: 'Confirmado', color: '#065f46', bg: '#ecfdf5' },
  enviado:    { label: 'Enviado',    color: '#92400e', bg: '#fffbeb' },
  cancelado:  { label: 'Cancelado',  color: '#991b1b', bg: '#fef2f2' },
};

export default async function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order] = await sql`
    SELECT * FROM orders WHERE id = ${Number(id)} LIMIT 1
  `;
  if (!order) notFound();

  const items = await sql`
    SELECT oi.*, p.slug as product_slug
    FROM order_items oi
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ${Number(id)}
    ORDER BY oi.id
  `;

  const o = order as Record<string, unknown>;
  const estado = String(o.estado);
  const badge = ESTADOS[estado as keyof typeof ESTADOS] ?? { label: estado, color: '#374151', bg: '#f3f4f6' };

  const changeStatus = updateOrderStatus.bind(null, Number(id));

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-1.5 text-[#6b7280] hover:text-[#1E92D8] text-[13px] no-underline transition-colors"
          >
            <ArrowLeft size={14} />
            Volver
          </Link>
          <div>
            <h1 className="text-[22px] font-semibold text-[#1a1f2a] leading-tight font-mono">
              #{String(o.numero_pedido)}
            </h1>
            <div className="text-[12px] text-[#9ca3af] mt-0.5">
              {new Date(String(o.created_at)).toLocaleString('es-ES')}
            </div>
          </div>
          <span
            className="inline-block text-[12px] font-semibold px-3 py-1 rounded-full"
            style={{ color: badge.color, background: badge.bg }}
          >
            {badge.label}
          </span>
        </div>

        {/* Status change */}
        <form action={changeStatus as unknown as (formData: FormData) => void} className="flex items-center gap-2">
          <select
            name="estado"
            defaultValue={estado}
            className="border border-[#d1d5db] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1E92D8] bg-white"
          >
            {Object.entries(ESTADOS).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-[#1E92D8] hover:bg-[#1370A8] text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Actualizar
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Client info */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#6b7280] mb-4 uppercase tracking-wide">
            <User size={13} /> Cliente
          </div>
          <div className="space-y-1.5 text-[14px]">
            <div className="font-semibold text-[#1a1f2a]">{String(o.cliente_nombre)}</div>
            <div className="text-[#6b7280]">{String(o.cliente_email)}</div>
            {Boolean(o.cliente_telefono) && (
              <div className="text-[#6b7280]">{String(o.cliente_telefono)}</div>
            )}
          </div>
        </div>

        {/* Shipping address */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#6b7280] mb-4 uppercase tracking-wide">
            <MapPin size={13} /> Dirección de entrega
          </div>
          <div className="space-y-0.5 text-[14px] text-[#374151]">
            <div>{String(o.cliente_direccion)}</div>
            <div>{String(o.cliente_cp)} {String(o.cliente_ciudad)}</div>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] mb-6" id="items">
        <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center gap-2">
          <Package size={14} className="text-[#9ca3af]" />
          <span className="text-[14px] font-semibold text-[#1a1f2a]">Artículos</span>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[#6b7280] bg-[#f9fafb] border-b border-[#e5e7eb]">
              <th className="px-6 py-3 font-medium">Producto</th>
              <th className="px-6 py-3 font-medium">Formato</th>
              <th className="px-6 py-3 font-medium text-right">Precio ud.</th>
              <th className="px-6 py-3 font-medium text-center">Cantidad</th>
              <th className="px-6 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(items as Record<string, unknown>[]).map((item) => (
              <tr key={String(item.id)} className="border-b border-[#f3f4f6]">
                <td className="px-6 py-3">
                  {item.product_slug ? (
                    <Link
                      href={`/tienda/${item.product_slug}`}
                      className="font-medium text-[#1E92D8] hover:underline no-underline"
                      target="_blank"
                    >
                      {String(item.nombre_producto)}
                    </Link>
                  ) : (
                    <span className="font-medium text-[#1a1f2a]">{String(item.nombre_producto)}</span>
                  )}
                </td>
                <td className="px-6 py-3 text-[#6b7280]">{item.formato ? String(item.formato) : '—'}</td>
                <td className="px-6 py-3 text-right">{Number(item.precio_unitario).toFixed(2)} €</td>
                <td className="px-6 py-3 text-center font-semibold">{String(item.cantidad)}</td>
                <td className="px-6 py-3 text-right font-bold text-[#1a1f2a]">
                  {(Number(item.precio_unitario) * Number(item.cantidad)).toFixed(2)} €
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#f9fafb]">
              <td colSpan={4} className="px-6 py-3 text-right font-bold text-[14px] text-[#1a1f2a]">Total</td>
              <td className="px-6 py-3 text-right font-bold text-[16px] text-[#1a1f2a]">
                {Number(o.total).toFixed(2)} €
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Notes */}
      {Boolean(o.notas) && (
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#6b7280] mb-3 uppercase tracking-wide">
            <FileText size={13} /> Notas del cliente
          </div>
          <p className="text-[14px] text-[#374151]">{String(o.notas)}</p>
        </div>
      )}
    </div>
  );
}
