import { readdirSync } from 'fs'
import { join } from 'path'

export interface ImagePair {
  slug: string
  familia: string
  categoria: 'Náutico' | 'Caravaning' | 'Industrial'
  categoriaSlug: 'nautico' | 'caravaning' | 'industrial'
}

// Familias canónicas (clave = prefijo del slug)
// ANTIDESLILAM excluido: producto descatalogado.
const FAMILIES: Record<string, string> = {
  'decalam': 'DECALAM',
  'desoxilam': 'DESOXILAM',
  'fibralam': 'FIBRALAM',
  'fosslam': 'FOSSLAM',
  'gelcoatlam-fase-1': 'GELCOATLAM Fase 1',
  'gelcoatlam-fase-2': 'GELCOATLAM Fase 2',
  'inyeclam-diesel': 'INYECLAM Diésel',
  'inyeclam-gasolina': 'INYECLAM Gasolina',
  'manzalam': 'MANZALAM',
  'motorlam': 'MOTORLAM',
  'pasta-rosa-superbrillo': 'PASTA ROSA',
  'pasta-verde-superbrillo': 'PASTA VERDE',
  'plastilam': 'PLASTILAM',
  'proteclam': 'PROTECLAM',
  'pulimento-superbrillo': 'PULIMENTO SUPERBRILLO',
  'tapilam': 'TAPILAM',
  'tekalam': 'TEKALAM',
}

const CATS: Record<string, { label: ImagePair['categoria']; slug: ImagePair['categoriaSlug'] }> = {
  'nautico': { label: 'Náutico', slug: 'nautico' },
  'caravaning': { label: 'Caravaning', slug: 'caravaning' },
  'industrial': { label: 'Industrial', slug: 'industrial' },
}

function parseSlug(slug: string): { familia: string; cat: ImagePair['categoria']; catSlug: ImagePair['categoriaSlug'] } | null {
  // Encontrar el sufijo de categoría (-nautico, -caravaning, -industrial)
  for (const catKey of Object.keys(CATS)) {
    const suffix = `-${catKey}`
    if (slug.endsWith(suffix)) {
      const prefix = slug.slice(0, -suffix.length)
      const familia = FAMILIES[prefix]
      if (familia) {
        return { familia, cat: CATS[catKey].label, catSlug: CATS[catKey].slug }
      }
    }
  }
  return null
}

let cached: ImagePair[] | null = null

export function getImagePairs(): ImagePair[] {
  if (cached) return cached
  const beforeDir = join(process.cwd(), 'public', 'assets', 'before-after', 'before-v7')
  let files: string[] = []
  try {
    files = readdirSync(beforeDir).filter((f) => f.endsWith('.png'))
  } catch {
    return []
  }
  const pairs: ImagePair[] = []
  for (const file of files) {
    const slug = file.replace(/\.png$/, '')
    const parsed = parseSlug(slug)
    if (parsed) {
      pairs.push({ slug, familia: parsed.familia, categoria: parsed.cat, categoriaSlug: parsed.catSlug })
    }
  }
  // Orden: familia ASC, después categoría
  const catOrder = { 'Náutico': 0, 'Caravaning': 1, 'Industrial': 2 }
  pairs.sort((a, b) => {
    const f = a.familia.localeCompare(b.familia)
    if (f !== 0) return f
    return catOrder[a.categoria] - catOrder[b.categoria]
  })
  cached = pairs
  return pairs
}
