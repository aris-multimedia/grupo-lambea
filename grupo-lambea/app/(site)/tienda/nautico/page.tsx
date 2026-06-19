import type { Metadata } from 'next'
import { Anchor } from 'lucide-react'
import { getAllProducts } from '@/lib/products'
import { getPageSeo } from '@/lib/seo'
import { CategoryPageLayout } from '@/components/CategoryPageLayout'

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getPageSeo('nautico')
  const url = '/tienda/nautico'
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: 'Grupo Lambea', locale: 'es_ES', url, title, description },
  }
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
