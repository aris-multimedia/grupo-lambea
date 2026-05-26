'use client'

import Image from 'next/image'
import { Plus } from 'lucide-react'

export interface MockProduct {
  slug: string
  familia: string
  descripcion_corta: string
  aplicaciones: string[]
  precio_desde: number
  imagen: string
  valoracion?: number
  num_valoraciones?: number
}

interface Props {
  product: MockProduct
  priority?: boolean
}

const aplicacionLabel: Record<string, string> = {
  nautico: 'Náutica',
  caravaning: 'Caravaning',
  industrial: 'Industrial',
}

const BESTSELLERS = ['DESOXILAM', 'INYECLAM DIESEL']

type BadgeVariant = 'primary' | 'warning' | 'dark'

const BADGE_STYLES: Record<BadgeVariant, string> = {
  primary: 'bg-[var(--blue)] text-white',
  warning: 'bg-[var(--warning)] text-[var(--ink)]',
  dark: 'bg-[var(--ink)] text-white',
}

function resolveBadge(
  familia: string,
  aplicaciones: string[],
  catLabel: string,
): { label: string; variant: BadgeVariant } {
  const fam = familia.toUpperCase()
  if (fam.includes('INYECLAM')) return { label: 'Pre-ITV', variant: 'primary' }
  if (BESTSELLERS.includes(familia)) return { label: 'Más vendido', variant: 'primary' }
  if (fam.includes('FIBRALAM')) return { label: 'Profesional', variant: 'warning' }
  if (aplicaciones.includes('industrial')) return { label: 'Industrial', variant: 'dark' }
  return { label: catLabel, variant: 'primary' }
}

export function ProductCard({ product, priority = false }: Props) {
  const catLabel = aplicacionLabel[product.aplicaciones[0]] ?? product.aplicaciones[0]
  const badge = resolveBadge(product.familia, product.aplicaciones, catLabel)

  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      className="group block bg-white rounded-[var(--r-md)] overflow-hidden text-inherit no-underline flex flex-col relative"
      style={{ border: '1px solid #e2e8ef', boxShadow: '0 1px 4px rgba(14,87,132,0.04)', transition: 'all 0.3s' }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.transform = 'translateY(-4px)'
        el.style.boxShadow = '0 12px 28px rgba(14,87,132,0.10)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = ''
        el.style.boxShadow = '0 1px 4px rgba(14,87,132,0.04)'
      }}
    >
      <div className="relative aspect-square bg-white overflow-hidden flex items-center justify-center">
        <div className="w-[78%] h-[78%] relative transition-transform duration-500 group-hover:scale-105">
          <Image
            src={product.imagen}
            alt={product.familia}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain"
            priority={priority}
          />
        </div>

        <span className={`absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 ${BADGE_STYLES[badge.variant]} text-[9.5px] sm:text-[10.5px] font-semibold uppercase tracking-[0.08em] sm:tracking-[0.1em] px-2 sm:px-3 py-[3px] sm:py-1 rounded-full z-10 max-w-[80%] truncate`}>
          {badge.label}
        </span>

        <div
          className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-10 flex flex-col items-center justify-center w-11 h-11 sm:w-[54px] sm:h-[54px]"
          style={{
            background: 'var(--warning)',
            borderRadius: '50%',
            transform: 'rotate(-12deg)',
            boxShadow: '0 4px 10px rgba(232,169,60,0.5)',
          }}
        >
          <span className="font-(family-name:--font-lora) font-bold text-[var(--ink)] leading-none text-[12px] sm:text-[15px]">3×2</span>
          <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.04em] text-[var(--ink)] opacity-75 mt-0.5">Gratis</span>
        </div>
      </div>

      <div className="px-3.5 sm:px-[22px] pt-3.5 sm:pt-[22px] pb-4 sm:pb-6 flex flex-col flex-1">
        <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-[var(--blue)] font-semibold mb-1.5 sm:mb-2">
          {catLabel}
        </div>

        <h3 className="font-(family-name:--font-lora) text-[15px] sm:text-[18px] text-[var(--ink)] leading-tight mb-1.5 sm:mb-2 font-medium">
          {product.familia}
        </h3>

        <p className="hidden sm:block text-[13px] text-[var(--ink-500)] leading-relaxed mb-3 flex-1 line-clamp-2">
          {product.descripcion_corta}
        </p>
        <div className="flex-1 sm:hidden" />

        {product.valoracion && (
          <div className="hidden sm:flex items-center gap-1.5 mb-3.5">
            <span className="text-[var(--warning)] text-[13px] tracking-wider">
              {'★'.repeat(Math.round(product.valoracion))}{'☆'.repeat(5 - Math.round(product.valoracion))}
            </span>
            {product.num_valoraciones && (
              <span className="text-[11.5px] text-[var(--ink-500)]">({product.num_valoraciones} valoraciones)</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2.5 sm:pt-3.5 border-t border-[var(--line)] gap-2">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] text-(--ink-500) font-medium mr-1">desde</span>
            <span className="font-(family-name:--font-lora) text-[17px] sm:text-[22px] text-(--ink) font-semibold tracking-tight whitespace-nowrap">
              {product.precio_desde.toFixed(2).replace('.', ',')} €
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-[var(--blue)] hover:bg-[var(--blue-dark)] text-white flex items-center justify-center hover:scale-[1.08] transition-all cursor-pointer"
            aria-label={`Añadir ${product.familia} al carrito`}
          >
            <Plus size={16} strokeWidth={2.2} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>
    </a>
  )
}
