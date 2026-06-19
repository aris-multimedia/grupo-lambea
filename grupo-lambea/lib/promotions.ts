// Catálogo y matemática de promociones — módulo PURO (sin DB).
// El catálogo (qué promos existen) se define AQUÍ, en código: añadir un tipo
// nuevo es un cambio de código. El cliente, desde el panel, solo elige cuál
// está activa, edita su texto y su parámetro, y la enciende/apaga.
//
// La promo activa se guarda en site_settings (ver settings-schema) y se
// consume en: barra superior (banner), distintivos de producto, ficha y
// carrito/checkout. La mecánica de carrito (3×2 / % descuento) se revalida
// también en el servidor (app/actions/orders.ts).

import type { CartItem } from '@/types/product';
import type { ActivePromo, PromoTipo } from './settings-schema';
import { totalDiscount as discount3x2, combinedDiscount } from './cart';

export type { ActivePromo, PromoTipo };

export interface PromoPreset {
  tipo: PromoTipo;
  nombre: string;            // etiqueta en el selector del panel
  resumen: string;           // qué hace exactamente (ayuda para el cliente)
  tituloDefault: string;
  descripcionDefault: string;
  // Parámetro editable (porcentaje, importe…). Ausente = la promo no lo usa.
  valor?: { label: string; sufijo: string; placeholder: string };
}

export const PROMO_CATALOG: PromoPreset[] = [
  {
    tipo: '3x2',
    nombre: '3×2',
    resumen:
      'Por cada 3 unidades de una misma familia, la más barata sale gratis. Se aplica solo en el carrito y muestra el distintivo 3×2 en los productos.',
    tituloDefault: '3×2 en todo el catálogo',
    descripcionDefault: 'Llévate tres y paga solo dos',
  },
  {
    tipo: 'descuento',
    nombre: 'Descuento %',
    resumen:
      'Resta un porcentaje del subtotal en el carrito y muestra el distintivo de descuento en los productos.',
    tituloDefault: '-10 % en todo el catálogo',
    descripcionDefault: 'Descuento aplicado automáticamente en el carrito',
    valor: { label: 'Porcentaje de descuento', sufijo: '%', placeholder: '10' },
  },
  {
    tipo: 'combinada',
    nombre: '3×2 + % descuento',
    resumen:
      'Combina las dos ofertas: 3×2 en los formatos de 1 L / 1 kg (la unidad más barata gratis por cada 3 del MISMO tamaño) Y un % de descuento en el resto de botes — incluidos los de 1 L/1 kg que no lleguen a 3 unidades. No se acumulan: lo que entra en un 3×2 no recibe además el %.',
    tituloDefault: '3×2 + 10 % en el resto',
    descripcionDefault: '3×2 en 1 L y 1 kg · 10 % en los demás formatos',
    valor: { label: 'Porcentaje para el resto', sufijo: '%', placeholder: '10' },
  },
  {
    tipo: 'envio_gratis',
    nombre: 'Envío gratis',
    resumen:
      'Mensaje destacado de envío gratis en la barra superior y la web. No cambia el cálculo del carrito (el envío ya es gratis).',
    tituloDefault: 'Envío gratis en toda la Península',
    descripcionDefault: 'En todos los pedidos, sin mínimo',
    valor: { label: 'Importe mínimo (opcional, solo texto)', sufijo: '€', placeholder: '40' },
  },
];

export function presetFor(tipo: PromoTipo): PromoPreset {
  return PROMO_CATALOG.find((p) => p.tipo === tipo) ?? PROMO_CATALOG[0];
}

/** ¿Hay que mostrar la promo en la web? (toggle maestro encendido). */
export function promoVisible(p: ActivePromo): boolean {
  return p.activa;
}

/** Descuento de carrito según la promo activa (3×2, %, combinada — envío_gratis no descuenta). */
export function promoDiscount(items: CartItem[], p: ActivePromo): number {
  if (!promoVisible(p)) return 0;
  if (p.tipo === '3x2') return discount3x2(items);
  if (p.tipo === 'descuento') {
    const sub = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
    const pct = Math.max(0, Math.min(100, Number(p.valor) || 0));
    return Number(((sub * pct) / 100).toFixed(2));
  }
  if (p.tipo === 'combinada') return combinedDiscount(items, Number(p.valor) || 0).total;
  return 0;
}

/**
 * Desglose del descuento para el resumen del carrito. Para la promo combinada
 * devuelve la parte 3×2 y la parte %; para las demás, una sola parte.
 */
export function promoBreakdown(items: CartItem[], p: ActivePromo): { free: number; pct: number; total: number } {
  if (!promoVisible(p)) return { free: 0, pct: 0, total: 0 };
  if (p.tipo === 'combinada') return combinedDiscount(items, Number(p.valor) || 0);
  if (p.tipo === '3x2') { const f = discount3x2(items); return { free: f, pct: 0, total: f }; }
  if (p.tipo === 'descuento') { const d = promoDiscount(items, p); return { free: 0, pct: d, total: d }; }
  return { free: 0, pct: 0, total: 0 };
}

/** Etiqueta corta del descuento para el resumen del carrito ("Promo 3×2", "-10 %"). */
export function promoDiscountLabel(p: ActivePromo): string {
  if (p.tipo === '3x2') return 'Promo 3×2';
  if (p.tipo === 'descuento') return `Descuento ${Number(p.valor) || 0} %`;
  if (p.tipo === 'combinada') return `3×2 + ${Number(p.valor) || 0} %`;
  return 'Promoción';
}
