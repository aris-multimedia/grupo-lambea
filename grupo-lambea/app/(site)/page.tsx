import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Anchor, ArrowRight, Phone, Truck, FlaskConical, Headphones, ShieldCheck, PhoneCall, RotateCcw, Star } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { getFeatured, getTopReviews, getReviewStats } from '@/lib/products'
import { getSettings } from '@/lib/settings'
import { getPageSeo } from '@/lib/seo'
import { phoneDigits } from '@/lib/settings-schema'
import { ProductCard } from '@/components/ProductCard'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getPageSeo('home')
  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: { type: 'website', siteName: 'Grupo Lambea', locale: 'es_ES', url: '/', title, description },
  }
}

export default async function HomePage() {
  const featured = (await getFeatured()).slice(0, 4)
  const { empresa, envio, promo, contacto } = await getSettings()
  const promoPct = Number(promo.valor) || 0
  // Marca corta de la promo activa para los distintivos decorativos de la home.
  const promoMark = promo.tipo === 'descuento' ? `−${promoPct}%` : '3×2'
  const topReviews = await getTopReviews(3)
  const reviewStats = await getReviewStats()
  const t = await getTranslations('home')
  const tc = await getTranslations('common')
  const tcat = await getTranslations('cats')
  const hero = featured[0]
  const aplLabelMap: Record<string, string> = { nautico: 'Náutica', caravaning: 'Caravaning', industrial: 'Industrial' }
  const heroApl = hero ? (aplLabelMap[hero.aplicaciones[0]] ?? hero.aplicaciones[0]) : 'Náutica'

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[460px] md:min-h-[580px] overflow-hidden flex items-center bg-[var(--blue-deep)]">
        {/* BG image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/categorias/foto-productos-barco.jpg"
            alt="Marina náutica Grupo Lambea"
            fill
            className="object-cover opacity-55"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(95deg, rgba(14,87,132,0.92) 0%, rgba(14,87,132,0.55) 60%, rgba(14,87,132,0.2) 100%), radial-gradient(ellipse at top right, rgba(79,181,232,0.35), transparent 60%)',
            }}
          />
        </div>

        {/* Decorative shapes */}
        <div
          className="absolute pointer-events-none z-10"
          style={{
            top: -100, right: -100, width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          className="absolute pointer-events-none z-10"
          style={{
            bottom: -150, left: '30%', width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(79,181,232,0.18), transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Content grid */}
        <div
          className="max-w-[1320px] mx-auto px-4 md:px-8 py-12 md:py-20 w-full relative z-20 text-white grid gap-8 md:gap-[60px] grid-cols-1 lg:grid-cols-[1.4fr_1fr]"
          style={{ alignItems: 'center' }}
        >
          {/* Left: copy */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <Anchor size={13} className="text-[#B3DEF2]" strokeWidth={1.8} />
              <span className="text-[12px] uppercase tracking-[0.22em] font-semibold text-[#B3DEF2]">
                {t('heroEyebrow')} {empresa.anio_fundacion}
              </span>
            </div>

            <h1
              className="font-(family-name:--font-lora) font-medium text-white mb-[22px]"
              style={{ fontSize: 'clamp(38px, 5vw, 60px)', lineHeight: 1.1, letterSpacing: '-0.025em' }}
            >
              {t('heroH1')}{' '}
              <em style={{ fontStyle: 'italic', color: '#B3DEF2', fontWeight: 400 }}>{t('heroH1Em')}</em>
            </h1>

            <p className="text-[17px] leading-[1.65] text-white/88 max-w-[560px] mb-8">
              {t('heroSub')}
            </p>

            <div className="flex gap-3.5 flex-wrap">
              <Link
                href="/tienda"
                className="bg-white text-[var(--blue-deep)] font-semibold px-[30px] py-[15px] rounded-[10px] text-[14px] inline-flex items-center gap-2.5 hover:-translate-y-0.5 transition-all no-underline"
                style={{ transition: 'all 0.2s' }}
              >
                {t('verCatalogo')} <ArrowRight size={16} strokeWidth={2.2} />
              </Link>
              <a
                href={`tel:+${phoneDigits(contacto.telefono)}`}
                className="inline-flex items-center gap-2.5 font-medium text-[14px] px-[26px] py-[15px] rounded-[10px] text-white no-underline backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.4)', transition: 'all 0.2s' }}
              >
                <Phone size={16} /> {contacto.telefono}
              </a>
            </div>
          </div>

          {/* Right: floating product card — clicable, lleva a la ficha del destacado */}
          <Link
            href={hero?.slug ? `/tienda/${hero.slug}` : '/tienda'}
            aria-label={`Ver ${hero?.familia ?? 'producto destacado'}`}
            className="group block no-underline bg-white/97 rounded-[var(--r-lg)] p-6 text-[var(--ink)] relative transition-transform duration-300 hover:-translate-y-1"
            style={{
              backdropFilter: 'blur(20px)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* Distintivo de promo activa (3×2 / −X%); oculto si la promo no descuenta o está apagada */}
            {promo.activa && promo.tipo !== 'envio_gratis' && (
              <div
                className="absolute flex flex-col items-center justify-center font-bold text-[var(--ink)] z-10"
                style={{
                  top: -16, right: -16, width: 64, height: 64,
                  background: 'var(--warning)', borderRadius: '50%',
                  boxShadow: '0 8px 20px rgba(232,169,60,0.4)',
                }}
              >
                <span className="font-(family-name:--font-lora) text-[20px] leading-none">{promoMark}</span>
                <span className="text-[9px] uppercase tracking-[0.08em] mt-0.5">Promo</span>
              </div>
            )}

            {/* Product image */}
            <div
              className="relative aspect-square rounded-[var(--r-md)] flex items-center justify-center overflow-hidden mb-[18px]"
              style={{ background: 'linear-gradient(135deg, #F7F9FB 0%, #EAF4FB 100%)' }}
            >
              <div className="relative w-[78%] h-full">
                <Image
                  src={hero?.imagen ?? '/assets/productos/desoxilam.jpg'}
                  alt={hero?.familia ?? 'Producto destacado Grupo Lambea'}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="text-[10.5px] uppercase tracking-[0.16em] text-[var(--blue)] font-bold mb-2">
              {heroApl} · {tc('masVendido')}
            </div>
            <h3 className="font-(family-name:--font-lora) text-[20px] text-[var(--ink)] leading-tight mb-1.5 font-medium">
              {hero?.familia ?? 'DESOXILAM'}
            </h3>
            <p className="text-[13px] text-[var(--ink-500)] leading-relaxed mb-3.5 line-clamp-2">
              {hero?.descripcion_corta ?? 'Desoxidante enérgico concentrado con efecto pasivante'}
            </p>

            <div
              className="flex items-center justify-between pt-3.5"
              style={{ borderTop: '1px solid var(--line)' }}
            >
              <div>
                <span className="text-[10.5px] text-[var(--ink-500)] mr-1">{tc('desde')}</span>
                <span className="font-(family-name:--font-lora) text-[22px] text-[var(--ink)] font-semibold">
                  {hero?.precio_desde != null ? `${hero.precio_desde.toFixed(2).replace('.', ',')} €` : tc('consultar')}
                </span>
              </div>
              {hero?.valoracion ? (
                <span className="text-[var(--warning)] text-[13px] tracking-wider">
                  {'★'.repeat(Math.round(hero.valoracion))}{'☆'.repeat(5 - Math.round(hero.valoracion))}
                </span>
              ) : null}
            </div>
          </Link>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────── */}
      <div className="bg-[var(--bg-soft)] py-8">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-7">
          {[
            { Icon: ShieldCheck, title: t('trustSeguraTitulo'), sub: t('trustSeguraSub') },
            { Icon: Truck, title: envio.texto_peninsula, sub: `${t('trustBaleares')} ${envio.coste_baleares}` },
            { Icon: PhoneCall, title: t('trustAtencionTitulo'), sub: t('trustAtencionSub') },
            { Icon: RotateCcw, title: t('trustDevolucionTitulo'), sub: t('trustDevolucionSub') },
          ].map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 flex items-center justify-center bg-white rounded-full text-[var(--blue)] flex-shrink-0"
                style={{ boxShadow: '0 4px 12px rgba(14,87,132,0.08)' }}
              >
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <div>
                <strong className="block text-[var(--ink)] font-bold text-[13.5px] mb-0.5">{title}</strong>
                <span className="text-[var(--ink-500)] text-[12px]">{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORÍAS ──────────────────────────────────────────── */}
      <section className="py-14 md:py-[100px]">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <span className="block text-[11px] uppercase tracking-[0.22em] text-[var(--blue)] font-semibold mb-3">
              {t('catsEyebrow')}
            </span>
            <h2
              className="font-(family-name:--font-lora) text-[var(--ink)] font-medium mb-4"
              style={{ fontSize: 'clamp(30px, 4vw, 42px)', letterSpacing: '-0.02em' }}
            >
              {t('catsTitulo')} <em className="italic text-[var(--blue-deep)]">{t('catsTituloEm')}</em>
            </h2>
            <p className="text-[15px] text-[var(--ink-500)] leading-relaxed max-w-lg mx-auto">
              {t('catsSub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7">
            {[
              { tkey: 'nautica',    name: t('catNauticaNombre'),    desc: t('catNauticaDesc'),    img: '/assets/categorias/foto-productos-barco.jpg', href: '/tienda/nautico' },
              { tkey: 'caravaning', name: t('catCaravaningNombre'), desc: t('catCaravaningDesc'), img: '/assets/categorias/foto-caravanas.jpg',      href: '/tienda/caravaning' },
              { tkey: 'industrial', name: t('catIndustrialNombre'), desc: t('catIndustrialDesc'), img: '/assets/categorias/foto-industrial.jpg',     href: '/tienda/industrial' },
            ].map(({ tkey, name, desc, img, href }) => (
              <Link
                key={tkey}
                href={href}
                className="group rounded-[var(--r-lg)] overflow-hidden bg-white no-underline text-inherit block transition-transform duration-300 hover:-translate-y-1.5"
              >
                {/* Image */}
                <div className="relative overflow-hidden rounded-[var(--r-lg)] mb-[18px]" style={{ aspectRatio: '5/4' }}>
                  <Image
                    src={img}
                    alt={`${tcat(tkey)} — Grupo Lambea`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                {/* Body */}
                <div className="px-1.5">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--blue)] font-semibold mb-2 block">
                    {tcat(tkey)}
                  </span>
                  <h3
                    className="font-(family-name:--font-lora) font-medium text-[var(--ink)] mb-2.5 leading-tight"
                    style={{ fontSize: 26, letterSpacing: '-0.015em' }}
                  >
                    {name}
                  </h3>
                  <p className="text-[14.5px] text-[var(--ink-500)] leading-relaxed mb-4">{desc}</p>
                  <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[var(--blue)] transition-all group-hover:gap-3">
                    {t('verProductos')} <ArrowRight size={14} strokeWidth={2.2} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTOS DESTACADOS ─────────────────────────────────── */}
      <section className="py-14 md:py-[100px] bg-[var(--bg-soft)]">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12 gap-15">
            <div>
              <span className="block text-[11px] uppercase tracking-[0.22em] text-[var(--blue)] font-semibold mb-2">
                {t('destacadosEyebrow')}
              </span>
              <h2
                className="font-(family-name:--font-lora) text-[var(--ink)] font-medium"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', letterSpacing: '-0.02em' }}
              >
                {t('destacadosTitulo')} <em className="italic text-[var(--blue-deep)]">{t('destacadosTituloEm')}</em>
              </h2>
            </div>
            <Link
              href="/tienda"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--blue)] no-underline px-5 py-2.5 bg-white rounded-[10px] hover:-translate-y-px hover:gap-3 transition-all"
              style={{ boxShadow: '0 2px 8px rgba(14,87,132,0.08)' }}
            >
              {t('verTodo')} <ArrowRight size={14} strokeWidth={2.2} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p, i) => (
              <ProductCard key={p.slug} product={p} priority={i < 2} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ANTES / DESPUÉS ─────────────────────────────────────── */}
      <section className="py-[100px] bg-white">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <span className="block text-[11px] uppercase tracking-[0.22em] text-[var(--blue)] font-semibold mb-3">
              {t('antesEyebrow')}
            </span>
            <h2
              className="font-(family-name:--font-lora) text-[var(--ink)] font-medium mb-4"
              style={{ fontSize: 'clamp(30px, 4vw, 42px)', letterSpacing: '-0.02em' }}
            >
              {t('antesTitulo')}{' '}
              <em className="italic text-[var(--blue-deep)]">{t('antesTituloEm')}</em>
            </h2>
            <p className="text-[15px] text-[var(--ink-500)] leading-relaxed max-w-lg mx-auto">
              {t('antesSub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                slug: 'desoxilam-nautico',
                name: 'Desoxilam',
                tag: 'Náutico · Desoxidante',
                href: '/tienda/desoxilam-nautico',
              },
              {
                slug: 'fibralam-nautico',
                name: 'Fibralam',
                tag: 'Náutico · Limpieza de casco',
                href: '/tienda/fibralam-nautico',
              },
              {
                slug: 'motorlam-nautico',
                name: 'Motorlam',
                tag: 'Náutico · Desengrasante',
                href: '/tienda/motorlam-nautico',
              },
            ].map(({ slug, name, tag, href }) => (
              <div key={slug} className="flex flex-col gap-4">
                <BeforeAfterSlider
                  beforeSrc={`/assets/before-after/before/${slug}.png`}
                  afterSrc={`/assets/before-after/after/${slug}.png`}
                  alt={name}
                  className="w-full aspect-4/3 rounded-[var(--r-lg)]"
                />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--blue)] font-semibold mb-0.5">
                      {tag}
                    </div>
                    <div
                      className="font-(family-name:--font-lora) text-[var(--ink)] font-medium"
                      style={{ fontSize: 18 }}
                    >
                      {name}
                    </div>
                  </div>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--blue)] no-underline hover:gap-2.5 transition-all"
                  >
                    {t('verProducto')} <ArrowRight size={13} strokeWidth={2.2} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HERITAGE ─────────────────────────────────────────────── */}
      <section className="py-14 md:py-[100px] bg-[var(--bg-soft)]">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8 grid gap-12 md:gap-20 items-center grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
          {/* Stacked images — desktop only */}
          <div className="relative hidden lg:block" style={{ aspectRatio: '5/6' }}>
            {/* Main image */}
            <div
              className="absolute top-0 left-0 rounded-[var(--r-lg)] overflow-hidden"
              style={{ width: '78%', height: '78%', boxShadow: '0 24px 50px rgba(14,87,132,0.18)' }}
            >
              <Image
                src="/assets/hero/foto-hero-autolam1.webp"
                alt="Grupo Lambea — productos náuticos"
                fill
                className="object-cover"
              />
            </div>
            {/* Second image */}
            <div
              className="absolute bottom-0 right-0 rounded-[var(--r-lg)] overflow-hidden"
              style={{
                width: '56%', height: '48%',
                boxShadow: '0 16px 40px rgba(14,87,132,0.15)',
                border: '6px solid #fff',
              }}
            >
              <Image
                src="/assets/empresa/foto-empresa-mesa.jpg"
                alt="Grupo Lambea — laboratorio de fórmulas"
                fill
                className="object-cover"
              />
            </div>
            {/* Badge */}
            <div
              className="absolute z-10 text-white text-center rounded-[var(--r-md)] px-[22px] py-[18px]"
              style={{
                top: '28%', right: '8%',
                background: 'var(--blue)',
                boxShadow: '0 12px 30px rgba(30,146,216,0.4)',
                transform: 'rotate(4deg)',
              }}
            >
              <div className="font-(family-name:--font-lora) text-[32px] font-semibold leading-none">+70</div>
              <div className="text-[10px] uppercase tracking-[0.18em] mt-1 font-semibold opacity-90">
                {t('anosOficio')}
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <span className="block text-[11px] uppercase tracking-[0.22em] text-[var(--blue)] font-semibold mb-4">
              {t('heritageEyebrow')}
            </span>
            <h2
              className="font-(family-name:--font-lora) text-[var(--ink)] font-medium mb-6"
              style={{ fontSize: 'clamp(34px, 4.2vw, 46px)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
            >
              {t('heritageTitulo')} <em className="italic text-[var(--blue-deep)]">{t('heritageTituloEm')}</em>
            </h2>
            <p className="text-[16px] text-[var(--ink-700)] leading-[1.8] mb-4">
              {t('heritageP1', { anio: empresa.anio_fundacion })}
            </p>
            <p className="text-[16px] text-[var(--ink-700)] leading-[1.8] mb-6">
              {t('heritageP2')}
            </p>

            {/* Quote */}
            <blockquote
              className="font-(family-name:--font-lora) italic text-[18px] leading-[1.55] text-[var(--blue-deep)] px-[38px] py-[22px] bg-[var(--bg-soft)] rounded-[var(--r-md)] mb-7 relative"
            >
              <span
                className="absolute top-[-2px] left-3.5 text-[var(--blue)] leading-none opacity-35 font-serif text-[64px]"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              {t('heritageQuote')}
              <span className="block not-italic text-[12.5px] text-[var(--ink-500)] mt-3 font-medium tracking-[0.04em]">
                {t('heritageAutor')}
              </span>
            </blockquote>

            {/* Pillars */}
            <div
              className="grid grid-cols-3 gap-[18px] mt-7 pt-7"
              style={{ borderTop: '1px solid var(--line)' }}
            >
              {[
                { num: '+70', label: t('pilarOficio') },
                { num: '3', label: t('pilarGeneraciones') },
                { num: '3', label: t('pilarSectores') },
              ].map(({ num, label }) => (
                <div key={num + label} className="flex flex-col gap-1.5">
                  <div className="font-(family-name:--font-lora) text-[28px] text-[var(--blue)] font-semibold leading-none">
                    {num}
                  </div>
                  <div className="text-[12px] text-[var(--ink-700)] leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VENTAJAS STRIP ──────────────────────────────────────── */}
      <section
        className="py-14 relative"
        style={{ background: 'var(--blue-deep)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(79,181,232,0.07) 0%, transparent 60%)' }}
        />
        <div className="max-w-[1320px] mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {[
            {
              content: (
                <span
                  className="font-(family-name:--font-lora) font-semibold leading-none flex-shrink-0 mt-[-4px]"
                  style={{ fontSize: promo.tipo === 'descuento' ? 38 : 48, color: '#B3DEF2', letterSpacing: '-0.03em' }}
                >
                  {promoMark}
                </span>
              ),
              title: promo.titulo || 'Promoción activa',
              sub: `${promo.descripcion || ''}. Se aplica automáticamente en el carrito.`,
            },
            {
              icon: <Truck size={30} strokeWidth={1.4} />,
              title: t('ventajasEnvioTitulo'),
              sub: `${envio.texto_peninsula}. ${envio.entrega_estimada}.`,
            },
            {
              icon: <FlaskConical size={30} strokeWidth={1.4} />,
              title: t('ventajasFormulaTitulo'),
              sub: `Reg. Tox. ${empresa.registro_toxicologico}.`,
            },
            {
              icon: <Headphones size={30} strokeWidth={1.4} />,
              title: t('ventajasAsesoramientoTitulo'),
              sub: t('ventajasAsesoramientoSub'),
            },
          ].map(({ content, icon, title, sub }, i) => (
            <div
              key={title}
              className="flex items-start gap-5 px-9"
              style={{
                paddingLeft: i === 0 ? 0 : undefined,
                paddingRight: i === 3 ? 0 : undefined,
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}
            >
              {content ?? (
                <div className="flex-shrink-0 mt-0.5" style={{ color: '#4FB5E8' }}>
                  {icon}
                </div>
              )}
              <div>
                <strong className="block text-white text-[15px] font-semibold mb-1.5">{title}</strong>
                <span className="text-[13px] leading-[1.55] block" style={{ color: 'rgba(255,255,255,0.58)' }}>
                  {sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIOS ─────────────────────────────────────────── */}
      <section className="py-[100px] bg-white">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="text-center mb-14">
            <span className="block text-[11px] uppercase tracking-[0.22em] text-[var(--blue)] font-semibold mb-3">
              {t('valoracionesEyebrow')}
            </span>
            <h2
              className="font-(family-name:--font-lora) text-[var(--ink)] font-medium mb-3"
              style={{ fontSize: 'clamp(30px, 4vw, 42px)', letterSpacing: '-0.02em' }}
            >
              {t('valoracionesTitulo')}{' '}
              <em className="italic text-[var(--blue-deep)]">{t('valoracionesTituloEm')}</em>
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    fill={s <= Math.round(reviewStats.avg) ? '#E8A93C' : 'transparent'}
                    stroke={s <= Math.round(reviewStats.avg) ? '#E8A93C' : '#d1d5db'}
                  />
                ))}
              </div>
              <span className="font-semibold text-[var(--ink)] text-[15px]">{reviewStats.avg.toFixed(1)}</span>
              <span className="text-[var(--ink-500)] text-[13px]">· {reviewStats.count} {t('valoracionesReales')}</span>
            </div>
          </div>

          {/* Testimonial grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {topReviews.map((t) => (
              <div key={t.slug + t.author} className="flex flex-col">
                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={15}
                      fill={s <= t.rating ? '#E8A93C' : 'transparent'}
                      stroke={s <= t.rating ? '#E8A93C' : '#d1d5db'}
                    />
                  ))}
                </div>
                {/* Quote */}
                <p
                  className="font-(family-name:--font-lora) text-[var(--ink)] leading-[1.65] flex-1 mb-6"
                  style={{ fontSize: 17, fontStyle: 'italic' }}
                >
                  &ldquo;{t.texto}&rdquo;
                </p>
                {/* Author */}
                <div
                  className="flex items-center gap-3 pt-5"
                  style={{ borderTop: '1px solid var(--line)' }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-[13px] shrink-0"
                    style={{ background: 'var(--blue-soft)', color: 'var(--blue)' }}
                  >
                    {t.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--ink)] text-[13.5px]">{t.author}</div>
                    <div className="text-[11.5px] text-[var(--ink-500)]">
                      {aplLabelMap[t.aplicacion] ?? t.aplicacion} · {t.familia}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS ─────────────────────────────────────────────── */}
      <section className="py-16 bg-[var(--bg-soft)]">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8">
          <div className="text-center text-[11px] uppercase tracking-[0.22em] text-[var(--ink-500)] font-semibold mb-10">
            {t('partners')}
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
            {[
              { src: '/assets/empresa/empresa1.png', alt: 'Logo de empresa cliente de Grupo Lambea' },
              { src: '/assets/empresa/empresa2.png', alt: 'Logo de empresa cliente de Grupo Lambea' },
              { src: '/assets/empresa/empresa3.png', alt: 'Logo de empresa cliente de Grupo Lambea' },
              { src: '/assets/empresa/empresa4.png', alt: 'Logo de empresa cliente de Grupo Lambea' },
              { src: '/assets/empresa/empresa5.png', alt: 'Logo de empresa cliente de Grupo Lambea' },
            ].map(({ src, alt }, i) => (
              <div
                key={i}
                className="flex items-center justify-center h-28 bg-white rounded-[var(--r-md)] px-6 py-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(14,87,132,0.10)] grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                style={{ boxShadow: '0 2px 8px rgba(14,87,132,0.06)' }}
              >
                <Image
                  src={src}
                  alt={alt}
                  width={200}
                  height={80}
                  className="object-contain max-h-[56px] w-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
