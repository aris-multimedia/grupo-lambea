import type { Metadata } from 'next'
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
  return (
    <>
      <PageHero
        tagline="Legal"
        headline="Política de cookies"
      />
      <div className="max-w-[820px] mx-auto px-8 py-16 text-[var(--ink-700)]">

        <p className="text-[15px] leading-[1.8] mb-10">
          En cumplimiento del Real Decreto-ley 13/2012 y el Reglamento UE 2016/679 (RGPD), informamos sobre el uso de cookies en el sitio web de <strong>Grupo Lambea</strong> ({empresa.razon_social}).
        </p>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            ¿Qué son las cookies?
          </h2>
          <p className="text-[15px] leading-[1.8]">
            Las cookies son pequeños archivos de texto que los sitios web guardan en tu dispositivo al visitarlos. Permiten que el sitio recuerde tus preferencias y mejore tu experiencia de navegación.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-4">
            Tipos de cookies que utilizamos
          </h2>

          <div className="space-y-4">
            {[
              {
                type: 'Técnicas (necesarias)',
                desc: 'Imprescindibles para el funcionamiento del sitio: autenticación, seguridad de la sesión y gestión del carrito de compra. No requieren consentimiento.',
              },
              {
                type: 'Analíticas',
                desc: 'Nos permiten medir la actividad del sitio y entender cómo interactúan los usuarios con él, con el objetivo de mejorar la experiencia. Se usa Google Analytics.',
              },
              {
                type: 'Personalización',
                desc: 'Almacenan preferencias del usuario (idioma, región) para ofrecer una experiencia más personalizada.',
              },
              {
                type: 'Publicitarias',
                desc: 'Gestionan los espacios publicitarios del sitio y evitan mostrar el mismo anuncio repetidamente. Requieren consentimiento expreso.',
              },
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
            Duración
          </h2>
          <p className="text-[15px] leading-[1.8]">
            Las cookies pueden ser <strong>de sesión</strong> (se eliminan al cerrar el navegador) o <strong>persistentes</strong> (permanecen un tiempo determinado, normalmente entre 30 días y 2 años según su finalidad).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            Cookies de terceros
          </h2>
          <p className="text-[15px] leading-[1.8] mb-3">
            Utilizamos servicios de terceros que pueden instalar sus propias cookies:
          </p>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-1">
            <li><strong>Google Analytics:</strong> análisis de tráfico y comportamiento de los usuarios.</li>
            <li><strong>Google Maps:</strong> visualización de mapas en la página de contacto.</li>
          </ul>
          <p className="text-[15px] leading-[1.8] mt-3">
            Estos servicios tienen sus propias políticas de privacidad y están sujetos a las normas de sus respectivos proveedores.
          </p>
        </section>

        <section>
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            Cómo gestionar o desactivar las cookies
          </h2>
          <p className="text-[15px] leading-[1.8] mb-3">
            Puedes configurar tu navegador para aceptar, rechazar o eliminar cookies en cualquier momento:
          </p>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-1">
            <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies.</li>
            <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio.</li>
            <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies.</li>
            <li><strong>Edge:</strong> Configuración → Privacidad, búsqueda y servicios → Cookies.</li>
          </ul>
          <p className="text-[15px] leading-[1.8] mt-3">
            Ten en cuenta que desactivar cookies técnicas puede afectar al funcionamiento del carrito y al proceso de compra.
          </p>
          <p className="text-[15px] leading-[1.8] mt-3">
            Para cualquier consulta: <a href={`mailto:${contacto.email}`} className="text-[var(--blue)] no-underline hover:underline">{contacto.email}</a> · {contacto.telefono} · {empresa.direccion}, CP {empresa.cp} {empresa.ciudad}.
          </p>
        </section>

      </div>
    </>
  )
}
