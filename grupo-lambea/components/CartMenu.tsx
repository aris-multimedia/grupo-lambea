'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingCart, ShoppingBag, Minus, Plus, Trash2, ArrowRight, Tag } from 'lucide-react';
import { useCart } from './CartProvider';
import { subtotal } from '@/lib/cart';
import { promoDiscount, promoDiscountLabel } from '@/lib/promotions';
import type { ActivePromo } from '@/lib/settings-schema';

const eur = (n: number) => n.toFixed(2).replace('.', ',');

/**
 * Mini-cesta desplegable en la cabecera. Al pulsar el icono se abre un panel
 * flotante con los productos (editables) y dos acciones: "Ir al pago" y "Ver la
 * cesta". Reutiliza el CartProvider; no duplica estado.
 */
export function CartMenu({ promo }: { promo: ActivePromo }) {
  const { items, removeItem, updateQty } = useCart();
  const pathname = usePathname();
  const t = useTranslations('cart');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const itemCount = items.reduce((s, i) => s + i.cantidad, 0);
  const sub = subtotal(items);
  const disc = promoDiscount(items, promo);
  const total = sub - disc;

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Cerrar al navegar
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cerrar el panel al cambiar de ruta es un efecto legítimo
    setOpen(false);
  }, [pathname]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${t('cesta')}${itemCount > 0 ? `, ${itemCount}` : ''}`}
        className="flex items-center gap-2 bg-[var(--blue)] text-white px-4 md:px-5 py-2 md:py-2.5 rounded-[100px] font-semibold text-[13px] md:text-[14px] transition-colors hover:bg-[var(--blue-dark)] cursor-pointer"
      >
        <ShoppingCart size={15} />
        <span className="hidden sm:inline">{t('cesta')}</span>
        {itemCount > 0 && (
          <span className="bg-white/25 px-1.5 py-0.5 rounded-[100px] text-[11px] font-bold">{itemCount}</span>
        )}
        {total > 0 && <span className="hidden sm:inline text-[12px] opacity-90">{eur(total)} €</span>}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Resumen de la cesta"
          className="absolute right-0 top-full mt-2 z-50 w-[min(380px,calc(100vw-2rem))] bg-white rounded-[var(--r-lg)] overflow-hidden"
          style={{ boxShadow: '0 20px 50px rgba(14,87,132,0.18)', border: '1px solid var(--line)' }}
        >
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 text-center px-6 py-10">
              <ShoppingBag size={36} className="text-[var(--line)]" strokeWidth={1.3} />
              <p className="text-[14px] text-[var(--ink-500)]">{t('vacia')}</p>
              <Link
                href="/tienda"
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--blue)] no-underline hover:gap-2.5 transition-all"
              >
                {t('irTienda')} <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <>
              {/* Lista de artículos */}
              <div className="max-h-[min(50vh,360px)] overflow-y-auto divide-y divide-[var(--line)]">
                {items.map((item) => (
                  <div key={`${item.slug}|${item.aplicacion}|${item.formato}`} className="flex items-start gap-3 p-3.5">
                    <div className="w-12 h-12 bg-[var(--blue-soft)] rounded-lg flex-shrink-0 overflow-hidden">
                      {item.imagen ? (
                        <Image src={item.imagen} alt={item.familia} width={48} height={48} className="w-full h-full object-contain p-1" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--ink-300)]">
                          <ShoppingBag size={16} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[13px] text-[var(--ink)] leading-snug truncate">{item.familia}</div>
                      <div className="text-[11.5px] text-[var(--ink-500)] mb-1.5">{item.formato}</div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center overflow-hidden" style={{ border: '1.5px solid var(--line)', borderRadius: '100px' }}>
                          <button
                            type="button"
                            onClick={() => updateQty(item.slug, item.aplicacion, item.formato, -1)}
                            className="qty-btn w-7 h-7 flex items-center justify-center"
                            aria-label="Reducir cantidad"
                          >
                            <Minus size={12} strokeWidth={2.5} />
                          </button>
                          <span className="w-7 text-center text-[13px] font-semibold text-[var(--ink)]">{item.cantidad}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.slug, item.aplicacion, item.formato, 1)}
                            className="qty-btn w-7 h-7 flex items-center justify-center"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                        <span className="text-[13px] font-bold text-[var(--ink)] whitespace-nowrap">
                          {eur(item.precio * item.cantidad)} €
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.slug, item.aplicacion, item.formato)}
                      className="w-7 h-7 flex items-center justify-center text-[var(--ink-300)] hover:text-red-500 hover:bg-red-50 active:bg-red-100 rounded-full transition-colors flex-shrink-0"
                      aria-label={`Eliminar ${item.familia} de la cesta`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Resumen + acciones */}
              <div className="p-4 bg-[var(--bg-soft)] border-t border-[var(--line)] space-y-3">
                {disc > 0 && (
                  <div className="flex justify-between text-[12.5px] font-semibold text-[#92400e]">
                    <span className="flex items-center gap-1.5"><Tag size={12} /> {promoDiscountLabel(promo)}</span>
                    <span>−{eur(disc)} €</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline">
                  <span className="text-[13px] text-[var(--ink-500)]">{t('total')}</span>
                  <span className="text-[18px] font-bold text-[var(--ink)]">{eur(total)} €</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/carrito"
                    className="flex items-center justify-center text-[13px] font-semibold text-[var(--blue)] bg-white no-underline py-2.5 rounded-[10px] border border-[var(--line)] hover:bg-[var(--blue-soft)] transition-colors"
                  >
                    {t('verCesta')}
                  </Link>
                  <Link
                    href="/checkout"
                    className="btn-cart flex items-center justify-center gap-1.5 text-white text-[13px] font-semibold no-underline py-2.5 rounded-[10px]"
                  >
                    {t('irPago')} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
