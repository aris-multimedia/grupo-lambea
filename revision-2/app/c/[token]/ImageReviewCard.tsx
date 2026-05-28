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

  // Auto-save al cambiar estado o comentario (debounced 600 ms)
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
        if (result.ok) {
          setStatus('saved')
          // Toast global
          window.dispatchEvent(new CustomEvent('feedback-saved', {
            detail: { message: `Guardado · ${familia} ${categoria}`, kind: 'success' },
          }))
          setTimeout(() => setStatus('idle'), 2500)
        } else {
          setStatus('error')
          window.dispatchEvent(new CustomEvent('feedback-saved', {
            detail: { message: `Error al guardar ${familia}`, kind: 'error' },
          }))
        }
      })
    }, 600)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [estado, comentario, token, slug, familia, categoria])

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

        {/* Save status indicator — badge prominente */}
        <div className="min-h-[30px] flex items-center">
          {status === 'idle' && (
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
              Sin cambios
            </span>
          )}
          {status === 'saving' && (
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-700 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" strokeWidth={2.5} />
              Guardando
            </span>
          )}
          {status === 'saved' && (
            <span
              className="text-[11px] uppercase tracking-wider font-bold text-white px-2.5 py-1 rounded-full flex items-center gap-1.5"
              style={{ background: '#16a34a', animation: 'save-pulse 1s ease-out' }}
            >
              <Check size={12} strokeWidth={3} />
              Guardado
            </span>
          )}
          {status === 'error' && (
            <span className="text-[11px] uppercase tracking-wider font-bold text-white bg-red-600 px-2.5 py-1 rounded-full">
              ⚠ Error
            </span>
          )}
        </div>
      </header>

      {/* Slider */}
      <div className="p-5 pb-3">
        <BeforeAfterSlider
          beforeSrc={`/assets/before-after/before-v3/${slug}.png`}
          afterSrc={`/assets/before-after/after-v3/${slug}.png`}
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
                onClick={(ev) => {
                  // Pop animation
                  ev.currentTarget.style.animation = 'none'
                  void ev.currentTarget.offsetWidth
                  ev.currentTarget.style.animation = 'button-pop 0.18s ease-out'
                  handleEstadoClick(e)
                }}
                className="flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-[14px] font-semibold transition-all cursor-pointer"
                style={{
                  background: selected ? bgSelected : '#f8fafc',
                  border: `1.5px solid ${selected ? border : '#e2e8ef'}`,
                  color: selected ? color : '#64748b',
                  boxShadow: selected ? `0 4px 12px ${color}25` : 'none',
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
