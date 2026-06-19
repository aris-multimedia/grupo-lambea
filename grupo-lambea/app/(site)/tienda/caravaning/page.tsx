import type { Metadata } from 'next'
import { Caravan } from 'lucide-react'
import { getAllProducts } from '@/lib/products'
import { getPageSeo } from '@/lib/seo'
import { CategoryPageLayout } from '@/components/CategoryPageLayout'

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getPageSeo('caravaning')
  const url = '/tienda/caravaning'
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: 'Grupo Lambea', locale: 'es_ES', url, title, description },
  }
}

const config = {
  slug: 'caravaning' as const,
  label: 'Caravaning',
  tagline: 'Caravaning · Vehículos recreativos',
  headline: 'Productos para caravanas',
  headlineEm: 'y campers.',
  description:
    'Limpiadores de toldo, abrillantadores de plástico, productos para depósito de aguas y mantenimiento completo para caravanas, autocaravanas y furgonetas camper.',
  heroImage: '/assets/categorias/foto-caravanas.jpg',
  Icon: Caravan,
}

export default async function CaravaningPage() {
  const all = await getAllProducts()
  const products = all.filter((p) => p.aplicaciones.includes('caravaning'))
  return <CategoryPageLayout config={config} products={products} />
}
