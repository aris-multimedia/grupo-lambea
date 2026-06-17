import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { existsSync } from 'fs'
import { join } from 'path'
import { ChevronRight, Star } from 'lucide-react'
import { getProduct, getStaticSlugs, getRelated, getProductVariants, getProductReviews } from '@/lib/products'
import { getSettings } from '@/lib/settings'
import { ProductViewer } from './ProductViewer'
import { ProductTabs } from './ProductTabs'

export async function generateStaticParams() {
  const slugs = await getStaticSlugs()
  return slugs.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}
  // SEO: preservamos el título y la meta description de Yoast (web antigua) tal cual,
  // con fallback al genérico solo si no existen. Esto conserva las keywords posicionadas.
  const title = product.seo_title?.trim() || `${product.familia} — Grupo Lambea`
  const description = product.seo_description?.trim() || product.descripcion_corta || undefined
  const url = `/tienda/${product.slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: 'Grupo Lambea',
      locale: 'es_ES',
      title,
      description,
      url,
      images: product.imagen ? [{ url: product.imagen }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.imagen ? [product.imagen] : [],
    },
  }
}

const aplicacionLabel: Record<string, string> = {
  nautico: 'Productos para barcos',
  caravaning: 'Productos para caravanas',
  industrial: 'Productos industriales',
}

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const settings = await getSettings()
  const product = await getProduct(slug)
  if (!product) notFound()
  const { sql } = await import('@/lib/db')
  const [variants, related, galleryRows, reviews] = await Promise.all([
    getProductVariants(product.id),
    getRelated(slug, product.aplicaciones),
    sql`SELECT url, alt FROM product_images WHERE product_id = ${product.id} ORDER BY orden, id`.catch(() => [] as { url: string; alt: string }[]),
    getProductReviews(product.id),
  ])
  const reviewsConTexto = reviews.filter((r) => r.texto && r.texto.trim().length > 0)
  const galleryImages = (galleryRows as { url: string; alt: string }[])
    .map(r => ({ url: String(r.url), alt: String(r.alt ?? '') }))
    // El antes/después se muestra con su propio thumbnail dedicado (beforeAfterSrc).
    // Las filas heredadas que apuntan a /assets/before-after/<slug>.png no existen
    // como imagen suelta (los archivos viven en before/ y after/), así que dejaban
    // un thumbnail roto en la galería. Las excluimos.
    .filter(img => !img.url.includes('/before-after/'))

  const catLabel = aplicacionLabel[product.aplicaciones[0]] ?? product.aplicaciones[0]
  const fallbackImage = product.imagen ?? '/assets/productos/prod-nautico-01.jpg'

  const publicDir = join(process.cwd(), 'public')
  const beforePath = `/assets/before-after/before/${product.slug}.png`
  const afterPath = `/assets/before-after/after/${product.slug}.png`
  const beforeAfterSrc = existsSync(join(publicDir, beforePath)) && existsSync(join(publicDir, afterPath))
    ? { before: beforePath, after: afterPath }
    : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.familia,
    description: product.descripcion_corta ?? undefined,
    // product.imagen puede venir ya como URL absoluta (https://grupolambea.com/…) o como
    // ruta local (/assets/…). Solo anteponemos el dominio cuando es ruta local, para no
    // generar URLs malformadas con doble dominio en los datos estructurados.
    image: product.imagen
      ? [product.imagen.startsWith('http') ? product.imagen : `https://grupolambea.com${product.imagen}`]
      : undefined,
    brand: { '@type': 'Brand', name: 'Grupo Lambea' },
    sku: product.slug,
    ...(product.codigo_toxicologia && { mpn: product.codigo_toxicologia }),
    ...(product.precio_desde && {
      offers: {
        '@type': 'Offer',
        url: `https://grupolambea.com/tienda/${product.slug}`,
        priceCurrency: 'EUR',
        price: product.precio_desde.toFixed(2),
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'Grupo Lambea' },
      },
    }),
    ...(product.valoracion && product.num_valoraciones && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.valoracion.toFixed(1),
        reviewCount: product.num_valoraciones,
        bestRating: '5',
        worstRating: '1',
      },
    }),
    ...(reviewsConTexto.length > 0 && {
      review: reviewsConTexto.slice(0, 8).map((r) => ({
        '@type': 'Review',
        reviewRating: { '@type': 'Rating', ratingValue: String(r.rating), bestRating: '5', worstRating: '1' },
        author: { '@type': 'Person', name: r.author },
        reviewBody: r.texto,
        ...(r.fecha_iso && { datePublished: r.fecha_iso }),
      })),
    }),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://grupolambea.com' },
      { '@type': 'ListItem', position: 2, name: 'Tienda', item: 'https://grupolambea.com/tienda' },
      { '@type': 'ListItem', position: 3, name: product.familia, item: `https://grupolambea.com/tienda/${product.slug}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="bg-[var(--bg-soft)] py-4">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8 flex items-center gap-2.5 text-[13px] text-[var(--ink-500)]">
          <Link href="/" className="hover:text-[var(--blue)] transition-colors no-underline text-inherit">
            Inicio
          </Link>
          <ChevronRight size={14} className="opacity-60" />
          <Link href="/tienda" className="hover:text-[var(--blue)] transition-colors no-underline text-inherit">
            Tienda
          </Link>
          <ChevronRight size={14} className="opacity-60" />
          <span className="text-[var(--ink)] font-medium">{product.familia}</span>
        </div>
      </div>

      {/* Product page */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-10 pb-20">
        <ProductViewer
          slug={product.slug!}
          familia={product.familia}
          catLabel={catLabel}
          descripcionCorta={product.descripcion_corta}
          valoracion={product.valoracion}
          numValoraciones={product.num_valoraciones}
          codigoToxicologia={product.codigo_toxicologia}
          imagenDefault={fallbackImage}
          galleryImages={galleryImages}
          beforeAfterSrc={beforeAfterSrc}
          bestseller={product.bestseller}
          aplicaciones={product.aplicaciones}
          variants={variants}
          precioDesde={product.precio_desde}
          precioHasta={product.precio_hasta}
          fichaUrl={product.ficha_tecnica_url}
          hasReviews={reviewsConTexto.length > 0}
          settings={settings}
        />
      </div>

      <ProductTabs
        settings={settings}
        product={{
          familia: product.familia,
          aplicaciones: product.aplicaciones ?? [],
          formatos: product.formatos ?? null,
          codigo_toxicologia: product.codigo_toxicologia ?? null,
          precio_desde: product.precio_desde ?? null,
          precio_hasta: product.precio_hasta ?? null,
          descripcion_larga: product.descripcion_larga ?? null,
          instrucciones_uso: product.instrucciones_uso ?? null,
          usos: product.usos ?? null,
          caracteristicas: product.caracteristicas ?? null,
          valoracion: product.valoracion ?? null,
          num_valoraciones: product.num_valoraciones ?? null,
          ficha_tecnica_url: product.ficha_tecnica_url ?? null,
        }}
      />

      {/* ── REVIEWS SECTION (reseñas reales migradas de grupolambea.com) ── */}
      {reviewsConTexto.length > 0 && (
        <section id="opiniones" className="scroll-mt-28 bg-(--bg-soft) py-16 mt-15">
          <div className="max-w-[1320px] mx-auto px-4 md:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <h2
                  className="font-(family-name:--font-lora) text-[var(--ink)] font-medium"
                  style={{ fontSize: 32, letterSpacing: '-0.02em' }}
                >
                  Lo que dicen nuestros{' '}
                  <em className="italic text-[var(--blue-deep)]">clientes</em>
                </h2>
                {product.valoracion && product.num_valoraciones && (
                  <div className="flex items-center gap-2.5 mt-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          fill={s <= Math.round(product.valoracion!) ? '#E8A93C' : 'transparent'}
                          stroke={s <= Math.round(product.valoracion!) ? '#E8A93C' : '#d1d5db'}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-[var(--ink)] text-[14px]">
                      {product.valoracion.toFixed(1)}
                    </span>
                    <span className="text-[var(--ink-500)] text-[13px]">
                      · {product.num_valoraciones}{' '}
                      {product.num_valoraciones === 1 ? 'valoración' : 'valoraciones'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Review cards — reseñas reales de clientes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {reviewsConTexto.slice(0, 6).map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-[var(--r-lg)] p-6 flex flex-col"
                  style={{ boxShadow: '0 2px 8px rgba(14,87,132,0.06)' }}
                >
                  <div className="flex gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= r.rating ? '#E8A93C' : 'transparent'}
                        stroke={s <= r.rating ? '#E8A93C' : '#d1d5db'}
                      />
                    ))}
                  </div>
                  <p className="text-[15px] text-[var(--ink-700)] leading-[1.7] flex-1 mb-5">
                    &ldquo;{r.texto}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[13px] shrink-0"
                      style={{ background: 'var(--blue-soft)', color: 'var(--blue)' }}
                    >
                      {r.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--ink)] text-[13px]">{r.author}</div>
                      <div className="text-[11px] text-[var(--ink-500)]">
                        {catLabel}{r.fecha_iso ? ` · ${r.fecha_iso.slice(0, 4)}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── RELATED PRODUCTS ─────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="bg-white py-20 mt-17.5">
          <div className="max-w-[1320px] mx-auto px-4 md:px-8">
            <h2
              className="font-(family-name:--font-lora) text-[var(--ink)] font-medium mb-9"
              style={{ fontSize: 32, letterSpacing: '-0.02em' }}
            >
              También te puede <em className="italic text-[var(--blue-deep)]">interesar</em>
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-[22px]">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/tienda/${p.slug}`}
                  className="group bg-white rounded-[var(--r-md)] overflow-hidden no-underline text-inherit block transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_16px_30px_rgba(14,87,132,0.15)]"
                  style={{ boxShadow: '0 2px 8px rgba(14,87,132,0.06)' }}
                >
                  <div className="aspect-square bg-white relative overflow-hidden flex items-center justify-center">
                    <div className="w-[78%] h-[78%] relative">
                      <Image
                        src={p.imagen!}
                        alt={p.familia}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="px-5 pt-[18px] pb-[22px]">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--blue)] font-semibold mb-2">
                      {aplicacionLabel[p.aplicaciones[0]] ?? p.aplicaciones[0]}
                    </div>
                    <div
                      className="font-(family-name:--font-lora) text-[var(--ink)] font-medium mb-3 leading-tight"
                      style={{ fontSize: 16, minHeight: 40 }}
                    >
                      {p.familia}
                    </div>
                    <div
                      className="flex justify-between items-center pt-3"
                      style={{ borderTop: '1px solid var(--line)' }}
                    >
                      <div>
                        <span className="text-[11px] text-[var(--ink-500)] font-medium mr-1">desde</span>
                        <span className="font-(family-name:--font-lora) text-[18px] text-[var(--ink)] font-semibold">
                          {(p.precio_desde ?? 0).toFixed(2).replace('.', ',')} €
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
