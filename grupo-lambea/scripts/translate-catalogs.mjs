// Traduce los catálogos i18n: rellena en/de/fr/it/pt con las claves que existan
// en es.json (la BASE) y aún falten, usando Gemini. NO pisa lo ya traducido.
// Ejecutar: node --env-file=.env.local scripts/translate-catalogs.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const KEY = process.env.GEMINI_API_KEY
if (!KEY) { console.error('Falta GEMINI_API_KEY'); process.exit(1) }
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

const LANGS = { en: 'English', de: 'German', fr: 'French', it: 'Italian', pt: 'European Portuguese' }
const es = JSON.parse(readFileSync('messages/es.json', 'utf8'))

const flatten = (o, p = '', out = {}) => {
  for (const [k, v] of Object.entries(o)) {
    const key = p ? `${p}.${k}` : k
    if (v && typeof v === 'object') flatten(v, key, out)
    else out[key] = v
  }
  return out
}
const getDeep = (o, d) => d.split('.').reduce((x, k) => (x == null ? undefined : x[k]), o)
const setDeep = (o, d, val) => {
  const parts = d.split('.'); let x = o
  for (let i = 0; i < parts.length - 1; i++) { x[parts[i]] = x[parts[i]] || {}; x = x[parts[i]] }
  x[parts[parts.length - 1]] = val
}

async function gemini(missing, langName) {
  const prompt = `You are a professional translator for an e-commerce site (Grupo Lambea: cleaning, maintenance and polishing products for boats/nautical, caravans/campers and industry/workshops).
Translate the VALUES of this JSON object from Spanish to ${langName}. Rules:
- Keep the keys EXACTLY identical.
- Preserve ICU placeholders EXACTLY as-is: {pct} {n} {cantidad} {precio} {coste}.
- Keep as-is: "3×2", "Grupo Lambea", "SEUR / MRW", "IVA"/"VAT" abbreviations adapted naturally, brand/product names (DESOXILAM, etc.) if any.
- Natural, commercial tone. European variants (es→${langName}).
- Return ONLY valid minified JSON (same keys), no markdown, no comments.

${JSON.stringify(missing)}`
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    },
  )
  const j = await res.json()
  const text = j?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Sin respuesta: ' + JSON.stringify(j).slice(0, 400))
  return JSON.parse(text)
}

const esFlat = flatten(es)
for (const [lang, name] of Object.entries(LANGS)) {
  const cur = JSON.parse(readFileSync(`messages/${lang}.json`, 'utf8'))
  const missing = {}
  for (const [k, v] of Object.entries(esFlat)) if (getDeep(cur, k) === undefined) missing[k] = v
  const keys = Object.keys(missing)
  if (!keys.length) { console.log(`${lang}: completo (0 faltantes)`); continue }
  // Trocear para no enviar prompts gigantes
  const CHUNK = 60
  let done = 0
  for (let i = 0; i < keys.length; i += CHUNK) {
    const slice = Object.fromEntries(keys.slice(i, i + CHUNK).map((k) => [k, missing[k]]))
    const out = await gemini(slice, name)
    for (const [k, v] of Object.entries(out)) setDeep(cur, k, v)
    done += Object.keys(out).length
  }
  writeFileSync(`messages/${lang}.json`, JSON.stringify(cur, null, 2) + '\n')
  console.log(`${lang}: ${done}/${keys.length} claves rellenadas`)
}
console.log('Hecho.')
