'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, AlertTriangle, RotateCcw } from 'lucide-react'
import { saveSeoReview, type SeoEstado } from '@/app/actions/seo-review'

export function SeoReviewControls({
  slug,
  initialEstado,
  initialComentario,
}: {
  slug: string
  initialEstado: SeoEstado
  initialComentario: string
}) {
  const router = useRouter()
  const [estado, setEstado] = useState<SeoEstado>(initialEstado)
  const [comentario, setComentario] = useState(initialComentario)
  const [savedComment, setSavedComment] = useState(initialComentario)
  const [pending, startTransition] = useTransition()
  const [flash, setFlash] = useState(false)

  function persist(nextEstado: SeoEstado, nextComentario: string) {
    startTransition(async () => {
      await saveSeoReview(slug, nextEstado, nextComentario)
      setFlash(true)
      setTimeout(() => setFlash(false), 1200)
      // Refresca el contador de resumen de la cabecera (estado global del servidor)
      router.refresh()
    })
  }

  function choose(next: SeoEstado) {
    const value = estado === next ? 'pendiente' : next // segundo clic = volver a pendiente
    setEstado(value)
    persist(value, comentario)
  }

  function commitComment() {
    if (comentario === savedComment) return
    setSavedComment(comentario)
    persist(estado, comentario)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => choose('aprobado')}
          aria-pressed={estado === 'aprobado'}
          className={`inline-flex items-center gap-1 rounded-(--r-sm) border px-2 py-1 text-xs font-semibold transition ${
            estado === 'aprobado'
              ? 'border-transparent bg-[#2E9E5B] text-white'
              : 'border-neutral-300 text-neutral-600 hover:border-[#2E9E5B] hover:text-[#2E9E5B]'
          }`}
        >
          <Check className="size-3.5" /> Aprobar
        </button>
        <button
          type="button"
          onClick={() => choose('rechazado')}
          aria-pressed={estado === 'rechazado'}
          className={`inline-flex items-center gap-1 rounded-(--r-sm) border px-2 py-1 text-xs font-semibold transition ${
            estado === 'rechazado'
              ? 'border-transparent bg-[#D14343] text-white'
              : 'border-neutral-300 text-neutral-600 hover:border-[#D14343] hover:text-[#D14343]'
          }`}
        >
          <AlertTriangle className="size-3.5" /> Hay un problema
        </button>
        {estado !== 'pendiente' && (
          <button
            type="button"
            onClick={() => choose(estado)}
            title="Volver a pendiente"
            className="inline-flex items-center gap-1 rounded-(--r-sm) border border-neutral-200 px-2 py-1 text-xs text-neutral-400 hover:text-neutral-600"
          >
            <RotateCcw className="size-3.5" />
          </button>
        )}
      </div>

      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        onBlur={commitComment}
        placeholder="Comentario: ¿qué está mal o no es del todo cierto?"
        rows={2}
        className="w-full resize-y rounded-(--r-sm) border border-neutral-300 bg-white px-2 py-1.5 text-xs text-(--ink) placeholder:text-neutral-400 focus:border-(--blue) focus:outline-none"
      />

      <div className="h-3 text-[11px]">
        {pending ? (
          <span className="text-neutral-400">Guardando…</span>
        ) : flash ? (
          <span className="text-[#2E9E5B]">Guardado ✓</span>
        ) : comentario !== savedComment ? (
          <span className="text-(--warning)">Sin guardar (clic fuera para guardar)</span>
        ) : null}
      </div>
    </div>
  )
}
