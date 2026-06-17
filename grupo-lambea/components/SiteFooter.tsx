'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'
import { phoneDigits, type SiteSettings } from '@/lib/settings-schema'
import { NewsletterForm } from './NewsletterForm'

const NAV_TIENDA = [
  ['Náutico', '/tienda/nautico'],
  ['Caravaning', '/tienda/caravaning'],
  ['Industrial', '/tienda/industrial'],
] as const

const NAV_EMPRESA = [
  ['Quiénes somos', '/nosotros'],
  ['Distribuidores', '/'],
  ['Contacto', '/contacto'],
] as const

const NAV_AYUDA = [
  ['Condiciones de contratación', '/condiciones-contratacion'],
  ['Política de privacidad', '/politica-privacidad'],
  ['Aviso legal', '/aviso-legal'],
  ['Cookies', '/cookies'],
] as const

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block py-2 text-[15px] no-underline transition-colors"
      style={{ color: '#C8E8F8' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#C8E8F8' }}
    >
      {children}
    </Link>
  )
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="text-white" style={{ background: '#0E5784' }}>

      {/* ── NEWSLETTER ─────────────────────────────────────────── */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-9" style={{ borderBottom: '1px solid #1C6FA0' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <strong
              className="block text-white text-[17px] mb-1 font-(family-name:--font-lora)"
              style={{ fontWeight: 500 }}
            >
              Novedades y ofertas exclusivas
            </strong>
            <span className="text-[15px]" style={{ color: '#C8E8F8' }}>
              Accede antes que nadie a nuevas fórmulas y promociones de temporada.
            </span>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* ── MAIN GRID ──────────────────────────────────────────── */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10">
        {/* Brand column */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="font-(family-name:--font-lora) text-[24px] font-medium text-white mb-1">
            Grupo Lambea
          </div>
          <div className="text-[13px] mb-5" style={{ color: '#90C8E8' }}>
            Empresa familiar · Desde {settings.empresa.anio_fundacion}
          </div>
          <p className="text-[15px] leading-relaxed mb-6" style={{ color: '#C8E8F8' }}>
            Formulamos productos profesionales de limpieza y mantenimiento para náutica,
            caravaning e industrial. Tres generaciones con el mismo oficio desde Tarragona.
          </p>

          <div className="flex flex-col gap-3.5">
            {[
              { href: `tel:+${phoneDigits(settings.contacto.telefono)}`, Icon: Phone, label: settings.contacto.telefono },
              { href: `mailto:${settings.contacto.email}`, Icon: Mail, label: settings.contacto.email },
              {
                href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Grupo Lambea, ${settings.empresa.ciudad}, ${settings.empresa.provincia}`)}`,
                Icon: MapPin,
                label: `${settings.empresa.ciudad}, ${settings.empresa.provincia}`,
              },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-3 text-[15px] no-underline transition-colors"
                style={{ color: '#C8E8F8' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#C8E8F8' }}
              >
                <Icon size={16} strokeWidth={2} style={{ color: '#7DD8F8', flexShrink: 0 }} />
                {label}
              </a>
            ))}
          </div>

          <p className="text-[13px] mt-5" style={{ color: '#90C8E8' }}>
            Reg. toxicológico {settings.empresa.registro_toxicologico} · Fabricado en España
          </p>
        </div>

        {/* Tienda */}
        <div>
          <h4 className="text-[12px] uppercase tracking-[0.18em] font-bold mb-4" style={{ color: '#90C8E8' }}>
            Tienda
          </h4>
          {NAV_TIENDA.map(([label, href]) => (
            <FooterLink key={label} href={href}>{label}</FooterLink>
          ))}
          {settings.promo.activa && settings.promo.titulo && (
            <FooterLink href="/tienda/nautico">{settings.promo.titulo}</FooterLink>
          )}
        </div>

        {/* Empresa */}
        <div>
          <h4 className="text-[12px] uppercase tracking-[0.18em] font-bold mb-4" style={{ color: '#90C8E8' }}>
            Empresa
          </h4>
          {NAV_EMPRESA.map(([label, href]) => (
            <FooterLink key={label} href={href}>{label}</FooterLink>
          ))}
        </div>

        {/* Ayuda */}
        <div>
          <h4 className="text-[12px] uppercase tracking-[0.18em] font-bold mb-4" style={{ color: '#90C8E8' }}>
            Ayuda
          </h4>
          {NAV_AYUDA.map(([label, href]) => (
            <FooterLink key={label} href={href}>{label}</FooterLink>
          ))}
        </div>
      </div>

      {/* ── BOTTOM BAR ─────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #1C6FA0' }}>
        <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-center md:text-left">
          <span className="text-[13px]" style={{ color: '#90C8E8' }}>
            © {new Date().getFullYear()} {settings.empresa.razon_social}{settings.empresa.cif ? ` · CIF ${settings.empresa.cif}` : ''} · Todos los derechos reservados.
          </span>

          {/* Urgencias — discreta, en el bottom bar */}
          <span className="text-[12px]" style={{ color: '#7BBCD8' }}>
            Urgencias toxicológicas:{' '}
            <a
              href={`tel:+${phoneDigits(settings.contacto.telefono_toxicologia)}`}
              className="font-semibold no-underline transition-colors"
              style={{ color: '#A8D8F0' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#A8D8F0' }}
            >
              {settings.contacto.telefono_toxicologia}
            </a>
            {' '}· 24 h
          </span>

          <span className="text-[13px]" style={{ color: '#90C8E8' }}>
            Desarrollado por{' '}
            <a
              href="https://arismultimedia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline font-medium transition-colors"
              style={{ color: '#C8E8F8' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#C8E8F8' }}
            >
              Arismultimedia
            </a>
          </span>
        </div>
      </div>

    </footer>
  )
}
