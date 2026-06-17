import type { LucideIcon } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { PageHero } from '@/components/PageHero'
import type { Product } from '@/lib/products'

export interface CategoryConfig {
  slug: 'nautico' | 'caravaning' | 'industrial'
  label: string
  tagline: string
  headline: string
  headlineEm: string
  description: string
  heroImage: string
  Icon: LucideIcon
}

interface Props {
  config: CategoryConfig
  products: Product[]
}

export function CategoryPageLayout({ config, products }: Props) {
  const { label, tagline, headline, headlineEm, description, heroImage, Icon } = config

  return (
    <>
      <PageHero
        tagline={tagline}
        TaglineIcon={Icon}
        headline={headline}
        headlineEm={headlineEm}
        description={description}
        image={heroImage}
        imageAlt={`${label} — Grupo Lambea`}
        minHeight={360}
      />

      {/* ── PRODUCT GRID ──────────────────────────────────────── */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {products.length === 0 ? (
          <div className="text-center py-24 text-[var(--ink-500)]">
            No hay productos en esta categoría.
          </div>
        ) : (
          <>
          <p className="mb-5 text-[13px] text-[var(--ink-500)]">
            {products.length} {products.length === 1 ? 'producto' : 'productos'} en {label}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {products.map((p, i) => (
              <ProductCard key={p.slug} product={p} priority={i < 4} />
            ))}
          </div>
          </>
        )}
      </div>

    </>
  )
}
