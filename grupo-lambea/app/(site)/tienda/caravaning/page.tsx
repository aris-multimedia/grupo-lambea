import type { Metadata } from 'next'
import { Caravan } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
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

export default async function CaravaningPage() {
  const all = await getAllProducts()
  const products = all.filter((p) => p.aplicaciones.includes('caravaning'))
  const t = await getTranslations('categoria')
  const tc = await getTranslations('cats')
  const config = {
    slug: 'caravaning' as const,
    label: tc('caravaning'),
    tagline: t('caravaningTagline'),
    headline: t('caravaningHeadline'),
    headlineEm: t('caravaningHeadlineEm'),
    description: t('caravaningDescription'),
    heroImage: '/assets/categorias/foto-caravanas.jpg',
    Icon: Caravan,
  }
  return <CategoryPageLayout config={config} products={products} />
}
