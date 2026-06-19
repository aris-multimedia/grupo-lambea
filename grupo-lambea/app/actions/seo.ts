'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { sql } from '@/lib/db'
import { PAGE_SEO_TAG } from '@/lib/seo'

async function ensurePageSeoTable() {
  await sql`CREATE TABLE IF NOT EXISTS page_seo (
    key TEXT PRIMARY KEY, title TEXT, description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`
}

/** Guarda el SEO de una página estática (home, categorías, nosotros, contacto…). */
export async function updatePageSeo(key: string, title: string, description: string) {
  await ensurePageSeoTable()
  await sql`
    INSERT INTO page_seo (key, title, description, updated_at)
    VALUES (${key}, ${title.trim() || null}, ${description.trim() || null}, now())
    ON CONFLICT (key) DO UPDATE
      SET title = EXCLUDED.title, description = EXCLUDED.description, updated_at = now()
  `
  updateTag(PAGE_SEO_TAG)
  revalidatePath('/', 'layout')
  revalidatePath('/admin/seo')
  return { ok: true }
}

/** Guarda el SEO (Yoast) de una ficha de producto. */
export async function updateProductSeo(
  id: number,
  slug: string,
  seoTitle: string,
  seoDescription: string,
) {
  await sql`
    UPDATE products
    SET seo_title = ${seoTitle.trim() || null}, seo_description = ${seoDescription.trim() || null}
    WHERE id = ${id}
  `
  revalidatePath(`/tienda/${slug}`)
  revalidatePath('/admin/seo')
  return { ok: true }
}
