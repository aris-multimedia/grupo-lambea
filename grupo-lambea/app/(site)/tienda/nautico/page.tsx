import type { Metadata } from 'next'
import { Anchor } from 'lucide-react'
import { getAllProducts } from '@/lib/products'
import { CategoryPageLayout } from '@/components/CategoryPageLayout'

export const metadata: Metadata = {
  title: 'Productos Náuticos — Limpieza y mantenimiento para embarcaciones',
  description:
    'Limpiadores de gelcoat, desoxidantes marinos, pulimentos para fibra y teca, productos para motores y cabinas. Fabricados en España desde 1952. Promo 3×2.',
  alternates: { canonical: '/tienda/nautico' },
  openGraph: {
    type: 'website',
    siteName: 'Grupo Lambea',
    locale: 'es_ES',
    url: '/tienda/nautico',
    title: 'Productos Náuticos — Limpieza y mantenimiento para embarcaciones',
    description:
      'Limpiadores de gelcoat, desoxidantes marinos, pulimentos para fibra y teca, productos para motores y cabinas. Fabricados en España desde 1952. Promo 3×2.',
  },
}

const config = {
  slug: 'nautico' as const,
  label: 'Náutica',
  tagline: 'Náutica · Desde 1952',
  headline: 'Productos para barcos',
  headlineEm: 'y embarcaciones.',
  description:
    'Desoxidantes marinos, limpiadores de gelcoat, pulimentos para fibra y teca, y todo lo que necesita una embarcación para aguantar el ambiente marino.',
  heroImage: '/assets/categorias/foto-productos-barco.jpg',
  Icon: Anchor,
}

export default async function NauticoPage() {
  const all = await getAllProducts()
  const products = all.filter((p) => p.aplicaciones.includes('nautico'))
  return <CategoryPageLayout config={config} products={products} />
}
