import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ExternalLink } from 'lucide-react'
import { sql } from '@/lib/db'
import { SEO_SUGGESTIONS } from '@/lib/seo-suggestions'
import { SeoReviewControls } from './SeoReviewControls'
import type { SeoEstado } from '@/app/actions/seo-review'

// ──────────────────────────────────────────────────────────────────────────
// PÁGINA TEMPORAL — Revisión de SEO con el cliente.
//
// Tabla SEO ACTUAL vs. SUGERENCIA por producto. El cliente aprueba cada uno o
// deja un comentario; su decisión se guarda en la tabla `seo_review` (Neon).
//
// Ruta oculta: noindex/nofollow, no enlazada, fuera del sitemap, sin login (no
// está bajo /admin). Al cerrar la revisión: borrar app/seo-inventario/,
// app/actions/seo-review.ts, lib/seo-suggestions.ts y la tabla seo_review.
// ──────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: { absolute: 'Revisión SEO — Grupo Lambea' },
  robots: { index: false, follow: false },
}

interface ProdRow {
  slug: string
  nombre: string
  familia: string
  aplicaciones: string[]
  seo_title: string | null
  seo_description: string | null
}

const APP_LABEL: Record<string, string> = {
  nautico: 'Náutico',
  caravaning: 'Caravaning',
  industrial: 'Industrial',
}
// Color del chip de sector que se muestra en cada fila (la lista ya no se agrupa
// por categoría; va ordenada por producto, así que el chip mantiene la pista visual).
const SECTOR_CHIP: Record<string, string> = {
  nautico: '#0E5784',
  caravaning: '#1E92D8',
  industrial: '#6B7480',
}

// Rangos de referencia de Google: título ~50-60 car., meta description ~120-158.
function titleBadge(len: number) {
  if (len >= 50 && len <= 60) return { label: 'óptimo', color: '#2E9E5B' }
  if (len < 50) return { label: 'corto', color: '#C77F12' }
  return { label: 'largo', color: '#D14343' }
}
function descBadge(len: number) {
  if (len >= 120 && len <= 158) return { label: 'óptima', color: '#2E9E5B' }
  if (len < 120) return { label: 'corta', color: '#C77F12' }
  return { label: 'larga', color: '#D14343' }
}

function Badge({ len, kind }: { len: number; kind: 'title' | 'desc' }) {
  const b = kind === 'title' ? titleBadge(len) : descBadge(len)
  return (
    <span className="ml-1 whitespace-nowrap text-[11px] font-medium" style={{ color: b.color }}>
      {len} car. · {b.label}
    </span>
  )
}

/** Celda de un par título + descripción (sirve para el actual y el sugerido). */
function SeoCell({ title, description }: { title: string | null; description: string | null }) {
  return (
    <div className="space-y-2">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
          Título
          {title ? <Badge len={title.length} kind="title" /> : null}
        </div>
        <p className="text-sm leading-snug text-(--ink)">
          {title || <span className="italic text-neutral-300">—</span>}
        </p>
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
          Descripción
          {description ? <Badge len={description.length} kind="desc" /> : null}
        </div>
        <p className="text-[13px] leading-snug text-(--ink-700)">
          {description || <span className="italic text-neutral-300">—</span>}
        </p>
      </div>
    </div>
  )
}

const TH = 'px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide'

async function SeoReviewTable() {
  const [prodRowsRaw, reviewRows] = await Promise.all([
    sql`SELECT slug, nombre, familia, aplicaciones, seo_title, seo_description
        FROM products WHERE publicado = true
        ORDER BY familia, nombre`,
    sql`SELECT slug, estado, comentario FROM seo_review`.catch(
      () => [] as { slug: string; estado: string; comentario: string | null }[],
    ),
  ])
  const prodRows = prodRowsRaw as unknown as ProdRow[]

  const review = new Map(
    (reviewRows as { slug: string; estado: string; comentario: string | null }[]).map((r) => [
      r.slug,
      { estado: (r.estado as SeoEstado) ?? 'pendiente', comentario: r.comentario ?? '' },
    ]),
  )

  const aprobados = [...review.values()].filter((r) => r.estado === 'aprobado').length
  const problemas = [...review.values()].filter((r) => r.estado === 'rechazado').length
  const total = prodRows.length
  const pendientes = total - aprobados - problemas

  return (
    <>
      {/* Resumen de progreso */}
      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <span className="rounded-(--r-sm) bg-neutral-100 px-3 py-1 font-medium text-neutral-600">
          {total} productos
        </span>
        <span className="rounded-(--r-sm) bg-[#E7F5ED] px-3 py-1 font-semibold text-[#2E9E5B]">
          {aprobados} aprobados
        </span>
        <span className="rounded-(--r-sm) bg-[#FBE9E9] px-3 py-1 font-semibold text-[#D14343]">
          {problemas} con problema
        </span>
        <span className="rounded-(--r-sm) bg-[#FBF3E3] px-3 py-1 font-semibold text-[#C77F12]">
          {pendientes} pendientes
        </span>
      </div>

      <div className="mt-6 overflow-x-auto rounded-(--r-md) border border-neutral-200">
        <table className="w-full min-w-[1100px] border-collapse text-left">
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[29%]" />
            <col className="w-[29%]" />
            <col className="w-[30%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
              <th className={TH}>Producto</th>
              <th className={TH}>SEO actual</th>
              <th className={`${TH} bg-(--blue-soft) text-(--blue-deep)`}>SEO sugerido</th>
              <th className={TH}>Revisión del cliente</th>
            </tr>
          </thead>
          <tbody>
            {prodRows.map((p, i) => {
              const sugg = SEO_SUGGESTIONS[p.slug]
              const rev = review.get(p.slug) ?? { estado: 'pendiente' as SeoEstado, comentario: '' }
              const rowTint =
                rev.estado === 'aprobado'
                  ? 'bg-[#F4FBF7]'
                  : rev.estado === 'rechazado'
                    ? 'bg-[#FDF6F6]'
                    : 'bg-white'
              // Separador más marcado al cambiar de producto (familia), para que las
              // variantes del mismo producto se lean como un bloque.
              const nuevoProducto = i > 0 && prodRows[i - 1].familia !== p.familia
              const sector = p.aplicaciones?.[0] ?? ''
              return (
                <tr
                  key={p.slug}
                  className={`align-top ${nuevoProducto ? 'border-t-2 border-neutral-300' : 'border-t border-neutral-100'} ${rowTint}`}
                >
                  <td className="px-3 py-3">
                    <div className="font-(family-name:--font-lora) text-sm font-semibold text-(--blue-deep)">
                      {p.nombre}
                    </div>
                    <span
                      className="mt-1 inline-block rounded-(--r-sm) px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                      style={{ backgroundColor: SECTOR_CHIP[sector] ?? '#6B7480' }}
                    >
                      {APP_LABEL[sector] ?? sector}
                    </span>
                    <a
                      href={`/tienda/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 flex items-center gap-1 text-[11px] text-(--blue) hover:underline"
                    >
                      ver ficha <ExternalLink className="size-3" />
                    </a>
                  </td>
                  <td className="px-3 py-3">
                    <SeoCell title={p.seo_title} description={p.seo_description} />
                  </td>
                  <td className="bg-(--blue-soft)/40 px-3 py-3">
                    {sugg ? (
                      <SeoCell title={sugg.title} description={sugg.description} />
                    ) : (
                      <span className="text-xs italic text-neutral-400">
                        Sin sugerencia (producto fuera de la lista)
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <SeoReviewControls
                      slug={p.slug}
                      initialEstado={rev.estado}
                      initialComentario={rev.comentario}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default function SeoInventarioPage() {
  return (
    <main className="mx-auto max-w-[1500px] px-4 py-10 print:py-4">
      <header className="border-b border-neutral-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-(--warning)">
          Documento interno · revisión SEO
        </p>
        <h1 className="mt-1 font-(family-name:--font-lora) text-3xl font-bold text-(--blue-deep)">
          Revisión SEO — Grupo Lambea
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-(--ink)">
          Para cada producto verás el <strong>SEO actual</strong> (el heredado de la web antigua,
          que es el que está posicionado hoy) y, al lado, una <strong>sugerencia mejorada</strong>:
          título y meta descripción específicos por sector, optimizados en longitud y palabras clave
          para Google, conservando los términos que ya posicionan. Revisa cada fila y pulsa{' '}
          <strong>Aprobar</strong> si te encaja, o <strong>Hay un problema</strong> y escribe en el
          comentario qué está mal o no es del todo cierto. Todo se guarda automáticamente.
        </p>
        <p className="mt-3 max-w-3xl text-xs leading-relaxed text-neutral-500">
          El color de cada texto indica el recuento de caracteres:{' '}
          <span style={{ color: '#2E9E5B' }}>verde = óptimo</span>,{' '}
          <span style={{ color: '#C77F12' }}>ámbar = corto</span> (desaprovecha espacio),{' '}
          <span style={{ color: '#D14343' }}>rojo = largo</span> (Google lo recorta). Título ideal
          50–60 · descripción ideal 120–158. La revisión cubre los 41 productos publicados; los
          descatalogados no se incluyen porque no tienen ficha activa que posicionar.
        </p>
      </header>

      <Suspense fallback={<p className="mt-8 text-sm text-neutral-400">Cargando inventario…</p>}>
        <SeoReviewTable />
      </Suspense>
    </main>
  )
}
