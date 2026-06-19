import type { Metadata } from 'next'
import { Factory } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { getAllProducts } from '@/lib/products'
import { getPageSeo } from '@/lib/seo'
import { CategoryPageLayout } from '@/components/CategoryPageLayout'

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getPageSeo('industrial')
  const url = '/tienda/industrial'
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: 'Grupo Lambea', locale: 'es_ES', url, title, description },
  }
}

export default async function IndustrialPage() {
  const all = await getAllProducts()
  const products = all.filter((p) => p.aplicaciones.includes('industrial'))
  const t = await getTranslations('categoria')
  const tc = await getTranslations('cats')
  const config = {
    slug: 'industrial' as const,
    label: tc('industrial'),
    tagline: t('industrialTagline'),
    headline: t('industrialHeadline'),
    headlineEm: t('industrialHeadlineEm'),
    description: t('industrialDescription'),
    heroImage: '/assets/categorias/foto-industrial.jpg',
    Icon: Factory,
  }
  return <CategoryPageLayout config={config} products={products} />
}
