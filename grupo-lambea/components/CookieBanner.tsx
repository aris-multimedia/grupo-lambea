'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const CONSENT_KEY = 'lambea-cookie-consent'

/**
 * Banner de consentimiento de cookies (RGPD/LSSI).
 * Mientras no se integre analítica, solo registra la decisión del usuario en
 * localStorage. Cuando se añada GA u otra cookie no esencial, condicionar su
 * carga a que el valor guardado sea 'all'.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      // localStorage solo existe en cliente: la decisión se evalúa tras montar.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!localStorage.getItem(CONSENT_KEY)) setVisible(true)
    } catch {
      /* modo incógnito / storage bloqueado: no mostramos nada */
    }
  }, [])

  function decide(value: 'all' | 'essential') {
    try {
      localStorage.setItem(CONSENT_KEY, value)
    } catch {
      /* noop */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-[70] px-4 pb-4"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
    >
      <div
        className="max-w-[1100px] mx-auto bg-white rounded-[var(--r-lg)] border border-[var(--line)] p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
        style={{ boxShadow: '0 16px 48px rgba(14,87,132,0.18)' }}
      >
        <p className="text-[13.5px] leading-relaxed text-[var(--ink-700)] flex-1">
          Usamos cookies propias necesarias para el funcionamiento de la web. Con tu permiso,
          también usaríamos cookies de análisis para mejorar la tienda. Puedes aceptarlas todas
          o seguir solo con las esenciales. Más información en nuestra{' '}
          <Link href="/cookies" className="text-[var(--blue)] font-medium no-underline hover:underline">
            política de cookies
          </Link>
          .
        </p>
        <div className="flex gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => decide('essential')}
            className="px-4 py-2.5 rounded-[10px] text-[13px] font-semibold text-[var(--ink-700)] border border-[var(--line)] bg-white hover:bg-[var(--bg-soft)] transition-colors cursor-pointer whitespace-nowrap"
          >
            Solo esenciales
          </button>
          <button
            type="button"
            onClick={() => decide('all')}
            className="px-5 py-2.5 rounded-[10px] text-[13px] font-semibold text-white bg-[var(--blue)] hover:bg-[var(--blue-dark)] transition-colors cursor-pointer whitespace-nowrap"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  )
}
