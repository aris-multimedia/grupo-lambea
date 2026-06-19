// Normaliza formatos ambiguos en product_variants (idempotente).
// Ejecutar: node --env-file=.env.local scripts/migrate-formatos.mjs
import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL)

// (slug, formato_actual, formato_nuevo). Criterio: "Variante 1" → formato real
// del producto hermano (mismo precio), para que entre en el 3×2 (1 L / 1 kg).
const MAP = [
  { slug: 'decalam-industrial',        from: 'Variante 1', to: '1 L'  }, // hermano decalam-nautico = «1 L» 33,40
  { slug: 'gelcoatlam-fase-2-nautico', from: 'Variante 1', to: '1 kg' }, // hermanos gelcoatlam = «1 kg» 30,00
]

let changed = 0
for (const m of MAP) {
  const [p] = await sql`SELECT id FROM products WHERE slug = ${m.slug} LIMIT 1`
  if (!p) { console.log(`· ${m.slug}: producto no encontrado, salto`); continue }
  // Evitar choque con UNIQUE(product_id, formato) si el destino ya existiera
  const dup = await sql`SELECT 1 FROM product_variants WHERE product_id = ${p.id} AND formato = ${m.to} LIMIT 1`
  if (dup.length) { console.log(`· ${m.slug}: «${m.to}» ya existe, salto`); continue }
  const res = await sql`UPDATE product_variants SET formato = ${m.to} WHERE product_id = ${p.id} AND formato = ${m.from}`
  const n = res.length ?? 0 // neon http no devuelve rowCount en UPDATE; comprobamos por re-consulta
  const check = await sql`SELECT 1 FROM product_variants WHERE product_id = ${p.id} AND formato = ${m.to} LIMIT 1`
  if (check.length) { console.log(`✓ ${m.slug}: «${m.from}» → «${m.to}»`); changed++ }
  else console.log(`· ${m.slug}: «${m.from}» no encontrado (¿ya migrado?)`)
}
console.log(`\nMigración completada. Cambios aplicados: ${changed}`)
