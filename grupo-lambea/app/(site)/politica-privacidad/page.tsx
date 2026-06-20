import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PageHero } from '@/components/PageHero'
import { getSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad de Grupo Lambea. Cómo tratamos y protegemos tus datos personales conforme al RGPD.',
  alternates: { canonical: '/politica-privacidad' },
  robots: { index: false, follow: true },
}

export default async function PoliticaPrivacidadPage() {
  const { empresa, contacto } = await getSettings()
  const t = await getTranslations('legal')
  return (
    <>
      <PageHero
        tagline={t('tag')}
        headline={t('privTitulo')}
      />
      <div className="max-w-[820px] mx-auto px-8 py-16 text-[var(--ink-700)]">

        {/* Responsible party */}
        <div
          className="rounded-[var(--r-md)] p-7 mb-10"
          style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)' }}
        >
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[20px] font-medium mb-4">
            {t('responsable')}
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[14.5px]">
            {[
              [t('labelEntidad'), empresa.razon_social],
              [t('labelNif'), empresa.cif],
              [t('labelDireccion'), `${empresa.direccion}, CP ${empresa.cp} ${empresa.ciudad} (${empresa.provincia})`],
              [t('labelEmail'), contacto.email],
              [t('labelTelefono'), contacto.telefono],
            ].filter(([, value]) => value).map(([label, value]) => (
              <>
                <dt key={`l-${label}`} className="font-semibold text-[var(--ink)]">{label}</dt>
                <dd key={`v-${label}`} className="text-[var(--ink-500)]">{value}</dd>
              </>
            ))}
          </dl>
        </div>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('privQueT')}
          </h2>
          <p className="text-[15px] leading-[1.8] mb-3">
            {t('privQueIntro')}
          </p>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-1">
            <li>{t('privDato1')}</li>
            <li>{t('privDato2')}</li>
            <li>{t('privDato3')}</li>
            <li>{t('privDato4')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('privFinT')}
          </h2>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-1">
            <li>{t('privFin1')}</li>
            <li>{t('privFin2')}</li>
            <li>{t('privFin3')}</li>
            <li>{t('privFin4')}</li>
            <li>{t('privFin5')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('privLegitT')}
          </h2>
          <p className="text-[15px] leading-[1.8]">
            {t('privLegitP')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('privDestT')}
          </h2>
          <p className="text-[15px] leading-[1.8]">
            {t('privDestP')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('privConsT')}
          </h2>
          <p className="text-[15px] leading-[1.8]">
            {t('privConsP')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('privDerT')}
          </h2>
          <p className="text-[15px] leading-[1.8] mb-3">
            {t('privDerIntro')}
          </p>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-1 mb-3">
            <li><strong>{t('privDerAcceso')}</strong> {t('privDerAccesoD')}</li>
            <li><strong>{t('privDerRect')}</strong> {t('privDerRectD')}</li>
            <li><strong>{t('privDerSupr')}</strong> {t('privDerSuprD')}</li>
            <li><strong>{t('privDerLim')}</strong> {t('privDerLimD')}</li>
            <li><strong>{t('privDerPort')}</strong> {t('privDerPortD')}</li>
            <li><strong>{t('privDerOpos')}</strong> {t('privDerOposD')}</li>
          </ul>
          <p className="text-[15px] leading-[1.8]">
            {t('privEjercerPre')} <a href={`mailto:${contacto.email}`} className="text-[var(--blue)] no-underline hover:underline">{contacto.email}</a> {t('privEjercerAsunto')} <em>{t('privEjercerAsuntoVal')}</em> {t('privEjercerPost')} (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-[var(--blue)] no-underline hover:underline">www.aepd.es</a>).
          </p>
        </section>

      </div>
    </>
  )
}
