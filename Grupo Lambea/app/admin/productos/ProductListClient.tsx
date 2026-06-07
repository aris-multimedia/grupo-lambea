'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Anchor, Caravan, Factory, LayoutGrid, Star, Package, ChevronRight } from 'lucide-react';
import { Card, Empty } from '../_components/layout';
import { SearchInput, Segmented, type SegmentedOption } from '../_components/ui';

interface Producto {
  id: number;
  slug: string;
  familia: string;
  nombre: string;
  aplicaciones: string[];
  precio_desde: number | null;
  precio_hasta: number | null;
  publicado: boolean;
  bestseller: boolean;
  promo_3x2: boolean;
  imagen: string | null;
}

const CATS: SegmentedOption[] = [
  { key: 'todos',      label: 'Todos',      Icon: LayoutGrid },
  { key: 'nautico',    label: 'Náutico',    Icon: Anchor },
  { key: 'caravaning', label: 'Caravaning', Icon: Caravan },
  { key: 'industrial', label: 'Industrial', Icon: Factory },
];

const CAT_ICON: Record<string, React.FC<{ size?: number }>> = {
  nautico: Anchor,
  caravaning: Caravan,
  industrial: Factory,
};
const CAT_LABEL: Record<string, string> = {
  nautico: 'Náutico', caravaning: 'Caravaning', industrial: 'Industrial',
};

function precioRango(desde: number | null, hasta: number | null): string {
  if (desde == null) return 'Sin precio';
  const f = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;
  if (hasta == null || hasta <= desde) return f(desde);
  return `${f(desde)} – ${f(hasta)}`;
}

export function ProductListClient({ productos }: { productos: Producto[] }) {
  const [active, setActive] = useState<string>('todos');
  const [search, setSearch] = useState('');

  const q = search.trim().toLowerCase();
  const filtered = productos.filter((p) => {
    if (active !== 'todos' && !p.aplicaciones.includes(active)) return false;
    if (!q) return true;
    return (
      p.nombre.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.familia.toLowerCase().includes(q)
    );
  });

  const countByCat = (key: string) =>
    key === 'todos' ? productos.length : productos.filter((p) => p.aplicaciones.includes(key)).length;

  const tabs = CATS.map((c) => ({ ...c, count: countByCat(c.key) }));

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <Segmented options={tabs} value={active} onChange={setActive} />
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar producto…" />
      </div>

      <Card padded={false}>
        {/* Cabecera de columnas */}
        <div className="hidden md:flex items-center gap-4 px-4 py-2.5 bg-(--bg-soft) border-b border-(--line) text-[11px] font-semibold uppercase tracking-wider text-(--ink-500)">
          <div className="w-12 shrink-0" />
          <div className="flex-1 min-w-0">Producto</div>
          <div className="hidden xl:block w-24 shrink-0">Categorías</div>
          <div className="w-40 shrink-0 text-right">Precio</div>
          <div className="hidden sm:block w-20 shrink-0 text-right">Promo</div>
          <div className="w-28 shrink-0">Estado</div>
          <div className="w-4 shrink-0" />
        </div>

        {filtered.length === 0 ? (
          <Empty>No hay productos que coincidan.</Empty>
        ) : (
          <ul>
            {filtered.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/productos/${p.slug}`}
                  className="group flex items-center gap-4 px-4 py-3 no-underline border-b border-(--line-soft) last:border-0 hover:bg-(--blue-soft) transition-colors"
                >
                  {/* Miniatura */}
                  <div className="w-12 h-12 shrink-0 rounded-(--r-sm) border border-(--line) bg-(--bg-soft) overflow-hidden flex items-center justify-center">
                    {p.imagen ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imagen} alt="" className="w-full h-full object-contain p-1" />
                    ) : (
                      <Package size={18} className="text-[#c4c9d4]" />
                    )}
                  </div>

                  {/* Producto */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-(--ink-500) truncate">
                      {p.familia}
                    </div>
                    <div className="text-[14px] font-semibold text-(--ink) truncate group-hover:text-(--blue) transition-colors">
                      {p.nombre}
                    </div>
                  </div>

                  {/* Categorías */}
                  <div className="hidden xl:flex items-center gap-2 w-24 shrink-0 text-[#c4c9d4]">
                    {p.aplicaciones.map((a) => {
                      const Icon = CAT_ICON[a];
                      return Icon ? (
                        <span key={a} title={CAT_LABEL[a] ?? a}>
                          <Icon size={15} />
                        </span>
                      ) : null;
                    })}
                  </div>

                  {/* Precio */}
                  <div
                    className={`w-40 shrink-0 text-right text-[14px] font-bold whitespace-nowrap ${p.precio_desde == null ? 'text-(--ink-500) font-medium' : 'text-(--ink)'}`}
                  >
                    {precioRango(p.precio_desde, p.precio_hasta)}
                  </div>

                  {/* Promo */}
                  <div className="hidden sm:flex items-center justify-end gap-1.5 w-20 shrink-0">
                    {p.bestseller && (
                      <span title="Bestseller — aparece en la home">
                        <Star size={14} className="text-(--warning)" fill="currentColor" />
                      </span>
                    )}
                    {p.promo_3x2 && (
                      <span className="text-[10px] font-bold text-[#b45309] bg-[#fff7ed] border border-[#fed7aa] rounded px-1.5 py-0.5">
                        3×2
                      </span>
                    )}
                  </div>

                  {/* Estado */}
                  <div className="w-28 shrink-0 flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: p.publicado ? '#10b981' : '#cbd2dc' }}
                    />
                    <span className="text-[12.5px] text-(--ink-700)">
                      {p.publicado ? 'Publicado' : 'Oculto'}
                    </span>
                  </div>

                  <ChevronRight
                    size={16}
                    className="w-4 shrink-0 text-[#c4c9d4] group-hover:text-(--blue) transition-colors"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="text-[12px] text-(--ink-500) mt-3">
        {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
        {active !== 'todos' ? ` en ${CAT_LABEL[active]}` : ''}
      </p>
    </div>
  );
}
