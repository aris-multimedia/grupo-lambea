import type { Metadata } from 'next'
import { Factory } from 'lucide-react'
import { getAllProducts } from '@/lib/products'
import { CategoryPageLayout } from '@/components/CategoryPageLayout'

export const metadata: Metadata = {
  title: 'Productos Industriales — Talleres, camiones y flotas | Grupo Lambea',
  description:
    'Aditivos pre-ITV para diesel y gasolina, desengrasantes de motores, limpiadores de inyectores y productos de mantenimiento para talleres mecánicos y flotas de vehículos.',
  alternates: { canonical: '/tienda/industrial' },
}

const config = {
  slug: 'industrial' as const,
  label: 'Industrial',
  tagline: 'Industrial · Talleres y flotas',
  headline: 'Productos para talleres',
  headlineEm: 'y vehículos.',
  description:
    'Aditivos pre-ITV, desengrasantes de motores de alto rendimiento, limpiadores de inyectores y productos de mantenimiento para talleres mecánicos, camiones y flotas.',
  heroImage: '/assets/categorias/foto-industrial.jpg',
  Icon: Factory,
}

export default async function IndustrialPage() {
  const all = await getAllProducts()
  const products = all.filter((p) => p.aplicaciones.includes('industrial'))
  return <CategoryPageLayout config={config} products={products} />
}
