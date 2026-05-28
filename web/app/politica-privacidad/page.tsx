import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Grupo Lambea',
  description: 'Política de privacidad de Grupo Lambea. Cómo tratamos y protegemos tus datos personales conforme al RGPD.',
  alternates: { canonical: '/politica-privacidad' },
}

export default function PoliticaPrivacidadPage() {
  return (
    <>
      <PageHero
        tagline="Legal"
        headline="Política de privacidad"
      />
      <div className="max-w-[820px] mx-auto px-8 py-16 text-[var(--ink-700)]">

        {/* Responsible party */}
        <div
          className="rounded-[var(--r-md)] p-7 mb-10"
          style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)' }}
        >
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[20px] font-medium mb-4">
            Responsable del tratamiento
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[14.5px]">
            {[
              ['Entidad', 'TECNICLAM 2016 SL'],
              ['NIF', 'B66896945'],
              ['Dirección', 'Calle Caserna 48, CP 43877 Sant Jaume d\'Enveja (Tarragona)'],
              ['Email', 'francisco@grupolambea.com'],
              ['Teléfono', '637 916 345'],
            ].map(([label, value]) => (
              <>
                <dt key={`l-${label}`} className="font-semibold text-[var(--ink)]">{label}</dt>
                <dd key={`v-${label}`} className="text-[var(--ink-500)]">{value}</dd>
              </>
            ))}
          </dl>
        </div>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            ¿Qué datos recogemos?
          </h2>
          <p className="text-[15px] leading-[1.8] mb-3">
            Recogemos únicamente los datos necesarios para prestar el servicio solicitado:
          </p>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-1">
            <li>Datos de identificación: nombre y apellidos.</li>
            <li>Datos de contacto: dirección postal, teléfono y correo electrónico.</li>
            <li>Datos de la transacción: productos comprados, importes y forma de pago.</li>
            <li>Preferencias de usuario cuando se suscriba a nuestra newsletter.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            Finalidades del tratamiento
          </h2>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-1">
            <li>Gestión y tramitación de los pedidos realizados a través de la tienda online.</li>
            <li>Respuesta a solicitudes de información y consultas comerciales.</li>
            <li>Envío de la newsletter cuando el usuario se haya suscrito expresamente.</li>
            <li>Cumplimiento de obligaciones legales y fiscales.</li>
            <li>Mejora de la experiencia de usuario en el sitio web.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            Legitimación
          </h2>
          <p className="text-[15px] leading-[1.8]">
            La base jurídica del tratamiento es la ejecución de un contrato de compraventa (art. 6.1.b RGPD) para los pedidos, el consentimiento expreso del usuario para la newsletter (art. 6.1.a), y el cumplimiento de obligaciones legales (art. 6.1.c) para la facturación y conservación de datos contables.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            Destinatarios
          </h2>
          <p className="text-[15px] leading-[1.8]">
            Los datos podrán ser comunicados a: proveedores de servicios de hosting y tecnología necesarios para el funcionamiento del sitio web, empresas de transporte para la entrega de pedidos, y administraciones públicas cuando la ley lo exija. No se realizan transferencias internacionales de datos sin las garantías adecuadas.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            Conservación de los datos
          </h2>
          <p className="text-[15px] leading-[1.8]">
            Los datos se conservarán durante el tiempo necesario para cumplir la finalidad para la que fueron recogidos y mientras existan obligaciones legales que así lo exijan (p. ej., 5 años para documentación fiscal). Los datos de newsletter se eliminarán cuando el usuario solicite la baja.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            Tus derechos
          </h2>
          <p className="text-[15px] leading-[1.8] mb-3">
            Puedes ejercer en cualquier momento los derechos de:
          </p>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-1 mb-3">
            <li><strong>Acceso:</strong> conocer qué datos tenemos sobre ti.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos.</li>
            <li><strong>Supresión:</strong> solicitar la eliminación de tus datos.</li>
            <li><strong>Limitación:</strong> restringir el tratamiento en determinadas circunstancias.</li>
            <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado.</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento con fines de marketing directo.</li>
          </ul>
          <p className="text-[15px] leading-[1.8]">
            Para ejercerlos, envíanos un correo a <a href="mailto:francisco@grupolambea.com" className="text-[var(--blue)] no-underline hover:underline">francisco@grupolambea.com</a> con el asunto <em>Protección de Datos</em> e indicando tu nombre y DNI. También tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-[var(--blue)] no-underline hover:underline">www.aepd.es</a>).
          </p>
        </section>

      </div>
    </>
  )
}
