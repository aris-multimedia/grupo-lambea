'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Check, Pencil, X, Loader2 } from 'lucide-react'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { saveFeedbackAction } from '@/app/actions'
import type { Estado } from '@/lib/feedback'

interface Props {
  token: string
  slug: string
  familia: string
  categoria: string
  index: number
  total: number
  initialEstado: Estado | null
  initialComentario: string
}

const STATE_BUTTONS: Array<{
  estado: Estado
  label: string
  Icon: typeof Check
  color: string
  bgSelected: string
  border: string
}> = [
  { estado: 'aprobado', label: 'Aprobado',  Icon: Check,  color: '#16a34a', bgSelected: '#dcfce7', border: '#86efac' },
  { estado: 'mejorar',  label: 'Mejorar',   Icon: Pencil, color: '#d97706', bgSelected: '#fef3c7', border: '#fcd34d' },
  { estado: 'rehacer',  label: 'Rehacer',   Icon: X,      color: '#dc2626', bgSelected: '#fee2e2', border: '#fca5a5' },
]

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function ImageReviewCard({
  token,
  slug,
  familia,
  categoria,
  index,
  total,
  initialEstado,
  initialComentario,
}: Props) {
  const [estado, setEstado] = useState<Estado | null>(initialEstado)
  const [comentario, setComentario] = useState(initialComentario)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firstRender = useRef(true)

  // Auto-save al cambiar estado o comentario (debounced 800 ms)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setStatus('saving')
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const result = await saveFeedbackAction({ token, slug, estado, comentario })
        setStatus(result.ok ? 'saved' : 'error')
        if (result.ok) {
          setTimeout(() => setStatus('idle'), 1500)
        }
      })
    }, 800)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [estado, comentario, token, slug])

  function handleEstadoClick(e: Estado) {
    setEstado((prev) => (prev === e ? null : e))
  }

  const needsComment = estado === 'mejorar' || estado === 'rehacer'
  const showCommentWarning = needsComment && comentario.trim().length === 0

  return (
    <article
      className="bg-white rounded-xl overflow-hidden border border-slate-200"
      style={{ scrollMarginTop: 80 }}
      id={slug}
    >
      {/* Header */}
      <header className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
            {String(index + 1).padStart(2, '0')} / {total}
          </span>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-slate-500">
              {categoria}
            </div>
            <h2 className="text-[17px] font-semibold text-slate-900 leading-tight truncate">
              {familia}
            </h2>
          </div>
        </div>

        {/* Save status indicator */}
        <div className="text-[12px] flex items-center gap-1.5 min-h-[20px]">
          {status === 'saving' && (
            <>
              <Loader2 size={13} className="animate-spin text-slate-400" />
              <span className="text-slate-400">Guardando…</span>
            </>
          )}
          {status === 'saved' && <span className="text-emerald-600">✓ Guardado</span>}
          {status === 'error' && <span className="text-red-600">Error al guardar</span>}
        </div>
      </header>

      {/* Slider */}
      <div className="p-5 pb-3">
        <BeforeAfterSlider
          beforeSrc={`/assets/before-after/before/${slug}.png`}
          afterSrc={`/assets/before-after/after/${slug}.png`}
          alt={`${familia} ${categoria}`}
          className="w-full aspect-[4/3] max-h-[480px]"
        />
        <p className="text-[12px] text-slate-500 mt-2.5 text-center">
          Arrastra la barra para comparar antes y después
        </p>
      </div>

      {/* Estados */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-3 gap-2">
          {STATE_BUTTONS.map(({ estado: e, label, Icon, color, bgSelected, border }) => {
            const selected = estado === e
            return (
              <button
                key={e}
                onClick={() => handleEstadoClick(e)}
                className="flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-[14px] font-semibold transition-all cursor-pointer"
                style={{
                  background: selected ? bgSelected : '#f8fafc',
                  border: `1.5px solid ${selected ? border : '#e2e8ef'}`,
                  color: selected ? color : '#64748b',
                }}
              >
                <Icon size={16} strokeWidth={2.5} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Comentario */}
      <div className="px-5 pb-5">
        <label className="block text-[12px] font-medium text-slate-500 mb-2">
          {estado === 'mejorar' && '¿Qué mejorarías?'}
          {estado === 'rehacer' && '¿Por qué hay que rehacerla? ¿Cómo te gustaría?'}
          {(estado === 'aprobado' || estado === null) && 'Comentario (opcional)'}
        </label>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder={
            estado === 'mejorar'
              ? 'Ej: el óxido del antes es demasiado leve, debería verse más realista'
              : estado === 'rehacer'
              ? 'Ej: la imagen no representa una situación real, partir de cero con otro contexto'
              : ''
          }
          rows={3}
          maxLength={2000}
          className="w-full px-3.5 py-3 rounded-lg border border-slate-200 text-[14px] text-slate-900 resize-y focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
        />
        {showCommentWarning && (
          <p className="text-[12px] text-amber-600 mt-1.5">
            ⚠️ Para «{estado === 'mejorar' ? 'Mejorar' : 'Rehacer'}» es útil añadir un comentario.
          </p>
        )}
      </div>
    </article>
  )
}
