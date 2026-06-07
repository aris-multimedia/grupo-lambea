'use client'

import { useState } from 'react'
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
  const tabs = [
    'Descripción',
    'Ficha técnica',
    'Modo de uso',
    'Envíos y devoluciones',
  ]
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
                  Sobre{' '}
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
              Especificaciones <em className="italic text-[var(--blue-deep)]">técnicas</em>
            </h3>

            {product.ficha_tecnica_url && (
              <div
                className="flex items-center gap-3 py-4 mb-5"
                style={{ borderBottom: '1px solid var(--line)' }}
              >
                <FlaskConical size={16} className="text-[var(--blue)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[13.5px] font-semibold text-[var(--ink)] block">Ficha técnica completa</span>
                  <span className="text-[12px] text-[var(--ink-500)]">Especificaciones, seguridad y certificaciones</span>
                </div>
                <a
                  href={product.ficha_tecnica_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[var(--blue)] no-underline font-semibold text-[13px] hover:underline shrink-0"
                >
                  <Download size={14} />
                  Descargar
                </a>
              </div>
            )}

            {/* Full specs table */}
            <div className="rounded-[var(--r-lg)] overflow-hidden border border-[var(--line)]">
              {(
                [
                  ['Familia / Referencia', product.familia],
                  product.aplicaciones?.length > 0
                    ? ['Sector de aplicación', product.aplicaciones.map(a => APLICACION_LABEL[a] ?? a).join(' · ')]
                    : null,
                  (product.formatos?.length ?? 0) > 0
                    ? ['Formatos disponibles', product.formatos!.join(' · ')]
                    : null,
                  product.codigo_toxicologia
                    ? ['Registro toxicológico', product.codigo_toxicologia]
                    : null,
                  product.precio_desde != null
                    ? ['Precio mínimo (IVA inc.)', `${product.precio_desde.toFixed(2).replace('.', ',')} €`]
                    : null,
                  product.precio_hasta
                    ? ['Precio máximo (IVA inc.)', `${product.precio_hasta.toFixed(2).replace('.', ',')} €`]
                    : null,
                  ['País de fabricación', 'España'],
                  ['Empresa formuladora', settings.empresa.razon_social],
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
                <h4 className="text-[15px] font-semibold text-[var(--ink)] mb-4">Características del producto</h4>
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
              Modo de <em className="italic text-[var(--blue-deep)]">uso</em>
            </h3>

            {product.instrucciones_uso ? (
              <>
                <p className="text-[15.5px] text-[var(--ink-700)] leading-[1.85] mb-8">
                  {product.instrucciones_uso}
                </p>

                <div className="space-y-5">
                  {[
                    { icon: <Package size={17} />, title: 'Preparación', text: 'Asegúrate de que la superficie esté seca y libre de polvo antes de aplicar.' },
                    { icon: <CheckCircle2 size={17} />, title: 'Aplicación', text: product.instrucciones_uso.split('.')[0] + '.' },
                    { icon: <Clock size={17} />, title: 'Tiempo de actuación', text: 'Respeta el tiempo indicado en las instrucciones para obtener el mejor resultado.' },
                    { icon: <ShieldCheck size={17} />, title: 'Seguridad', text: 'Usar con guantes y en zonas ventiladas. Mantener fuera del alcance de niños.' },
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
                Consulta con nuestro equipo para obtener información detallada sobre el modo de aplicación de este producto.
                <div className="mt-4">
                  <a
                    href="tel:637916345"
                    className="inline-flex items-center gap-2 bg-[var(--blue)] text-white no-underline font-semibold text-[14px] px-6 py-2.5 rounded-[10px] hover:bg-[var(--blue-dark)] transition-colors"
                  >
                    Llamar para consultar
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
                  Aplicaciones principales
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
              Envíos y <em className="italic text-[var(--blue-deep)]">devoluciones</em>
            </h3>

            {/* Shipping zones — clean list with dividers */}
            <div className="mb-8">
              {[
                {
                  icon: <Truck size={18} />,
                  title: 'Península',
                  badge: 'Envío gratis',
                  lines: [
                    'Envío gratuito en todos los pedidos.',
                    'Entrega estimada: 2–4 días laborables.',
                    'Transportista: SEUR / MRW.',
                  ],
                },
                {
                  icon: <MapPin size={18} />,
                  title: 'Baleares',
                  badge: costeBaleares,
                  lines: [
                    `Tarifa única de ${costeBaleares} para envíos a Baleares.`,
                    'Entrega estimada: 3–5 días laborables.',
                  ],
                },
                {
                  icon: <MapPin size={18} />,
                  title: 'Canarias, Ceuta y Melilla',
                  badge: 'Consultar',
                  lines: [
                    'Para envíos a estas zonas, contacta con nosotros.',
                    'Gastos de aduanas no incluidos.',
                  ],
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
                <h4 className="font-semibold text-[var(--ink)] text-[14px]">Política de devoluciones</h4>
              </div>
              <ul className="space-y-3">
                {[
                  'Devoluciones aceptadas dentro de los 14 días desde la recepción.',
                  'El producto debe estar en perfecto estado, sin abrir y en su embalaje original.',
                  'Los gastos de devolución corren a cargo del comprador salvo defecto de fábrica.',
                  'Reembolso tramitado en un plazo máximo de 7 días hábiles.',
                  'Productos dañados en el transporte: comunicar en 24 h con fotografías.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13.5px] text-[var(--ink-700)]">
                    <Check size={14} className="text-[var(--blue)] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
                <p className="text-[13px] text-[var(--ink-500)]">
                  Para iniciar una devolución o reclamación contacta con nosotros en{' '}
                  <a href={`mailto:${soporteEmail}`} className="text-[var(--blue)] hover:underline">
                    {soporteEmail}
                  </a>{' '}
                  o llama al{' '}
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
  const rows = (
    [
      ['Familia', product.familia],
      product.aplicaciones?.length > 0
        ? ['Sector', product.aplicaciones.map(a => APLICACION_LABEL[a] ?? a).join(', ')]
        : null,
      !compact && (product.formatos?.length ?? 0) > 0
        ? ['Formatos', product.formatos!.join(', ')]
        : null,
      product.codigo_toxicologia
        ? ['Reg. toxicológico', product.codigo_toxicologia]
        : null,
      product.precio_desde != null
        ? ['Precio desde', `${product.precio_desde.toFixed(2).replace('.', ',')} €`]
        : null,
      product.precio_hasta
        ? ['Precio hasta', `${product.precio_hasta.toFixed(2).replace('.', ',')} €`]
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
        Especificaciones
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
            Producto con registro toxicológico. Urgencias:{' '}
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
