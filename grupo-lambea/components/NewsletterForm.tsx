'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Send, Check } from 'lucide-react'
import { subscribeToNewsletter } from '@/app/actions/newsletter'

export function NewsletterForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [err, setErr] = useState<string | null>(null)

  if (status === 'done') {
    return (
      <div className="flex items-center gap-2.5 text-[14px] w-full sm:w-auto sm:min-w-[280px]" style={{ color: '#C8E8F8' }}>
        <Check size={18} style={{ color: '#7DD8F8' }} />
        ¡Gracias! Te has suscrito correctamente.
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErr(null)
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value ?? ''
    const consent = (form.elements.namedItem('consent') as HTMLInputElement)?.checked
    if (!consent) {
      setErr('Marca la casilla para aceptar recibir comunicaciones.')
      return
    }
    setStatus('sending')
    const res = await subscribeToNewsletter(email, 'footer')
    if (res.ok) {
      setStatus('done')
      return
    }
    setErr(res.reason === 'invalid' ? 'Introduce un email válido.' : 'No se ha podido completar. Inténtalo de nuevo.')
    setStatus('idle')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full sm:w-auto flex-shrink-0">
      <div className="flex gap-2.5">
        <input
          type="email"
          name="email"
          required
          placeholder="tu@email.com"
          aria-label="Correo electrónico"
          className="rounded-[8px] px-[18px] py-3 text-[15px] text-white flex-1 sm:flex-initial sm:min-w-[220px]"
          style={{ background: '#0A4A70', border: '1px solid #2A80B0', fontFamily: 'inherit' }}
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="flex items-center gap-2 font-semibold text-[14px] px-[20px] py-3 rounded-[8px] text-white transition-colors whitespace-nowrap disabled:opacity-60"
          style={{ background: '#1E92D8' }}
          onMouseEnter={(e) => { if (status !== 'sending') e.currentTarget.style.background = '#1580C0' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#1E92D8' }}
        >
          <Send size={15} />
          <span className="hidden sm:inline">{status === 'sending' ? 'Enviando…' : 'Suscribirse'}</span>
        </button>
      </div>

      <label className="flex items-start gap-2 mt-2.5 cursor-pointer select-none" style={{ color: '#90C8E8' }}>
        <input type="checkbox" name="consent" required className="w-3.5 h-3.5 mt-0.5 rounded shrink-0" style={{ accentColor: '#1E92D8' }} />
        <span className="text-[11.5px] leading-snug">
          Acepto recibir comunicaciones comerciales y la{' '}
          <Link href="/politica-privacidad" className="underline" style={{ color: '#C8E8F8' }}>
            política de privacidad
          </Link>
          .
        </span>
      </label>

      {err && <p className="text-[11.5px] mt-1.5" style={{ color: '#FFD3C9' }}>{err}</p>}
    </form>
  )
}
