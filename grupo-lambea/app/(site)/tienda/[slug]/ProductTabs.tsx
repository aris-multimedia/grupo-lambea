'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  FlaskConical, AlertTriangle, Download, Truck, RotateCcw,
  MapPin, CheckCircle2, Clock, Package, ShieldCheck, Check,
} from 'lucide-react'
import { phoneDigits, type SiteSettings } from '@/lib/settings-schema'

interface TabProduct {
  familia: string
  aplicaciones: string[]
  formatos: string[] | null
  codigo_toxicologia: string | null
  precio_desde: number | null
  precio_hasta: number | null
  descripcion_larga: string | null
  instrucciones_uso: string | null
  usos: string[] | null
  caracteristicas: string[] | null
  valoracion: number | null
  num_valoraciones: number | null
  ficha_tecnica_url: string | null
}

const APLICACION_LABEL: Record<string, string> = {
  nautico: 'Náutico', caravaning: 'Caravaning', industrial: 'Industrial',
}

export function ProductTabs({ product, settings }: { product: TabProduct; settings: SiteSettings }) {
  const t = useTranslations('producto')
  const tabs = [t('tabDescripcion'), t('tabFicha'), t('tabModoUso'), t('tabEnvios')]
  const [active, setActive] = useState(0)

  const soporteEmail = settings?.contacto.email ?? 'francisco@grupolambea.com'
  const soporteTel = settings?.contacto.telefono ?? '637 916 345'
  const costeBaleares = settings?.envio.coste_baleares ?? '4 €'

  return (
    <section className="max-w-[1320px] mx-auto px-4 md:px-8 mt-12 md:mt-[60px]" id="descripcion">
      {/* Tab bar */}
      <div
        className="flex overflow-x-auto"
        style={{ borderBottom: '1px solid var(--line)', marginBottom: 36 }}
      >
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActive(i)}
            className="font-semibold text-[14px] py-[18px] mr-[38px] shrink-0 transition-all"
            style={{
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${active === i ? 'var(--blue)' : 'transparent'}`,
              color: active === i ? 'var(--blue)' : 'var(--ink-500)',
              marginBottom: -1,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── TAB 0: Descripción ─────────────────────────────── */}
      {active === 0 && (
        <div className="grid gap-10 md:gap-[60px] mb-[60px] grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
          <div>
            {product.descripcion_larga ? (
              <>
                <h3
                  className="font-(family-name:--font-lora) text-[var(--ink)] font-medium mb-[18px]"
                  style={{ fontSize: 26, letterSpacing: '-0.015em' }}
                >
                  {t('sobre')}{' '}
                  <em className="italic text-[var(--blue-deep)]">{product.familia}</em>
                </h3>
                {product.descripcion_larga.split(/\n+/).map((par) => par.trim()).filter(Boolean).map((par, i) => (
                  <p key={i} className="text-[15.5px] text-[var(--ink-700)] leading-[1.78] mb-4">
                    {par}
                  </p>
                ))}
              </>
            ) : (
              <h3
                className="font-(family-name:--font-lora) text-[var(--ink)] font-medium mb-[18px]"
                style={{ fontSize: 26, letterSpacing: '-0.015em' }}
              >
                {product.familia}
              </h3>
            )}

            {product.usos && product.usos.length > 0 && (
              <ul className="list-none mt-[18px]">
                {product.usos.map((uso) => (
                  <li
                    key={uso}
                    className="py-2.5 flex items-start gap-2.5 text-[14.5px] text-[var(--ink-700)] leading-[1.55]"
                    style={{ borderBottom: '1px solid rgba(26,31,42,0.04)' }}
                  >
                    <Check size={15} className="text-[var(--blue)] shrink-0 mt-[3px]" />
                    {uso}
                  </li>
                ))}
              </ul>
            )}

            {product.caracteristicas && product.caracteristicas.length > 0 && !product.usos?.length && (
              <ul className="list-none mt-[18px]">
                {product.caracteristicas.map((c) => (
                  <li
                    key={c}
                    className="py-2.5 flex items-start gap-2.5 text-[14.5px] text-[var(--ink-700)] leading-[1.55]"
                    style={{ borderBottom: '1px solid rgba(26,31,42,0.04)' }}
                  >
                    <Check size={15} className="text-[var(--blue)] shrink-0 mt-[3px]" />
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <SpecsColumn product={product} />
        </div>
      )}

      {/* ── TAB 1: Ficha técnica ────────────────────────────── */}
      {active === 1 && (
        <div className="grid gap-10 md:gap-[60px] mb-[60px] grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h3
              className="font-(family-name:--font-lora) text-[var(--ink)] font-medium mb-6"
              style={{ fontSize: 26, letterSpacing: '-0.015em' }}
            >
              {t('especsTecnicas')}
            </h3>

            {product.ficha_tecnica_url && (
              <div
                className="flex items-center gap-3 py-4 mb-5"
                style={{ borderBottom: '1px solid var(--line)' }}
              >
                <FlaskConical size={16} className="text-[var(--blue)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[13.5px] font-semibold text-[var(--ink)] block">{t('fichaCompleta')}</span>
                  <span className="text-[12px] text-[var(--ink-500)]">{t('fichaCompletaSub')}</span>
                </div>
                <a
                  href={product.ficha_tecnica_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[var(--blue)] no-underline font-semibold text-[13px] hover:underline shrink-0"
                >
                  <Download size={14} />
                  {t('descargar')}
                </a>
              </div>
            )}

            {/* Full specs table */}
            <div className="rounded-[var(--r-lg)] overflow-hidden border border-[var(--line)]">
              {(
                [
                  [t('specFamiliaRef'), product.familia],
                  product.aplicaciones?.length > 0
                    ? [t('specSector'), product.aplicaciones.map(a => APLICACION_LABEL[a] ?? a).join(' · ')]
                    : null,
                  (product.formatos?.length ?? 0) > 0
                    ? [t('specFormatos'), product.formatos!.join(' · ')]
                    : null,
                  product.codigo_toxicologia
                    ? [t('specRegTox'), product.codigo_toxicologia]
                    : null,
                  product.precio_desde != null
                    ? [t('specPrecioMin'), `${product.precio_desde.toFixed(2).replace('.', ',')} €`]
                    : null,
                  product.precio_hasta
                    ? [t('specPrecioMax'), `${product.precio_hasta.toFixed(2).replace('.', ',')} €`]
                    : null,
                  [t('specPais'), t('espana')],
                  [t('specEmpresa'), settings.empresa.razon_social],
                ] as ([string, string] | null)[]
              )
                .filter((row): row is [string, string] => row !== null)
                .map(([key, val], idx) => (
                  <div
                    key={key}
                    className="flex justify-between px-5 py-[13px] text-[13.5px]"
                    style={{
                      borderBottom: '1px solid var(--line)',
                      background: idx % 2 === 0 ? 'var(--bg-soft)' : '#fff',
                    }}
                  >
                    <span className="text-[var(--ink-500)] font-medium">{key}</span>
                    <span className="font-semibold text-[var(--ink)] text-right max-w-[55%]">{val}</span>
                  </div>
                ))}
            </div>

            {product.caracteristicas && product.caracteristicas.length > 0 && (
              <div className="mt-8">
                <h4 className="text-[15px] font-semibold text-[var(--ink)] mb-4">{t('caracteristicas')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.caracteristicas.map((c) => (
                    <div key={c} className="flex items-start gap-2.5 text-[14px] text-[var(--ink-700)]">
                      <CheckCircle2 size={16} className="text-[var(--blue)] shrink-0 mt-0.5" />
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <SpecsColumn product={product} />
        </div>
      )}

      {/* ── TAB 2: Modo de uso ──────────────────────────────── */}
      {active === 2 && (
        <div className="grid gap-10 md:gap-[60px] mb-[60px] grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h3
              className="font-(family-name:--font-lora) text-[var(--ink)] font-medium mb-6"
              style={{ fontSize: 26, letterSpacing: '-0.015em' }}
            >
              {t('modoUso')}
            </h3>

            {product.instrucciones_uso ? (
              <>
                <p className="text-[15.5px] text-[var(--ink-700)] leading-[1.85] mb-8">
                  {product.instrucciones_uso}
                </p>

                <div className="space-y-5">
                  {[
                    { icon: <Package size={17} />, title: t('pasoPreparacionT'), text: t('pasoPreparacion') },
                    { icon: <CheckCircle2 size={17} />, title: t('pasoAplicacionT'), text: product.instrucciones_uso.split('.')[0] + '.' },
                    { icon: <Clock size={17} />, title: t('pasoTiempoT'), text: t('pasoTiempo') },
                    { icon: <ShieldCheck size={17} />, title: t('pasoSeguridadT'), text: t('pasoSeguridad') },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white mt-0.5"
                        style={{ background: 'var(--blue)' }}
                      >
                        {step.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--ink)] text-[14px] mb-1">{step.title}</div>
                        <div className="text-[13.5px] text-[var(--ink-500)] leading-relaxed">{step.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-[15px] text-[var(--ink-500)] py-10 text-center">
                {t('modoUsoVacio')}
                <div className="mt-4">
                  <a
                    href="tel:637916345"
                    className="inline-flex items-center gap-2 bg-[var(--blue)] text-white no-underline font-semibold text-[14px] px-6 py-2.5 rounded-[10px] hover:bg-[var(--blue-dark)] transition-colors"
                  >
                    {t('llamarConsultar')}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {product.usos && product.usos.length > 0 && (
              <div>
                <h4 className="font-semibold text-[var(--ink)] text-[14px] mb-4 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[var(--blue)]" />
                  {t('aplicacionesPrincipales')}
                </h4>
                <ul className="space-y-2.5">
                  {product.usos.map((uso) => (
                    <li key={uso} className="flex items-start gap-2 text-[13.5px] text-[var(--ink-700)]">
                      <Check size={13} className="text-[var(--blue)] shrink-0 mt-0.5" />
                      {uso}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <SpecsColumn product={product} compact />
          </div>
        </div>
      )}

      {/* ── TAB 3: Envíos y devoluciones ───────────────────── */}
      {active === 3 && (
        <div className="grid gap-10 md:gap-[60px] mb-[60px] grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h3
              className="font-(family-name:--font-lora) text-[var(--ink)] font-medium mb-6"
              style={{ fontSize: 26, letterSpacing: '-0.015em' }}
            >
              {t('tabEnvios')}
            </h3>

            {/* Shipping zones — clean list with dividers */}
            <div className="mb-8">
              {[
                {
                  icon: <Truck size={18} />,
                  title: t('zonaPeninsula'),
                  badge: t('badgeEnvioGratis'),
                  lines: [t('peninsulaL1'), t('peninsulaL2'), t('peninsulaL3')],
                },
                {
                  icon: <MapPin size={18} />,
                  title: t('zonaBaleares'),
                  badge: costeBaleares,
                  lines: [t('balearesL1', { coste: costeBaleares }), t('balearesL2')],
                },
                {
                  icon: <MapPin size={18} />,
                  title: t('zonaCanarias'),
                  badge: t('badgeConsultar'),
                  lines: [t('canariasL1'), t('canariasL2')],
                },
              ].map((zone, i, arr) => (
                <div
                  key={zone.title}
                  className="flex gap-4 py-5"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'var(--blue-soft)', color: 'var(--blue)' }}
                  >
                    {zone.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="font-semibold text-[var(--ink)] text-[14px]">{zone.title}</span>
                      <span className="text-[11.5px] font-semibold text-[var(--blue)] uppercase tracking-[0.06em]">
                        {zone.badge}
                      </span>
                    </div>
                    {zone.lines.map((l) => (
                      <p key={l} className="text-[13.5px] text-[var(--ink-500)] leading-relaxed">{l}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Returns — no box */}
            <div className="pt-6" style={{ borderTop: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2.5 mb-4">
                <RotateCcw size={16} className="text-[var(--ink-500)]" />
                <h4 className="font-semibold text-[var(--ink)] text-[14px]">{t('politicaDevoluciones')}</h4>
              </div>
              <ul className="space-y-3">
                {[t('dev1'), t('dev2'), t('dev3'), t('dev4'), t('dev5')].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13.5px] text-[var(--ink-700)]">
                    <Check size={14} className="text-[var(--blue)] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
                <p className="text-[13px] text-[var(--ink-500)]">
                  {t('devContacto')}{' '}
                  <a href={`mailto:${soporteEmail}`} className="text-[var(--blue)] hover:underline">
                    {soporteEmail}
                  </a>{' '}
                  {t('devContactoO')}{' '}
                  <a href={`tel:+${phoneDigits(soporteTel)}`} className="text-[var(--blue)] hover:underline">
                    {soporteTel}
                  </a>.
                </p>
              </div>
            </div>
          </div>

          <SpecsColumn product={product} />
        </div>
      )}
    </section>
  )
}

/* ── Shared specs column — no outer box ─────────────────── */
function SpecsColumn({ product, compact }: { product: TabProduct; compact?: boolean }) {
  const t = useTranslations('producto')
  const rows = (
    [
      [t('specFamilia'), product.familia],
      product.aplicaciones?.length > 0
        ? [t('specSectorCorto'), product.aplicaciones.map(a => APLICACION_LABEL[a] ?? a).join(', ')]
        : null,
      !compact && (product.formatos?.length ?? 0) > 0
        ? [t('specFormatosCorto'), product.formatos!.join(', ')]
        : null,
      product.codigo_toxicologia
        ? [t('specRegToxCorto'), product.codigo_toxicologia]
        : null,
      product.precio_desde != null
        ? [t('specPrecioDesde'), `${product.precio_desde.toFixed(2).replace('.', ',')} €`]
        : null,
      product.precio_hasta
        ? [t('specPrecioHasta'), `${product.precio_hasta.toFixed(2).replace('.', ',')} €`]
        : null,
    ] as ([string, string] | null)[]
  ).filter((row): row is [string, string] => row !== null)

  return (
    <div>
      <h4
        className="font-(family-name:--font-lora) text-[var(--ink)] font-medium mb-4 flex items-center gap-2"
        style={{ fontSize: 16 }}
      >
        <FlaskConical size={15} className="text-[var(--blue)]" />
        {t('especificaciones')}
      </h4>
      <div>
        {rows.map(([key, val]) => (
          <div
            key={key}
            className="flex justify-between py-3 text-[13.5px]"
            style={{ borderBottom: '1px solid var(--line)' }}
          >
            <span className="text-[var(--ink-500)]">{key}</span>
            <span className="font-semibold text-[var(--ink)] text-right max-w-[55%]">{val}</span>
          </div>
        ))}
      </div>

      {product.codigo_toxicologia && (
        <div className="flex items-start gap-2 pt-4 text-[12px] text-[var(--ink-500)]">
          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
          <span>
            {t('regToxAviso')}{' '}
            <a
              href="tel:915620420"
              className="font-semibold text-[var(--ink)] hover:text-[var(--blue)] transition-colors"
            >
              915 620 420
            </a>
          </span>
        </div>
      )}
    </div>
  )
}
