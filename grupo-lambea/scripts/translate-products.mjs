// Traduce el contenido de producto (products → product_translations) a en/de/fr/it/pt
// con Gemini. El español es la BASE. Idempotente: solo rellena (product_id, locale)
// que falten. Ejecutar:
//   GEMINI_MODEL=gemini-2.5-flash node --env-file=.env.local scripts/translate-products.mjs
import { neon } from '@neondatabase/serverless'

const KEY = process.env.GEMINI_API_KEY
if (!KEY) { console.error('Falta GEMINI_API_KEY'); process.exit(1) }
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const sql = neon(process.env.DATABASE_URL)
const LANGS = { en: 'English', de: 'German', fr: 'French', it: 'Italian', pt: 'European Portuguese' }
const FIELDS = ['descripcion_corta', 'descripcion_larga', 'instrucciones_uso', 'usos', 'caracteristicas', 'seo_title', 'seo_description']

async function gemini(prompt) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } }),
  })
  const j = await res.json()
  const text = j?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Sin respuesta: ' + JSON.stringify(j).slice(0, 300))
  return JSON.parse(text)
}

const products = await sql`
  SELECT id, familia, descripcion_corta, descripcion_larga, instrucciones_uso, usos, caracteristicas, seo_title, seo_description
  FROM products WHERE publicado = true ORDER BY id`
const existing = await sql`SELECT product_id, locale FROM product_translations`
const have = new Set(existing.map((r) => `${r.product_id}:${r.locale}`))

let done = 0, skipped = 0
for (const p of products) {
  const missing = Object.keys(LANGS).filter((l) => !have.has(`${p.id}:${l}`))
  if (!missing.length) { skipped++; continue }
  const base = {}
  for (const f of FIELDS) base[f] = p[f]
  const prompt = `Eres traductor profesional de una tienda (Grupo Lambea: productos de limpieza/mantenimiento para náutica, caravaning e industria). Traduce los VALORES de este producto del español a estos idiomas: ${missing.map((l) => LANGS[l]).join(', ')}.
Reglas:
- Devuelve SOLO JSON válido con esta forma: {"en":{...},"de":{...}} usando los códigos ${JSON.stringify(missing)}.
- Cada idioma tiene EXACTAMENTE estas claves: ${JSON.stringify(FIELDS)}.
- "usos" y "caracteristicas" son ARRAYS de strings: traduce cada elemento, conserva el mismo número de elementos.
- Si un valor es null, devuélvelo null.
- NO traduzcas el nombre de marca "${p.familia}" ni "Grupo Lambea"; conserva "3×2", unidades (1 L, 1 kg, ml), teléfonos y registros tal cual.
- Tono comercial y natural.

Producto (es): ${JSON.stringify(base)}`
  let out
  try { out = await gemini(prompt) } catch (e) { console.log(`✗ id ${p.id}: ${e.message}`); continue }
  for (const l of missing) {
    const t = out[l]
    if (!t) continue
    const arr = (v) => (Array.isArray(v) ? v : null)
    await sql`
      INSERT INTO product_translations (product_id, locale, descripcion_corta, descripcion_larga, instrucciones_uso, usos, caracteristicas, seo_title, seo_description)
      VALUES (${p.id}, ${l}, ${t.descripcion_corta ?? null}, ${t.descripcion_larga ?? null}, ${t.instrucciones_uso ?? null}, ${arr(t.usos)}, ${arr(t.caracteristicas)}, ${t.seo_title ?? null}, ${t.seo_description ?? null})
      ON CONFLICT (product_id, locale) DO UPDATE SET
        descripcion_corta = EXCLUDED.descripcion_corta, descripcion_larga = EXCLUDED.descripcion_larga,
        instrucciones_uso = EXCLUDED.instrucciones_uso, usos = EXCLUDED.usos, caracteristicas = EXCLUDED.caracteristicas,
        seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description, updated_at = now()`
  }
  done++
  console.log(`✓ id ${p.id} (${p.familia}) → ${missing.join(',')}`)
}
console.log(`\nHecho. Productos traducidos: ${done}, ya completos: ${skipped}`)
