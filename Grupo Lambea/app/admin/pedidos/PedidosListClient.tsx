'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { changeOrderStatus } from '@/app/actions/orders';
import { Card, Empty, ORDER_STATUS } from '../_components/layout';
import { SearchInput, Segmented } from '../_components/ui';

export interface PedidoRow {
  id: number;
  numero_pedido: string;
  cliente_nombre: string;
  cliente_email: string;
  num_items: number;
  total: number;
  estado: string;
  created_at: string;
}

const ESTADOS = ['nuevo', 'confirmado', 'enviado', 'entregado', 'completado', 'cancelado', 'reembolsado'] as const;

export function PedidosListClient({ pedidos }: { pedidos: PedidoRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [filtro, setFiltro] = useState<string>('todos');
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  const counts: Record<string, number> = { todos: pedidos.length };
  for (const e of ESTADOS) counts[e] = pedidos.filter((p) => p.estado === e).length;

  const q = search.trim().toLowerCase();
  const filtered = pedidos.filter((p) => {
    if (filtro !== 'todos' && p.estado !== filtro) return false;
    if (!q) return true;
    return (
      p.numero_pedido.toLowerCase().includes(q) ||
      p.cliente_nombre.toLowerCase().includes(q) ||
      p.cliente_email.toLowerCase().includes(q)
    );
  });

  function onChangeEstado(id: number, estado: string) {
    setSavingId(id);
    startTransition(async () => {
      await changeOrderStatus(id, estado);
      router.refresh();
      setSavingId(null);
    });
  }

  function openPedido(id: number) {
    router.push(`/admin/pedidos/${id}`);
  }

  const tabs = [
    { key: 'todos', label: 'Todos', count: counts.todos },
    ...ESTADOS.map((e) => ({ key: e, label: ORDER_STATUS[e].label, count: counts[e] })),
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <Segmented options={tabs} value={filtro} onChange={setFiltro} />
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar pedido, cliente o email…" className="w-72" />
      </div>

      <Card padded={false}>
        {filtered.length === 0 ? (
          <Empty>{pedidos.length === 0 ? 'Aún no hay pedidos.' : 'Ningún pedido coincide con el filtro.'}</Empty>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-(--ink-500) bg-(--bg-soft) border-b border-(--line)">
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Pedido</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Cliente</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] hidden md:table-cell">Email</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] text-center hidden sm:table-cell">Art.</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] text-right">Total</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Estado</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] hidden lg:table-cell">Fecha</th>
                <th className="px-5 py-3 w-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const meta = ORDER_STATUS[p.estado] ?? ORDER_STATUS.nuevo;
                return (
                  <tr
                    key={p.id}
                    onClick={() => openPedido(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') openPedido(p.id);
                    }}
                    tabIndex={0}
                    role="link"
                    aria-label={`Abrir pedido ${p.numero_pedido}`}
                    className="group border-b border-(--line-soft) last:border-0 cursor-pointer hover:bg-(--blue-soft) focus:bg-(--blue-soft) focus:outline-none transition-colors"
                  >
                    <td className="px-5 py-3 font-mono font-semibold text-(--blue)">#{p.numero_pedido}</td>
                    <td className="px-5 py-3 font-medium text-(--ink)">{p.cliente_nombre}</td>
                    <td className="px-5 py-3 text-(--ink-500) hidden md:table-cell">{p.cliente_email}</td>
                    <td className="px-5 py-3 text-center text-(--ink-700) hidden sm:table-cell">{p.num_items}</td>
                    <td className="px-5 py-3 font-bold text-(--ink) text-right whitespace-nowrap">{p.total.toFixed(2)} €</td>
                    {/* La única celda interactiva: cambiar estado no debe abrir el pedido */}
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={p.estado}
                        disabled={savingId === p.id}
                        onChange={(e) => onChangeEstado(p.id, e.target.value)}
                        className="text-[12px] font-semibold rounded-(--r-pill) pl-2.5 pr-1 py-1 outline-none cursor-pointer border-0 disabled:opacity-50"
                        style={{ color: meta.color, background: meta.bg }}
                        aria-label={`Estado del pedido ${p.numero_pedido}`}
                      >
                        {ESTADOS.map((e) => (
                          <option key={e} value={e}>{ORDER_STATUS[e].label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-(--ink-500) hidden lg:table-cell whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-5 py-3">
                      <ChevronRight size={16} className="text-[#c4c9d4] group-hover:text-(--blue) transition-colors" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <p className="text-[12px] text-(--ink-500) mt-3">
        {filtered.length} pedido{filtered.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
