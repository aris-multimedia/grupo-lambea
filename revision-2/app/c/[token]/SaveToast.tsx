'use client'

import { useEffect, useState } from 'react'
import { Check, AlertCircle } from 'lucide-react'

interface ToastItem {
  id: number
  message: string
  kind: 'success' | 'error'
  exiting?: boolean
}

let nextId = 0

export function SaveToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    function handle(e: Event) {
      const detail = (e as CustomEvent<{ message: string; kind: 'success' | 'error' }>).detail
      const id = nextId++
      setToasts((prev) => [...prev.slice(-2), { id, message: detail.message, kind: detail.kind }])
      // Inicio salida a los 2.2s
      setTimeout(() => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)))
      }, 2200)
      // Eliminar a los 2.5s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 2500)
    }
    window.addEventListener('feedback-saved', handle as EventListener)
    return () => window.removeEventListener('feedback-saved', handle as EventListener)
  }, [])

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="px-5 py-3 rounded-full shadow-xl flex items-center gap-2.5 text-[14px] font-semibold text-white whitespace-nowrap"
          style={{
            background: t.kind === 'success' ? '#16a34a' : '#dc2626',
            boxShadow:
              t.kind === 'success'
                ? '0 10px 25px rgba(22,163,74,0.35)'
                : '0 10px 25px rgba(220,38,38,0.35)',
            animation: t.exiting ? 'toast-out 0.3s ease-in forwards' : 'toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {t.kind === 'success' ? <Check size={18} strokeWidth={3} /> : <AlertCircle size={18} strokeWidth={2.5} />}
          {t.message}
        </div>
      ))}
    </div>
  )
}
