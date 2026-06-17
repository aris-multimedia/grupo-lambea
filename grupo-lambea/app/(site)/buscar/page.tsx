import type { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { getAllProducts } from '@/lib/products'
import { ProductCard } from '@/components/ProductCard'

// Las páginas de resultados de búsqueda NO se indexan (evita contenido duplicado/fino
// que diluiría el SEO de las fichas y categorías reales). Sí se siguen los enlaces.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Resultados para “${q}”` : 'Buscar productos',
    robots: { index: false, follow: true },
  }
}

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const terms = normalize(q).split(/\s+/).filter(Boolean)

  const all = terms.length > 0 ? await getAllProducts() : []
  const results = all.filter((p) => {
    const haystack = normalize(
      [
        p.familia,
        p.nombre,
        p.descripcion_corta ?? '',
        (p.aplicaciones ?? []).join(' '),
        (p.usos ?? []).join(' '),
      ].join(' '),
    )
    return terms.every((t) => haystack.includes(t))
  })

  return (
    <>
      {/* ── Hero + buscador ───────────────────────────────── */}
      <section className="bg-[var(--blue-deep)] text-white py-12 md:py-16">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8">
          <h1
            className="font-(family-name:--font-lora) font-medium mb-6"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.02em' }}
          >
            {q ? (
              <>
                Resultados para <em className="italic text-[#B3DEF2]">“{q}”</em>
              </>
            ) : (
              'Buscar productos'
            )}
          </h1>
          <form action="/buscar" method="get" className="flex items-center gap-3 max-w-[640px]">
            <div className="relative flex-1 flex items-center">
              <Search size={18} strokeWidth={1.9} className="absolute left-4 text-[var(--ink-500)] pointer-events-none" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Busca un producto, fórmula o aplicación…"
                aria-label="Buscar productos"
                className="w-full pl-12 pr-4 py-3.5 rounded-full text-[15px] text-[var(--ink)] bg-white outline-none focus:ring-2 focus:ring-[var(--blue)]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-full bg-[var(--blue)] hover:bg-[var(--blue-dark)] font-semibold text-[14px] transition-colors cursor-pointer"
            >
              Buscar
            </button>
          </form>
        </div>
      </section>

      {/* ── Resultados ────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-[var(--bg-soft)]" style={{ minHeight: '40vh' }}>
        <div className="max-w-[1320px] mx-auto px-4 md:px-8">
          {!q ? (
            <p className="text-[var(--ink-500)] text-[15px] leading-relaxed max-w-xl">
              Escribe qué necesitas: un producto (<em>Desoxilam</em>), una aplicación
              (<em>faros</em>, <em>casco</em>, <em>inyectores</em>) o un sector
              (<em>náutico</em>, <em>caravaning</em>, <em>industrial</em>).
            </p>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[var(--ink)] text-[18px] font-medium mb-2">
                Sin resultados para “{q}”.
              </p>
              <p className="text-[var(--ink-500)] text-[14px] mb-7">
                Prueba con otra palabra o explora por categoría.
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {[
                  ['Náutica', '/tienda/nautico'],
                  ['Caravaning', '/tienda/caravaning'],
                  ['Industrial', '/tienda/industrial'],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="px-4 py-2 bg-white rounded-full text-[13px] font-medium text-[var(--blue-deep)] no-underline hover:bg-[var(--blue)] hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="text-[var(--ink-500)] text-[14px] mb-7">
                {results.length} {results.length === 1 ? 'producto encontrado' : 'productos encontrados'}.
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {results.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
