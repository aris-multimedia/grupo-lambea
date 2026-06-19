import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'

// Provee locale + mensajes al árbol (cliente y servidor). Es un Server Component
// async: la lectura de la cookie (vía getLocale/getMessages → request.ts) es
// dinámica, por eso se monta DENTRO del <Suspense> de (site)/layout para ser
// compatible con `cacheComponents`.
export async function IntlProvider({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
