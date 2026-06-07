import { sql } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, User, MapPin, FileText, MessageCircle, CreditCard } from 'lucide-react';
import { updateOrderStatus } from '@/app/actions/orders';
import { phoneDigits } from '@/lib/settings-schema';
import { Card, StatusPill, ORDER_STATUS, orderBadge } from '../../_components/layout';

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
  const badge = orderBadge(estado);

  const changeStatus = updateOrderStatus.bind(null, Number(id));

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-1.5 text-(--ink-500) hover:text-(--blue) text-[13px] no-underline transition-colors"
          >
            <ArrowLeft size={14} />
            Volver
          </Link>
          <div>
            <h1 className="font-(family-name:--font-lora) text-[24px] font-semibold text-(--ink) leading-tight">
              #{String(o.numero_pedido)}
            </h1>
            <div className="text-[12px] text-(--ink-500) mt-0.5">
              {new Date(String(o.created_at)).toLocaleString('es-ES')}
            </div>
          </div>
          <StatusPill label={badge.label} color={badge.color} bg={badge.bg} className="text-[12px] px-3 py-1" />
        </div>

        {/* Status change */}
        <form action={changeStatus as unknown as (formData: FormData) => void} className="flex items-center gap-2">
          <select
            name="estado"
            defaultValue={estado}
            className="border border-[#d7dde6] rounded-(--r-sm) px-3 py-2 text-[13px] text-(--ink) outline-none focus:border-(--blue) bg-white cursor-pointer"
          >
            {Object.entries(ORDER_STATUS).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue hover:bg-blue-dark text-white text-[13px] font-semibold px-4 py-2 rounded-(--r-sm) transition-colors cursor-pointer"
          >
            Actualizar
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Client info */}
        <Card title="Cliente" icon={<User size={14} />}>
          <div className="space-y-1.5 text-[14px]">
            <div className="font-semibold text-(--ink)">{String(o.cliente_nombre)}</div>
            <a href={`mailto:${String(o.cliente_email)}`} className="text-(--ink-700) hover:text-(--blue) no-underline block transition-colors">
              {String(o.cliente_email)}
            </a>
            {Boolean(o.cliente_telefono) && (
              <div className="flex items-center gap-3">
                <a href={`tel:+${phoneDigits(String(o.cliente_telefono))}`} className="text-(--ink-700) hover:text-(--blue) no-underline transition-colors">
                  {String(o.cliente_telefono)}
                </a>
                <a
                  href={`https://wa.me/${phoneDigits(String(o.cliente_telefono))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Escribir por WhatsApp"
                  className="inline-flex items-center gap-1 text-[12px] text-[#16a34a] hover:underline no-underline"
                >
                  <MessageCircle size={13} /> WhatsApp
                </a>
              </div>
            )}
          </div>
        </Card>

        {/* Shipping address */}
        <Card title="Dirección de entrega" icon={<MapPin size={14} />}>
          <div className="space-y-0.5 text-[14px] text-(--ink-700)">
            <div>{String(o.cliente_direccion)}</div>
            <div>{String(o.cliente_cp)} {String(o.cliente_ciudad)}</div>
          </div>
        </Card>
      </div>

      {/* Facturación */}
      {(String(o.tipo_cliente) === 'empresa' || Boolean(o.facturacion_nif) || Boolean(o.facturacion_empresa)) && (
        <div className="mb-6">
          <Card title="Datos de facturación" icon={<CreditCard size={14} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[14px]">
              <FactRow label="Tipo de cliente" value={String(o.tipo_cliente) === 'empresa' ? 'Empresa' : 'Particular'} />
              {Boolean(o.facturacion_empresa) && <FactRow label="Empresa" value={String(o.facturacion_empresa)} />}
              {Boolean(o.facturacion_nif) && <FactRow label="NIF / CIF" value={String(o.facturacion_nif)} />}
              {Boolean(o.facturacion_dir) && <FactRow label="Dirección fiscal" value={String(o.facturacion_dir)} />}
              {(Boolean(o.facturacion_cp) || Boolean(o.facturacion_ciudad)) && (
                <FactRow label="Población" value={`${o.facturacion_cp ?? ''} ${o.facturacion_ciudad ?? ''}`.trim()} />
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Order items */}
      <div className="mb-6" id="items">
        <Card title="Artículos" icon={<Package size={14} />} padded={false}>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-(--ink-500) bg-(--bg-soft) border-b border-(--line)">
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[11px]">Producto</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[11px]">Formato</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[11px] text-right">Precio ud.</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[11px] text-center">Cantidad</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[11px] text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(items as Record<string, unknown>[]).map((item) => (
                <tr key={String(item.id)} className="border-b border-(--line-soft)">
                  <td className="px-6 py-3">
                    {item.product_slug ? (
                      <Link
                        href={`/tienda/${item.product_slug}`}
                        className="font-medium text-(--blue) hover:underline no-underline"
                        target="_blank"
                      >
                        {String(item.nombre_producto)}
                      </Link>
                    ) : (
                      <span className="font-medium text-(--ink)">{String(item.nombre_producto)}</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-(--ink-500)">{item.formato ? String(item.formato) : '—'}</td>
                  <td className="px-6 py-3 text-right text-(--ink-700)">{Number(item.precio_unitario).toFixed(2)} €</td>
                  <td className="px-6 py-3 text-center font-semibold text-(--ink)">{String(item.cantidad)}</td>
                  <td className="px-6 py-3 text-right font-bold text-(--ink)">
                    {(Number(item.precio_unitario) * Number(item.cantidad)).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-(--bg-soft)">
                <td colSpan={4} className="px-6 py-3 text-right font-bold text-[14px] text-(--ink)">Total</td>
                <td className="px-6 py-3 text-right font-bold text-[16px] text-(--ink)">
                  {Number(o.total).toFixed(2)} €
                </td>
              </tr>
            </tfoot>
          </table>
        </Card>
      </div>

      {/* Notes */}
      {Boolean(o.notas) && (
        <Card title="Notas del cliente" icon={<FileText size={14} />}>
          <p className="text-[14px] text-(--ink-700)">{String(o.notas)}</p>
        </Card>
      )}
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-(--ink-500)">{label}</span>
      <span className="text-(--ink) font-medium text-right">{value}</span>
    </>
  );
}
