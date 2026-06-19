'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown } from 'lucide-react'
import ES from 'country-flag-icons/react/3x2/ES'
import GB from 'country-flag-icons/react/3x2/GB'
import DE from 'country-flag-icons/react/3x2/DE'
import FR from 'country-flag-icons/react/3x2/FR'
import IT from 'country-flag-icons/react/3x2/IT'
import PT from 'country-flag-icons/react/3x2/PT'
import { LOCALES, LOCALE_LABELS, type Locale } from '@/i18n/locales'

const FLAGS: Record<Locale, React.FC<{ className?: string; title?: string }>> = {
  es: ES, en: GB, de: DE, fr: FR, it: IT, pt: PT,
}

function Flag({ locale, className }: { locale: Locale; className?: string }) {
  const F = FLAGS[locale]
  return <F className={className} title={LOCALE_LABELS[locale].label} />
}

/** Selector de idioma de la interfaz (cabecera). Banderas + cambio al instante. */
export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  function setLocale(l: Locale) {
    document.cookie = `NEXT_LOCALE=${l};path=/;max-age=31536000;samesite=lax`
    router.refresh() // el servidor re-renderiza el contenido en el nuevo idioma
  }

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Idioma: ${LOCALE_LABELS[locale].label}`}
        className="flex items-center gap-1.5 h-10 px-2.5 rounded-full text-[var(--ink-700)] hover:bg-[var(--blue-soft)] hover:text-[var(--blue)] transition-colors cursor-pointer text-[13px] font-semibold"
      >
        <Flag locale={locale} className="w-5 h-auto rounded-[2px] shrink-0" />
        <span className="hidden sm:inline">{LOCALE_LABELS[locale].short}</span>
        <ChevronDown size={13} strokeWidth={2.5} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 z-50 bg-white rounded-[var(--r-md)] overflow-hidden py-1 min-w-[172px]"
          style={{ boxShadow: '0 12px 30px rgba(14,87,132,0.16)', border: '1px solid var(--line)' }}
        >
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              role="option"
              aria-selected={l === locale}
              onClick={() => { setLocale(l); setOpen(false) }}
              className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left text-[13.5px] text-[var(--ink)] hover:bg-[var(--blue-soft)] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Flag locale={l} className="w-[22px] h-auto rounded-[2px] shrink-0" />
                {LOCALE_LABELS[l].label}
              </span>
              {l === locale && <Check size={15} className="text-[var(--blue)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
