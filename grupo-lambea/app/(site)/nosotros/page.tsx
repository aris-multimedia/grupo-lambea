import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight, FlaskConical, ShieldCheck, Award, Clock,
  Factory, Microscope, Leaf, Globe2,
} from 'lucide-react'
import { PageHero } from '@/components/PageHero'
import { getPageSeo } from '@/lib/seo'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getPageSeo('nosotros')
  const url = '/nosotros'
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: 'Grupo Lambea', locale: 'es_ES', url, title, description },
  }
}

export default async function NosotrosPage() {
  const t = await getTranslations('nosotros')
  const tc = await getTranslations('cats')
  return (
    <>
      <PageHero
        tagline={t('heroTagline')}
        TaglineIcon={Factory}
        headline={t('heroHeadline')}
        headlineEm={t('heroHeadlineEm')}
        description={t('heroDesc')}
        image="/assets/categorias/foto-productos-barco.jpg"
        imageAlt="Grupo Lambea — instalaciones"
        minHeight={480}
      />

      {/* ── STATS STRIP ──────────────────────────────────────────── */}
      <div className="bg-[var(--blue)] text-white">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-8 md:py-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {[
            { num: '1952', label: t('statFundacion') },
            { num: '+70', label: t('statExperiencia') },
            { num: '3', label: t('statGeneraciones') },
            { num: '+40', label: t('statProductos') },
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
                {t('fundacion')}
              </div>
            </div>
          </div>

          {/* Text */}
          <div>
            <span className="block text-[11px] uppercase tracking-[0.22em] text-[var(--blue)] font-semibold mb-4">
              {t('historiaEyebrow')}
            </span>
            <h2
              className="font-(family-name:--font-lora) text-[var(--ink)] font-medium mb-6"
              style={{ fontSize: 'clamp(30px, 3.8vw, 42px)', lineHeight: 1.12, letterSpacing: '-0.02em' }}
            >
              {t('historiaTitulo')}{' '}
              <em className="italic text-[var(--blue-deep)]">{t('historiaTituloEm')}</em>
            </h2>
            <p className="text-[16px] text-[var(--ink-700)] leading-[1.8] mb-5">
              {t('historiaP1')}
            </p>
            <p className="text-[16px] text-[var(--ink-700)] leading-[1.8] mb-5">
              {t('historiaP2')}
            </p>
            <p className="text-[16px] text-[var(--ink-700)] leading-[1.8] mb-7">
              {t('historiaP3')}
            </p>

            <blockquote
              className="font-(family-name:--font-lora) italic text-[18px] leading-[1.6] text-[var(--blue-deep)] px-[32px] py-[20px] bg-[var(--bg-soft)] rounded-[var(--r-md)] relative"
            >
              <span className="absolute top-0 left-3 font-serif text-[60px] text-[var(--blue)] leading-none opacity-30" aria-hidden>
                &ldquo;
              </span>
              {t('historiaQuote')}
              <span className="block not-italic text-[12px] text-[var(--ink-500)] mt-3 font-semibold tracking-[0.05em]">
                {t('quoteAutor')}
              </span>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── POR QUÉ ELEGIRNOS ────────────────────────────────────── */}
      <section className="bg-[var(--bg-soft)] grid place-items-center min-h-[calc(100svh-65px)] md:min-h-[calc(100svh-92px)] py-16">
        <div className="max-w-[1320px] mx-auto w-full px-4 md:px-8">
          <div className="text-center mb-14">
            <span className="block text-[11px] uppercase tracking-[0.22em] text-[var(--blue)] font-semibold mb-3">
              {t('porqueEyebrow')}
            </span>
            <h2
              className="font-(family-name:--font-lora) text-[var(--ink)] font-medium"
              style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', letterSpacing: '-0.02em' }}
            >
              {t('porqueTitulo')}{' '}
              <em className="italic text-[var(--blue-deep)]">{t('porqueTituloEm')}</em>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-7">
            {[
              { Icon: FlaskConical, title: t('cardFormulaT'), desc: t('cardFormulaD') },
              { Icon: ShieldCheck, title: t('cardRegistroT'), desc: t('cardRegistroD') },
              { Icon: Leaf, title: t('cardBioT'), desc: t('cardBioD') },
              { Icon: Microscope, title: t('cardCalidadT'), desc: t('cardCalidadD') },
              { Icon: Factory, title: t('cardEspanaT'), desc: t('cardEspanaD') },
              { Icon: Clock, title: t('cardOficioT'), desc: t('cardOficioD') },
              { Icon: Globe2, title: t('cardSectoresT'), desc: t('cardSectoresD') },
              { Icon: Award, title: t('cardFamiliarT'), desc: t('cardFamiliarD') },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-[var(--r-lg)] p-7 flex flex-col gap-4"
                style={{ boxShadow: '0 2px 10px rgba(14,87,132,0.06)' }}
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
        className="grid place-items-center min-h-[calc(100svh-65px)] md:min-h-[calc(100svh-92px)] py-16"
        style={{ background: '#1E92D8' }}
      >
        <div className="max-w-[1320px] mx-auto w-full px-4 md:px-8">
          <div className="text-center mb-12">
            <span
              className="block text-[11px] uppercase tracking-[0.22em] font-semibold mb-3"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              {t('sectoresEyebrow')}
            </span>
            <h2
              className="font-(family-name:--font-lora) font-medium text-white"
              style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', letterSpacing: '-0.02em' }}
            >
              {t('sectoresTitulo')}{' '}
              <em className="italic" style={{ color: 'rgba(255,255,255,0.88)' }}>{t('sectoresTituloEm')}</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {[
              {
                label: tc('nautica'),
                tag: t('secNauticaTag'),
                desc: t('secNauticaDesc'),
                img: '/assets/categorias/foto-productos-barco.jpg',
                href: '/tienda/nautico',
              },
              {
                label: tc('caravaning'),
                tag: t('secCaravaningTag'),
                desc: t('secCaravaningDesc'),
                img: '/assets/categorias/foto-caravanas.jpg',
                href: '/tienda/caravaning',
              },
              {
                label: tc('industrial'),
                tag: t('secIndustrialTag'),
                desc: t('secIndustrialDesc'),
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
                    {t('verProductos')} <ArrowRight size={13} strokeWidth={2.2} />
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
          {t('partnersConfiado')}
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
            {t('ctaTitulo')}{' '}
            <em className="italic text-[var(--blue-deep)]">{t('ctaTituloEm')}</em>
          </h2>
          <p className="text-[16px] text-[var(--ink-500)] leading-[1.75] mb-8">
            {t('ctaTexto')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/contacto"
              className="bg-[var(--blue)] text-white font-semibold px-[30px] py-[15px] rounded-[10px] text-[14px] inline-flex items-center gap-2.5 hover:-translate-y-0.5 transition-all no-underline"
            >
              {t('contactar')} <ArrowRight size={15} strokeWidth={2.2} />
            </Link>
            <Link
              href="/tienda"
              className="bg-white text-[var(--ink)] font-semibold px-[30px] py-[15px] rounded-[10px] text-[14px] inline-flex items-center gap-2.5 hover:-translate-y-0.5 transition-all no-underline"
              style={{ border: '1.5px solid var(--line)' }}
            >
              {t('verCatalogo')}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
