'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  beforeSrc: string
  afterSrc: string
  alt: string
  className?: string
}

export function BeforeAfterSlider({ beforeSrc, afterSrc, alt, className = '' }: Props) {
  const [pct, setPct] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  function getPercent(clientX: number) {
    const el = containerRef.current
    if (!el) return 50
    const rect = el.getBoundingClientRect()
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isDragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    setPct(getPercent(e.clientX))
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging.current) return
    setPct(getPercent(e.clientX))
  }

  function onPointerUp() {
    isDragging.current = false
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') setPct((p) => Math.max(0, p - 2))
    if (e.key === 'ArrowRight') setPct((p) => Math.min(100, p + 2))
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none touch-none rounded-lg bg-slate-100 ${className}`}
      style={{ cursor: 'col-resize' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="slider"
      aria-label="Arrastra para comparar antes y después"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Después — imagen completa abajo */}
      <div className="absolute inset-0">
        <Image
          src={afterSrc}
          alt={`${alt} — después`}
          fill
          className="object-cover"
          draggable={false}
          sizes="(max-width: 1024px) 100vw, 800px"
        />
        <span
          className="absolute bottom-3 right-3 text-white text-[11px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded-md pointer-events-none shadow-md"
          style={{ background: '#16a34a' }}
        >
          Después
        </span>
      </div>

      {/* Antes — recortado a la izquierda del handle */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      >
        <Image
          src={beforeSrc}
          alt={`${alt} — antes`}
          fill
          className="object-cover"
          draggable={false}
          sizes="(max-width: 1024px) 100vw, 800px"
        />
        <span
          className="absolute bottom-3 left-3 text-white text-[11px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded-md pointer-events-none shadow-md"
          style={{ background: 'rgba(15,23,42,0.85)' }}
        >
          Antes
        </span>
      </div>

      {/* Línea divisora */}
      <div
        className="absolute inset-y-0 w-[2px] bg-white shadow-[0_0_12px_rgba(0,0,0,0.4)] pointer-events-none z-10"
        style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
      />

      {/* Handle */}
      <div
        className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-xl flex items-center justify-center pointer-events-none"
        style={{ left: `${pct}%` }}
        aria-hidden="true"
      >
        <ChevronLeft size={15} className="-mr-0.5 text-slate-900" strokeWidth={2.5} />
        <ChevronRight size={15} className="-ml-0.5 text-slate-900" strokeWidth={2.5} />
      </div>
    </div>
  )
}
