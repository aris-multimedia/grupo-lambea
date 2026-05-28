'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { Anchor, Tent, Factory, LayoutGrid } from 'lucide-react';

interface Producto {
  id: number;
  slug: string;
  familia: string;
  nombre: string;
  aplicaciones: string[];
  precio_desde: number | null;
  publicado: boolean;
  bestseller: boolean;
  imagen: string | null;
}

const CATS = [
  { key: 'todos',      label: 'Todos',      Icon: LayoutGrid },
  { key: 'nautico',    label: 'Náutico',    Icon: Anchor },
  { key: 'caravaning', label: 'Caravaning', Icon: Tent },
  { key: 'industrial', label: 'Industrial', Icon: Factory },
] as const;

const CAT_ICON: Record<string, React.FC<{ size?: number; className?: string }>> = {
  nautico:    (p) => <Anchor    {...p} />,
  caravaning: (p) => <Tent      {...p} />,
  industrial: (p) => <Factory   {...p} />,
};

const CAT_LABEL: Record<string, string> = {
  nautico: 'Náutico', caravaning: 'Caravaning', industrial: 'Industrial',
};


export function ProductListClient({ productos }: { productos: Producto[] }) {
  const [active, setActive] = useState<'todos' | 'nautico' | 'caravaning' | 'industrial'>('todos');

  const filtered =
    active === 'todos'
      ? productos
      : productos.filter((p) => p.aplicaciones.includes(active));

  // Group by familia preserving order
  const groups: { familia: string; items: Producto[] }[] = [];
  for (const p of filtered) {
    const last = groups[groups.length - 1];
    if (last?.familia === p.familia) {
      last.items.push(p);
    } else {
      groups.push({ familia: p.familia, items: [p] });
    }
  }

  const countBycat = (key: string) =>
    key === 'todos'
      ? productos.length
      : productos.filter((p) => p.aplicaciones.includes(key)).length;

  return (
    <div>
      {/* ── Filter tabs ─────────────────────────────────── */}
      <div className="flex items-center gap-0.5 mb-5 bg-white rounded-xl border border-[#e5e7eb] p-1 w-fit">
        {CATS.map(({ key, label, Icon }) => {
          const count = countBycat(key);
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
              style={
                isActive
                  ? { background: '#1E92D8', color: '#fff' }
                  : { background: 'transparent', color: '#6b7280' }
              }
            >
              <Icon size={13} />
              {label}
              <span className="text-[11px] opacity-60 font-normal">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Continuous table ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden shadow-sm">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[#6b7280] bg-[#f9fafb] border-b border-[#e5e7eb]">
              <th className="px-5 py-3 font-medium">Producto</th>
              <th className="px-5 py-3 font-medium hidden md:table-cell">Categoría</th>
              <th className="px-5 py-3 font-medium hidden sm:table-cell text-right">Precio desde</th>
              <th className="px-5 py-3 font-medium text-right">Estado</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(({ familia, items }) => (
              <Fragment key={familia}>
                {/* Familia group header */}
                <tr className="border-t border-[#e5e7eb]">
                  <td
                    colSpan={4}
                    className="px-5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#9ca3af] bg-[#f9fafb]"
                  >
                    {familia}
                    <span className="ml-2 font-normal text-[#c4c9d4]">({items.length})</span>
                  </td>
                </tr>

                {/* Product rows */}
                {items.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-[#f3f4f6] hover:bg-[#f0f7ff] transition-colors cursor-pointer group"
                  >
                    {/* Name + image — full row link overlay */}
                    <td className="px-5 py-3 relative">
                      <Link
                        href={`/admin/productos/${p.slug}`}
                        className="absolute inset-0 z-0"
                        aria-label={`Editar ${p.nombre}`}
                      />
                      <div className="flex items-center gap-3 relative z-10 pointer-events-none">
                        <div className="w-10 h-10 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] shrink-0 overflow-hidden flex items-center justify-center">
                          {p.imagen ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.imagen}
                              alt={p.nombre}
                              className="w-full h-full object-contain p-0.5"
                            />
                          ) : (
                            <span className="text-[15px]">📦</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-[#1a1f2a] group-hover:text-[#1E92D8] transition-colors leading-tight">
                            {p.nombre}
                          </div>
                          <div className="text-[11px] text-[#c4c9d4] font-mono mt-0.5">{p.slug}</div>
                        </div>
                      </div>
                    </td>

                    {/* Categories — icons only with tooltip */}
                    <td className="px-5 py-3 hidden md:table-cell">
                      <div className="flex gap-2">
                        {p.aplicaciones.map((a) => {
                          const Icon = CAT_ICON[a];
                          return Icon ? (
                            <span key={a} title={CAT_LABEL[a] ?? a} className="text-[#c4c9d4] hover:text-[#6b7280] transition-colors">
                              <Icon size={15} />
                            </span>
                          ) : null;
                        })}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-3 hidden sm:table-cell text-right font-semibold text-[#1a1f2a]">
                      {p.precio_desde != null ? `${p.precio_desde.toFixed(2)} €` : '—'}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.bestseller && (
                          <span title="Bestseller" className="text-[#f59e0b] text-[13px]">★</span>
                        )}
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          title={p.publicado ? 'Publicado' : 'Oculto'}
                          style={{ background: p.publicado ? '#10b981' : '#d1d5db' }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center text-[13px] text-[#9ca3af]">
                  No hay productos en esta categoría.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[12px] text-[#9ca3af] mt-3 text-right">
        {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
        {active !== 'todos' ? ` en ${CAT_LABEL[active]}` : ' en total'}
      </p>
    </div>
  );
}
