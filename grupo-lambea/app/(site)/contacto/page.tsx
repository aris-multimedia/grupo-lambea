import type { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock, AlertTriangle, MessageCircle } from 'lucide-react'
import { ContactForm } from './ContactForm'
import { PageHero } from '@/components/PageHero'
import { getSettings } from '@/lib/settings'
import { getPageSeo } from '@/lib/seo'
import { phoneDigits } from '@/lib/settings-schema'

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getPageSeo('contacto')
  const url = '/contacto'
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: 'Grupo Lambea', locale: 'es_ES', url, title, description },
  }
}

export default async function ContactoPage() {
  const { contacto, empresa } = await getSettings()
  return (
    <>
      <PageHero
        tagline="Estamos aquí"
        headline="Hablemos sin"
        headlineEm="intermediarios."
        description="Cuando contactas con Grupo Lambea, hablas directamente con quien formula y conoce cada producto. Sin bots ni call centers."
      />

      {/* ── QUICK CONTACT STRIP ──────────────────────────────────── */}
      <div className="bg-white border-b border-(--line)">
        <div className="max-w-330 mx-auto px-4 md:px-8 py-8 md:py-10 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <a
            href={`https://wa.me/${phoneDigits(contacto.whatsapp)}?text=Hola%2C%20tengo%20una%20consulta%20sobre%20un%20producto%20de%20Grupo%20Lambea`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-5 p-6 rounded-(--r-lg) transition-all no-underline hover:-translate-y-0.5"
            style={{ background: 'var(--bg-soft)', border: '1.5px solid var(--line)' }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--blue-soft)' }}>
              <MessageCircle size={24} strokeWidth={1.8} className="text-(--blue)" />
            </div>
            <div>
              <div className="font-bold text-(--ink) text-[15px] mb-0.5">WhatsApp</div>
              <div className="text-(--ink-500) text-[13.5px] mb-1">Respuesta rápida</div>
              <div className="text-(--blue) font-semibold text-[14px]">{contacto.whatsapp}</div>
            </div>
          </a>

          <a
            href={`tel:+${phoneDigits(contacto.telefono)}`}
            className="group flex items-center gap-5 p-6 rounded-(--r-lg) transition-all no-underline hover:-translate-y-0.5"
            style={{ background: 'var(--bg-soft)', border: '1.5px solid var(--line)' }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--blue-soft)' }}>
              <Phone size={24} strokeWidth={1.8} className="text-(--blue)" />
            </div>
            <div>
              <div className="font-bold text-(--ink) text-[15px] mb-0.5">Teléfono</div>
              <div className="text-(--ink-500) text-[13.5px] mb-1">{contacto.horario}</div>
              <div className="text-(--blue) font-semibold text-[14px]">{contacto.telefono}</div>
            </div>
          </a>

          <a
            href={`mailto:${contacto.email}`}
            className="group flex items-center gap-5 p-6 rounded-(--r-lg) transition-all no-underline hover:-translate-y-0.5"
            style={{ background: 'var(--bg-soft)', border: '1.5px solid var(--line)' }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--blue-soft)' }}>
              <Mail size={24} strokeWidth={1.8} className="text-(--blue)" />
            </div>
            <div>
              <div className="font-bold text-(--ink) text-[15px] mb-0.5">Email</div>
              <div className="text-(--ink-500) text-[13.5px] mb-1">Respuesta en 24 h</div>
              <div className="text-(--blue) font-semibold text-[13px] truncate">{contacto.email}</div>
            </div>
          </a>
        </div>
      </div>

      {/* ── FORM + INFO ──────────────────────────────────────────── */}
      <section className="py-12 md:py-20 bg-(--bg-soft)">
        <div className="max-w-330 mx-auto px-4 md:px-8 grid gap-10 md:gap-16 grid-cols-1 lg:grid-cols-[1.2fr_1fr]">

          {/* Left: Form — en tarjeta blanca para que se lea claramente como zona de formulario */}
          <div
            className="bg-white rounded-(--r-lg) border border-(--line) p-6 md:p-9 self-start"
            style={{ boxShadow: '0 10px 34px rgba(14,87,132,0.08)' }}
          >
            <h2
              className="font-(family-name:--font-lora) text-(--ink) font-medium mb-2"
              style={{ fontSize: 28, letterSpacing: '-0.015em' }}
            >
              Envíanos un mensaje
            </h2>
            <p className="text-[14px] text-(--ink-500) mb-8">
              Te respondemos en menos de 24 horas laborables.
            </p>
            <ContactForm email={contacto.email} telefono={contacto.telefono} />
          </div>

          {/* Right: Info */}
          <div className="flex flex-col gap-8">

            {/* Address + hours — clean list, no card */}
            <div>
              <h3 className="font-(family-name:--font-lora) text-(--ink) font-medium text-[20px] mb-5">
                Dónde encontrarnos
              </h3>
              <div className="space-y-0">
                <div className="flex items-start gap-4 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
                  <div className="w-9 h-9 bg-(--blue-soft) rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={16} className="text-(--blue)" />
                  </div>
                  <div>
                    <div className="font-semibold text-(--ink) text-[14px] mb-1">Dirección</div>
                    <div className="text-(--ink-500) text-[13.5px] leading-[1.6]">
                      {empresa.direccion}<br />
                      {empresa.cp} {empresa.ciudad}<br />
                      {empresa.provincia}, España
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4 py-4">
                  <div className="w-9 h-9 bg-(--blue-soft) rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={16} className="text-(--blue)" />
                  </div>
                  <div>
                    <div className="font-semibold text-(--ink) text-[14px] mb-1">Horario</div>
                    <div className="text-(--ink-500) text-[13.5px] leading-[1.6]">
                      {contacto.horario}<br />
                      <span className="text-[12px]">Sábados y festivos: cerrado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map embed — no shadow */}
            <div className="rounded-(--r-lg) overflow-hidden border border-(--line)" style={{ height: 360 }}>
              <iframe
                title="Ubicación Grupo Lambea"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2993.4!2d0.6!3d40.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a2f3f5a0000001%3A0x0!2sCalle%20Caserna%2048%2C%2043877%20Sant%20Jaume%20d'Enveja%2C%20Tarragona!5e0!3m2!1ses!2ses!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Toxicology — inline warning row, no red box */}
            <div className="flex items-start gap-3 pt-1">
              <AlertTriangle size={16} className="text-(--ink-500) shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-(--ink) text-[13px] mb-0.5">Urgencias toxicológicas — 24 h</div>
                <a href={`tel:+${phoneDigits(contacto.telefono_toxicologia)}`} className="text-(--blue) font-bold text-[18px] no-underline hover:underline block mb-0.5">
                  {contacto.telefono_toxicologia}
                </a>
                <p className="text-(--ink-500) text-[12px] leading-relaxed">
                  En caso de ingestión accidental o contacto con los ojos.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
