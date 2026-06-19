import type { Metadata } from 'next'
import { Anchor } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
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

export default async function NauticoPage() {
  const all = await getAllProducts()
  const products = all.filter((p) => p.aplicaciones.includes('nautico'))
  const t = await getTranslations('categoria')
  const tc = await getTranslations('cats')
  const config = {
    slug: 'nautico' as const,
    label: tc('nautica'),
    tagline: t('nauticoTagline'),
    headline: t('nauticoHeadline'),
    headlineEm: t('nauticoHeadlineEm'),
    description: t('nauticoDescription'),
    heroImage: '/assets/categorias/foto-productos-barco.jpg',
    Icon: Anchor,
  }
  return <CategoryPageLayout config={config} products={products} />
}
