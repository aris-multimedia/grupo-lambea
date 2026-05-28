import type { Metadata } from 'next'
import { Caravan } from 'lucide-react'
import { getAllProducts } from '@/lib/products'
import { CategoryPageLayout } from '@/components/CategoryPageLayout'

export const metadata: Metadata = {
  title: 'Productos para Caravanas y Campers — Limpieza y mantenimiento | Grupo Lambea',
  description:
    'Limpiadores de toldo, abrillantadores para plásticos, desengrasantes y productos para depósitos de agua. Formulados para caravanas, autocaravanas y furgonetas camper.',
  alternates: { canonical: '/tienda/caravaning' },
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
