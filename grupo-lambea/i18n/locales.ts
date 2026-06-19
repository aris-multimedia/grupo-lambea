// Idiomas soportados por la interfaz. Fase 1: traducción de la "chrome"
// (cabecera, cesta, selector) en cliente con next-intl. El contenido de las
// páginas y el SEO por URL (/[locale]/…) es la fase 2 — ver docs/i18n.md.
export const LOCALES = ['es', 'en', 'de', 'fr', 'it', 'pt'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'es'

// `country` = código ISO para los SVG de country-flag-icons (en → bandera GB).
export const LOCALE_LABELS: Record<Locale, { label: string; short: string; country: string }> = {
  es: { label: 'Español', short: 'ES', country: 'ES' },
  en: { label: 'English', short: 'EN', country: 'GB' },
  de: { label: 'Deutsch', short: 'DE', country: 'DE' },
  fr: { label: 'Français', short: 'FR', country: 'FR' },
  it: { label: 'Italiano', short: 'IT', country: 'IT' },
  pt: { label: 'Português', short: 'PT', country: 'PT' },
}

export function isLocale(v: string | undefined | null): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v)
}
