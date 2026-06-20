import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PageHero } from '@/components/PageHero'
import { getSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Condiciones de Contratación',
  description: 'Condiciones generales de contratación de Grupo Lambea: envíos, plazos de entrega, métodos de pago y política de devoluciones.',
  alternates: { canonical: '/condiciones-contratacion' },
  robots: { index: false, follow: true },
}

export default async function CondicionesContratacionPage() {
  const { empresa } = await getSettings()
  const t = await getTranslations('legal')
  const datos = `${empresa.razon_social}${empresa.cif ? `, NIF ${empresa.cif}` : ''}`
  return (
    <>
      <PageHero
        tagline={t('tag')}
        headline={t('condTitulo')}
      />
      <div className="max-w-[820px] mx-auto px-8 py-16 text-[var(--ink-700)]">

        <p className="text-[15px] leading-[1.8] mb-10">
          {t('condIntro', { datos })}
        </p>

        <section className="mb-10">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-4">
            {t('condEnvioT')}
          </h2>
          <div
            className="rounded-[var(--r-md)] p-6 mb-4"
            style={{ background: 'var(--blue-soft)' }}
          >
            <p className="text-[15px] font-semibold text-[var(--blue)]">
              {t('condEnvioGratis')}
            </p>
          </div>
          <p className="text-[15px] leading-[1.8] mb-3">
            {t('condEnvioIntro')}
          </p>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-1">
            <li>{t('condEnvioBaleares')}</li>
            <li>{t('condEnvioCanarias')}</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('condPlazosT')}
          </h2>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-2">
            <li>{t('condPlazo1')}</li>
            <li>{t('condPlazo2')}</li>
            <li>{t('condPlazo3')}</li>
            <li>{t('condPlazo4')}</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('condPagoT')}
          </h2>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-2">
            <li>{t('condPago1')}</li>
            <li>{t('condPago2')}</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('condDevT')}
          </h2>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-2">
            <li>{t('condDev1')}</li>
            <li>{t('condDev2')}</li>
            <li>{t('condDev3')}</li>
            <li>{t('condDev4')}</li>
          </ul>
        </section>

        <section>
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('condGarantiaT')}
          </h2>
          <p className="text-[15px] leading-[1.8] mb-3">
            {t('condGarantiaP1')}
          </p>
          <p className="text-[15px] leading-[1.8]">
            {t('condGarantiaP2')}{' '}
            <a href="mailto:francisco@grupolambea.com" className="text-[var(--blue)] no-underline hover:underline">
              francisco@grupolambea.com
            </a>.
          </p>
        </section>

      </div>
    </>
  )
}
