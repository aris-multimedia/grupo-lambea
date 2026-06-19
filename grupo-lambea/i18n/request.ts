import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, isLocale } from './locales'

// Locale por petición: cookie NEXT_LOCALE (la fija el selector de idioma), con
// español como base. Sin enrutado por URL: el contenido se re-renderiza en el
// servidor al cambiar la cookie + router.refresh(). El plugin (next.config.ts)
// apunta aquí; los mensajes se cargan del catálogo del idioma activo.
export default getRequestConfig(async () => {
  const store = await cookies()
  const cookieLocale = store.get('NEXT_LOCALE')?.value
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE
  const messages = (await import(`../messages/${locale}.json`)).default
  return { locale, messages }
})
