'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Phone, Mail, MapPin } from 'lucide-react'
import { phoneDigits, type SiteSettings } from '@/lib/settings-schema'
import { NewsletterForm } from './NewsletterForm'

// [claveTraducción, href] — la etiqueta se traduce en render.
const NAV_TIENDA = [
  ['nautica', '/tienda/nautico'],
  ['caravaning', '/tienda/caravaning'],
  ['industrial', '/tienda/industrial'],
] as const

const NAV_EMPRESA = [
  ['quienesSomos', '/nosotros'],
  ['distribuidores', '/'],
  ['contacto', '/contacto'],
] as const

const NAV_AYUDA = [
  ['condiciones', '/condiciones-contratacion'],
  ['privacidad', '/politica-privacidad'],
  ['avisoLegal', '/aviso-legal'],
  ['cookies', '/cookies'],
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
  const t = useTranslations('footer')
  const tc = useTranslations('cats')

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
              {t('newsletterTitulo')}
            </strong>
            <span className="text-[15px]" style={{ color: '#C8E8F8' }}>
              {t('newsletterTexto')}
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
            {t('familiarDesde')} {settings.empresa.anio_fundacion}
          </div>
          <p className="text-[15px] leading-relaxed mb-6" style={{ color: '#C8E8F8' }}>
            {t('marcaDesc')}
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
            {t('regTox')} {settings.empresa.registro_toxicologico} · {t('fabricadoEspana')}
          </p>
        </div>

        {/* Tienda */}
        <div>
          <h4 className="text-[12px] uppercase tracking-[0.18em] font-bold mb-4" style={{ color: '#90C8E8' }}>
            {t('tienda')}
          </h4>
          {NAV_TIENDA.map(([key, href]) => (
            <FooterLink key={href} href={href}>{tc(key)}</FooterLink>
          ))}
          {settings.promo.activa && settings.promo.titulo && (
            <FooterLink href="/tienda/nautico">{settings.promo.titulo}</FooterLink>
          )}
        </div>

        {/* Empresa */}
        <div>
          <h4 className="text-[12px] uppercase tracking-[0.18em] font-bold mb-4" style={{ color: '#90C8E8' }}>
            {t('empresa')}
          </h4>
          {NAV_EMPRESA.map(([key, href]) => (
            <FooterLink key={key} href={href}>{t(key)}</FooterLink>
          ))}
        </div>

        {/* Ayuda */}
        <div>
          <h4 className="text-[12px] uppercase tracking-[0.18em] font-bold mb-4" style={{ color: '#90C8E8' }}>
            {t('ayuda')}
          </h4>
          {NAV_AYUDA.map(([key, href]) => (
            <FooterLink key={key} href={href}>{t(key)}</FooterLink>
          ))}
        </div>
      </div>

      {/* ── BOTTOM BAR ─────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #1C6FA0' }}>
        <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-center md:text-left">
          <span className="text-[13px]" style={{ color: '#90C8E8' }}>
            © {new Date().getFullYear()} {settings.empresa.razon_social}{settings.empresa.cif ? ` · CIF ${settings.empresa.cif}` : ''} · {t('derechos')}
          </span>

          {/* Urgencias — discreta, en el bottom bar */}
          <span className="text-[12px]" style={{ color: '#7BBCD8' }}>
            {t('urgencias')}{' '}
            <a
              href={`tel:+${phoneDigits(settings.contacto.telefono_toxicologia)}`}
              className="font-semibold no-underline transition-colors"
              style={{ color: '#A8D8F0' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#A8D8F0' }}
            >
              {settings.contacto.telefono_toxicologia}
            </a>
            {' '}· {t('h24')}
          </span>

          <span className="text-[13px]" style={{ color: '#90C8E8' }}>
            {t('desarrollado')}{' '}
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
