'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCart } from '@/components/CartProvider';
import { subtotal, freeUnitsFor, esFormatoPromo } from '@/lib/cart';
import { promoDiscount, promoDiscountLabel, promoBreakdown } from '@/lib/promotions';
import { PaymentMethods } from '@/components/PaymentMethods';

export default function CarritoPage() {
  const { items, removeItem, updateQty, promo } = useCart();
  const t = useTranslations('carrito');

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-6">
        <ShoppingBag size={56} className="text-[var(--line)]" strokeWidth={1.2} />
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--ink)] mb-2">{t('vaciaTitulo')}</h1>
          <p className="text-[15px] text-[var(--ink-500)]">{t('vaciaTexto')}</p>
        </div>
        <Link
          href="/tienda"
          className="inline-flex items-center gap-2 bg-[var(--blue)] hover:bg-[var(--blue-dark)] text-white no-underline px-7 py-3 rounded-[10px] font-semibold text-[15px] transition-colors"
        >
          {t('irTienda')}
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const is3x2 = promo.activa && (promo.tipo === '3x2' || promo.tipo === 'combinada');
  const sub = subtotal(items);
  const disc = promoDiscount(items, promo);
  const bd = promoBreakdown(items, promo); // desglose: { free (3×2), pct (%), total }
  const tot = sub - disc;

  return (
    <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-8 md:py-12">
      <h1 className="text-[22px] md:text-[28px] font-semibold text-[var(--ink)] mb-6 md:mb-8">
        {t('titulo')} <span className="text-[var(--ink-500)] font-normal text-[16px] md:text-[18px]">({items.reduce((s, i) => s + i.cantidad, 0)} {t('articulos')})</span>
      </h1>

      <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => {
            // El distintivo 3×2 solo se muestra en las líneas de formato elegible (1 L / 1 kg).
            const freeCount = is3x2 ? freeUnitsFor(items, item.slug) : 0;
            const hasPromo = freeCount > 0 && esFormatoPromo(item.formato);

            return (
              <div
                key={`${item.slug}|${item.aplicacion}|${item.formato}`}
                className="bg-white rounded-xl border border-[var(--line)] p-4 sm:p-5"
              >
                {/* Top row: image + info + remove */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[var(--blue-soft)] rounded-lg flex-shrink-0 overflow-hidden">
                    {item.imagen ? (
                      <Image
                        src={item.imagen}
                        alt={item.familia}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--ink-300)]">
                        <ShoppingBag size={20} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[15px] text-[var(--ink)] leading-snug">{item.familia}</div>
                    <div className="text-[13px] text-[var(--ink-500)] mt-0.5">{item.formato}</div>
                    {hasPromo && (
                      <div className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-[#92400e] bg-[#fffbeb] px-2 py-0.5 rounded-full">
                        <Tag size={10} />
                        3×2 — {freeCount} {freeCount === 1 ? t('unidadGratis') : t('unidadesGratis')}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.slug, item.aplicacion, item.formato)}
                    className="w-8 h-8 flex items-center justify-center text-[var(--ink-300)] hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                    aria-label={`Eliminar ${item.familia} de la cesta`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Bottom row: qty stepper + price */}
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
                  <div
                    className="flex items-center overflow-hidden"
                    style={{ border: '1.5px solid var(--line)', borderRadius: '100px' }}
                  >
                    <button
                      type="button"
                      onClick={() => updateQty(item.slug, item.aplicacion, item.formato, -1)}
                      className="qty-btn w-9 h-9 flex items-center justify-center"
                      aria-label="Reducir cantidad"
                    >
                      <Minus size={13} strokeWidth={2.5} />
                    </button>
                    <span className="w-8 text-center text-[14px] font-semibold text-[var(--ink)]">
                      {item.cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.slug, item.aplicacion, item.formato, 1)}
                      className="qty-btn w-9 h-9 flex items-center justify-center"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-[16px] text-[var(--ink)]">
                      {(item.precio * item.cantidad).toFixed(2).replace('.', ',')} €
                    </div>
                    {item.cantidad > 1 && (
                      <div className="text-[11px] text-[var(--ink-500)]">
                        {item.precio.toFixed(2).replace('.', ',')} € {t('porUd')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="space-y-4 sticky top-[100px] self-start">
          <div className="bg-white rounded-xl border border-[var(--line)] p-6">
            <h2 className="text-[16px] font-semibold text-[var(--ink)] mb-5">{t('resumen')}</h2>

            <div className="space-y-3 text-[14px] mb-5">
              <div className="flex justify-between text-[var(--ink-700)]">
                <span>{t('subtotal')}</span>
                <span>{sub.toFixed(2).replace('.', ',')} €</span>
              </div>

              {promo.tipo === 'combinada' && disc > 0 ? (
                <>
                  {bd.free > 0 && (
                    <div className="flex justify-between text-[#92400e] font-semibold">
                      <span className="flex items-center gap-1.5"><Tag size={13} /> Promo 3×2 (1 L / 1 kg)</span>
                      <span>−{bd.free.toFixed(2).replace('.', ',')} €</span>
                    </div>
                  )}
                  {bd.pct > 0 && (
                    <div className="flex justify-between text-[#92400e] font-semibold">
                      <span className="flex items-center gap-1.5"><Tag size={13} /> Descuento {Number(promo.valor) || 0}% (resto)</span>
                      <span>−{bd.pct.toFixed(2).replace('.', ',')} €</span>
                    </div>
                  )}
                </>
              ) : (
                disc > 0 && (
                  <div className="flex justify-between text-[#92400e] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Tag size={13} />
                      {promoDiscountLabel(promo)}
                    </span>
                    <span>−{disc.toFixed(2).replace('.', ',')} €</span>
                  </div>
                )
              )}

              <div className="flex justify-between text-[var(--ink-700)]">
                <span>{t('envio')}</span>
                <span className="text-[var(--success)] font-semibold">{t('gratis')}</span>
              </div>

              <div
                className="flex justify-between font-bold text-[18px] text-[var(--ink)] pt-3"
                style={{ borderTop: '1px solid var(--line)' }}
              >
                <span>{t('total')}</span>
                <span>{tot.toFixed(2).replace('.', ',')} €</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2.5 bg-[var(--blue)] hover:bg-[var(--blue-dark)] text-white no-underline font-semibold text-[15px] py-3.5 rounded-[10px] transition-colors"
            >
              {t('finalizar')}
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/tienda"
              className="block text-center text-[13px] text-[var(--ink-500)] hover:text-[var(--blue)] no-underline mt-4 transition-colors"
            >
              {t('seguir')}
            </Link>

            <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--line)' }}>
              <PaymentMethods />
            </div>
          </div>

          {disc > 0 && (
            <div
              className="rounded-xl p-4 text-[13px]"
              style={{ background: 'linear-gradient(135deg, rgba(232,169,60,0.12) 0%, rgba(232,169,60,0.06) 100%)', border: '1px solid rgba(232,169,60,0.3)' }}
            >
              <div className="font-semibold text-[var(--ink)] mb-1 flex items-center gap-2">
                <Tag size={13} className="text-[#E8A93C]" />
                {promoDiscountLabel(promo)} {t('aplicada')}
              </div>
              <div className="text-[var(--ink-500)]">
                {t('ahorrando')} <strong className="text-[#92400e]">{disc.toFixed(2).replace('.', ',')} €</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
