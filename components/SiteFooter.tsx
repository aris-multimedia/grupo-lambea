'use client'

import { Phone, Mail, MapPin, Send } from 'lucide-react'

const NAV_TIENDA = ['Náutico', 'Caravaning', 'Industrial', 'Promoción 3×2'] as const
const NAV_EMPRESA = ['Quiénes somos', 'Distribuidores', 'Contacto'] as const
const NAV_AYUDA = ['Condiciones de contratación', 'Política de privacidad', 'Aviso legal', 'Cookies'] as const

function FooterLink({ children }: { children: React.ReactNode }) {
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      className="block py-2 text-[15px] no-underline transition-colors"
      style={{ color: '#C8E8F8' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#C8E8F8' }}
    >
      {children}
    </a>
  )
}

export function SiteFooter() {
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
          <form
            className="flex gap-2.5 w-full sm:w-auto flex-shrink-0"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="tu@email.com"
              aria-label="Correo electrónico"
              className="rounded-[8px] px-[18px] py-3 text-[15px] text-white flex-1 sm:flex-initial sm:min-w-[220px]"
              style={{
                background: '#0A4A70',
                border: '1px solid #2A80B0',
                fontFamily: 'inherit',
              }}
            />
            <button
              type="submit"
              className="flex items-center gap-2 font-semibold text-[14px] px-[20px] py-3 rounded-[8px] text-white transition-colors whitespace-nowrap"
              style={{ background: '#1E92D8' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1580C0' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#1E92D8' }}
            >
              <Send size={15} />
              <span className="hidden sm:inline">Suscribirse</span>
            </button>
          </form>
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
            Empresa familiar · Desde 1952
          </div>
          <p className="text-[15px] leading-relaxed mb-6" style={{ color: '#C8E8F8' }}>
            Formulamos productos profesionales de limpieza y mantenimiento para náutica,
            caravaning e industrial. Tres generaciones con el mismo oficio desde Tarragona.
          </p>

          <div className="flex flex-col gap-3.5">
            {[
              { href: 'tel:637916345', Icon: Phone, label: '637 91 63 45' },
              { href: 'mailto:francisco@grupolambea.com', Icon: Mail, label: 'francisco@grupolambea.com' },
              { href: '#', Icon: MapPin, label: "Sant Jaume d'Enveja, Tarragona" },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
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
            Reg. toxicológico DRP19-0005580 · Fabricado en España
          </p>
        </div>

        {/* Tienda */}
        <div>
          <h4 className="text-[12px] uppercase tracking-[0.18em] font-bold mb-4" style={{ color: '#90C8E8' }}>
            Tienda
          </h4>
          {NAV_TIENDA.map((label) => (
            <FooterLink key={label}>{label}</FooterLink>
          ))}
        </div>

        {/* Empresa */}
        <div>
          <h4 className="text-[12px] uppercase tracking-[0.18em] font-bold mb-4" style={{ color: '#90C8E8' }}>
            Empresa
          </h4>
          {NAV_EMPRESA.map((label) => (
            <FooterLink key={label}>{label}</FooterLink>
          ))}
        </div>

        {/* Ayuda */}
        <div>
          <h4 className="text-[12px] uppercase tracking-[0.18em] font-bold mb-4" style={{ color: '#90C8E8' }}>
            Ayuda
          </h4>
          {NAV_AYUDA.map((label) => (
            <FooterLink key={label}>{label}</FooterLink>
          ))}
        </div>
      </div>

      {/* ── BOTTOM BAR ─────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #1C6FA0' }}>
        <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-center md:text-left">
          <span className="text-[13px]" style={{ color: '#90C8E8' }}>
            © {new Date().getFullYear()} Grupo Lambea S.L. · Todos los derechos reservados.
          </span>

          <span className="text-[12px]" style={{ color: '#7BBCD8' }}>
            Urgencias toxicológicas:{' '}
            <a
              href="tel:915620420"
              className="font-semibold no-underline transition-colors"
              style={{ color: '#A8D8F0' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#A8D8F0' }}
            >
              915 620 420
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
            {' '}· Hecho con oficio en Tarragona
          </span>
        </div>
      </div>

    </footer>
  )
}
