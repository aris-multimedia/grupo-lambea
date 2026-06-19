import type { CartItem } from '@/types/product';

/**
 * ¿Este formato entra en la promo 3×2? Solo los formatos de 1 litro o 1 kg.
 * El resto de formatos (250 ml, 5 L, 25 L, 0,5 kg…) NO cuentan para el 3×2.
 *
 * Tolera la notación heterogénea de la web antigua: "1 Litro", "1 kg", "1KG",
 * "1 Litro / 1000 ml"… Extrae el primer número+unidad y exige valor = 1 con
 * unidad litro/kg. (Misma idea que `toBaseUnit` en ProductViewer.)
 * Esta función es PURA y se usa igual en el cliente (carrito) y en el servidor
 * (revalidación del descuento en checkout), para que no se pueda falsear.
 */
export function esFormatoPromo(formato: string): boolean {
  if (!formato) return false;
  const m = formato.match(/(\d+(?:[.,]\d+)?)\s*(ml|l|kg|g)/i);
  if (!m) return false;
  const val = parseFloat(m[1].replace(',', '.'));
  const unit = m[2].toLowerCase();
  return Math.abs(val - 1) < 1e-9 && (unit === 'l' || unit === 'kg');
}

/** Total de unidades de una familia (todos los formatos). */
export function unitsForFamilia(items: CartItem[], slug: string): number {
  return items
    .filter((i) => i.slug === slug)
    .reduce((sum, i) => sum + i.cantidad, 0);
}

/** Unidades de una familia que ENTRAN en el 3×2 (solo formatos 1 L / 1 kg). */
export function promoUnitsForFamilia(items: CartItem[], slug: string): number {
  return items
    .filter((i) => i.slug === slug && esFormatoPromo(i.formato))
    .reduce((sum, i) => sum + i.cantidad, 0);
}

/** How many free units does this familia earn under 3x2? (floor(n/3)) — solo 1 L / 1 kg */
export function freeUnitsFor(items: CartItem[], slug: string): number {
  return Math.floor(promoUnitsForFamilia(items, slug) / 3);
}

/**
 * Total discount for a single familia.
 * We give away the cheapest unit(s) for free — contando SOLO los formatos
 * elegibles (1 L / 1 kg). Las unidades regalo salen de entre esos formatos.
 */
export function discountForFamilia(items: CartItem[], slug: string): number {
  const freeCount = freeUnitsFor(items, slug);
  if (freeCount === 0) return 0;

  // Solo cuentan las unidades de formatos elegibles, baratas primero.
  const units: number[] = [];
  for (const item of items.filter((i) => i.slug === slug && esFormatoPromo(i.formato))) {
    for (let i = 0; i < item.cantidad; i++) {
      units.push(item.precio);
    }
  }
  units.sort((a, b) => a - b);
  return units.slice(0, freeCount).reduce((s, p) => s + p, 0);
}

export function subtotal(items: CartItem[]): number {
  return items.reduce((s, i) => s + i.precio * i.cantidad, 0);
}

export function totalDiscount(items: CartItem[]): number {
  const slugs = [...new Set(items.map((i) => i.slug))];
  return slugs.reduce((s, slug) => s + discountForFamilia(items, slug), 0);
}

/**
 * Valor de las unidades que forman un trío completo de 3×2 en una familia (las
 * `floor(n/3)*3` unidades elegibles más baratas). Sirve para EXCLUIRLAS del %
 * combinable: una unidad que entra en un 3×2 no recibe además el descuento %.
 */
export function trioValueForFamilia(items: CartItem[], slug: string): number {
  const units: number[] = [];
  for (const it of items.filter((i) => i.slug === slug && esFormatoPromo(i.formato))) {
    for (let k = 0; k < it.cantidad; k++) units.push(it.precio);
  }
  units.sort((a, b) => a - b);
  const trioCount = Math.floor(units.length / 3) * 3;
  return units.slice(0, trioCount).reduce((s, p) => s + p, 0);
}

/**
 * Descuento COMBINADO (promo "combinada"): 3×2 + % al resto, sin acumular.
 *  - 3×2: por cada 3 unidades del mismo tamaño elegible (1 L / 1 kg) de una
 *    familia, la más barata sale gratis.
 *  - %: se aplica a TODO lo demás (incluidos 1 L/1 kg que NO formen grupo de 3),
 *    nunca a las unidades ya cubiertas por un trío 3×2.
 * Devuelve el desglose para mostrarlo en el carrito.
 */
export function combinedDiscount(
  items: CartItem[],
  pct: number,
): { free: number; pct: number; total: number } {
  const free = totalDiscount(items); // parte 3×2 (unidades regalo)
  const slugs = [...new Set(items.map((i) => i.slug))];
  const trioValue = slugs.reduce((s, slug) => s + trioValueForFamilia(items, slug), 0);
  const base = Math.max(0, subtotal(items) - trioValue);
  const p = Math.max(0, Math.min(100, pct));
  const pctDisc = Number(((base * p) / 100).toFixed(2));
  return { free: Number(free.toFixed(2)), pct: pctDisc, total: Number((free + pctDisc).toFixed(2)) };
}

export function total(items: CartItem[]): number {
  return subtotal(items) - totalDiscount(items);
}
