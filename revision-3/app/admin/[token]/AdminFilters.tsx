'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Estado } from '@/lib/feedback'

interface Row {
  slug: string
  familia: string
  categoria: string
  estado: Estado | null
  comentario: string | null
  updated_at: string | null
}

interface Props {
  rows: Row[]
}

const FILTERS: Array<{ key: Estado | 'todos' | 'pendiente'; label: string; color: string }> = [
  { key: 'todos',     label: 'Todos',      color: '#0f172a' },
  { key: 'pendiente', label: 'Pendientes', color: '#64748b' },
  { key: 'aprobado',  label: 'Aprobadas',  color: '#16a34a' },
  { key: 'mejorar',   label: 'Mejorar',    color: '#d97706' },
  { key: 'rehacer',   label: 'Rehacer',    color: '#dc2626' },
]

export function AdminFilters({ rows }: Props) {
  const [filter, setFilter] = useState<Estado | 'todos' | 'pendiente'>('todos')

  const filtered = rows.filter((r) => {
    if (filter === 'todos') return true
    if (filter === 'pendiente') return r.estado === null
    return r.estado === filter
  })

  const counts: Record<typeof filter, number> = {
    todos: rows.length,
    pendiente: rows.filter((r) => r.estado === null).length,
    aprobado: rows.filter((r) => r.estado === 'aprobado').length,
    mejorar: rows.filter((r) => r.estado === 'mejorar').length,
    rehacer: rows.filter((r) => r.estado === 'rehacer').length,
  }

  return (
    <>
      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-5">
        {FILTERS.map((f) => {
          const active = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer transition-all"
              style={{
                background: active ? f.color : '#fff',
                color: active ? '#fff' : f.color,
                border: `1.5px solid ${f.color}`,
              }}
            >
              {f.label} ({counts[f.key]})
            </button>
          )
        })}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-[14px]">
            Sin resultados en este filtro
          </div>
        )}
        {filtered.map((r) => (
          <RowCard key={r.slug} row={r} />
        ))}
      </div>
    </>
  )
}

function RowCard({ row }: { row: Row }) {
  const estadoColor =
    row.estado === 'aprobado' ? '#16a34a' :
    row.estado === 'mejorar' ? '#d97706' :
    row.estado === 'rehacer' ? '#dc2626' : '#94a3b8'
  const estadoLabel =
    row.estado === 'aprobado' ? 'Aprobada' :
    row.estado === 'mejorar' ? 'Mejorar' :
    row.estado === 'rehacer' ? 'Rehacer' : 'Pendiente'

  return (
    <article className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col sm:flex-row">
      {/* Miniaturas */}
      <div className="flex sm:w-[200px] shrink-0">
        <div className="relative w-1/2 aspect-square bg-slate-100 border-r border-slate-200">
          <Image src={`/assets/before-after/before-v4/${row.slug}.png`} alt="antes" fill className="object-cover" sizes="100px" />
          <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-slate-900/70 px-1.5 py-0.5 rounded">ANTES</span>
        </div>
        <div className="relative w-1/2 aspect-square bg-slate-100">
          <Image src={`/assets/before-after/after-v4/${row.slug}.png`} alt="después" fill className="object-cover" sizes="100px" />
          <span className="absolute bottom-1 right-1 text-[9px] font-bold text-white bg-emerald-700/85 px-1.5 py-0.5 rounded">DESPUÉS</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 p-4 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <div className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-slate-500">
              {row.categoria}
            </div>
            <h3 className="text-[15px] font-semibold text-slate-900 truncate">{row.familia}</h3>
            <code className="text-[11px] text-slate-400">{row.slug}</code>
          </div>
          <span
            className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded shrink-0"
            style={{ background: estadoColor + '20', color: estadoColor }}
          >
            {estadoLabel}
          </span>
        </div>
        {row.comentario ? (
          <p className="text-[13px] text-slate-700 leading-relaxed mt-2 bg-slate-50 rounded-lg p-3 border border-slate-100 whitespace-pre-wrap">
            {row.comentario}
          </p>
        ) : (
          row.estado && row.estado !== 'aprobado' && (
            <p className="text-[12px] text-amber-600 italic mt-2">
              Sin comentario — cliente no detalló.
            </p>
          )
        )}
        {row.updated_at && (
          <p className="text-[11px] text-slate-400 mt-2">
            Actualizado {new Date(row.updated_at).toLocaleString('es-ES')}
          </p>
        )}
      </div>
    </article>
  )
}
