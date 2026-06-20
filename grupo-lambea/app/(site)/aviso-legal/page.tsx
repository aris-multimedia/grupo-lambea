import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PageHero } from '@/components/PageHero'
import { getSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Aviso Legal',
  description: 'Aviso legal de Grupo Lambea (SOLUCIONES ECOLAM S.L). Información sobre titularidad, condiciones de uso y propiedad intelectual.',
  alternates: { canonical: '/aviso-legal' },
  robots: { index: false, follow: true },
}

export default async function AvisoLegalPage() {
  const { empresa, contacto } = await getSettings()
  const t = await getTranslations('legal')
  const razon = empresa.razon_social
  return (
    <>
      <PageHero
        tagline={t('tag')}
        headline={t('avisoTitulo')}
      />
      <div className="max-w-[820px] mx-auto px-8 py-16 text-[var(--ink-700)]">

        {/* Company data */}
        <div
          className="rounded-[var(--r-md)] p-7 mb-10"
          style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)' }}
        >
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[20px] font-medium mb-4">
            {t('datosTitular')}
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[14.5px]">
            {[
              [t('labelRazon'), empresa.razon_social],
              [t('labelNif'), empresa.cif],
              [t('labelDireccion'), `${empresa.direccion}, CP ${empresa.cp} ${empresa.ciudad} (${empresa.provincia})`],
              [t('labelTelefono'), contacto.telefono],
              [t('labelEmail'), contacto.email],
              [t('labelMarca'), 'Grupo Lambea'],
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
            {t('condUsoT')}
          </h2>
          <p className="text-[15px] leading-[1.8] mb-3">
            {t('condUsoP1', { razon })}
          </p>
          <p className="text-[15px] leading-[1.8] mb-3">
            {t('condUsoP2')}
          </p>
          <p className="text-[15px] leading-[1.8]">
            {t('condUsoP3', { razon })}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('exencionT')}
          </h2>
          <p className="text-[15px] leading-[1.8] mb-3">
            {t('exencionP1', { razon })}
          </p>
          <p className="text-[15px] leading-[1.8]">
            {t('exencionP2')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('propiedadT')}
          </h2>
          <p className="text-[15px] leading-[1.8]">
            {t('propiedadP', { razon })}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('enlacesT')}
          </h2>
          <p className="text-[15px] leading-[1.8]">
            {t('enlacesP', { razon })}
          </p>
        </section>

        <section>
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            {t('legislacionT')}
          </h2>
          <p className="text-[15px] leading-[1.8]">
            {t('legislacionP')}
          </p>
        </section>

      </div>
    </>
  )
}
