'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Minus, Plus, ShoppingCart, ArrowRight,
  Lock, Truck, RotateCcw, Award, PhoneCall, FileText,
} from 'lucide-react'
import { useCart } from '@/components/CartProvider'
import type { ProductVariant } from '@/lib/products'
import type { SiteSettings } from '@/lib/settings-schema'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'

interface Props {
  slug: string
  familia: string
  catLabel: string
  descripcionCorta: string | null
  valoracion: number | null
  numValoraciones: number | null
  codigoToxicologia: string | null
  imagenDefault: string
  galleryImages?: { url: string; alt: string }[]
  beforeAfterSrc?: { before: string; after: string } | null
  bestseller: boolean
  aplicaciones: string[]
  variants: ProductVariant[]
  precioDesde: number | null
  precioHasta: number | null
  fichaUrl?: string | null
  hasReviews?: boolean
  settings: SiteSettings
}

export function ProductViewer({
  slug, familia, catLabel, descripcionCorta, valoracion, numValoraciones,
  codigoToxicologia, imagenDefault, galleryImages = [], beforeAfterSrc = null,
  bestseller, aplicaciones, variants, precioDesde, precioHasta, fichaUrl,
  hasReviews = false, settings,
}: Props) {
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null)
  const [sliderMode, setSliderMode] = useState(false)
  const [cantidad, setCantidad] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()
  const router = useRouter()

  // Sort ascending by size: ml/g as-is, L/kg × 1000
  function toBaseUnit(formato: string): number {
    const m = formato.match(/(\d+(?:[.,]\d+)?)\s*(ml|l|kg|g)/i)
    if (!m) return Infinity
    const val = parseFloat(m[1].replace(',', '.'))
    const unit = m[2].toLowerCase()
    return unit === 'l' || unit === 'kg' ? val * 1000 : val
  }
  const sorted = [...variants].sort((a, b) => toBaseUnit(a.formato) - toBaseUnit(b.formato))

  // Default to the variant that matches the product card image (imagen_url === imagenDefault),
  // or the first variant with no specific image (falls back to imagenDefault), or index 0.
  const defaultIdx = (() => {
    let idx = sorted.findIndex(v => v.imagen_url === imagenDefault)
    if (idx >= 0) return idx
    idx = sorted.findIndex(v => !v.imagen_url)
    return Math.max(0, idx)
  })()
  const [variantIdx, setVariantIdx] = useState(defaultIdx)
  const seen = new Set<string>()
  const allThumbs: { url: string; alt: string }[] = []
  for (const v of sorted) {
    const url = v.imagen_url || imagenDefault
    if (!seen.has(url)) { seen.add(url); allThumbs.push({ url, alt: v.formato }) }
  }
  if (allThumbs.length === 0) allThumbs.push({ url: imagenDefault, alt: familia })
  for (const img of galleryImages) {
    if (!seen.has(img.url)) { seen.add(img.url); allThumbs.push(img) }
  }

  // Current state — index into sorted, not the original variants array
  const selectedVariant = sorted[variantIdx] ?? null
  const mainImage = activeImageUrl ?? selectedVariant?.imagen_url ?? imagenDefault

  // Stock de la variante seleccionada (null = producto sin control de stock)
  const stockSel = selectedVariant ? selectedVariant.stock : null
  const agotado = stockSel !== null && stockSel <= 0
  const maxQty = stockSel === null ? 99 : Math.max(stockSel, 1)

  // Price
  const precio: number = selectedVariant
    ? selectedVariant.precio
    : (() => {
        const desde = precioDesde ?? 0
        const hasta = precioHasta ?? desde
        if (variants.length <= 1) return desde
        const ratio = variantIdx / Math.max(variants.length - 1, 1)
        return Number((desde + ratio * (hasta - desde)).toFixed(2))
      })()

  const formato = selectedVariant?.formato ?? 'Unidad'
  const aplicacion = aplicaciones[0] ?? 'generico'

  function selectVariant(idx: number) {
    setSliderMode(false)
    setVariantIdx(idx)
    // La cantidad no puede superar el stock del formato recién elegido
    const s = sorted[idx]?.stock
    if (s != null) setCantidad(c => Math.max(1, Math.min(c, Math.max(s, 1))))
    const img = sorted[idx]?.imagen_url
    if (img) setActiveImageUrl(img)
  }

  function selectImage(url: string) {
    setSliderMode(false)
    setActiveImageUrl(url)
    const vIdx = sorted.findIndex(v => v.imagen_url === url)
    if (vIdx >= 0) setVariantIdx(vIdx)
  }

  function handleAdd() {
    if (agotado) return
    for (let i = 0; i < cantidad; i++) {
      addItem({ slug, familia, aplicacion, formato, precio, imagen: mainImage })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleBuyNow() {
    if (agotado) return
    for (let i = 0; i < cantidad; i++) {
      addItem({ slug, familia, aplicacion, formato, precio, imagen: mainImage })
    }
    router.push('/checkout')
  }

  return (
    <div className="grid gap-8 lg:gap-[70px] grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      {/* ── LEFT: Gallery ──────────────────────────────── */}
      <div className="self-start flex flex-col gap-3 lg:sticky lg:top-[100px]">
        {/* Main image — full width, on top */}
        <div
          className="aspect-square bg-white rounded-[var(--r-lg)] relative overflow-hidden flex items-center justify-center w-full"
          style={{ boxShadow: '0 8px 30px rgba(14,87,132,0.1)' }}
        >
          {bestseller && !sliderMode && (
            <span
              className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 text-white text-[11px] font-semibold uppercase tracking-[0.1em] px-3.5 py-[7px] rounded-full"
              style={{ background: 'var(--blue)', boxShadow: '0 4px 12px rgba(30,146,216,0.3)' }}
            >
              <Award size={12} strokeWidth={2.5} />
              Más vendido
            </span>
          )}
          {sliderMode && beforeAfterSrc ? (
            <div className="absolute inset-0">
              <BeforeAfterSlider
                beforeSrc={beforeAfterSrc.before}
                afterSrc={beforeAfterSrc.after}
                alt={familia}
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="w-[85%] h-[85%] relative">
              <Image
                src={mainImage}
                alt={`${familia} — ${formato}`}
                fill
                className="object-contain transition-opacity duration-200"
                priority
                sizes="(max-width: 1024px) 100vw, 600px"
              />
            </div>
          )}
        </div>

        {/* Thumbnails row — horizontal, below main image */}
        <div
          className="flex flex-row gap-2.5 overflow-x-auto pb-1 -mx-1 px-1"
          role="list"
          aria-label="Imágenes del producto — desliza para ver más"
          style={{
            scrollbarWidth: 'none',
            scrollSnapType: 'x mandatory',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0, black 16px, black calc(100% - 32px), transparent 100%)',
            maskImage:
              'linear-gradient(to right, transparent 0, black 16px, black calc(100% - 32px), transparent 100%)',
          }}
        >
          {allThumbs.slice(0, beforeAfterSrc ? 5 : 6).map(({ url, alt }, i) => (
            <button
              key={url + i}
              onClick={() => selectImage(url)}
              aria-label={`Ver imagen ${i + 1} de ${familia}`}
              aria-pressed={!sliderMode && url === mainImage}
              className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] shrink-0 bg-white rounded-[var(--r-md)] p-2 flex items-center justify-center overflow-hidden transition-all"
              style={{
                border: `2px solid ${!sliderMode && url === mainImage ? 'var(--blue)' : 'transparent'}`,
                boxShadow: '0 2px 6px rgba(14,87,132,0.06)',
              }}
            >
              <Image
                src={url}
                alt={alt}
                width={74}
                height={74}
                className="object-contain w-full h-full"
              />
            </button>
          ))}

          {/* Before/after slider thumbnail */}
          {beforeAfterSrc && (
            <button
              onClick={() => setSliderMode(true)}
              aria-label="Ver comparación antes y después"
              aria-pressed={sliderMode}
              className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] shrink-0 rounded-(--r-md) overflow-hidden transition-all relative"
              style={{
                border: `2px solid ${sliderMode ? 'var(--blue)' : 'transparent'}`,
                boxShadow: '0 2px 6px rgba(14,87,132,0.06)',
              }}
            >
              <div className="absolute inset-0 flex">
                <div className="w-1/2 relative overflow-hidden">
                  <Image src={beforeAfterSrc.before} alt="Antes" fill className="object-cover" sizes="50px" />
                </div>
                <div className="w-1/2 relative overflow-hidden">
                  <Image src={beforeAfterSrc.after} alt="Después" fill className="object-cover" sizes="50px" />
                </div>
              </div>
              <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white -translate-x-1/2 z-10" />
              <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[7px] font-bold uppercase tracking-wider text-center py-0.75 z-20 leading-none">
                Antes / Después
              </div>
            </button>
          )}
        </div>
      </div>

      {/* ── RIGHT: Product info + purchase ─────────────── */}
      <div>
        <div className="text-[12px] uppercase tracking-[0.18em] text-[var(--blue)] font-semibold mb-3.5">
          {catLabel}
        </div>

        <h1
          className="font-(family-name:--font-lora) text-[var(--ink)] font-medium mb-[18px]"
          style={{ fontSize: 'clamp(30px, 3.5vw, 40px)', lineHeight: 1.15, letterSpacing: '-0.02em' }}
        >
          {familia}
        </h1>

        {descripcionCorta && (
          <p className="text-[16px] text-[var(--ink-700)] leading-[1.7] mb-[22px]">
            {descripcionCorta}
          </p>
        )}

        {/* Rating */}
        {valoracion && (
          <div
            className="flex items-center gap-3.5 pb-[22px] mb-[26px] flex-wrap"
            style={{ borderBottom: '1px solid var(--line)' }}
          >
            <span
              className="text-[var(--warning)] text-[16px] tracking-[2px]"
              aria-label={`Valoración: ${valoracion} de 5 estrellas`}
              role="img"
            >
              {'★'.repeat(Math.round(valoracion))}
            </span>
            <span className="font-semibold text-[var(--ink)]" aria-hidden="true">{valoracion}.0</span>
            {numValoraciones && (
              <span className="text-[var(--ink-500)] text-[13px]">
                ({numValoraciones} valoraciones)
              </span>
            )}
            {hasReviews && (
              <a href="#opiniones" className="text-[var(--ink-500)] text-[13px] underline hover:text-[var(--blue)] transition-colors">
                Leer opiniones
              </a>
            )}
          </div>
        )}

        {codigoToxicologia && (
          <p className="text-[12px] text-[var(--ink-500)] mb-4">
            Reg. Tox.: {codigoToxicologia}
          </p>
        )}

        {/* ── Price */}
        <div className="flex items-baseline gap-3.5 mb-7">
          <span
            className="font-(family-name:--font-lora) font-semibold leading-none text-[var(--ink)]"
            style={{ fontSize: 42, letterSpacing: '-0.02em' }}
          >
            {precio.toFixed(2).replace('.', ',')} €
          </span>
          <span className="text-[12px] text-[var(--ink-500)] uppercase tracking-[0.1em] font-medium">
            IVA incluido
          </span>
        </div>

        {/* ── Format / variant selector */}
        {variants.length > 1 && (
          <div className="mb-[26px]">
            <div className="flex justify-between items-baseline text-[13px] font-semibold text-[var(--ink)] mb-3">
              <span>Formato</span>
              <span className="text-[var(--ink-500)] font-normal">
                Seleccionado: <strong className="text-[var(--ink)] font-semibold">{formato}</strong>
              </span>
            </div>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${Math.min(sorted.length, 4)}, 1fr)` }}
            >
              {sorted.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => selectVariant(i)}
                  aria-label={`Seleccionar formato ${v.formato} — ${v.precio.toFixed(2).replace('.', ',')} €`}
                  aria-pressed={variantIdx === i}
                  className="rounded-[var(--r-md)] py-3.5 px-1.5 text-center cursor-pointer transition-all text-[13px] font-medium"
                  style={{
                    background: variantIdx === i ? 'var(--blue)' : '#fff',
                    border: `1.5px solid ${variantIdx === i ? 'var(--blue)' : 'var(--line)'}`,
                    color: variantIdx === i ? '#fff' : 'var(--ink)',
                    boxShadow: variantIdx === i ? '0 4px 12px rgba(30,146,216,0.25)' : 'none',
                    opacity: v.stock <= 0 ? 0.55 : 1,
                  }}
                >
                  {v.formato}
                  <span className="block text-[11px] font-normal mt-[3px]" style={{ opacity: 0.85 }}>
                    {v.stock <= 0 ? 'Agotado' : `${v.precio.toFixed(2).replace('.', ',')} €`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Promo activa (3×2 con distintivo, o callout genérico) */}
        {settings.promo.activa && settings.promo.tipo === '3x2' && (
          <div
            className="rounded-[var(--r-md)] mb-[26px] flex items-stretch overflow-hidden"
            style={{ border: '2px solid var(--warning)' }}
          >
            {/* Sticker side */}
            <div
              className="flex flex-col items-center justify-center px-5 py-4 flex-shrink-0"
              style={{ background: 'var(--warning)', minWidth: 80 }}
            >
              <span
                className="font-(family-name:--font-lora) font-bold text-[var(--ink)] leading-none"
                style={{ fontSize: 28 }}
              >
                3×2
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--ink)] mt-1">
                GRATIS
              </span>
            </div>
            {/* Text side */}
            <div className="px-5 py-4 flex flex-col justify-center" style={{ background: '#fffbf0' }}>
              <strong className="text-[var(--ink)] text-[14px] block mb-0.5">
                Llévate 3, paga solo 2
              </strong>
              <span className="text-[12.5px] text-[var(--ink-500)] leading-snug">
                La unidad más barata sale gratis. Se aplica automáticamente al añadir al carrito.
              </span>
            </div>
          </div>
        )}
        {settings.promo.activa && settings.promo.tipo !== '3x2' && (
          <div
            className="rounded-[var(--r-md)] mb-[26px] px-5 py-4"
            style={{ border: '2px solid var(--warning)', background: '#fffbf0' }}
          >
            <strong className="text-[var(--ink)] text-[14px] block mb-0.5">
              {settings.promo.titulo}
            </strong>
            {settings.promo.descripcion && (
              <span className="text-[12.5px] text-[var(--ink-500)] leading-snug">
                {settings.promo.descripcion}
              </span>
            )}
          </div>
        )}

        {/* ── Qty + Add to cart */}
        <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: '130px 1fr' }}>
          <div
            className="flex items-center bg-white overflow-hidden"
            role="group"
            aria-label="Cantidad"
            style={{ border: '1.5px solid var(--line)', borderRadius: 'var(--r-pill)' }}
          >
            <button
              onClick={() => setCantidad(c => Math.max(1, c - 1))}
              aria-label="Reducir cantidad"
              className="flex-1 flex items-center justify-center py-3.5 text-[var(--ink-700)] hover:bg-[var(--blue-soft)] hover:text-[var(--blue)] transition-colors"
            >
              <Minus size={14} strokeWidth={2.5} aria-hidden="true" />
            </button>
            <span className="w-[50px] text-center text-[15px] font-semibold text-[var(--ink)]" aria-live="polite" aria-atomic="true">
              {cantidad}
            </span>
            <button
              onClick={() => setCantidad(c => Math.min(maxQty, c + 1))}
              aria-label="Aumentar cantidad"
              className="flex-1 flex items-center justify-center py-3.5 text-[var(--ink-700)] hover:bg-[var(--blue-soft)] hover:text-[var(--blue)] transition-colors"
            >
              <Plus size={14} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={agotado}
            className="flex items-center justify-center gap-2.5 text-white font-semibold text-[14px] uppercase tracking-[0.04em] rounded-[10px] transition-all disabled:cursor-not-allowed"
            style={{
              background: agotado ? 'var(--ink-300)' : added ? 'var(--success)' : 'var(--blue)',
              padding: '16px 28px',
            }}
            onMouseEnter={e => {
              if (!added && !agotado) {
                e.currentTarget.style.background = 'var(--blue-dark)'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(30,146,216,0.3)'
              }
            }}
            onMouseLeave={e => {
              if (!added && !agotado) {
                e.currentTarget.style.background = 'var(--blue)'
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = ''
              }
            }}
          >
            <ShoppingCart size={16} strokeWidth={2.2} />
            {agotado ? 'Agotado' : added ? '¡Añadido!' : 'Añadir a la cesta'}
          </button>
        </div>

        {/* Aviso de stock bajo / agotado del formato seleccionado */}
        {stockSel !== null && stockSel > 0 && stockSel <= 3 && (
          <p className="text-[13px] font-semibold mb-3" style={{ color: 'var(--warning)' }} role="status">
            ¡Solo quedan {stockSel} {stockSel === 1 ? 'unidad' : 'unidades'} de este formato!
          </p>
        )}
        {agotado && (
          <p className="text-[13px] text-[var(--ink-500)] mb-3" role="status">
            Este formato está agotado temporalmente. Elige otro formato o {' '}
            <a href="/contacto" className="text-[var(--blue)] underline">consúltanos la disponibilidad</a>.
          </p>
        )}

        {/* ── Buy now */}
        <button
          onClick={handleBuyNow}
          className="w-full flex items-center justify-center gap-2.5 text-white font-semibold text-[14px] uppercase tracking-[0.04em] rounded-[10px] mb-[22px] transition-all hover:-translate-y-px cursor-pointer"
          style={{ background: 'var(--ink)', padding: '16px 28px' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--ink-700)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--ink)' }}
        >
          Comprar ahora
          <ArrowRight size={14} strokeWidth={2.5} />
        </button>

        {/* ── Payment methods */}
        <div className="mb-[22px]" style={{ borderTop: '1px solid var(--line)', paddingTop: 22 }}>
          <div className="flex items-center gap-2 text-[12px] text-[var(--ink-500)] font-medium mb-3">
            <Lock size={14} className="text-[var(--blue)]" />
            Pago seguro con cifrado bancario
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'VISA', color: '#1a1f71' },
              { label: '● Mastercard', color: '#eb001b' },
            ].map(({ label, color }) => (
              <span
                key={label}
                className="inline-flex items-center h-8 px-3.5 rounded-[var(--r-sm)] text-[11.5px] font-bold"
                style={{ background: '#fff', border: '1px solid var(--line)', color }}
              >
                {label}
              </span>
            ))}
            <span className="text-[11.5px] text-[var(--ink-500)] font-medium">
              y demás métodos seguros vía Stripe
            </span>
          </div>
        </div>

        {/* ── Trust mini */}
        <div
          className="grid grid-cols-2 gap-3.5"
          style={{ borderTop: '1px solid var(--line)', paddingTop: 22 }}
        >
          {[
            { Icon: Truck,     title: settings.envio.texto_peninsula, sub: `Entrega en ${settings.envio.entrega_estimada}` },
            { Icon: RotateCcw, title: 'Devolución 14 días',        sub: 'Reintegro íntegro' },
            { Icon: Award,     title: 'Producto propio',           sub: 'Fórmula registrada' },
            { Icon: PhoneCall, title: 'Te asesoramos',             sub: settings.contacto.telefono },
          ].map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 text-[13px]">
              <div className="w-10 h-10 rounded-full bg-[var(--blue-soft)] flex items-center justify-center text-[var(--blue)] flex-shrink-0">
                <Icon size={17} />
              </div>
              <div>
                <strong className="block text-[var(--ink)] font-semibold text-[13px] leading-tight">{title}</strong>
                <span className="text-[var(--ink-500)] text-[11.5px]">{sub}</span>
              </div>
            </div>
          ))}
        </div>

        {fichaUrl && (
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--line)' }}>
            <a
              href={fichaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[13px] text-[var(--blue)] hover:underline no-underline"
            >
              <FileText size={16} />
              Descargar ficha técnica (PDF)
            </a>
          </div>
        )}

        {/* ── Barra de compra sticky (solo móvil) */}
        <div
          className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-[var(--line)] px-4 pt-2.5 flex items-center gap-3"
          style={{ paddingBottom: 'calc(10px + env(safe-area-inset-bottom))', boxShadow: '0 -6px 18px rgba(26,31,42,0.08)' }}
        >
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-[var(--ink-500)] leading-tight truncate">{formato}</div>
            <div className="text-[17px] font-bold text-[var(--ink)]">
              {precio.toFixed(2).replace('.', ',')} €
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={agotado}
            className="flex items-center justify-center gap-2 text-white font-semibold text-[13px] uppercase tracking-[0.04em] rounded-[10px] px-5 py-3 disabled:cursor-not-allowed"
            style={{ background: agotado ? 'var(--ink-300)' : added ? 'var(--success)' : 'var(--blue)' }}
          >
            <ShoppingCart size={15} strokeWidth={2.2} />
            {agotado ? 'Agotado' : added ? '¡Añadido!' : 'Añadir'}
          </button>
        </div>
      </div>
    </div>
  )
}
