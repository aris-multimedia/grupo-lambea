import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'

export const metadata: Metadata = {
  title: 'Condiciones de Contratación — Grupo Lambea',
  description: 'Condiciones generales de contratación de Grupo Lambea: envíos, plazos de entrega, métodos de pago y política de devoluciones.',
  alternates: { canonical: '/condiciones-contratacion' },
}

export default function CondicionesContratacionPage() {
  return (
    <>
      <PageHero
        tagline="Legal"
        headline="Condiciones de contratación"
      />
      <div className="max-w-[820px] mx-auto px-8 py-16 text-[var(--ink-700)]">

        <p className="text-[15px] leading-[1.8] mb-10">
          Las presentes condiciones regulan la venta de productos a través de la tienda online de <strong>Grupo Lambea</strong> (TECNICLAM 2016 SL, NIF B66896945). Al realizar un pedido, el usuario acepta íntegramente las condiciones aquí descritas.
        </p>

        <section className="mb-10">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-4">
            Gastos de envío
          </h2>
          <div
            className="rounded-[var(--r-md)] p-6 mb-4"
            style={{ background: 'var(--blue-soft)' }}
          >
            <p className="text-[15px] font-semibold text-[var(--blue)]">
              Envío gratuito en pedidos a partir de 210 € (Península)
            </p>
          </div>
          <p className="text-[15px] leading-[1.8] mb-3">
            Para pedidos por debajo de ese importe, los gastos de envío varían según el peso y el destino. Los precios por kilo adicional oscilan entre <strong>1 € y 3 €</strong> según la zona:
          </p>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-1">
            <li>Península, Ceuta y Melilla</li>
            <li>Baleares</li>
            <li>Canarias (consultar disponibilidad)</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            Plazos de entrega
          </h2>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-2">
            <li>Los pedidos se procesan en un plazo de <strong>24 horas</strong> desde la confirmación del pago, para artículos en stock.</li>
            <li>Entrega estimada en <strong>24–72 horas</strong> para Península y Baleares.</li>
            <li>No se realizan envíos en días festivos.</li>
            <li>Para artículos fuera de stock, contacta con nosotros por email antes de formalizar el pedido.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            Métodos de pago
          </h2>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-2">
            <li><strong>Tarjeta de crédito/débito</strong> (incluyendo American Express) mediante pasarela segura con protocolo SSL.</li>
            <li><strong>PayPal.</strong></li>
            <li><strong>Transferencia bancaria</strong> — requiere coordinación previa por email con confirmación antes del envío.</li>
            <li><strong>Efectivo</strong> — únicamente para recogida en fábrica en Hospitalet de Llobregat (concertar cita previa).</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            Devoluciones
          </h2>
          <ul className="list-disc list-outside pl-5 text-[15px] leading-[1.8] space-y-2">
            <li>Plazo de devolución: <strong>15 días naturales</strong> desde la fecha de entrega.</li>
            <li>Los productos deben devolverse en su embalaje original y con los envases intactos.</li>
            <li>Los gastos de devolución corren a cargo del cliente, salvo en caso de productos dañados durante el transporte o con defecto de fabricación.</li>
            <li>Para iniciar una devolución, contacta con nosotros por email indicando el número de pedido.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-(family-name:--font-lora) text-[var(--ink)] text-[22px] font-medium mb-3">
            Garantía
          </h2>
          <p className="text-[15px] leading-[1.8] mb-3">
            Todos nuestros productos cuentan con la garantía legal del vendedor de <strong>2 años</strong> desde la fecha de entrega, conforme al Real Decreto Legislativo 1/2007.
          </p>
          <p className="text-[15px] leading-[1.8]">
            En caso de producto defectuoso, procederemos a la sustitución inmediata o al reembolso íntegro según las circunstancias. Para reclamaciones de garantía escríbenos a{' '}
            <a href="mailto:francisco@grupolambea.com" className="text-[var(--blue)] no-underline hover:underline">
              francisco@grupolambea.com
            </a>.
          </p>
        </section>

      </div>
    </>
  )
}
