'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Send, CheckCircle, AlertTriangle, Phone, Mail } from 'lucide-react'
import { sendContactMessage } from '@/app/actions/contact'

type Status = 'idle' | 'sending' | 'sent' | 'fallback' | 'error'

export function ContactForm({ email, telefono }: { email: string; telefono: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle size={48} className="text-(--blue)" />
        <h3 className="font-(family-name:--font-lora) text-2xl font-bold text-(--ink)">
          Mensaje enviado
        </h3>
        <p className="text-(--ink-500)">
          Gracias por contactarnos. Te responderemos en menos de 24 horas laborables.
        </p>
      </div>
    )
  }

  // Resend aún no está configurado: ofrecemos contacto directo en vez de fingir un envío.
  if (status === 'fallback') {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <AlertTriangle size={44} className="text-(--warning)" />
        <h3 className="font-(family-name:--font-lora) text-xl font-bold text-(--ink)">
          Escríbenos directamente
        </h3>
        <p className="text-(--ink-500) max-w-sm">
          Ahora mismo no podemos procesar el formulario. Contáctanos por estos medios y te
          respondemos enseguida:
        </p>
        <div className="flex flex-col items-center gap-2.5 mt-1">
          <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-(--blue) font-semibold no-underline hover:underline">
            <Mail size={16} /> {email}
          </a>
          <a href={`tel:+${telefono.replace(/\D/g, '')}`} className="inline-flex items-center gap-2 text-(--blue) font-semibold no-underline hover:underline">
            <Phone size={16} /> {telefono}
          </a>
        </div>
      </div>
    )
  }

  const fieldClass =
    'w-full bg-white border border-(--line) rounded-(--r-sm) px-4 py-3 text-(--ink) text-[15px] focus:outline-none focus:border-(--blue) focus:ring-2 focus:ring-(--blue)/10 transition-colors placeholder:text-(--ink-400)'

  const labelClass = 'block text-[13px] font-semibold uppercase tracking-wide text-(--ink-500) mb-2'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)
    setStatus('sending')
    const formData = new FormData(e.currentTarget)
    const result = await sendContactMessage(formData)
    if (result.ok) {
      setStatus('sent')
      return
    }
    if (result.reason === 'validation') {
      setErrorMsg(result.message ?? 'Revisa los datos del formulario.')
      setStatus('idle')
      return
    }
    if (result.reason === 'no-config') {
      setStatus('fallback')
      return
    }
    setErrorMsg('No se ha podido enviar el mensaje. Inténtalo de nuevo o escríbenos a ' + email + '.')
    setStatus('idle')
  }

  const sending = status === 'sending'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-[13.5px] rounded-(--r-sm) px-4 py-3">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Honeypot anti-spam — oculto a usuarios reales */}
      <input
        type="text"
        name="empresa_web"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="nombre" className={labelClass}>Nombre *</label>
          <input id="nombre" name="nombre" type="text" required className={fieldClass} placeholder="Tu nombre" />
        </div>
        <div>
          <label htmlFor="telefono" className={labelClass}>Teléfono</label>
          <input id="telefono" name="telefono" type="tel" className={fieldClass} placeholder="+34 600 000 000" />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Email *</label>
        <input id="email" name="email" type="email" required className={fieldClass} placeholder="tu@email.com" />
      </div>

      <div>
        <label htmlFor="asunto" className={labelClass}>Asunto *</label>
        <select id="asunto" name="asunto" required className={fieldClass} defaultValue="">
          <option value="" disabled>Selecciona un asunto</option>
          <option value="consulta">Consulta sobre un producto</option>
          <option value="pedido">Consulta sobre un pedido</option>
          <option value="presupuesto">Solicitar presupuesto</option>
          <option value="distribucion">Información distribución</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div>
        <label htmlFor="mensaje" className={labelClass}>Mensaje *</label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          minLength={10}
          rows={5}
          className={`${fieldClass} resize-none`}
          placeholder="¿En qué podemos ayudarte?"
        />
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer select-none">
        <input type="checkbox" name="consentimiento" required className="w-4 h-4 mt-0.5 rounded accent-(--blue)" />
        <span className="text-[13px] text-(--ink-500) leading-relaxed">
          He leído y acepto la{' '}
          <Link href="/politica-privacidad" className="text-(--blue) hover:underline">
            política de privacidad
          </Link>
          .
        </span>
      </label>

      <button
        type="submit"
        disabled={sending}
        className="w-full flex items-center justify-center gap-2 bg-(--blue) hover:bg-(--blue-dark) disabled:opacity-60 text-white font-semibold py-4 rounded-(--r-pill) transition-colors text-base"
      >
        <Send size={18} />
        {sending ? 'Enviando…' : 'Enviar mensaje'}
      </button>

      <p className="text-xs text-(--ink-500) text-center">
        Respondemos en menos de 24 horas laborables
      </p>
    </form>
  )
}
