import type { Metadata } from 'next'
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
  return (
    <>
      <PageHero
        tagline="Legal"
        headline="Aviso legal"
      />
      <div className="max-w-[820px] mx-auto px-8 py-16 text-[var(--ink-700)]">

        {/* Company data */}
        <div
          className="rounded-[var(--r-md)] p-7 mb-10"
          style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)' }}
        >
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[20px] font-medium mb-4">
            Datos del titular
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[14.5px]">
            {[
              ['Razón social', empresa.razon_social],
              ['NIF', empresa.cif],
              ['Dirección', `${empresa.direccion}, CP ${empresa.cp} ${empresa.ciudad} (${empresa.provincia})`],
              ['Teléfono', contacto.telefono],
              ['Email', contacto.email],
              ['Marca comercial', 'Grupo Lambea'],
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
            Condiciones de uso
          </h2>
          <p className="text-[15px] leading-[1.8] mb-3">
            El acceso y uso del sitio web <strong>grupolambea.com</strong> es responsabilidad exclusiva del usuario. El mero acceso no implica ninguna relación comercial entre el usuario y {empresa.razon_social}.
          </p>
          <p className="text-[15px] leading-[1.8] mb-3">
            Este sitio web cumple con la normativa vigente: Reglamento UE 2016/679 (RGPD) y la Ley 34/2002 de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE).
          </p>
          <p className="text-[15px] leading-[1.8]">
            {empresa.razon_social} se reserva el derecho de modificar las condiciones de uso en cualquier momento y sin previo aviso. El uso continuado del sitio tras cualquier modificación implica la aceptación de los nuevos términos.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            Exención de responsabilidad
          </h2>
          <p className="text-[15px] leading-[1.8] mb-3">
            {empresa.razon_social} no se responsabiliza de interrupciones del servicio, fallos técnicos, pérdida de datos, ataques informáticos ni daños causados por terceros ajenos a la empresa.
          </p>
          <p className="text-[15px] leading-[1.8]">
            La empresa podrá denegar el acceso a usuarios que incumplan las presentes condiciones sin necesidad de previo aviso.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            Propiedad intelectual e industrial
          </h2>
          <p className="text-[15px] leading-[1.8]">
            Todo el contenido y diseño del sitio web —textos, imágenes, logotipos, marcas, fórmulas y código fuente— es propiedad exclusiva de {empresa.razon_social} o cuenta con la correspondiente autorización de uso. Su reproducción, distribución o comunicación pública requiere autorización expresa y por escrito del titular.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            Enlaces externos
          </h2>
          <p className="text-[15px] leading-[1.8]">
            Los enlaces a sitios web de terceros tienen carácter meramente informativo y no implican respaldo ni responsabilidad por parte de {empresa.razon_social} sobre su contenido.
          </p>
        </section>

        <section>
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            Legislación aplicable
          </h2>
          <p className="text-[15px] leading-[1.8]">
            El presente aviso legal se rige por la legislación española. Para cualquier controversia derivada del uso de este sitio web, las partes se someten a los Juzgados y Tribunales de Tarragona.
          </p>
        </section>

      </div>
    </>
  )
}
