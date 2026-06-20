'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Lock, ShoppingBag, Tag, Building2, User } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import { subtotal } from '@/lib/cart';
import { promoDiscount, promoDiscountLabel } from '@/lib/promotions';
import { createCheckoutSession } from '@/app/actions/orders';
import { subscribeToNewsletter } from '@/app/actions/newsletter';

export default function CheckoutPage() {
  const { items, promo } = useCart();
  const t = useTranslations('checkout');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipoCliente, setTipoCliente] = useState<'particular' | 'empresa'>('particular');
  const [dirFiscalDistinta, setDirFiscalDistinta] = useState(false);
  const [quieroFactura, setQuieroFactura] = useState(false);

  const sub = subtotal(items);
  const disc = promoDiscount(items, promo);
  const tot = sub - disc;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-6">
        <ShoppingBag size={48} className="text-[var(--line)]" strokeWidth={1.2} />
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--ink)] mb-2">{t('vaciaTitulo')}</h1>
          <p className="text-[14px] text-[var(--ink-500)]">{t('vaciaTexto')}</p>
        </div>
        <Link href="/tienda" className="bg-[var(--blue)] text-white no-underline px-6 py-2.5 rounded-[10px] font-semibold text-[14px] hover:bg-[var(--blue-dark)] transition-colors">
          {t('irTienda')}
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Validate empresa required fields
    if (tipoCliente === 'empresa') {
      const form = e.currentTarget;
      const empresa = (form.elements.namedItem('facturacion_empresa') as HTMLInputElement)?.value;
      const nif = (form.elements.namedItem('facturacion_nif') as HTMLInputElement)?.value;
      if (!empresa?.trim() || !nif?.trim()) {
        setError(t('errEmpresa'));
        return;
      }
    }

    // Particular que pide factura: NIF/DNI obligatorio
    if (tipoCliente === 'particular' && quieroFactura) {
      const nif = (e.currentTarget.elements.namedItem('facturacion_nif') as HTMLInputElement)?.value;
      if (!nif?.trim()) {
        setError(t('errNifParticular'));
        return;
      }
    }

    // Consentimiento de marketing (opcional) → alta en newsletter. No bloquea el pedido.
    const aceptaMarketing = (e.currentTarget.elements.namedItem('acepta_marketing') as HTMLInputElement)?.checked;
    const emailMarketing = (e.currentTarget.elements.namedItem('email') as HTMLInputElement)?.value;
    if (aceptaMarketing && emailMarketing) {
      void subscribeToNewsletter(emailMarketing, 'checkout').catch(() => {});
    }

    setPending(true);
    const formData = new FormData(e.currentTarget);
    formData.set('cart_json', JSON.stringify(items));
    formData.set('tipo_cliente', tipoCliente);

    const result = await createCheckoutSession(formData);
    if (result?.error || !result?.url) {
      setError(result?.error ?? t('errPago'));
      setPending(false);
      return;
    }
    // Redirige a la pasarela de pago de Stripe. La cesta se vacía al volver a la
    // página de confirmación, solo si el pago se ha completado.
    window.location.href = result.url;
  }

  const inputClass =
    'w-full border border-[#d1d5db] rounded-lg px-3.5 py-2.5 text-[14px] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue)]/20 transition-all';
  const labelClass = 'block text-[13px] font-medium text-[var(--ink-700)] mb-1.5';

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <Link href="/carrito" className="text-[var(--ink-500)] hover:text-[var(--blue)] no-underline transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-[22px] md:text-[26px] font-semibold text-[var(--ink)]">{t('titulo')}</h1>
      </div>

      <div className="grid gap-8 md:gap-10 grid-cols-1 lg:grid-cols-[1fr_360px]">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Contact */}
          <section className="bg-white rounded-xl border border-[var(--line)] p-6">
            <h2 className="text-[15px] font-semibold text-[var(--ink)] mb-5">{t('datosContacto')}</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="co-nombre" className={labelClass}>{t('nombreCompleto')}</label>
                <input id="co-nombre" name="nombre" required minLength={2} className={inputClass} placeholder={t('phNombre')} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="co-email" className={labelClass}>{t('email')}</label>
                  <input id="co-email" name="email" type="email" required className={inputClass} placeholder={t('phEmail')} />
                </div>
                <div>
                  <label htmlFor="co-telefono" className={labelClass}>{t('telefono')}</label>
                  <input id="co-telefono" name="telefono" type="tel" className={inputClass} placeholder={t('phTelefono')} />
                </div>
              </div>
            </div>
          </section>

          {/* Tipo cliente / Facturación */}
          <section className="bg-white rounded-xl border border-[var(--line)] p-6">
            <h2 className="text-[15px] font-semibold text-[var(--ink)] mb-4">{t('facturacion')}</h2>

            {/* Toggle Particular / Empresa */}
            <div className="flex gap-2 mb-5" role="group" aria-label={t('tipoCliente')}>
              <button
                type="button"
                onClick={() => setTipoCliente('particular')}
                aria-pressed={tipoCliente === 'particular'}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border transition-colors"
                style={{
                  background: tipoCliente === 'particular' ? 'var(--blue)' : 'transparent',
                  color: tipoCliente === 'particular' ? '#fff' : 'var(--ink-500)',
                  borderColor: tipoCliente === 'particular' ? 'var(--blue)' : '#d1d5db',
                }}
              >
                <User size={14} />
                {t('particular')}
              </button>
              <button
                type="button"
                onClick={() => setTipoCliente('empresa')}
                aria-pressed={tipoCliente === 'empresa'}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border transition-colors"
                style={{
                  background: tipoCliente === 'empresa' ? 'var(--blue)' : 'transparent',
                  color: tipoCliente === 'empresa' ? '#fff' : 'var(--ink-500)',
                  borderColor: tipoCliente === 'empresa' ? 'var(--blue)' : '#d1d5db',
                }}
              >
                <Building2 size={14} />
                {t('empresa')}
              </button>
            </div>

            {tipoCliente === 'empresa' && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="co-empresa" className={labelClass}>{t('nombreEmpresa')}</label>
                    <input
                      id="co-empresa"
                      name="facturacion_empresa"
                      required
                      className={inputClass}
                      placeholder={t('phEmpresa')}
                    />
                  </div>
                  <div>
                    <label htmlFor="co-nif" className={labelClass}>{t('nifCif')}</label>
                    <input
                      id="co-nif"
                      name="facturacion_nif"
                      required
                      className={inputClass}
                      placeholder={t('phNif')}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dirFiscalDistinta}
                    onChange={(e) => setDirFiscalDistinta(e.target.checked)}
                    className="w-4 h-4 rounded accent-(--blue)"
                  />
                  <span className="text-[13px] text-(--ink-700)">
                    {t('dirFiscalDistinta')}
                  </span>
                </label>

                {dirFiscalDistinta && (
                  <div className="space-y-4 pl-6 border-l-2 border-(--line)">
                    <div>
                      <label htmlFor="co-fac-dir" className={labelClass}>{t('dirFiscal')}</label>
                      <input id="co-fac-dir" name="facturacion_dir" className={inputClass} placeholder={t('phDirFiscal')} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="co-fac-ciudad" className={labelClass}>{t('ciudad')}</label>
                        <input id="co-fac-ciudad" name="facturacion_ciudad" className={inputClass} placeholder={t('phCiudadFiscal')} />
                      </div>
                      <div>
                        <label htmlFor="co-fac-cp" className={labelClass}>{t('cp')}</label>
                        <input id="co-fac-cp" name="facturacion_cp" className={inputClass} placeholder={t('phCpFiscal')} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tipoCliente === 'particular' && (
              <div className="pt-1 space-y-4">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="quiere_factura"
                    checked={quieroFactura}
                    onChange={(e) => setQuieroFactura(e.target.checked)}
                    className="w-4 h-4 rounded accent-(--blue)"
                  />
                  <span className="text-[13px] text-[var(--ink-700)]">
                    {t('necesitoFactura')}
                  </span>
                </label>
                {quieroFactura && (
                  <div>
                    <label htmlFor="co-nif-part" className={labelClass}>{t('nifDni')}</label>
                    <input
                      id="co-nif-part"
                      name="facturacion_nif"
                      required
                      className={inputClass}
                      placeholder={t('phNifDni')}
                    />
                    <p className="text-[12px] text-[var(--ink-500)] mt-1.5">
                      {t('facturaNombre')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Shipping */}
          <section className="bg-white rounded-xl border border-[var(--line)] p-6">
            <h2 className="text-[15px] font-semibold text-[var(--ink)] mb-5">{t('dirEntrega')}</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="co-direccion" className={labelClass}>{t('direccion')}</label>
                <input id="co-direccion" name="direccion" required minLength={5} className={inputClass} placeholder={t('phDireccion')} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="co-ciudad" className={labelClass}>{t('ciudadReq')}</label>
                  <input id="co-ciudad" name="ciudad" required minLength={2} className={inputClass} placeholder={t('phCiudad')} />
                </div>
                <div>
                  <label htmlFor="co-cp" className={labelClass}>{t('cpReq')}</label>
                  <input id="co-cp" name="cp" required minLength={4} className={inputClass} placeholder={t('phCp')} />
                </div>
              </div>
              <div>
                <label htmlFor="co-notas" className={labelClass}>{t('notas')}</label>
                <textarea id="co-notas" name="notas" rows={2} className={inputClass} placeholder={t('phNotas')} />
              </div>
            </div>
          </section>

          {/* Payment info */}
          <section className="bg-white rounded-xl border border-[var(--line)] p-6">
            <h2 className="text-[15px] font-semibold text-[var(--ink)] mb-3">{t('pago')}</h2>
            <p className="text-[13px] text-[var(--ink-500)] mb-4">
              {t('pagoTexto')}
            </p>
            <div className="flex items-center gap-2 text-[12px] text-[var(--ink-500)]">
              <Lock size={13} className="text-[var(--success)]" />
              {t('sslProtegido')}
            </div>
          </section>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input type="checkbox" name="acepta_marketing" className="w-4 h-4 mt-0.5 rounded accent-(--blue)" />
            <span className="text-[13px] text-[var(--ink-500)]">
              {t('marketing')} <span className="opacity-70">{t('opcional')}</span>.
            </span>
          </label>

          <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2.5 bg-[var(--blue)] hover:bg-[var(--blue-dark)] disabled:opacity-60 text-white font-semibold text-[15px] py-4 rounded-[10px] transition-colors"
          >
            <Lock size={15} />
            {pending ? t('procesando') : `${t('confirmarPedido')} · ${tot.toFixed(2).replace('.', ',')} €`}
          </button>
        </form>

        {/* Order summary */}
        <div className="sticky top-[100px] self-start">
          <div className="bg-white rounded-xl border border-[var(--line)] p-6">
            <h2 className="text-[15px] font-semibold text-[var(--ink)] mb-4">{t('tuPedido')}</h2>
            <div className="space-y-3 mb-5">
              {items.map((item) => (
                <div
                  key={`${item.slug}|${item.aplicacion}|${item.formato}`}
                  className="flex items-center gap-3 text-[13px]"
                >
                  <div className="w-10 h-10 bg-[var(--blue-soft)] rounded-md overflow-hidden flex-shrink-0">
                    {item.imagen ? (
                      <Image src={item.imagen} alt={item.familia} width={40} height={40} className="w-full h-full object-contain p-0.5" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--ink-300)]">
                        <ShoppingBag size={14} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[var(--ink)] truncate">{item.familia}</div>
                    <div className="text-[11px] text-[var(--ink-500)]">{item.formato} × {item.cantidad}</div>
                  </div>
                  <div className="font-semibold text-[var(--ink)] flex-shrink-0">
                    {(item.precio * item.cantidad).toFixed(2).replace('.', ',')} €
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-[13px] pt-4" style={{ borderTop: '1px solid var(--line)' }}>
              <div className="flex justify-between text-[var(--ink-700)]">
                <span>{t('subtotal')}</span>
                <span>{sub.toFixed(2).replace('.', ',')} €</span>
              </div>
              {disc > 0 && (
                <div className="flex justify-between text-[#92400e] font-semibold">
                  <span className="flex items-center gap-1"><Tag size={11} /> {promoDiscountLabel(promo)}</span>
                  <span>−{disc.toFixed(2).replace('.', ',')} €</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--ink-700)]">
                <span>{t('envio')}</span>
                <span className="text-[var(--success)] font-semibold">{t('gratis')}</span>
              </div>
              <div
                className="flex justify-between font-bold text-[17px] text-[var(--ink)] pt-3"
                style={{ borderTop: '1px solid var(--line)' }}
              >
                <span>{t('total')}</span>
                <span>{tot.toFixed(2).replace('.', ',')} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
