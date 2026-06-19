import { cacheLife, cacheTag } from 'next/cache'
import { sql } from './db'

// SEO de PÁGINAS estáticas (las fichas de producto usan products.seo_title/…).
// Se gestiona desde /admin/seo y se consume con getPageSeo() en cada
// generateMetadata. Si la tabla/clave no existe, se usan estos defaults.

export const PAGE_SEO_TAG = 'page-seo'

export interface PageSeoDef {
  key: string
  label: string
  ruta: string
  title: string
  description: string
}

export const PAGE_SEO_DEFS: PageSeoDef[] = [
  {
    key: 'home',
    label: 'Inicio',
    ruta: '/',
    title: 'Grupo Lambea — Productos profesionales de limpieza y mantenimiento',
    description:
      'Fabricante familiar desde 1952. Productos de limpieza, pulido y mantenimiento para náutica, caravaning e industria. Envío gratis en Península.',
  },
  {
    key: 'nautico',
    label: 'Tienda · Náutica',
    ruta: '/tienda/nautico',
    title: 'Productos de limpieza náutica para barcos | Grupo Lambea',
    description:
      'Limpiadores, desoxidantes, pulimentos y protectores para embarcaciones: gelcoat, fibra, teca, motores. Fórmulas profesionales fabricadas en España.',
  },
  {
    key: 'caravaning',
    label: 'Tienda · Caravaning',
    ruta: '/tienda/caravaning',
    title: 'Productos de limpieza para caravanas y campers | Grupo Lambea',
    description:
      'Limpieza y mantenimiento de caravanas, autocaravanas y furgonetas camper. Desengrasantes, limpiafibras, abrillantadores y más.',
  },
  {
    key: 'industrial',
    label: 'Tienda · Industrial',
    ruta: '/tienda/industrial',
    title: 'Productos de limpieza industrial y para talleres | Grupo Lambea',
    description:
      'Aditivos pre-ITV, desengrasantes y desoxidantes de alto rendimiento para vehículos, talleres mecánicos y limpieza industrial.',
  },
  {
    key: 'nosotros',
    label: 'Nosotros',
    ruta: '/nosotros',
    title: 'Sobre Grupo Lambea — Tres generaciones fabricando en España',
    description:
      'Empresa familiar fundada en 1952 en Tarragona. Fabricamos nuestros propios productos de limpieza y mantenimiento con décadas de oficio.',
  },
  {
    key: 'contacto',
    label: 'Contacto',
    ruta: '/contacto',
    title: 'Contacto — Grupo Lambea',
    description:
      'Habla directamente con el fabricante. Te asesoramos sobre el producto que necesitas para tu barco, caravana o taller.',
  },
]

const DEF_BY_KEY = new Map(PAGE_SEO_DEFS.map((d) => [d.key, d]))

/** Lectura cacheada para generateMetadata. Cae a los defaults si no hay fila. */
export async function getPageSeo(key: string): Promise<{ title: string; description: string }> {
  'use cache'
  cacheLife('hours')
  cacheTag(PAGE_SEO_TAG)

  const def = DEF_BY_KEY.get(key)
  const fallback = {
    title: def?.title ?? 'Grupo Lambea',
    description: def?.description ?? '',
  }
  try {
    const [row] = await sql`SELECT title, description FROM page_seo WHERE key = ${key} LIMIT 1`
    if (!row) return fallback
    return {
      title: (typeof row.title === 'string' && row.title.trim()) || fallback.title,
      description: (typeof row.description === 'string' && row.description.trim()) || fallback.description,
    }
  } catch {
    return fallback // tabla aún no migrada
  }
}

export interface PageSeoRow extends PageSeoDef {
  titleSaved: string
  descriptionSaved: string
}

/** Lectura sin cache para el panel admin: defaults + lo guardado en DB. */
export async function getAllPageSeoRaw(): Promise<PageSeoRow[]> {
  const saved: Record<string, { title: string | null; description: string | null }> = {}
  try {
    const rows = await sql`SELECT key, title, description FROM page_seo`
    for (const r of rows as { key: string; title: string | null; description: string | null }[]) {
      saved[r.key] = { title: r.title, description: r.description }
    }
  } catch {
    // tabla aún no migrada → solo defaults
  }
  return PAGE_SEO_DEFS.map((d) => ({
    ...d,
    titleSaved: saved[d.key]?.title ?? '',
    descriptionSaved: saved[d.key]?.description ?? '',
  }))
}
