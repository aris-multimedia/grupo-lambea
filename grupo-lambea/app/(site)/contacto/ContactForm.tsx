'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Send, CheckCircle, AlertTriangle, Phone, Mail } from 'lucide-react'
import { sendContactMessage } from '@/app/actions/contact'

type Status = 'idle' | 'sending' | 'sent' | 'fallback' | 'error'

export function ContactForm({ email, telefono }: { email: string; telefono: string }) {
  const t = useTranslations('contacto')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle size={48} className="text-(--blue)" />
        <h3 className="font-(family-name:--font-lora) text-2xl font-bold text-(--ink)">
          {t('mensajeEnviado')}
        </h3>
        <p className="text-(--ink-500)">
          {t('graciasContactar')}
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
          {t('escribenosDirecto')}
        </h3>
        <p className="text-(--ink-500) max-w-sm">
          {t('noProcesar')}
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
      setErrorMsg(result.message ?? t('errValidacion'))
      setStatus('idle')
      return
    }
    if (result.reason === 'no-config') {
      setStatus('fallback')
      return
    }
    setErrorMsg(t('errEnvio', { email }))
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
          <label htmlFor="nombre" className={labelClass}>{t('labelNombre')}</label>
          <input id="nombre" name="nombre" type="text" required className={fieldClass} placeholder={t('phNombre')} />
        </div>
        <div>
          <label htmlFor="telefono" className={labelClass}>{t('labelTelefono')}</label>
          <input id="telefono" name="telefono" type="tel" className={fieldClass} placeholder="+34 600 000 000" />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>{t('labelEmail')}</label>
        <input id="email" name="email" type="email" required className={fieldClass} placeholder={t('phEmail')} />
      </div>

      <div>
        <label htmlFor="asunto" className={labelClass}>{t('labelAsunto')}</label>
        <select id="asunto" name="asunto" required className={fieldClass} defaultValue="">
          <option value="" disabled>{t('optSelecciona')}</option>
          <option value="consulta">{t('optConsulta')}</option>
          <option value="pedido">{t('optPedido')}</option>
          <option value="presupuesto">{t('optPresupuesto')}</option>
          <option value="distribucion">{t('optDistribucion')}</option>
          <option value="otro">{t('optOtro')}</option>
        </select>
      </div>

      <div>
        <label htmlFor="mensaje" className={labelClass}>{t('labelMensaje')}</label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          minLength={10}
          rows={5}
          className={`${fieldClass} resize-none`}
          placeholder={t('phMensaje')}
        />
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer select-none">
        <input type="checkbox" name="consentimiento" required className="w-4 h-4 mt-0.5 rounded accent-(--blue)" />
        <span className="text-[13px] text-(--ink-500) leading-relaxed">
          {t('consentPre')}{' '}
          <Link href="/politica-privacidad" className="text-(--blue) hover:underline">
            {t('consentLink')}
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
        {sending ? t('enviando') : t('enviar')}
      </button>

      <p className="text-xs text-(--ink-500) text-center">
        {t('respondemos')}
      </p>
    </form>
  )
}
