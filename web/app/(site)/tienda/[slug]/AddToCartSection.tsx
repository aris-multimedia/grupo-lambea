'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingCart, ArrowRight, Lock, Truck, RotateCcw, Award, PhoneCall, Building2 } from 'lucide-react'
import { useCart } from '@/components/CartProvider'
import type { ProductVariant } from '@/lib/products'

interface Props {
  slug: string
  familia: string
  imagenDefault: string
  aplicaciones: string[]
  variants: ProductVariant[]
  precioDesde: number | null
  precioHasta: number | null
}

export function AddToCartSection({
  slug,
  familia,
  imagenDefault,
  aplicaciones,
  variants,
  precioDesde,
  precioHasta,
}: Props) {
  const [variantIdx, setVariantIdx] = useState(0)
  const [cantidad, setCantidad] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const hasVariants = variants.length > 0
  const selectedVariant = hasVariants ? variants[variantIdx] : null

  // Price: use real variant price when available, otherwise interpolate from range
  const precio = selectedVariant
    ? selectedVariant.precio
    : (() => {
        const desde = precioDesde ?? 0
        const hasta = precioHasta ?? desde
        if (variants.length <= 1) return desde
        const ratio = variantIdx / Math.max(variants.length - 1, 1)
        return Number((desde + ratio * (hasta - desde)).toFixed(2))
      })()

  // Image: use variant-specific image if available
  const currentImage = selectedVariant?.imagen_url || imagenDefault

  const formato = selectedVariant?.formato ?? 'Unidad'
  const aplicacion = aplicaciones[0] ?? 'generico'

  function handleAdd() {
    for (let i = 0; i < cantidad; i++) {
      addItem({ slug, familia, aplicacion, formato, precio, imagen: currentImage })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      {/* Price */}
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

      {/* Variant / format selector */}
      {hasVariants && variants.length > 1 && (
        <div className="mb-[26px]">
          <div className="flex justify-between items-baseline text-[13px] font-semibold text-[var(--ink)] mb-3">
            <span>Formato</span>
            <span className="text-[var(--ink-500)] font-normal">
              Seleccionado: <strong className="text-[var(--ink)] font-semibold">{formato}</strong>
            </span>
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(variants.length, 4)}, 1fr)` }}>
            {variants.map((v, i) => (
              <button
                key={v.id}
                onClick={() => setVariantIdx(i)}
                className="rounded-[var(--r-md)] py-3.5 px-1.5 text-center cursor-pointer transition-all text-[13px] font-medium"
                style={{
                  background: variantIdx === i ? 'var(--blue)' : '#fff',
                  border: `1.5px solid ${variantIdx === i ? 'var(--blue)' : 'var(--line)'}`,
                  color: variantIdx === i ? '#fff' : 'var(--ink)',
                  boxShadow: variantIdx === i ? '0 4px 12px rgba(30,146,216,0.25)' : 'none',
                }}
              >
                {v.formato}
                <span
                  className="block text-[11px] font-normal mt-[3px]"
                  style={{ opacity: 0.85 }}
                >
                  {v.precio.toFixed(2).replace('.', ',')} €
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Promo 3×2 */}
      <div
        className="rounded-[var(--r-md)] mb-[26px] flex items-stretch overflow-hidden"
        style={{ border: '2px solid var(--warning)' }}
      >
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
        <div className="px-5 py-4 flex flex-col justify-center" style={{ background: '#fffbf0' }}>
          <strong className="text-[var(--ink)] text-[14px] block mb-0.5">
            Llévate 3, paga solo 2
          </strong>
          <span className="text-[12.5px] text-[var(--ink-500)] leading-snug">
            La unidad más barata sale gratis. Se aplica automáticamente al carrito.
          </span>
        </div>
      </div>

      {/* Qty + Add to cart */}
      <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: '130px 1fr' }}>
        {/* Qty */}
        <div
          className="flex items-center bg-white overflow-hidden"
          style={{ border: '1.5px solid var(--line)', borderRadius: 'var(--r-pill)' }}
        >
          <button
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            className="flex-1 flex items-center justify-center py-3.5 text-[var(--ink-700)] hover:bg-[var(--blue-soft)] hover:text-[var(--blue)] transition-colors"
          >
            <Minus size={14} strokeWidth={2.5} />
          </button>
          <span className="w-[50px] text-center text-[15px] font-semibold text-[var(--ink)]">
            {cantidad}
          </span>
          <button
            onClick={() => setCantidad((c) => c + 1)}
            className="flex-1 flex items-center justify-center py-3.5 text-[var(--ink-700)] hover:bg-[var(--blue-soft)] hover:text-[var(--blue)] transition-colors"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2.5 text-white font-semibold text-[14px] uppercase tracking-[0.04em] rounded-[10px] transition-all"
          style={{
            background: added ? 'var(--success)' : 'var(--blue)',
            padding: '16px 28px',
            boxShadow: added ? 'none' : undefined,
          }}
          onMouseEnter={(e) => {
            if (!added) {
              const el = e.currentTarget
              el.style.background = 'var(--blue-dark)'
              el.style.transform = 'translateY(-1px)'
              el.style.boxShadow = '0 8px 20px rgba(30,146,216,0.3)'
            }
          }}
          onMouseLeave={(e) => {
            if (!added) {
              const el = e.currentTarget
              el.style.background = 'var(--blue)'
              el.style.transform = ''
              el.style.boxShadow = ''
            }
          }}
        >
          <ShoppingCart size={16} strokeWidth={2.2} />
          {added ? '¡Añadido!' : 'Añadir a la cesta'}
        </button>
      </div>

      {/* Buy now */}
      <button
        className="w-full flex items-center justify-center gap-2.5 text-white font-semibold text-[14px] uppercase tracking-[0.04em] rounded-[10px] mb-[22px] transition-all hover:-translate-y-px"
        style={{ background: 'var(--ink)', padding: '16px 28px' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ink-700)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ink)' }}
      >
        Comprar ahora
        <ArrowRight size={14} strokeWidth={2.5} />
      </button>

      {/* Payment methods */}
      <div className="mb-[22px]" style={{ borderTop: '1px solid var(--line)', paddingTop: 22 }}>
        <div className="flex items-center gap-2 text-[12px] text-[var(--ink-500)] font-medium mb-3">
          <Lock size={14} className="text-[var(--success)]" />
          Pago seguro con cifrado bancario
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'VISA', color: '#1a1f71' },
            { label: '● Mastercard', color: '#eb001b' },
            { label: 'AMEX', color: '#2e77bb' },
            { label: 'Bizum', bg: '#04bfdf', color: 'white' },
            { label: 'Apple Pay', color: '#000' },
            { label: 'G Pay', color: '#4285F4' },
          ].map(({ label, color, bg }) => (
            <span
              key={label}
              className="inline-flex items-center h-8 px-3.5 rounded-[var(--r-sm)] text-[11.5px] font-bold"
              style={{
                background: bg ?? '#fff',
                border: bg ? `1px solid ${bg}` : '1px solid var(--line)',
                color,
              }}
            >
              {label}
            </span>
          ))}
          <span
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--r-sm)] text-[11.5px] font-bold"
            style={{ background: '#fff', border: '1px solid var(--line)', color: 'var(--blue-deep)' }}
          >
            <Building2 size={12} />
            Transferencia
          </span>
        </div>
      </div>

      {/* Trust mini */}
      <div
        className="grid grid-cols-2 gap-3.5"
        style={{ borderTop: '1px solid var(--line)', paddingTop: 22 }}
      >
        {[
          { Icon: Truck, title: 'Envío gratis a Península', sub: 'Entrega en 24-48 h' },
          { Icon: RotateCcw, title: 'Devolución 7 días', sub: 'Reintegro íntegro' },
          { Icon: Award, title: 'Producto propio', sub: 'Fórmula registrada' },
          { Icon: PhoneCall, title: 'Te asesoramos', sub: '637 91 63 45' },
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
    </>
  )
}
