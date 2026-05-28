import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight, FlaskConical, ShieldCheck, Award, Clock,
  Factory, Microscope, Leaf, Globe2,
} from 'lucide-react'
import { PageHero } from '@/components/PageHero'

export const metadata: Metadata = {
  title: 'Sobre Nosotros — Grupo Lambea',
  description:
    'Más de 70 años fabricando productos de limpieza y mantenimiento profesional para náutica, caravaning e industria. Empresa familiar fundada en 1952.',
}

export default function NosotrosPage() {
  return (
    <>
      <PageHero
        tagline="Empresa familiar · Fundada en 1952"
        TaglineIcon={Factory}
        headline="Tres generaciones al servicio"
        headlineEm="del profesional."
        description="Formulamos productos de limpieza y mantenimiento para los entornos más exigentes: astilleros, talleres mecánicos y profesionales del caravaning."
        image="/assets/categorias/foto-productos-barco.jpg"
        imageAlt="Grupo Lambea — instalaciones"
        minHeight={480}
      />

      {/* ── STATS STRIP ──────────────────────────────────────────── */}
      <div className="bg-[var(--blue)] text-white">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-8 md:py-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {[
            { num: '1952', label: 'Año de fundación' },
            { num: '+70', label: 'Años de experiencia' },
            { num: '3', label: 'Generaciones familiares' },
            { num: '+40', label: 'Productos activos en catálogo' },
          ].map(({ num, label }) => (
            <div key={label} className="text-center">
              <div
                className="font-(family-name:--font-lora) font-semibold text-white mb-1"
                style={{ fontSize: 44, letterSpacing: '-0.03em', lineHeight: 1 }}
              >
                {num}
              </div>
              <div className="text-[13px] text-white/70 font-medium uppercase tracking-[0.1em]">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HISTORIA ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-[100px] bg-white">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8 grid gap-12 md:gap-20 items-center grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
          {/* Images */}
          <div className="relative hidden lg:block" style={{ aspectRatio: '5/6' }}>
            <div
              className="absolute top-0 left-0 rounded-[var(--r-lg)] overflow-hidden"
              style={{ width: '80%', height: '75%', boxShadow: '0 24px 50px rgba(14,87,132,0.18)' }}
            >
              <Image
                src="/assets/empresa/foto-empresa-mesa.jpg"
                alt="Laboratorio de formulación Grupo Lambea"
                fill
                className="object-cover"
              />
            </div>
            <div
              className="absolute bottom-0 right-0 rounded-[var(--r-lg)] overflow-hidden"
              style={{
                width: '52%', height: '45%',
                boxShadow: '0 16px 40px rgba(14,87,132,0.15)',
                border: '6px solid #fff',
              }}
            >
              <Image
                src="/assets/categorias/foto-barco-2.jpg"
                alt="Embarcaciones tratadas con productos Lambea"
                fill
                className="object-cover"
              />
            </div>
            {/* Year badge */}
            <div
              className="absolute z-10 text-white text-center rounded-[var(--r-md)] px-[22px] py-[18px]"
              style={{
                top: '30%', right: '6%',
                background: '#1370A8',
                boxShadow: '0 12px 30px rgba(19,112,168,0.4)',
                transform: 'rotate(3deg)',
              }}
            >
              <div className="font-(family-name:--font-lora) text-[30px] font-semibold leading-none">1952</div>
              <div className="text-[10px] uppercase tracking-[0.18em] mt-1 font-semibold opacity-80">
                Fundación
              </div>
            </div>
          </div>

          {/* Text */}
          <div>
            <span className="block text-[11px] uppercase tracking-[0.22em] text-[var(--blue)] font-semibold mb-4">
              Nuestra historia
            </span>
            <h2
              className="font-(family-name:--font-lora) text-[var(--ink)] font-medium mb-6"
              style={{ fontSize: 'clamp(30px, 3.8vw, 42px)', lineHeight: 1.12, letterSpacing: '-0.02em' }}
            >
              De los astilleros del Mediterráneo{' '}
              <em className="italic text-[var(--blue-deep)]">a cada taller de España.</em>
            </h2>
            <p className="text-[16px] text-[var(--ink-700)] leading-[1.8] mb-5">
              Grupo Lambea nació en 1952 como empresa metalúrgica, fabricando componentes para los astilleros más importantes del Mediterráneo. Esa experiencia directa con los entornos marinos —la humedad, la sal, la corrosión— nos enseñó lo que realmente funciona.
            </p>
            <p className="text-[16px] text-[var(--ink-700)] leading-[1.8] mb-5">
              Con el tiempo, pasamos de fabricar piezas a fabricar los productos que esas piezas necesitaban para durar. Hoy somos una empresa química con fórmulas propias y registro toxicológico, al servicio de profesionales del sector náutico, caravaning e industrial.
            </p>
            <p className="text-[16px] text-[var(--ink-700)] leading-[1.8] mb-7">
              Tres generaciones después, Francisco Lambea sigue al frente. Sin intermediarios. Sin franquicias. Los mismos valores de oficio y rigor que pusimos en el primer motor que tratamos en el 52.
            </p>

            <blockquote
              className="font-(family-name:--font-lora) italic text-[18px] leading-[1.6] text-[var(--blue-deep)] px-[32px] py-[20px] bg-[var(--bg-soft)] rounded-[var(--r-md)] relative"
            >
              <span className="absolute top-0 left-3 font-serif text-[60px] text-[var(--blue)] leading-none opacity-30" aria-hidden>
                "
              </span>
              Nuestra amplia experiencia fabricando para mega yates y astilleros de primer nivel nos convirtió en especialistas en formular lo que realmente aguanta.
              <span className="block not-italic text-[12px] text-[var(--ink-500)] mt-3 font-semibold tracking-[0.05em]">
                — Francisco Lambea, tercera generación
              </span>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── LÍNEA DE TIEMPO ──────────────────────────────────────── */}
      <section className="py-12 md:py-[80px] bg-[var(--bg-soft)]">
        <div className="max-w-[860px] mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <span className="block text-[11px] uppercase tracking-[0.22em] text-[var(--blue)] font-semibold mb-3">
              Trayectoria
            </span>
            <h2
              className="font-(family-name:--font-lora) text-[var(--ink)] font-medium"
              style={{ fontSize: 'clamp(28px, 3.5vw, 38px)', letterSpacing: '-0.02em' }}
            >
              Más de siete décadas de <em className="italic text-[var(--blue-deep)]">oficio.</em>
            </h2>
          </div>

          <div className="relative">
            {/* Vertical line — desktop only */}
            <div
              className="hidden md:block absolute left-[50%] top-0 bottom-0 w-px"
              style={{ background: 'var(--line)', transform: 'translateX(-50%)' }}
            />

            {[
              {
                year: '1952',
                title: 'Fundación de Lambea',
                desc: 'El "Abuelo Lambea" funda la empresa como taller metalúrgico. Proveedor habitual de los astilleros más importantes del Mediterráneo.',
                side: 'left',
              },
              {
                year: '1970s',
                title: 'Especialización náutica',
                desc: 'La experiencia en construcción de embarcaciones deportivas y mega yates impulsa el desarrollo de los primeros productos de limpieza y mantenimiento propios.',
                side: 'right',
              },
              {
                year: '1990s',
                title: 'Segunda generación',
                desc: 'La segunda generación familiar amplía el catálogo a caravaning e industria, con nuevas fórmulas para vehículos recreativos y talleres mecánicos.',
                side: 'left',
              },
              {
                year: '2000s',
                title: 'Registro toxicológico',
                desc: 'Obtención del registro toxicológico DRP19-0005580. Cumplimiento de normativa europea para productos de uso profesional.',
                side: 'right',
              },
              {
                year: 'Hoy',
                title: 'Tercera generación',
                desc: 'Francisco Lambea lidera la empresa con más de 40 productos activos, venta directa online y distribución en toda España. La fórmula es nuestra, el oficio también.',
                side: 'left',
              },
            ].map(({ year, title, desc, side }) => (
              <div
                key={year}
                className="relative flex mb-6 md:mb-12"
                style={{ justifyContent: side === 'left' ? 'flex-start' : 'flex-end' }}
              >
                {/* Dot — desktop only */}
                <div
                  className="hidden md:block absolute left-[50%] top-5 w-4 h-4 rounded-full bg-[var(--blue)] z-10"
                  style={{ transform: 'translateX(-50%)', boxShadow: '0 0 0 4px #fff, 0 0 0 6px var(--blue)' }}
                />
                {/* Card */}
                <div
                  className="w-full md:w-[44%] bg-white rounded-[var(--r-md)] px-5 md:px-6 py-5"
                  style={{ boxShadow: '0 4px 16px rgba(14,87,132,0.08)' }}
                >
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--blue)] font-bold mb-1.5">
                    {year}
                  </div>
                  <h3 className="font-(family-name:--font-lora) text-[var(--ink)] font-medium text-[18px] mb-2 leading-tight">
                    {title}
                  </h3>
                  <p className="text-[13.5px] text-[var(--ink-500)] leading-[1.6]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PILARES ──────────────────────────────────────────────── */}
      <section className="py-12 md:py-[90px] bg-white">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <span className="block text-[11px] uppercase tracking-[0.22em] text-[var(--blue)] font-semibold mb-3">
              Por qué elegirnos
            </span>
            <h2
              className="font-(family-name:--font-lora) text-[var(--ink)] font-medium"
              style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', letterSpacing: '-0.02em' }}
            >
              Lo que nos diferencia de{' '}
              <em className="italic text-[var(--blue-deep)]">la competencia.</em>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-7">
            {[
              {
                Icon: FlaskConical,
                title: 'Fórmula propia',
                desc: 'Desarrollamos cada producto en base a años de uso real en astilleros y talleres. Nada subcontratado, nada genérico.',
              },
              {
                Icon: ShieldCheck,
                title: 'Registro toxicológico',
                desc: 'Todos nuestros productos tienen número de registro toxicológico. Conformes con normativa europea y etiquetado CLP.',
              },
              {
                Icon: Leaf,
                title: 'Biodegradables',
                desc: 'Formulados para ser eficaces sin agredir el entorno. Especialmente importante en aplicaciones náuticas e industriales.',
              },
              {
                Icon: Microscope,
                title: 'Control de calidad',
                desc: 'Cada lote pasa por control antes de salir. Garantizamos la consistencia que los profesionales necesitan en cada uso.',
              },
              {
                Icon: Factory,
                title: 'Fabricación en España',
                desc: 'Producimos en nuestras propias instalaciones en Tarragona. Trazabilidad completa, sin depender de terceros.',
              },
              {
                Icon: Clock,
                title: '+70 años de oficio',
                desc: 'No es marketing. Llevamos décadas en los mismos entornos que nuestros clientes, y eso se nota en cada fórmula.',
              },
              {
                Icon: Globe2,
                title: 'Tres sectores',
                desc: 'Náutica, caravaning e industria. Productos distintos para entornos distintos, con la misma exigencia en todos.',
              },
              {
                Icon: Award,
                title: 'Empresa familiar',
                desc: 'La tercera generación da la cara. Sin call centers. Cuando llamas, hablas con quien sabe de producto.',
              },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="bg-[var(--bg-soft)] rounded-[var(--r-lg)] p-7 flex flex-col gap-4"
              >
                <div className="w-11 h-11 rounded-full bg-[var(--blue-soft)] flex items-center justify-center text-[var(--blue)] flex-shrink-0">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--ink)] text-[15px] mb-2 leading-tight">{title}</h3>
                  <p className="text-[13.5px] text-[var(--ink-500)] leading-[1.65]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTORES ─────────────────────────────────────────────── */}
      <section
        className="py-12 md:py-[80px]"
        style={{ background: '#1E92D8' }}
      >
        <div className="max-w-[1320px] mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span
              className="block text-[11px] uppercase tracking-[0.22em] font-semibold mb-3"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              Áreas de especialidad
            </span>
            <h2
              className="font-(family-name:--font-lora) font-medium text-white"
              style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', letterSpacing: '-0.02em' }}
            >
              Profesionales en tres{' '}
              <em className="italic" style={{ color: 'rgba(255,255,255,0.88)' }}>entornos.</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {[
              {
                label: 'Náutica',
                tag: 'Barcos y embarcaciones',
                desc: 'Limpiadores de gelcoat, desoxidantes marinos, pulimentos para fibra, productos para teca y limpieza de motores fueraborda. Testados en agua salada.',
                img: '/assets/categorias/foto-productos-barco.jpg',
                href: '/tienda/nautico',
              },
              {
                label: 'Caravaning',
                tag: 'Caravanas, campers y furgonetas',
                desc: 'Limpiadores de toldo, abrillantadores para superficies plásticas, productos para depósitos de agua y mantenimiento general de vehículos recreativos.',
                img: '/assets/categorias/foto-caravanas.jpg',
                href: '/tienda/caravaning',
              },
              {
                label: 'Industrial',
                tag: 'Talleres y vehículos',
                desc: 'Aditivos pre-ITV para diesel y gasolina, desengrasantes industriales, limpiadores de inyectores y productos de mantenimiento para flotas y talleres mecánicos.',
                img: '/assets/categorias/foto-industrial.jpg',
                href: '/tienda/industrial',
              },
            ].map(({ label, tag, desc, img, href }) => (
              <Link
                key={label}
                href={href}
                className="group rounded-[var(--r-lg)] overflow-hidden no-underline block bg-white transition-transform duration-300 hover:-translate-y-1"
                style={{ boxShadow: '0 4px 20px rgba(14,87,132,0.12)' }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <Image
                    src={img}
                    alt={`${label} — Grupo Lambea`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--blue)] font-semibold mb-1.5">{tag}</div>
                  <h3 className="font-(family-name:--font-lora) text-[var(--ink)] font-medium text-[20px] mb-2.5 leading-tight">
                    {label}
                  </h3>
                  <p className="text-[13px] text-[var(--ink-500)] leading-[1.65] mb-4">{desc}</p>
                  <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--blue)] transition-all group-hover:gap-3">
                    Ver productos <ArrowRight size={13} strokeWidth={2.2} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS ─────────────────────────────────────────────── */}
      <section className="py-[60px] bg-white border-b border-[var(--line)]">
        <div className="text-center text-[12px] uppercase tracking-[0.22em] text-[var(--ink-500)] font-semibold mb-10">
          Empresas que han confiado en nosotros
        </div>
        <div className="max-w-[1100px] mx-auto px-8 flex justify-between items-center gap-10 flex-wrap">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="flex items-center justify-center h-[68px] px-7 py-3.5 bg-white rounded-[12px] flex-1 min-w-[140px] max-w-[200px] transition-all duration-300 hover:-translate-y-0.5 grayscale opacity-55 hover:grayscale-0 hover:opacity-100"
              style={{ border: '1px solid var(--line)' }}
            >
              <Image
                src={`/assets/empresa/empresa${n}.png`}
                alt="Partner Grupo Lambea"
                width={160}
                height={50}
                className="object-contain max-h-10 w-auto"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-[80px] bg-[var(--bg-soft)]">
        <div className="max-w-[700px] mx-auto px-8 text-center">
          <h2
            className="font-(family-name:--font-lora) text-[var(--ink)] font-medium mb-5"
            style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', letterSpacing: '-0.02em' }}
          >
            ¿Necesitas asesoramiento{' '}
            <em className="italic text-[var(--blue-deep)]">personalizado?</em>
          </h2>
          <p className="text-[16px] text-[var(--ink-500)] leading-[1.75] mb-8">
            Cuéntanos tu caso y te recomendamos el producto exacto. Llevamos décadas resolviendo los mismos problemas que tú tienes hoy.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/contacto"
              className="bg-[var(--blue)] text-white font-semibold px-[30px] py-[15px] rounded-[10px] text-[14px] inline-flex items-center gap-2.5 hover:-translate-y-0.5 transition-all no-underline"
            >
              Contactar ahora <ArrowRight size={15} strokeWidth={2.2} />
            </Link>
            <Link
              href="/tienda"
              className="bg-white text-[var(--ink)] font-semibold px-[30px] py-[15px] rounded-[10px] text-[14px] inline-flex items-center gap-2.5 hover:-translate-y-0.5 transition-all no-underline"
              style={{ border: '1.5px solid var(--line)' }}
            >
              Ver el catálogo
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
