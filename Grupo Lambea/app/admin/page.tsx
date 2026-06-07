import Link from 'next/link';
import { sql } from '@/lib/db';
import { getDashboardStats } from '@/lib/admin-stats';
import { getSettings } from '@/lib/settings';
import { StatCard } from './_components/StatCard';
import { PromoManager } from './_components/PromoManager';
import { PageHeader, Card, Empty, StatusPill, orderBadge } from './_components/layout';
import { ShoppingCart, Euro, Wallet, Clock, TrendingUp, ArrowRight } from 'lucide-react';

const eur = (v: number) =>
  v.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

export default async function AdminDashboard() {
  const [stats, settings, pedidosRecientes] = await Promise.all([
    getDashboardStats(),
    getSettings(),
    sql`SELECT id, numero_pedido, cliente_nombre, total, estado, created_at
        FROM orders ORDER BY created_at DESC LIMIT 6`,
  ]);

  return (
    <div>
      <PageHeader title="Escritorio" subtitle="Resumen de ventas y pedidos de tu tienda." />

      {/* ── KPIs ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Ventas este mes"
          value={eur(stats.ventasMes)}
          icon={<TrendingUp size={20} />}
          trend={stats.trendVentas}
          hint={`Mes anterior: ${eur(stats.ventasMesAnterior)}`}
        />
        <StatCard
          label="Pedidos pendientes"
          value={stats.pedidosNuevos}
          icon={<ShoppingCart size={20} />}
          highlight={stats.pedidosNuevos > 0}
          hint="Nuevos sin gestionar"
          href="/admin/pedidos"
        />
        <StatCard
          label="Ticket medio"
          value={eur(stats.ticketMedio)}
          icon={<Wallet size={20} />}
          hint={`${stats.pedidosTotales} pedidos en total`}
        />
        <StatCard
          label="Ventas totales"
          value={eur(stats.ventasTotales)}
          icon={<Euro size={20} />}
          hint="Histórico (sin cancelados)"
        />
      </div>

      {/* ── Gestión de promociones (lo que el cliente quiere tocar) ── */}
      <div className="mb-6">
        <PromoManager initial={settings.promo} />
      </div>

      {/* ── Pedidos recientes + Top productos ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          icon={<Clock size={15} />}
          title="Últimos pedidos"
          action={
            <Link href="/admin/pedidos" className="text-[12px] text-(--blue) hover:underline no-underline flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          }
        >
          {pedidosRecientes.length === 0 ? (
            <Empty>Aún no hay pedidos.</Empty>
          ) : (
            <div className="-mx-2">
              {(pedidosRecientes as Record<string, unknown>[]).map((p) => {
                const badge = orderBadge(String(p.estado));
                return (
                  <Link
                    key={String(p.id)}
                    href={`/admin/pedidos/${String(p.id)}`}
                    className="flex items-center gap-3 py-2 px-2 no-underline hover:bg-(--blue-soft) rounded-(--r-sm) transition-colors"
                  >
                    <span className="font-mono text-[12px] text-(--blue) w-24 shrink-0">#{String(p.numero_pedido)}</span>
                    <span className="flex-1 text-[13px] text-(--ink) truncate">{String(p.cliente_nombre)}</span>
                    <StatusPill label={badge.label} color={badge.color} bg={badge.bg} className="text-[10px]" />
                    <span className="text-[13px] font-semibold text-(--ink) w-16 text-right shrink-0">{eur(Number(p.total))}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        <Card icon={<TrendingUp size={15} />} title="Productos más vendidos">
          {stats.topProductos.length === 0 ? (
            <Empty>Aún no hay ventas registradas.</Empty>
          ) : (
            <div className="space-y-1">
              {stats.topProductos.map((p, i) => (
                <div key={`${p.nombre}-${i}`} className="flex items-center gap-3 py-2">
                  <span className="w-5 text-[12px] font-bold text-[#c4c9d4] text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    {p.slug ? (
                      <Link href={`/admin/productos/${p.slug}`} className="text-[13px] font-medium text-(--ink) hover:text-(--blue) no-underline truncate block transition-colors">
                        {p.nombre}
                      </Link>
                    ) : (
                      <span className="text-[13px] font-medium text-(--ink) truncate block">{p.nombre}</span>
                    )}
                  </div>
                  <span className="text-[12px] text-(--ink-500)">{p.unidades} ud.</span>
                  <span className="text-[13px] font-semibold text-(--ink) w-20 text-right">{eur(p.ingresos)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
