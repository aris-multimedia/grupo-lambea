// Genera docs/inventario-productos.md leyendo la DB REAL (Neon) — la fuente de
// verdad (el panel puede haber editado formatos/precios). Las descripciones se
// toman de data/productos.json (legacy) solo para detectar huecos de contenido.
//
// Ejecutar:  node --env-file=.env.local scripts/gen-inventario.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)
const legacy = JSON.parse(readFileSync('data/productos.json', 'utf8'))

// Misma regla que lib/cart.ts esFormatoPromo: 3×2 solo en 1 L / 1 kg
function esFormatoPromo(formato) {
  if (!formato) return false
  const m = formato.match(/(\d+(?:[.,]\d+)?)\s*(ml|l|kg|g)/i)
  if (!m) return false
  const val = parseFloat(m[1].replace(',', '.'))
  const unit = m[2].toLowerCase()
  return Math.abs(val - 1) < 1e-9 && (unit === 'l' || unit === 'kg')
}

const APLS = ['nautico', 'caravaning', 'industrial']
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/gi, '').toUpperCase()

const rows = await sql`
  SELECT p.slug, p.familia, p.publicado, v.formato, v.precio, v.stock
  FROM products p
  LEFT JOIN product_variants v ON v.product_id = p.id
  ORDER BY p.slug, v.orden`

// Agrupar variantes por slug
const bySlug = new Map()
for (const r of rows) {
  if (!bySlug.has(r.slug)) bySlug.set(r.slug, { slug: r.slug, familia: r.familia, publicado: r.publicado, variants: [] })
  if (r.formato != null) bySlug.get(r.slug).variants.push({ formato: r.formato, precio: Number(r.precio), stock: r.stock })
}

const products = [...bySlug.values()].map((p) => {
  const parts = p.slug.split('-')
  const apl = APLS.includes(parts[parts.length - 1]) ? parts[parts.length - 1] : '—'
  const base = APLS.includes(parts[parts.length - 1]) ? parts.slice(0, -1).join('-') : p.slug
  return { ...p, apl, base }
})

const legacyByNorm = new Map((legacy.familias_producto || []).map((f) => [norm(f.familia), f]))
const legacyFor = (base) => legacyByNorm.get(norm(base)) || legacyByNorm.get(norm(base.split('-')[0])) || null

const byBase = new Map()
for (const p of products) {
  if (!byBase.has(p.base)) byBase.set(p.base, [])
  byBase.get(p.base).push(p)
}

const fmtEur = (n) => n.toFixed(2).replace('.', ',') + ' €'
const aplLabel = { nautico: 'Náutico', caravaning: 'Caravaning', industrial: 'Industrial', '—': '—' }

let out = ''
out += '# Inventario completo de productos — Grupo Lambea\n\n'
out += '> **Generado automáticamente desde la DB de producción (Neon).** Regenerar:\n'
out += '> `node --env-file=.env.local scripts/gen-inventario.mjs`\n\n'

const totalEntries = products.length
const totalFamilias = byBase.size
const conPromo = products.filter((p) => p.variants.some((v) => esFormatoPromo(v.formato))).length
const sinPromo = products.filter((p) => p.variants.length && !p.variants.some((v) => esFormatoPromo(v.formato)))
const sinVariantes = products.filter((p) => !p.variants.length)
out += '## Resumen\n\n'
out += `- **${totalEntries}** fichas de producto (slug) · **${totalFamilias}** familias base.\n`
out += `- **${conPromo}** fichas con formato elegible para 3×2 (1 L / 1 kg); **${sinPromo.length}** sin formato elegible.\n`
if (sinVariantes.length) out += `- ⚠️ **${sinVariantes.length}** fichas sin variantes en DB.\n`
out += '\n'

out += '## Catálogo por familia\n\n'
for (const base of [...byBase.keys()].sort()) {
  const entries = byBase.get(base).sort((a, b) => a.apl.localeCompare(b.apl))
  const lf = legacyFor(base)
  const nombre = lf?.familia || base.toUpperCase().replace(/-/g, ' ')
  out += `### ${nombre}\n\n`
  if (lf?.descripcion_corta) out += `_${lf.descripcion_corta}_\n\n`
  out += '| Aplicación | Slug | Formatos (precio · stock) | 3×2 (1L/1kg) |\n'
  out += '|---|---|---|---|\n'
  for (const e of entries) {
    const formatos = e.variants.length
      ? e.variants.map((v) => `${v.formato} · ${fmtEur(v.precio)} · stock ${v.stock}${esFormatoPromo(v.formato) ? ' ✅' : ''}`).join('<br>')
      : '—'
    const elegible = e.variants.some((v) => esFormatoPromo(v.formato)) ? 'Sí' : '—'
    out += `| ${aplLabel[e.apl] || e.apl} | \`${e.slug}\` | ${formatos} | ${elegible} |\n`
  }
  out += '\n'
}

out += '## Avisos de calidad de datos\n\n'
out += '### Fichas SIN formato elegible para 3×2 (no recibirán la promo)\n\n'
for (const p of sinPromo.sort((a, b) => a.slug.localeCompare(b.slug))) {
  out += `- \`${p.slug}\` — formatos: ${p.variants.map((v) => v.formato).join(', ')}\n`
}
out += '\n### Formatos con notación sin unidad reconocible (revisar)\n\n'
const ambiguos = new Set()
for (const p of products) for (const v of p.variants) {
  if (!/(\d+(?:[.,]\d+)?)\s*(ml|l|kg|g)/i.test(v.formato)) ambiguos.add(`${v.formato}  →  ${p.slug}`)
}
if (ambiguos.size === 0) out += '_Ninguno: todos los formatos tienen unidad reconocible (litros/kg/ml/g) o son unidades sueltas._\n'
for (const a of [...ambiguos].sort()) out += `- \`${a}\`\n`

out += '\n### Familias legacy sin descripción larga\n\n'
for (const f of legacy.familias_producto || []) {
  if (!f.descripcion_larga) out += `- ${f.familia}\n`
}

mkdirSync('docs', { recursive: true })
writeFileSync('docs/inventario-productos.md', out)
console.log(`OK · ${totalEntries} fichas · ${totalFamilias} familias · ${conPromo} con 3×2 · ${sinPromo.length} sin 3×2 · ${ambiguos.size} formatos sin unidad`)
