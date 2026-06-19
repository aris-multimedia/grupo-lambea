'use client'

import { useState, useTransition } from 'react'
import { Search, Check, Loader2, ExternalLink, Globe, Package } from 'lucide-react'
import { Card } from '../_components/layout'
import { inputClass } from '../_components/ui'
import { updatePageSeo, updateProductSeo } from '@/app/actions/seo'

export type PageRow = { key: string; label: string; ruta: string; titleSaved: string; descriptionSaved: string; title: string; description: string }
export type ProductRow = { id: number; familia: string; slug: string; seoTitle: string; seoDescription: string }

const TITLE_MAX = 60
const DESC_MAX = 155

function counterColor(n: number, max: number) {
  return n > max ? '#b91c1c' : n > max * 0.9 ? '#92400e' : 'var(--ink-500)'
}

/** Fila editable: título + meta-descripción con contadores y guardado propio. */
function SeoRow({
  heading, sub, link, title0, desc0, titlePh, descPh, onSave,
}: {
  heading: string
  sub?: string
  link?: string
  title0: string
  desc0: string
  titlePh: string
  descPh: string
  onSave: (title: string, desc: string) => Promise<unknown>
}) {
  const [title, setTitle] = useState(title0)
  const [desc, setDesc] = useState(desc0)
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const dirty = title !== title0 || desc !== desc0

  function save() {
    start(async () => {
      await onSave(title, desc)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="p-4 border-b border-(--line-soft) last:border-0">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold text-(--ink) truncate">{heading}</div>
          {sub && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11.5px] text-(--ink-500) hover:text-(--blue) no-underline">
              {sub} <ExternalLink size={11} />
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="inline-flex items-center gap-1.5 bg-blue hover:bg-blue-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-[12.5px] px-3.5 py-1.5 rounded-(--r-sm) transition-colors cursor-pointer shrink-0"
        >
          {pending ? <Loader2 size={13} className="animate-spin" /> : saved ? <Check size={13} /> : null}
          {pending ? 'Guardando…' : saved ? 'Guardado' : 'Guardar'}
        </button>
      </div>

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={titlePh} className={inputClass} aria-label="Título SEO" />
      <div className="text-[11px] mt-1 mb-2.5 text-right" style={{ color: counterColor(title.length, TITLE_MAX) }}>
        {title.length}/{TITLE_MAX} car. (título)
      </div>

      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={descPh} rows={2} className={`${inputClass} resize-y`} aria-label="Meta descripción" />
      <div className="text-[11px] mt-1 text-right" style={{ color: counterColor(desc.length, DESC_MAX) }}>
        {desc.length}/{DESC_MAX} car. (descripción)
      </div>
    </div>
  )
}

export function SeoManager({ pages, productos }: { pages: PageRow[]; productos: ProductRow[] }) {
  const [q, setQ] = useState('')
  const filtered = productos.filter((p) =>
    (p.familia + ' ' + p.slug).toLowerCase().includes(q.trim().toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card
        title="Páginas"
        icon={<Globe size={15} />}
        description="SEO de las páginas estáticas. Si dejas un campo vacío se usa el texto por defecto."
        padded={false}
      >
        {pages.map((pg) => (
          <SeoRow
            key={pg.key}
            heading={pg.label}
            sub={pg.ruta}
            link={pg.ruta}
            title0={pg.titleSaved}
            desc0={pg.descriptionSaved}
            titlePh={pg.title}
            descPh={pg.description}
            onSave={(t, d) => updatePageSeo(pg.key, t, d)}
          />
        ))}
      </Card>

      <Card
        title={`Productos (${productos.length})`}
        icon={<Package size={15} />}
        description="SEO de cada ficha (columnas Yoast seo_title / seo_description). Vacío = se usa el nombre del producto."
        action={
          <div className="relative w-56">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--ink-500) pointer-events-none" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar producto…"
              className="w-full pl-9 pr-3 py-1.5 border border-[#d7dde6] rounded-(--r-sm) text-[13px] text-(--ink) outline-none focus:border-(--blue) bg-white"
            />
          </div>
        }
        padded={false}
      >
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-(--ink-500)">Sin resultados para «{q}».</div>
        ) : (
          filtered.map((p) => (
            <SeoRow
              key={p.id}
              heading={p.familia}
              sub={`/tienda/${p.slug}`}
              link={`/tienda/${p.slug}`}
              title0={p.seoTitle}
              desc0={p.seoDescription}
              titlePh={`${p.familia} — Grupo Lambea`}
              descPh="Describe el producto con su keyword principal (140–155 car.)"
              onSave={(t, d) => updateProductSeo(p.id, p.slug, t, d)}
            />
          ))
        )}
      </Card>
    </div>
  )
}
