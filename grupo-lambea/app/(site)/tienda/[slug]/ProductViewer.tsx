'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Minus, Plus, ShoppingCart, ArrowRight,
  Truck, RotateCcw, Award, PhoneCall, FileText,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCart } from '@/components/CartProvider'
import { PaymentMethods } from '@/components/PaymentMethods'
import { esFormatoPromo } from '@/lib/cart'
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
  const t = useTranslations('producto')

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

  // Formato de moneda (1.234,56) y total dinámico de la línea (precio × cantidad),
  // para que el usuario vea en todo momento cuánto va a gastar al cambiar cantidad.
  const eur = (n: number) => n.toFixed(2).replace('.', ',')
  const totalLinea = precio * cantidad
  // Promos: el 3×2 aplica a formatos 1 L/1 kg (tipos '3x2' y 'combinada'); el %
  // aplica al resto (tipos 'descuento' y 'combinada'). El distintivo 3×2 solo se
  // muestra si la promo lo incluye Y el producto tiene algún formato elegible.
  const promoTipo = settings.promo.tipo
  const promoPct = promoTipo === 'descuento' || promoTipo === 'combinada' ? settings.promo.valor : 0
  const show3x2 = settings.promo.activa && (promoTipo === '3x2' || promoTipo === 'combinada')
  const hasPromoFormato = show3x2 && sorted.some(v => esFormatoPromo(v.formato))
  const selFormatoPromo = esFormatoPromo(formato)

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
              {t('masVendido')}
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
                {t('antesDespues')}
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
                {t('valoraciones', { n: numValoraciones })}
              </span>
            )}
            {hasReviews && (
              <a href="#opiniones" className="text-[var(--ink-500)] text-[13px] underline hover:text-[var(--blue)] transition-colors">
                {t('leerOpiniones')}
              </a>
            )}
          </div>
        )}

        {codigoToxicologia && (
          <p className="text-[12px] text-[var(--ink-500)] mb-4">
            {t('regTox')} {codigoToxicologia}
          </p>
        )}

        {/* ── Price — el número grande es el TOTAL (precio × cantidad) y se
            actualiza en vivo al cambiar el formato o la cantidad. */}
        <div className="mb-7">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span
              className="font-(family-name:--font-lora) font-semibold leading-none text-[var(--ink)]"
              style={{ fontSize: 42, letterSpacing: '-0.02em', transition: 'color 0.15s ease' }}
              aria-live="polite"
            >
              {eur(totalLinea)} €
            </span>
            <span className="text-[12px] text-[var(--ink-500)] uppercase tracking-[0.1em] font-medium">
              {t('ivaIncluido')}
            </span>
          </div>
          {cantidad > 1 && (
            <p className="text-[13.5px] text-[var(--ink-500)] mt-2" aria-live="polite">
              {t('unidadesPorUd', { cantidad, precio: eur(precio) })}
            </p>
          )}
        </div>

        {/* ── Format / variant selector */}
        {variants.length > 1 && (
          <div className="mb-[26px]">
            <div className="flex justify-between items-baseline text-[13px] font-semibold text-[var(--ink)] mb-3">
              <span>{t('formato')}</span>
              <span className="text-[var(--ink-500)] font-normal">
                {t('seleccionado')} <strong className="text-[var(--ink)] font-semibold">{formato}</strong>
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
                    {v.stock <= 0 ? t('agotado') : `${v.precio.toFixed(2).replace('.', ',')} €`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Promo 3×2 — SOLO en formatos de 1 litro / 1 kg. El distintivo se
            muestra únicamente si el producto tiene algún formato elegible. */}
        {hasPromoFormato && (
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
                {t('gratis')}
              </span>
            </div>
            {/* Text side */}
            <div className="px-5 py-4 flex flex-col justify-center" style={{ background: '#fffbf0' }}>
              <strong className="text-[var(--ink)] text-[14px] block mb-0.5">
                {t('promo3x2Titulo')}
              </strong>
              <span className="text-[12.5px] text-[var(--ink-500)] leading-snug">
                {selFormatoPromo ? t('promo3x2Sel') : t('promo3x2NoSel')}
                {promoTipo === 'combinada' && promoPct > 0 && (
                  <> {' '}{t('promoComboResto', { pct: promoPct })}</>
                )}
              </span>
            </div>
          </div>
        )}
        {/* Callout de % de descuento: para promo 'descuento'/'envio_gratis', y para
            'combinada' cuando el producto NO tiene formato elegible para el 3×2. */}
        {settings.promo.activa &&
          (promoTipo === 'descuento' || promoTipo === 'envio_gratis' || (promoTipo === 'combinada' && !hasPromoFormato)) && (
          <div
            className="rounded-[var(--r-md)] mb-[26px] px-5 py-4"
            style={{ border: '2px solid var(--warning)', background: '#fffbf0' }}
          >
            <strong className="text-[var(--ink)] text-[14px] block mb-0.5">
              {promoTipo === 'combinada' ? t('descuentoPct', { pct: promoPct }) : settings.promo.titulo}
            </strong>
            <span className="text-[12.5px] text-[var(--ink-500)] leading-snug">
              {promoTipo === 'combinada'
                ? t('descuentoAuto')
                : settings.promo.descripcion}
            </span>
          </div>
        )}

        {/* ── Qty + Add to cart */}
        <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: '142px 1fr' }}>
          <div className="qty-stepper" role="group" aria-label="Cantidad">
            <button
              onClick={() => setCantidad(c => Math.max(1, c - 1))}
              disabled={cantidad <= 1}
              aria-label={t('reducirCantidad')}
              className="qty-btn flex-1 flex items-center justify-center py-4"
            >
              <Minus size={16} strokeWidth={2.5} aria-hidden="true" />
            </button>
            <span
              className="min-w-[46px] flex items-center justify-center text-center text-[16px] font-bold text-[var(--ink)] select-none"
              aria-live="polite"
              aria-atomic="true"
            >
              {cantidad}
            </span>
            <button
              onClick={() => setCantidad(c => Math.min(maxQty, c + 1))}
              disabled={cantidad >= maxQty}
              aria-label={t('aumentarCantidad')}
              className="qty-btn flex-1 flex items-center justify-center py-4"
            >
              <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={agotado}
            data-added={added ? 'true' : undefined}
            className="btn-cart flex items-center justify-center gap-2.5 text-white font-semibold text-[14px] uppercase tracking-[0.04em] rounded-[10px] disabled:cursor-not-allowed"
            style={{ padding: '16px 28px' }}
          >
            <ShoppingCart size={16} strokeWidth={2.2} />
            {agotado ? t('agotado') : added ? t('anadido') : t('anadir')}
          </button>
        </div>

        {/* (El total ya se muestra en el precio grande de arriba.) */}

        {/* Aviso de stock bajo / agotado del formato seleccionado */}
        {stockSel !== null && stockSel > 0 && stockSel <= 3 && (
          <p className="text-[13px] font-semibold mb-3" style={{ color: 'var(--warning)' }} role="status">
            {stockSel === 1 ? t('soloQuedanUna') : t('soloQuedanVarias', { n: stockSel })}
          </p>
        )}
        {agotado && (
          <p className="text-[13px] text-[var(--ink-500)] mb-3" role="status">
            {t('agotadoMsg')} {' '}
            <a href="/contacto" className="text-[var(--blue)] underline">{t('agotadoMsgLink')}</a>.
          </p>
        )}

        {/* ── Buy now */}
        <button
          onClick={handleBuyNow}
          disabled={agotado}
          className="btn-dark w-full flex items-center justify-center gap-2.5 text-white font-semibold text-[14px] uppercase tracking-[0.04em] rounded-[10px] mb-[22px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          style={{ padding: '16px 28px' }}
        >
          {t('comprarAhora')}
          <ArrowRight size={14} strokeWidth={2.5} />
        </button>

        {/* ── Payment methods */}
        <div className="mb-[22px]" style={{ borderTop: '1px solid var(--line)', paddingTop: 22 }}>
          <PaymentMethods />
        </div>

        {/* ── Trust mini */}
        <div
          className="grid grid-cols-2 gap-3.5"
          style={{ borderTop: '1px solid var(--line)', paddingTop: 22 }}
        >
          {[
            { Icon: Truck,     title: settings.envio.texto_peninsula, sub: `${t('trustEntregaEn')} ${settings.envio.entrega_estimada}` },
            { Icon: RotateCcw, title: t('trustDevolucion'),        sub: t('trustReintegro') },
            { Icon: Award,     title: t('trustProducto'),          sub: t('trustFormula') },
            { Icon: PhoneCall, title: t('trustAsesoramos'),        sub: settings.contacto.telefono },
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
              {t('descargarFicha')}
            </a>
          </div>
        )}

        {/* ── Barra de compra sticky (solo móvil) */}
        <div
          className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-[var(--line)] px-4 pt-2.5 flex items-center gap-3"
          style={{ paddingBottom: 'calc(10px + env(safe-area-inset-bottom))', boxShadow: '0 -6px 18px rgba(26,31,42,0.08)' }}
        >
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-[var(--ink-500)] leading-tight truncate">
              {formato}{cantidad > 1 ? ` · ${cantidad} uds` : ''}
            </div>
            <div className="text-[17px] font-bold text-[var(--ink)]">
              {eur(totalLinea)} €
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={agotado}
            data-added={added ? 'true' : undefined}
            className="btn-cart flex items-center justify-center gap-2 text-white font-semibold text-[13px] uppercase tracking-[0.04em] rounded-[10px] px-5 py-3 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={15} strokeWidth={2.2} />
            {agotado ? t('agotado') : added ? t('anadido') : t('anadirCorto')}
          </button>
        </div>
      </div>
    </div>
  )
}
