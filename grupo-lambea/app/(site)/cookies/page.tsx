import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PageHero } from '@/components/PageHero'
import { getSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description: 'Política de cookies de Grupo Lambea. Qué cookies utilizamos, para qué y cómo puedes gestionarlas.',
  alternates: { canonical: '/cookies' },
  robots: { index: false, follow: true },
}

export default async function CookiesPage() {
  const { empresa, contacto } = await getSettings()
  const t = await getTranslations('legal')
  const razon = empresa.razon_social
  return (
    <>
      <PageHero
        tagline={t('tag')}
        headline={t('cookiesTitulo')}
      />
      <div className="max-w-[820px] mx-auto px-8 py-16 text-[var(--ink-700)]">

        <p className="text-[15px] leading-[1.8] mb-10">
          {t('cookiesIntro', { razon })}
        </p>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('cookiesQueSonT')}
          </h2>
          <p className="text-[15px] leading-[1.8]">
            {t('cookiesQueSonP')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-4">
            {t('cookiesTiposT')}
          </h2>

          <div className="space-y-4">
            {[
              { type: t('tipoTecnicasT'), desc: t('tipoTecnicasD') },
              { type: t('tipoAnaliticasT'), desc: t('tipoAnaliticasD') },
              { type: t('tipoPersonalizacionT'), desc: t('tipoPersonalizacionD') },
              { type: t('tipoPublicitariasT'), desc: t('tipoPublicitariasD') },
            ].map(({ type, desc }) => (
              <div key={type} className="flex gap-4">
                <div
                  className="w-2 rounded-full flex-shrink-0 mt-1"
                  style={{ background: 'var(--blue)', height: 'auto', minHeight: 16 }}
                />
                <div>
                  <h3 className="font-semibold text-[var(--ink)] text-[14.5px] mb-1">{type}</h3>
                  <p className="text-[14px] leading-[1.75] text-[var(--ink-500)]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('cookiesDuracionT')}
          </h2>
          <p className="text-[15px] leading-[1.8]">
            {t('cookiesDuracionP')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('cookiesTercerosT')}
          </h2>
          <p className="text-[15px] leading-[1.8] mb-3">
            {t('cookiesTercerosIntro')}
          </p>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-1">
            <li>{t('cookiesTercGA')}</li>
            <li>{t('cookiesTercGM')}</li>
          </ul>
          <p className="text-[15px] leading-[1.8] mt-3">
            {t('cookiesTercerosPost')}
          </p>
        </section>

        <section>
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('cookiesGestionT')}
          </h2>
          <p className="text-[15px] leading-[1.8] mb-3">
            {t('cookiesGestionIntro')}
          </p>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-1">
            <li>{t('cookiesChrome')}</li>
            <li>{t('cookiesFirefox')}</li>
            <li>{t('cookiesSafari')}</li>
            <li>{t('cookiesEdge')}</li>
          </ul>
          <p className="text-[15px] leading-[1.8] mt-3">
            {t('cookiesAfecta')}
          </p>
          <p className="text-[15px] leading-[1.8] mt-3">
            {t('cookiesConsulta')} <a href={`mailto:${contacto.email}`} className="text-[var(--blue)] no-underline hover:underline">{contacto.email}</a> · {contacto.telefono} · {empresa.direccion}, CP {empresa.cp} {empresa.ciudad}.
          </p>
        </section>

      </div>
    </>
  )
}
