import type { Metadata } from 'next'
import { sql } from '@/lib/db'
import { getAllPageSeoRaw } from '@/lib/seo'
import { PageHeader } from '../_components/layout'
import { SeoManager, type ProductRow } from './SeoManager'

export const metadata: Metadata = { title: 'SEO · Admin' }

export default async function AdminSeoPage() {
  const [pages, rows] = await Promise.all([
    getAllPageSeoRaw(),
    sql`SELECT id, familia, slug, seo_title, seo_description
        FROM products WHERE visible_admin = true ORDER BY familia, slug`,
  ])

  const productos: ProductRow[] = (rows as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id),
    familia: String(r.familia),
    slug: String(r.slug),
    seoTitle: r.seo_title ? String(r.seo_title) : '',
    seoDescription: r.seo_description ? String(r.seo_description) : '',
  }))

  return (
    <>
      <PageHeader
        title="SEO"
        subtitle="Gestiona los títulos y meta-descripciones de las páginas y de cada ficha de producto. Los cambios se publican en la web al guardar."
      />
      <SeoManager pages={pages} productos={productos} />
    </>
  )
}
